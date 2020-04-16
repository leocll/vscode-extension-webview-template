const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const BridgeData = require('./vscode.bridge');
const { Message, ReceivedMessage, Handler } = require('./vscode.message');
const WebviewApi = require('./vscode.webviewApi');

/**
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
            this.panel.webview.postMessage(Message.syncBridgeData(data));
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
         * @type {(message: ReceivedMessage) => void}
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
            this.panel.webview.html = WebView.getHtml4Path(htmlPath);
            this.panel.onDidDispose(() => this.didDispose(), undefined, context.subscriptions);
            // on webview visibility changed or position changed
            this.panel.onDidChangeViewState(state => this.didChangeViewState(state), undefined, context.subscriptions);
            this.panel.webview.onDidReceiveMessage(message => this.didReceiveMessage(message), undefined, context.subscriptions);
        }
    }

    /**
     * On did receive message
     * @param {ReceivedMessage} message
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
        // this.panel.webview.postMessage(Message.webviewDidChangeViewState(undefined));
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
     * @param {import('vscode').ExtensionContext} context vscode extension context
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
                    extensionPath: context.extensionPath,
                    rootPath: vscode.workspace.rootPath,
                    startPath: uri ? uri.path : vscode.workspace.rootPath
                }, false);
                this.bridgeData.syncAll();
                this.onDidPose && this.onDidPose(uri);
                this.panel.webview.postMessage(Message.webviewDidPose(undefined));
            })
        );
        return this;
    }
    
    deactivate() { WebviewApi.deactivate(); }

    /**
     *Get html from the file path and replace resources protocol to `vscode-resource`
     *
     * @static
     * @param {string} htmlPath path of html path 
     * @returns
     * @memberof WebView
     */
    static getHtml4Path(htmlPath) {
        const dirPath = path.dirname(htmlPath);
        let html = fs.readFileSync(htmlPath, 'utf-8');
        html = html.replace(/(href=|src=)(.+?)(\ |>)/g, (m, $1, $2, $3) => {
            let uri = $2;
            uri = uri.replace('"', '').replace("'", '');
            uri.indexOf('/static') === 0 && (uri = `.${uri}`);
            if (uri.substring(0, 1) == ".") {
                uri = `${$1}${vscode.Uri.file(path.resolve(dirPath, uri)).with({ scheme: 'vscode-resource' }).toString()}${$3}`;
                return uri.replace('%22', '');
            }
            return m;
        });
        return html;
    }
}

module.exports = {
    WebView
};