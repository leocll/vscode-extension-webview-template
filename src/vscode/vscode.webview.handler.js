/**
 * @typedef {import('./vscode.webview.message').ReceivedMessageObject} ReceivedMessageObject
 */
/**
 * WebviewHandler to received message from `web` to `vscode`
 * @class WebviewHandler
 */
class WebviewHandler {
    /**
     * Creates an instance of WebviewHandler.
     * @memberof WebviewHandler
     */
    constructor() {
        /**@type {{[api: string]: Function}} */
        this._api = {};
        /**
         * WebviewHandler to received message
         * @type {(poster: import('vscode').Webview, message: ReceivedMessageObject) => void}
         */
        this.received = (poster, message) => {
            const cmd = message.cmd;
            const args = message.args;
            const func = this.api[cmd];
            if (typeof func === 'function') {
                const p = func(args);
                if (message.reply && poster) {
                    if (p) {
                        if (typeof p.then === 'function') {
                            p.then(data => {
                                message.data = data;
                                poster.postMessage(message);
                            });
                        } else {
                            message.data = p;
                            poster.postMessage(message);
                        }
                    } else {
                        poster.postMessage(message);
                    }
                }
            }
        };
    }

    get api() { return this._api; }

    /**
     * Add api
     * @param {{[api: string]: Function}[]} objs
     * @memberof WebviewHandler
     */
    addApi(...objs) {
        Object.assign(this._api, ...objs);
    }
}

module.exports = {
    WebviewHandler,
};