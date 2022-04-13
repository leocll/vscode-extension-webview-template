const vscode = require('vscode');
const os = require('os');
const path = os.platform() === 'win32' ? require('path').win32 : require('path');
const fs = require('fs');
const BridgeData = require('./vscode.bridge');
const { Message, Handler } = require('./vscode.message');
const WebviewApi = require('./vscode.webviewApi');

/**
 * @typedef {import('./vscode.message').PostMessageObject} PostMessageObject
 * @typedef {import('./vscode.message').ReceivedMessageObject} ReceivedMessageObject
 * WebView
 * @class WebView
 */
class WebView {
    /**
     * Creates an instance of WebView.
     * @param {Handler} [handler=new Handler()]
     * @memberof WebView
     */
    constructor(handler = new Handler()) {
        this._handler = handler;
        this._handler.addApi(WebviewApi);
        this._panel = undefined;
        this._bridgeData = new BridgeData();
        this._bridgeData.syncHandler = (data) => {
            this.postMessage(Message.syncBridgeData(data));
        };
        /**
         * @type {(uri: vscode.Uri) => void}
         */
        this.onDidPose = undefined;
        /**
         * @type {() => void}
         */
        this.onDidDispose = undefined;
        /**
         * @type {(state: any) => void}
         */
        this.onDidChangeViewState = undefined;
        /**
         * @type {(message: ReceivedMessageObject) => void}
         */
        this.onDidReceiveMessage = undefined;
    }
    get name() { return WebviewApi.name; }
    get handler() { return this._handler; }
    get panel() { return this._panel; }
    get bridgeData() { return this._bridgeData; }
    get uri() { return this._uri; }

    /**
     * Show panel
     * @param {vscode.ExtensionContext} context
     * @param {string} htmlPath
     * @param {string} [viewType=this.name]
     * @param {string} [title=this.name]
     * @param {number} [viewColumn=vscode.ViewColumn.Three]
     * @param {boolean} [enableScripts=true]
     * @param {boolean} [retainContextWhenHidden=true]
     * @memberof WebView
     */
    showPanel(context, htmlPath, viewType = this.name, title = this.name, viewColumn = vscode.ViewColumn.Three, enableScripts = true, retainContextWhenHidden = true) {
        if (this.panel) {
            this.panel.reveal(viewColumn);
        } else {
            this._panel = vscode.window.createWebviewPanel(
                viewType,
                title,
                viewColumn, // show in position of editor
                {
                    enableScripts, // default disabled
                    retainContextWhenHidden, // keep state and avoid being reset When hidden webview
                    localResourceRoots: [vscode.Uri.file(path.dirname(htmlPath))], //  be allowed load resource paths.
                }
            );
            // load html
            this.panel.webview.html = this.getHtml4Path(htmlPath);
            this.panel.onDidDispose(() => this.didDispose(), undefined, context.subscriptions);
            // on webview visibility changed or position changed
            this.panel.onDidChangeViewState(state => this.didChangeViewState(state), undefined, context.subscriptions);
            this.panel.webview.onDidReceiveMessage(message => this.didReceiveMessage(message), undefined, context.subscriptions);
        }
    }

    /**
     * Post message
     * @param {PostMessageObject} message
     * @memberof WebView
     */
    postMessage(message) {
        this.panel && this.panel.webview.postMessage(message);
    }

    /**
     * On did receive message
     * @param {ReceivedMessageObject} message
     * @memberof WebView
     */
    didReceiveMessage(message) {
        this.handler && this.handler.received && this.handler.received(this.panel.webview, message);
        this.onDidReceiveMessage && this.onDidReceiveMessage(message);
        console.log(`Extension(${this.name}) received message: ${message.cmd}`);
    }

    /**
     * On did change view state
     * @param {*} state
     * @memberof WebView
     */
    didChangeViewState(state) {
        // const p = state.panel;
        this.onDidChangeViewState && this.onDidChangeViewState(state);
        // this.postMessage(Message.webviewDidChangeViewState(undefined));
        console.log(`Webview(${this.name}) did changeView state.`);
    }

    /**
     * On did dispose
     * @memberof WebView
     */
    didDispose() {
        this._panel = undefined;
        this.onDidDispose && this.onDidDispose();
        console.log(`Webview(${this.name}) did dispose.`);
    }

    /**
     * Activate
     * @param {vscode.ExtensionContext} context vscode extension context
     * @param {string} name webview name
     * @param {string} cmdName cmd name
     * @param {string} [htmlPath=path.join(context.extensionPath, 'web', 'dist', 'index.html')] html path
     * @returns {this}
     * @memberof WebView
     */
    activate(context, name, cmdName, htmlPath = undefined) {
        // activate WebviewApi
        WebviewApi.activate(context, name, this.bridgeData);
        htmlPath || (htmlPath = path.join(context.extensionPath, 'web', 'dist', 'index.html'));
        context.subscriptions.push(
            vscode.commands.registerCommand(cmdName, (uri) => {
                this._uri = uri;
                this.showPanel(context, htmlPath);
                this.bridgeData.updateItems({
                    platform: os.platform(),
                    pathSep: path.sep,
                    extensionPath: context.extensionPath,
                    workspaceFile: vscode.workspace.workspaceFile ? vscode.workspace.workspaceFile.fsPath : '',
                    workspaceFolders: (vscode.workspace.workspaceFolders || []).map(wf => {
                        return { index: wf.index, name: wf.name, folder: wf.uri.fsPath };
                    }),
                    startPath: uri ? uri.fsPath : '',
                }, false);
                this.bridgeData.syncAll();
                this.onDidPose && this.onDidPose(uri);
                this.postMessage(Message.webviewDidPose(undefined));
            }),
            vscode.workspace.onDidChangeWorkspaceFolders(() => {
                this.bridgeData.updateItems({
                    workspaceFolders: (vscode.workspace.workspaceFolders || []).map(wf => {
                        return { index: wf.index, name: wf.name, folder: wf.uri.fsPath };
                    }),
                }, true);
                this.postMessage({
                    cmd: `onDidChangeWorkspaceFolders`,
                    data: undefined
                });
            })
        );
        return this;
    }
    
    deactivate() { WebviewApi.deactivate(); }

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
        // `vscode-resource`无法加载？用`vscode-webview-resource`替换，未在文档上查到`vscode-webview-resource`，根据`panel.webview.asWebviewUri(htmlPath)`获得
        const scheme = this.panel.webview.cspSource ? this.panel.webview.cspSource.split(':')[0] : 'vscode-resource';
        const dirPath = path.dirname(htmlPath);
        let html = fs.readFileSync(htmlPath, 'utf-8');
        html = html.replace(/(href=|src=)(.+?)(\ |>)/g, (m, $1, $2, $3) => {
            let uri = $2;
            uri = uri.replace('"', '').replace("'", '');
            uri.indexOf('/static') === 0 && (uri = `.${uri}`);
            if (uri.substring(0, 1) == ".") {
                const furi = vscode.Uri.file(path.resolve(dirPath, uri));
                if (this.panel.webview.asWebviewUri) {
                    uri = `${$1}${this.panel.webview.asWebviewUri(furi)}${$3}`;
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
        // `vscode-resource`无法加载？用`vscode-webview-resource`替换，未在文档上查到`vscode-webview-resource`，根据`panel.webview.asWebviewUri(htmlPath)`获得
        const scheme = this.panel.webview.cspSource ? this.panel.webview.cspSource.split(':')[0] : 'vscode-resource';
        const dirPath = path.dirname(htmlPath);
        let html = fs.readFileSync(htmlPath, 'utf-8');
        const doc = htmlparser2.parseDocument(html);
        const convertUri = (uri) => {
            uri.indexOf('/static') === 0 && (uri = `.${uri}`);
            const f = vscode.Uri.file(path.resolve(dirPath, uri));
            if (this.panel.webview.asWebviewUri) {
                return `${this.panel.webview.asWebviewUri(f)}`;
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