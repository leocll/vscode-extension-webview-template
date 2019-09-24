const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { BridgeData } = require('./vscode.bridge');
const { Message, Handler } = require('./vscode.message');

class WebView {
    constructor (name, handler=new Handler()) {
        this._name = name;
        this._handler = handler;
        this._panel = undefined;
        this._bridgeData = new BridgeData();
        this._bridgeData.syncHandler = (data) => {
            this.panel.webview.postMessage(Message.syncBridgeData(data));
        };
        this.onDidPose = undefined;
        this.onDidDispose = undefined;
        this.onDidChangeViewState = undefined;
        this.onDidReceiveMessage = undefined;
    }
    get name() {
        return this._name;
    }
    get handler() {
        return this._handler;
    }
    get panel() {
        return this._panel;
    }
    get bridgeData() {
        return this._bridgeData;
    }
    get uri() {
        return this._uri;
    }
    showPanel(context, htmlPath, viewType=this.name, title=this.name, viewColumn=vscode.ViewColumn.Three, enableScripts=true, retainContextWhenHidden=true) {
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
    didReceiveMessage(message) {
        this.handler && this.handler.received && this.handler.received(this.panel.webview, message);
        this.onDidReceiveMessage && this.onDidReceiveMessage(message);
        console.log(`Extension(${this.name}) received message: ${message.cmd}`);
    }
    didChangeViewState(state) {
        // const p = state.panel;
        this.onDidChangeViewState && this.onDidChangeViewState(state);
        // this.panel.webview.postMessage(Message.webviewDidChangeViewState(undefined));
        console.log(`Webview(${this.name}) did changeView state.`);
    }
    didDispose() {
        this._panel = undefined;
        this.onDidDispose && this.onDidDispose();
        console.log(`Webview(${this.name}) did dispose.`);
    }
    activate(context, cmdName, htmlPath=path.join(__dirname, '..', '..', 'web', 'dist', 'index.html')) {
        context.subscriptions.push(
            vscode.commands.registerCommand(cmdName, (uri) => {
                this._uri = uri;
                this.showPanel(context, htmlPath);
                this.bridgeData.updateItems({
                    rootPath: vscode.workspace.rootPath, 
                    startPath: uri ? uri.path : vscode.workspace.rootPath
                }, false);
                this.bridgeData.syncAll();
                this.onDidPose && this.onDidPose(uri);
                this.panel.webview.postMessage(Message.webviewDidPose(undefined));
            })
        );
    }
    deactivate() {
    }
    /**
     *Get html from the file path and replace resources protocol to `vscode-resource`
     *
     * @static
     * @param {*} htmlPath path of html path 
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

module.exports = WebView;