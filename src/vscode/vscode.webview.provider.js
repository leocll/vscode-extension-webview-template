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
 * WebviewViewProvider
 * @class WebviewViewProvider
 * @implements vscode.WebviewViewProvider
 */
class WebviewViewProvider {
    /**
     * Creates an instance of WebView.
     * @param {Handler} [handler=new Handler()]
     * @memberof WebviewViewProvider
     */
    constructor(handler = new Handler()) {
        this._handler = handler;
        this._handler.addApi(WebviewApi);
        /**@type {vscode.ExtensionContext} */
        this._extensionContext = undefined;
        /**@type {string} */
        this.htmlPath = '';
        /**@type {vscode.WebviewView} */
        this._webviewView = undefined;
        /**@type {vscode.WebviewViewResolveContext<any>} */
        this._webviewContext = undefined;
        /**@type {vscode.CancellationToken} */
        this._token = undefined;
        this._bridgeData = new BridgeData();
        this._bridgeData.syncHandler = (data) => {
            this.postMessage(Message.syncBridgeData(data));
        };
        /**
         * @type {() => void}
         */
        this.onDidPose = undefined;
        /**
         * @type {() => void}
         */
        this.onDidDispose = undefined;
        /**
         * @type {() => void}
         */
        this.onDidChangeVisibility = undefined;
        /**
         * @type {(message: ReceivedMessageObject) => void}
         */
        this.onDidReceiveMessage = undefined;
    }
    get name() { return WebviewApi.name; }
    get handler() { return this._handler; }
    get extensionContext() { return this._extensionContext; }
    /**@returns {vscode.Webview} */
    get webview() { return this.webviewView && this.webviewView.webview; }
    get webviewView() { return this._webviewView; }
    get webviewContext() { return this._webviewContext; }
    get token() { return this._token; }
    get bridgeData() { return this._bridgeData; }

    /**
     * Post message
     * @param {PostMessageObject} message
     * @memberof WebviewViewProvider
     */
    postMessage(message) {
        this.webview && this.webview.postMessage(message);
    }

    /**
     * On did receive message
     * @param {ReceivedMessageObject} message
     * @memberof WebviewViewProvider
     */
    didReceiveMessage(message) {
        this.handler && this.handler.received && this.handler.received(this.webview, message);
        this.onDidReceiveMessage && this.onDidReceiveMessage(message);
        console.log(`Extension(${this.name}) received message: ${message.cmd}`);
    }

    /**
     * On did change visibility
     * @memberof WebviewViewProvider
     */
    didChangeVisibility() {
        this.onDidChangeVisibility && this.onDidChangeVisibility();
        // this.postMessage(Message.webviewDidChangeViewState(undefined));
        console.log(`Webview(${this.name}) did change visibility.`);
    }

    /**
     * On did dispose
     * @memberof WebviewViewProvider
     */
    didDispose() {
        this._webviewView = undefined;
        this.onDidDispose && this.onDidDispose();
        console.log(`Webview(${this.name}) did dispose.`);
    }

    /**
     * Resolve webview view
     * @param {vscode.WebviewView} webviewView 
     * @param {vscode.WebviewViewResolveContext} context 
     * @param {vscode.CancellationToken} token 
     * @returns {Promise<void>}
     * @memberof WebviewViewProvider
     */
    resolveWebviewView(webviewView, context, token) {
        console.log(`resolveWebviewView: `, webviewView);
        if (this.webviewView) {
            this.webviewView.show();
            return;
        }
        this._webviewView = webviewView;
        this._webviewContext = context;
        this._token = token;

        const webview = this.webview;
        webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.dirname(this.htmlPath))], //  be allowed load resource paths.
        };
        // load html
        this.webview.html = this.getHtml4Path(this.htmlPath);
        this.webviewView.onDidDispose(() => this.didDispose());
        // on webview visibility changed
        this.webviewView.onDidChangeVisibility(() => this.didChangeVisibility());
        this.webview.onDidReceiveMessage(message => this.didReceiveMessage(message));

        this._initData();
    }

    _initData() {
        const context = this.extensionContext;
        this.bridgeData.updateItems({
            platform: os.platform(),
            pathSep: path.sep,
            extensionPath: context.extensionPath,
            workspaceFile: vscode.workspace.workspaceFile ? vscode.workspace.workspaceFile.fsPath : '',
            workspaceFolders: vscode.workspace.workspaceFolders.map(wf => {
                return { index: wf.index, name: wf.name, folder: wf.uri.fsPath };
            }),
        }, false);
        this.bridgeData.syncAll();
        this.onDidPose && this.onDidPose();
        this.postMessage(Message.webviewDidPose(undefined));
    }

    /**
     * Activate
     * @param {vscode.ExtensionContext} context vscode extension context
     * @param {{viewId: string, htmlPath?: string}} options
     * @returns {this}
     * @memberof WebviewViewProvider
     */
    activate(context, options) {
        this._extensionContext = context;
        // activate WebviewApi
        WebviewApi.activate(context, 'leocll', this.bridgeData);
        options.htmlPath || (options.htmlPath = path.join(context.extensionPath, 'web', 'dist', 'index.html'));
        this.htmlPath = options.htmlPath;
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(options.viewId, this),
            vscode.workspace.onDidChangeWorkspaceFolders(() => {
                this.bridgeData.updateItems({
                    workspaceFolders: vscode.workspace.workspaceFolders.map(wf => {
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
     * Get html from the file path and replace resources protocol to `vscode-resource`
     *
     * @param {string} htmlPath path of html path 
     * @returns
     * @memberof WebviewViewProvider
     */
    getHtml4Path(htmlPath) {
        const htmlparser2 = require('htmlparser2');
        const { Element } = require('domhandler');
        // 兼容`v1.38+`
        // `vscode-resource`无法加载？用`vscode-webview-resource`替换，未在文档上查到`vscode-webview-resource`，根据`panel.webview.asWebviewUri(htmlPath)`获得
        const scheme = this.webview.cspSource ? this.webview.cspSource.split(':')[0] : 'vscode-resource';
        const dirPath = path.dirname(htmlPath);
        let html = fs.readFileSync(htmlPath, 'utf-8');
        const doc = htmlparser2.parseDocument(html);
        const convertUri = (uri) => {
            uri.indexOf('/static') === 0 && (uri = `.${uri}`);
            const f = vscode.Uri.file(path.resolve(dirPath, uri));
            if (this.webview.asWebviewUri) {
                return `${this.webview.asWebviewUri(f)}`;
            } else {
                return `${f.with({ scheme }).toString()}`;
            }
        };
        htmlparser2.DomUtils.filter(e1 => {
            /**@type {Element} */
            // @ts-ignore
            const e = e1;
            // console.log(`${e.type} => ${e.name}`);
            if (e.type === htmlparser2.ElementType.Tag || e.type == htmlparser2.ElementType.Script) {
                if (e.name === 'link') {
                    if (e.attribs.rel === 'stylesheet') {
                        e.attribs.href = convertUri(e.attribs.href);
                    }
                } else if (e.name === 'script') {
                    e.attribs.src = convertUri(e.attribs.src);
                    // e.attribs.nonce = nonce;
                }
            }
            return false;
        }, doc, true);
        const html1 = htmlparser2.DomUtils.getInnerHTML(doc);
        return html1;
    }

    getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}

module.exports = {
    WebviewViewProvider
};