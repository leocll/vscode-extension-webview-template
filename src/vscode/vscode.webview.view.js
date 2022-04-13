const vscode = require('vscode');
const os = require('os');
const path = os.platform() === 'win32' ? require('path').win32 : require('path');
const fs = require('fs');
const { Message, Handler } = require('./vscode.message');
const { WebviewData } = require('./vscode.webview.data');
const { VscodeApi, VscodeContextApi, WebviewDataApi } = require('./vscode.webview.api');

/**
 * @typedef {import('./vscode.message').PostMessageObject} PostMessageObject
 * @typedef {import('./vscode.message').ReceivedMessageObject} ReceivedMessageObject
 */
/**
 * @typedef {{viewColumn?: vscode.ViewColumn, preserveFocus?: Boolean} & vscode.WebviewPanelOptions & vscode.WebviewOptions} WebviewPanelOptions
 * @typedef {{htmlPath: String, title?: String} & WebviewPanelOptions} ShowWebviewPanelOptions
 */
/**
 * @template T
 * WebView
 * @class WebView
 */
class WebView {
    /**
     * Creates an instance of WebView.
     * @param {{name: String, data?: T|WebviewData<T>}} options
     * @memberof WebView
     */
    constructor(options) {
        this._name = options.name;
        this._setupData(options.data);

        this._handler = handler;
        this._view = undefined;
        /**@type {(uri?: vscode.Uri) => void} */
        this.onDidPose = undefined;
        /**@type {() => void} */
        this.onDidDispose = undefined;
        /**@type {(state: any) => void} */
        this.onDidChangeViewState = undefined;
        /**@type {(message: ReceivedMessageObject) => void} */
        this.onDidReceiveMessage = undefined;
    }
    get name() { return this._name; }
    get data() { return this._data; }
    get dataApi() { return this._dataApi; }
    get handler() { return this._handler; }
    get view() { return this._view; }
    get uri() { return this._uri; }

    _setupData(data) {
        /**@type {WebviewData<T>} */
        this._data = data instanceof WebviewData ? data : new WebviewData(data);
        this._data.syncHandler = (data) => {
            this.postMessage(Message.syncBridgeData(data));
        };
        /**@type {WebviewDataApi<T>} */
        this._dataApi = new WebviewDataApi(this._data);
    }

    /**
     * Post message
     * @param {PostMessageObject} message
     * @memberof WebView
     */
    postMessage(message) {
        this.view && this.view.webview.postMessage(message);
    }

    /**
     * On did receive message
     * @param {ReceivedMessageObject} message
     * @memberof WebView
     */
    didReceiveMessage(message) {
        this.handler && this.handler.received && this.handler.received(this.view.webview, message);
        this.onDidReceiveMessage && this.onDidReceiveMessage(message);
        console.log(`Extension(${this.name}) received message: ${message.cmd}`);
    }

    /**
     * On did change view state
     * @param {*} state
     * @memberof WebView
     */
    didChangeViewState(state) {
        // const p = state.view;
        this.onDidChangeViewState && this.onDidChangeViewState(state);
        // this.postMessage(Message.webviewDidChangeViewState(undefined));
        console.log(`Webview(${this.name}) did changeView state.`);
    }

    /**
     * On did dispose
     * @memberof WebView
     */
    didDispose() {
        this._view = undefined;
        this.onDidDispose && this.onDidDispose();
        console.log(`Webview(${this.name}) did dispose.`);
    }

    /**
     * Show
     * @param {vscode.ExtensionContext} context
     * @param {String} cmdName
     * @param {ShowWebviewPanelOptions} options
     * @returns {this}
     * @memberof WebView
     */
    show(context, cmdName, options) {
        context.subscriptions.push(
            vscode.commands.registerCommand(cmdName, (uri) => {
                this._uri = uri;
                this._showView(context, options);
                // @ts-ignore
                this.data.updateItems({
                    startPath: uri ? uri.fsPath : '',
                }, false);
                this.data.syncAll();
                this.onDidPose && this.onDidPose(uri);
                this.postMessage(Message.webviewDidPose(undefined));
            })
        );
        return this;
    }

    /**
     * Show view
     * @param {vscode.ExtensionContext} context
     * @param {ShowWebviewPanelOptions} options
     * @memberof WebView
     */
    _showView(context, options) {
        const htmlPath = options.htmlPath || path.join(context.extensionPath, 'web', 'dist', 'index.html');
        /**@type {ShowWebviewPanelOptions} - default options */
        let opts = {
            htmlPath,
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
        opts = {...opts, ...options};
        if (this.view) {
            this.view.reveal(opts.viewColumn);
        } else {
            this._view = vscode.window.createWebviewPanel(
                this.name,
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
            this.view.webview.html = this.getHtml4Path(htmlPath);
            this.view.onDidDispose(() => this.didDispose(), undefined, context.subscriptions);
            // on webview visibility changed or position changed
            this.view.onDidChangeViewState(state => this.didChangeViewState(state), undefined, context.subscriptions);
            this.view.webview.onDidReceiveMessage(message => this.didReceiveMessage(message), undefined, context.subscriptions);
        }
    }

    /**
     *Get html from the file path and replace resources protocol to `vscode-resource`
     *
     * @param {string} htmlPath path of html path 
     * @returns
     * @memberof WebView
     */
    getHtml4Path(htmlPath) {
        return this._tmp(htmlPath);
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

    _tmp(htmlPath) {
        const htmlparser2 = require('htmlparser2');
        const { Element } = require('domhandler');
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
            /**@type {Element} */
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

module.exports = {
    WebView
};