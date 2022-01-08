const vscode = require('vscode');
const os = require('os');
const path = os.platform() === 'win32' ? require('path').win32 : require('path');
const fs = require('fs');
const { WebViewMessageManager } = require('./vscode.message');

/**
 * @typedef {import('./vscode.message').PostMessageObject} PostMessageObject
 * @typedef {import('./vscode.message').ReceivedMessageObject} ReceivedMessageObject
 * WebView
 * @class WebView
 */
class WebView {
    /**
     * Creates an instance of WebView.
     * @memberof WebView
     */
    constructor() {
        this._messageManager = new WebViewMessageManager({
            postMessage: (message) => this.postMessage(message)
        });
        /**@type {string} - webview name */
        this._name = undefined;
        /**@type {vscode.WebviewPanel} */
        this._panel = undefined;
        /**@type {vscode.Uri} */
        this._startUri = undefined;
        /**@type {(uri: vscode.Uri) => void} */
        this._onDidPose = this._messageManager.postMessage_onDidPose;
        /**@type {() => void} */
        this._onDidDispose = this._messageManager.postMessage_onDidDispose;
        /**@type {(event: vscode.WebviewPanelOnDidChangeViewStateEvent) => void} */
        this._onDidChangeViewState = this._messageManager.postMessage_onDidChangeViewState;
        /**@type {(message: ReceivedMessageObject) => void} */
        this._onDidReceiveMessage = this._messageManager.postMessage_onDidReceiveMessage;
    }
    get messageManager() { return this._messageManager; }
    get name() { return this._name; }
    get panel() { return this._panel; }
    get startUri() { return this._startUri; }

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
        this._onDidReceiveMessage && this._onDidReceiveMessage(message);
        console.log(`Extension(${this.name}) received message: ${message.cmd}`);
    }

    /**
     * On did change view state
     * @param {*} state
     * @memberof WebView
     */
    didChangeViewState(state) {
        // const p = state.panel;
        this._onDidChangeViewState && this._onDidChangeViewState(state);
        // this.postMessage(Message.webviewDidChangeViewState(undefined));
        console.log(`Webview(${this.name}) did changeView state.`);
    }

    /**
     * On did dispose
     * @memberof WebView
     */
    didDispose() {
        this._panel = undefined;
        this._onDidDispose && this._onDidDispose();
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
        this._name = name;
        htmlPath || (htmlPath = path.join(context.extensionPath, 'web', 'dist', 'index.html'));
        context.subscriptions.push(
            vscode.commands.registerCommand(cmdName, (uri) => {
                this._startUri = uri;
                this.showPanel(context, htmlPath);
                this._onDidPose && this._onDidPose(uri);
            })
        );
        this.messageManager.activate(context, this);
        return this;
    }

    deactivate() {
        this.messageManager.deactivate();
    }

    /**
     * Get html from the file path and replace resources protocol to `vscode-resource`
     *
     * @param {string} htmlPath path of html path 
     * @returns
     * @memberof WebView
     */
    getHtml4Path(htmlPath) {
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
}

module.exports = {
    WebView
};