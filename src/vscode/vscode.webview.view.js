const vscode = require('vscode');
const os = require('os');
const path = os.platform() === 'win32' ? require('path').win32 : require('path');
const fs = require('fs');
const { Message, Handler } = require('./vscode.webview.message');
const { WebviewData, WebviewDataApi } = require('./vscode.webview.data');
// const { VscodeApi, VscodeContextApi } = require('./vscode.webview.api');

/**
 * @typedef {import('./vscode.webview.message').PostMessageObject} PostMessageObject
 * @typedef {import('./vscode.webview.message').ReceivedMessageObject} ReceivedMessageObject
 */
/**
 * @template T
 * Webview
 * @class Webview
 */
class Webview {
    /**
     * Creates an instance of Webview.
     * @param {{name: String, data?: T|WebviewData<T>, handler?: Handler}} options
     * @memberof Webview
     */
    constructor(options) {
        this.name = options.name;
        this._setupData(options.data);
        this._setupHandler(options.handler);
        this._events = {
            /**@type {(uri?: vscode.Uri) => void} */
            onDidPose: undefined,
            /**@type {() => void} */
            onDidDispose: undefined,
            /**@type {(state: any) => void} */
            onDidChangeViewState: undefined,
            /**@type {() => void} */
            onDidChangeVisibility: undefined,
            /**@type {(message: ReceivedMessageObject) => void} */
            // onDidReceiveMessage: undefined,
        };
        /**@type {{webview: vscode.Webview}} */
        this._view = undefined;
        /**@type {vscode.ExtensionContext} */
        this._extensionContext = undefined;
    }

    /**@type {WebviewData<T & DefaultWebviewData>} */
    // @ts-ignore
    get data() { return this._data; }
    /**@type {WebviewDataApi<T & DefaultWebviewData>} */
    // @ts-ignore
    get dataApi() { return this._dataApi; }
    get handler() { return this._handler; }
    get events() { return this._events; }
    get view() { return this._view; }
    get extensionContext() { return this._extensionContext; }

    /**
     * @param {T|WebviewData<T>} data
     */
    _setupData(data) {
        /**@type {WebviewData<T>} */
        this._data = data instanceof WebviewData ? data : new WebviewData(data);
        this._data.syncHandler = (data) => {
            this.postMessage(Message.syncWebviewData(data));
        };
        /**@type {WebviewDataApi<T>} */
        this._dataApi = new WebviewDataApi(this._data);
    }

    /**
     * @param {Handler} handler
     */
     _setupHandler(handler) {
        this._handler = handler || new Handler();
        this.handler.addApi(this.dataApi.api);
    }

    /**
     * Post message
     * @param {PostMessageObject} message
     * @memberof Webview
     */
    postMessage(message) {
        this.view && this.view.webview.postMessage(message);
    }

    /**
     * On did receive message
     * @param {ReceivedMessageObject} message
     * @memberof Webview
     */
    _didReceiveMessage(message) {
        this.handler && this.handler.received && this.handler.received(this.view.webview, message);
        // this.events.onDidReceiveMessage && this.events.onDidReceiveMessage(message);
        console.log(`Webview(${this.name}) received message: ${message.cmd}`);
    }

    /**
     * On did pose
     * @param {vscode.Uri} [uri=undefined]
     * @memberof Webview
     */
    _didPose(uri) {
        /**@type {DefaultWebviewData} */
        const data = {
            startPath: uri ? uri.fsPath : '',
            platform: os.platform(),
            pathSep: path.sep,
            extensionPath: this.extensionContext.extensionPath,
            workspaceFile: vscode.workspace.workspaceFile ? vscode.workspace.workspaceFile.fsPath : '',
            workspaceFolders: (vscode.workspace.workspaceFolders || []).map(wf => {
                return { index: wf.index, name: wf.name, folder: wf.uri.fsPath };
            }),
        };
        // @ts-ignore
        this.data.update(data, false);
        this.events.onDidPose && this.events.onDidPose(uri);
        console.log(`Webview(${this.name}) did dispose.`);
    }

    /**
     * On did dispose
     * @memberof Webview
     */
    _didDispose() {
        this._view = undefined;
        this.events.onDidDispose && this.events.onDidDispose();
        console.log(`Webview(${this.name}) did dispose.`);
    }

    /**
     * On did change view state
     * @param {vscode.WebviewPanelOnDidChangeViewStateEvent} state
     * @memberof Webview
     */
    _didChangeViewState(state) {
        this.events.onDidChangeViewState && this.events.onDidChangeViewState(state);
        console.log(`Webview(${this.name}) did changeView state.`);
    }

    /**
     * On did change visibility
     * @memberof Webview
     */
    _didChangeVisibility() {
        this.events.onDidChangeVisibility && this.events.onDidChangeVisibility();
        console.log(`Webview(${this.name}) did changeView state.`);
    }

    /**
     * Get html from the file path and replace resources protocol to `vscode-resource`
     *
     * @param {string} htmlPath - path of html path 
     * @returns
     * @memberof Webview
     */
    getHtml4Path(htmlPath) {
        // 兼容`v1.38+`
        // `vscode-resource`无法加载？用`vscode-webview-resource`替换，未在文档上查到`vscode-webview-resource`，根据`view.webview.asWebviewUri(htmlPath)`获得
        const scheme = this.view.webview.cspSource ? this.view.webview.cspSource.split(':')[0] : 'vscode-resource';
        const dirPath = path.dirname(htmlPath);
        let html = fs.readFileSync(htmlPath, 'utf-8');
        html = html.replace(/(href=|src=)(.+?)(\ |>)/g, (m, $1, $2, $3) => {
            let uri = $2;
            uri = uri.replace('"', '').replace("'", '');
            uri.indexOf('/static') === 0 && (uri = `.${uri}`);
            if (uri.substring(0, 1) == ".") {
                const furi = vscode.Uri.file(path.resolve(dirPath, uri));
                if (this.view.webview.asWebviewUri) {
                    uri = `${$1}${this.view.webview.asWebviewUri(furi)}${$3}`;
                } else {
                    uri = `${$1}${furi.with({ scheme }).toString()}${$3}`;
                }
                return uri.replace('%22', '');
            }
            return m;
        });
        return html;
    }

    /**
     * Get html by `htmlparser2` lib
     *
     * @param {string} htmlPath - path of html path 
     * @returns
     * @memberof Webview
     */
    getHtml4Path1(htmlPath) {
        const htmlparser2 = require('htmlparser2');
        // const { Element } = require('domhandler');
        // 兼容`v1.38+`
        // `vscode-resource`无法加载？用`vscode-webview-resource`替换，未在文档上查到`vscode-webview-resource`，根据`view.webview.asWebviewUri(htmlPath)`获得
        const scheme = this.view.webview.cspSource ? this.view.webview.cspSource.split(':')[0] : 'vscode-resource';
        const dirPath = path.dirname(htmlPath);
        let html = fs.readFileSync(htmlPath, 'utf-8');
        const doc = htmlparser2.parseDocument(html);
        const convertUri = (uri) => {
            uri.indexOf('/static') === 0 && (uri = `.${uri}`);
            const f = vscode.Uri.file(path.resolve(dirPath, uri));
            if (this.view.webview.asWebviewUri) {
                return `${this.view.webview.asWebviewUri(f)}`;
            } else {
                return `${f.with({ scheme }).toString()}`;
            }
        };
        // /**@type {Element} */
        // let headEle = 
        htmlparser2.DomUtils.filter(e1 => {
            /**@type {import('domhandler').Element} */
            // @ts-ignore
            const e = e1;
            // console.log(`${e.type} => ${e.name}`);
            if (e.type === htmlparser2.ElementType.Tag || e.type == htmlparser2.ElementType.Script) {
                if (e.name === 'meta') {

                } else if (e.name === 'link') {
                    if (e.attribs.rel === 'stylesheet') {
                        e.attribs.href = convertUri(e.attribs.href);
                    }
                } else if (e.name === 'script') {
                    e.attribs.src = convertUri(e.attribs.src);
                }
            }
            return e.type === htmlparser2.ElementType.Tag && e.name === 'head';
        }, doc, true)[0];
        // if (headEle) {
        //     const policyEle = new Element('meta', {
        //         "http-equiv": "Content-Security-Policy",
        //         content: `default-src 'none'; style-src ${this.webview.cspSource}; script-src 'nonce-${nonce}';`,
        //     });
        //     headEle.children.splice(0, 0, policyEle);
        // }
        const html1 = htmlparser2.DomUtils.getInnerHTML(doc);
        return html1;
    }
}

/**
 * @typedef {import('./vscode.webview.api').WorkspaceFolder} WorkspaceFolder
 * @typedef {{startPath?: String, platform: NodeJS.Platform, pathSep: String, extensionPath: String, workspaceFile?: String, workspaceFolders: WorkspaceFolder[]}} DefaultWebviewData
 * @typedef {{viewColumn?: vscode.ViewColumn, preserveFocus?: Boolean} & vscode.WebviewPanelOptions & vscode.WebviewOptions} WebviewPanelOptions
 * @typedef {{htmlPath: String, viewType?: String, title?: String} & WebviewPanelOptions} ShowWebviewPanelOptions
 * @typedef {{command: String} & ShowWebviewPanelOptions} RegisterWebviewPanelOptions
 */
/**
 * @template T
 * WebviewPanel
 * @class WebviewPanel
 * @extends Webview<T>
 */
class WebviewPanel extends Webview {

    /**@type {vscode.WebviewPanel} */
    // @ts-ignore
    get panel() { return this.view; }
    set panel(v) { this._view = v; }

    /**
     * Register
     * @param {vscode.ExtensionContext} context
     * @param {RegisterWebviewPanelOptions} options
     * @returns {this}
     * @memberof WebviewPanel
     */
    register(context, options) {
        this._extensionContext = context;
        context.subscriptions.push(
            vscode.commands.registerCommand(options.command, (uri) => {
                this._show(context, options);
                this._didPose(uri);
            })
        );
        return this;
    }

    /**
     * show
     * @param {vscode.ExtensionContext} context
     * @param {ShowWebviewPanelOptions} options
     * @memberof WebviewPanel
     */
    _show(context, options) {
        if (this.panel) {
            this.panel.reveal(options.viewColumn || vscode.ViewColumn.Three);
            return;
        }
        const htmlPath = options.htmlPath;
        /**@type {ShowWebviewPanelOptions} - default options */
        const opts = {
            htmlPath,
            viewType: this.name,
            title: this.name,
            viewColumn: vscode.ViewColumn.Three,
            preserveFocus: false,
            enableFindWidget: false,
            retainContextWhenHidden: true,
            enableScripts: true,
            enableCommandUris: false,
            localResourceRoots: [vscode.Uri.file(path.dirname(htmlPath))],
            portMapping: undefined,
        };
        Object.assign(opts, options);
        this.panel = vscode.window.createWebviewPanel(
            opts.viewType,
            opts.title,
            {
                viewColumn: opts.viewColumn, // show in position of editor
                preserveFocus: opts.preserveFocus,
            },
            {
                enableFindWidget: opts.enableFindWidget,
                retainContextWhenHidden: opts.retainContextWhenHidden, // keep state and avoid being reset When hidden webview
                enableScripts: opts.enableScripts, // default disabled
                enableCommandUris: opts.enableCommandUris,
                localResourceRoots: opts.localResourceRoots, //  be allowed load resource paths.
                portMapping: opts.portMapping,
            }
        );
        // load html
        this.panel.webview.html = this.getHtml4Path1(htmlPath);
        context.subscriptions.push(
            this.panel.onDidDispose(() => this._didDispose()),
            this.panel.onDidChangeViewState(state => this._didChangeViewState(state)),
            this.panel.webview.onDidReceiveMessage(message => this._didReceiveMessage(message)),
        );
    }
}

/**
 * @typedef {vscode.WebviewOptions} WebviewViewOptions
 * @typedef {{htmlPath: String} & WebviewViewOptions} ShowWebviewViewOptions
 * @typedef {{viewId: String} & ShowWebviewViewOptions} RegisterWebviewViewOptions
 */
/**
 * @template T
 * WebviewView
 * @class WebviewView
 * @extends Webview<T>
 * @implements vscode.WebviewViewProvider
 */
 class WebviewView extends Webview {

    /**@type {vscode.WebviewView} */
    // @ts-ignore
    get webviewView() { return this.view; }
    set webviewView(v) { this._view = v; }
    get viewContext() { return this._webviewContext; }

    _didDispose() {
        super._didDispose();
        (this._disposables || []).forEach(e => {
            e.dispose();
        });
    }

     /**
     * Resolve webview view
     * @param {vscode.WebviewView} webviewView 
     * @param {vscode.WebviewViewResolveContext} context 
     * @param {vscode.CancellationToken} token 
     * @returns {Promise<void>}
     * @memberof WebviewView
     */
    resolveWebviewView(webviewView, context, token) {
        console.log(`Webview(${this.name}) did resolveWebviewView.`);
        if (this.webviewView) {
            this.webviewView.show();
            return;
        }
        this.webviewView = webviewView;
        this._webviewContext = context;
        this._token = token;
        this._show();
        this._didPose();
    }

    /**
     * show
     * @memberof WebviewView
     */
     _show() {
        const options = this._options;
        const htmlPath = options.htmlPath;
        /**@type {WebviewViewOptions} - default options */
        const opts = {
            enableScripts: true,
            enableCommandUris: false,
            localResourceRoots: [vscode.Uri.file(path.dirname(htmlPath))],
            portMapping: undefined,
        };
        Object.assign(opts, options);
        const view = this.webviewView;
        view.webview.options = opts;
        // load html
        view.webview.html = this.getHtml4Path1(htmlPath);
        /**@type {vscode.Disposable[]} */
        this._disposables = [];
        this._disposables.push(
            view.onDidDispose(() => this._didDispose()),
            view.onDidChangeVisibility(() => this._didChangeVisibility()),
            view.webview.onDidReceiveMessage(message => this._didReceiveMessage(message)),
        );
    }

    /**
     * Register
     * @param {vscode.ExtensionContext} context
     * @param {RegisterWebviewViewOptions} options
     * @returns {this}
     * @memberof WebviewView
     */
    register(context, options) {
        this._extensionContext = context;
        this._options = options;
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(options.viewId, this),
        );
        return this;
    }
 }

module.exports = {
    Webview,
    WebviewPanel,
    WebviewView,
};