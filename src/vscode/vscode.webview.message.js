/**
 * Communication Message from `vscode` to `web`
 * @class Message
 * @typedef {{cmd: string, data: any}} PostMessageObject
 */
class Message {
    /**
     * Create a new message
     * @static
     * @param {string} cmd
     * @param {any} data
     * @returns {PostMessageObject}
     * @memberof Message
     */
    static create(cmd, data) {
        return { cmd, data };
    }

    /**
     * Create a new message of `webviewDidPose`
     * @static
     * @param {any} data
     * @returns {PostMessageObject}
     * @memberof Message
     */
    static webviewDidPose(data) {
        return { cmd: `webviewDidPose`, data };
    }

    /**
     * Create a new message of `webviewDidDispose`
     * @static
     * @param {any} data
     * @returns {PostMessageObject}
     * @memberof Message
     */
    static webviewDidDispose(data) {
        return { cmd: `webviewDidDispose`, data };
    }

    /**
     * Create a new message of `webviewDidChangeViewState`
     * @static
     * @param {any} data
     * @returns {PostMessageObject}
     * @memberof Message
     */
    static webviewDidChangeViewState(data) {
        return { cmd: `webviewDidChangeViewState`, data };
    }

    /**
     * Create a new message of `webviewDidChangeVisibility`
     * @static
     * @param {any} data
     * @returns {PostMessageObject}
     * @memberof Message
     */
    static webviewDidChangeVisibility(data) {
        return { cmd: `webviewDidChangeVisibility`, data };
    }

    /**
     * Create a new message of `syncWebviewData`
     * @static
     * @param {any} data
     * @returns {PostMessageObject}
     * @memberof Message
     */
    static syncWebviewData(data) {
        return { cmd: `syncWebviewData`, data };
    }
}

/**
 * Received Message from `web` to `vscode`
 * @typedef {{cmd: string, args: {[x: string]: any}, reply: boolean, data?: any}} ReceivedMessageObject
 */

/**
 * Handler to received message from `web` to `vscode`
 * @class Handler
 */
class Handler {
    /**
     * Creates an instance of Handler.
     * @memberof Handler
     */
    constructor() {
        /**@type {{[api: string]: Function}} */
        this._api = {};
        /**
         * Handler to received message
         * @type {(poster: import('vscode').Webview, message: ReceivedMessageObject) => void}
         */
        this.received = (poster, message) => {
            const cmd = message.cmd;
            const args = message.args;
            const func = (_ => {
                if (this.api.hasOwnProperty(cmd) && this.api[cmd]) {
                    return this.api[cmd];
                }
                return undefined;
            })();
            if (func) {
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
     * @memberof Handler
     */
    addApi(...objs) {
        Object.assign(this._api, ...objs);
    }
}

module.exports = {
    Message,
    Handler
};