/**
 * @typedef {{cmd: string, data?: any}} PostMessageObject - Message from `vscode` to `web`
 * @typedef {{cmd: string, args: {[x: string]: any}, reply: boolean, data?: any}} ReceivedMessageObject - Message from `web` to `vscode`
 */
/**
 * Communication Message from `vscode` to `web`
 * @class Message
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

module.exports = {
    Message,
};