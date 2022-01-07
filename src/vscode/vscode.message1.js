const { EventEmitter } = require('events');

/**
 * @typedef {{cmd: string, data?: any}} PostMessageObject - Communication Message from `vscode` to `web`
 * @typedef {{cmd: string, args: any, reply: boolean, data?: any}} ReceivedMessageObject - Received Message from `web` to `vscode`
 * @typedef {(message: PostMessageObject) => void} PostMessageHandler - Post message handler
 * @typedef {(result: any) => void} ResultHandler - Result handler
 * @typedef {(resultHandler: ResultHandler, message: ReceivedMessageObject) => void} MessageResultHandler - Message result handler
 */
class WebViewMessageCenter {
    constructor() {
        /**@type {PostMessageHandler} */
        this.postMessage = () => {};
    }
    /**
     * On receive message for handler
     * @param {ResultHandler} resultHandler 
     * @param {ReceivedMessageObject} message 
     */
    onDidReceiveMessage(resultHandler, message) {
        resultHandler(this.handleReceiveMessage(message));
    }
    /**
     * Hande receive message
     * @param {ReceivedMessageObject} message 
     */
    handleReceiveMessage(message) {
        // code
        return undefined;
    }
    /**
     * Activate
     * @param {import('vscode').ExtensionContext} context vscode extension context
     * @param {import('./vscode.webview').WebView} webview
     */
     activate(context, webview) {
        return this;
    }
    deactivate() { }
}

class WebViewMessageManager {
    constructor() {
        this._eventEmitter = new EventEmitter();
        this._eventEmitter.setMaxListeners(0);
        /**@type {WebViewMessageCenter[]} */
        this._messageCenters = [];
        /**@type {PostMessageHandler} */
        this.postMessage = () => {};
        /**@type {(message: ReceivedMessageObject, result: any) => void} */
        this.messageResultHandler = (message, result) => {
            if (message && message.reply) {
                if (result) {
                    if (typeof result.then === 'function') {
                        result.then(data => {
                            message.data = data;
                            this.postMessage(message);
                        });
                    } else {
                        message.data = result;
                        this.postMessage(message);
                    }
                } else {
                    this.postMessage(message);
                }
            }
        };
    }
    /**
     * On webview start
     * @param {(uri?: import('vscode').Uri) => void} listener
     * @param {boolean} [once=false]
     */
    onDidPose(listener, once=false) {
        if (once) {
            this._eventEmitter.once(`webview.onDidPose`, listener);
        } else {
            this._eventEmitter.on(`webview.onDidPose`, listener);
        }
        return this;
    }
    /**
     * On webview deprecated
     * @param {() => void} listener
     * @param {boolean} [once=false]
     */
    onDidDispose(listener, once=false) {
        if (once) {
            this._eventEmitter.once(`webview.onDidDispose`, listener);
        } else {
            this._eventEmitter.on(`webview.onDidDispose`, listener);
        }
        return this;
    }
    /**
     * On webview state changed
     * @param {(event: import('vscode').WebviewPanelOnDidChangeViewStateEvent) => void} listener
     * @param {boolean} [once=false]
     */
    onDidChangeViewState(listener, once=false) {
        if (once) {
            this._eventEmitter.once(`webview.onDidChangeViewState`, listener);
        } else {
            this._eventEmitter.on(`webview.onDidChangeViewState`, listener);
        }
        return this;
    }
    /**
     * On received message from webview
     * @param {MessageResultHandler} listener
     * @param {boolean} [once=false]
     */
    onDidReceiveMessage(listener, once=false) {
        if (once) {
            this._eventEmitter.once(`webview.onDidReceiveMessage`, listener);
        } else {
            this._eventEmitter.on(`webview.onDidReceiveMessage`, listener);
        }
        return this;
    }
    /**
     * Add receive message center for message handler
     * @param {WebViewMessageCenter} center 
     */
    addReceiveMessageCenter(center) {
        this._messageCenters.push(center);
        center.postMessage = () => this.postMessage;
        this.onDidReceiveMessage((...args) => center.onDidReceiveMessage(...args), false);
        return this;
    }
    /**
     * Activate
     * @param {import('vscode').ExtensionContext} context vscode extension context
     * @param {import('./vscode.webview').WebView} webview
     */
    activate(context, webview) {
        this.postMessage = (message) => {
            webview.postMessage(message);
        };
        webview.onDidPose = (uri) => {
            this._eventEmitter.emit(`webview.onDidPose`, uri);
        };
        webview.onDidDispose = () => {
            this._eventEmitter.emit(`webview.onDidDispose`);
        };
        webview.onDidChangeViewState = (event) => {
            this._eventEmitter.emit(`webview.onDidChangeViewState`, event);
        };
        webview.onDidReceiveMessage = (message) => {
            /**@type {ResultHandler} */
            const handler = (result) => {
                this.messageResultHandler(message, result);
            };
            this._eventEmitter.emit(`webview.onDidReceiveMessage`, handler, message);
        };
        this._messageCenters.forEach(mc => mc.activate(context, webview));
        return this;
    }
    deactivate() {
        this._messageCenters.forEach(mc => mc.deactivate());
    }
}

module.exports = {
    WebViewMessageManager,
    WebViewMessageCenter,
};