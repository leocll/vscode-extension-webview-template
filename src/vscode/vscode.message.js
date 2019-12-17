const utils = require('./vscode.utils');

/**
 * Communication Message from `vscode` to `web`
 * @class Message
 * @typedef {{cmd: string, data: any}} PostMessageObject
 */
class Message {
    /**
     * Create a new message
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
     * Create a new message of `syncBridgeData`
     * @static
     * @param {any} data
     * @returns {PostMessageObject}
     * @memberof Message
     */
    static syncBridgeData(data) {
        return { cmd: `syncBridgeData`, data };
    }
}

/**
 * Received Message from `web` to `vscode`
 * @typedef {{cmd: string, args: {}, reply: boolean, data?: any}} ReceivedMessageObject
 * @class ReceivedMessage
 */
class ReceivedMessage {
    constructor() {
        this.cmd = '';
        this.args = {};
        this.reply = true;
        this.data = undefined;
    }
}

/**
 * Executor to received message from `web` to `vscode`
 * @class Executor
 */
class Executor {
    /**
     * Creates an instance of Executor.
     * @memberof Executor
     */
    constructor() {
            for (const key in utils.Api) {
                if (utils.Api.hasOwnProperty(key)) {
                    this[key] = utils.Api[key];
                }
            }
        }
        /**
         * Get message handle method by cmd
         * @param {string} cmd
         * @returns {({}: any) => Thenable<ReceivedMessageObject>|undefined}
         * @memberof Executor
         */
    get(cmd) {
        return this[cmd];
    }
}

/**
 * Handler to received message from `web` to `vscode`
 * @class Handler
 */
class Handler {
    /**
     * Creates an instance of Handler.
     * @param {Executor[]} [executors=[new Executor()]]
     * @memberof Handler
     */
    constructor(executors = [new Executor()]) {
        this.executors = executors;
        /**
         * Handler to received message
         * @type {(poster: import('vscode').Webview, message: ReceivedMessageObject) => void}
         */
        this.received = (poster, message) => {
            const cmd = message.cmd;
            const args = message.args;
            const func = (_ => {
                for (var i = 0, len = this.executors.length; i < len; i++) {
                    if (this.executors[i].get(cmd)) {
                        return this.executors[i].get(cmd);
                    }
                }
                return undefined;
            })();
            if (func) {
                const p = func(args);
                if (message.reply && poster) {
                    if (p) {
                        p.then(data => {
                            message.data = data;
                            poster.postMessage(message);
                        });
                    } else {
                        poster.postMessage(message);
                    }
                }
            }
        };
    }
}

module.exports = {
    Message,
    ReceivedMessage,
    Executor,
    Handler
};