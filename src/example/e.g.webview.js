const path = require('os').platform() === 'win32' ? require('path').win32 : require('path');
const { WebviewPanel, WebviewView } = require('../vscode/vscode.webview.view');
const { utils } = require('../vscode/vscode.utils');

/**
 * @template T
 * `EGWebViewPanel` business class
 * @class EGWebViewPanel
 * @extends {WebviewPanel<T>}
 */
class EGWebViewPanel extends WebviewPanel {
    /**
     * Creates an instance of EGWebViewPanel.
     * @param {string} name
     * @memberof EGWebViewPanel
     */
    constructor(name) {
        super({ name });
        this.handler.addApi(
            utils.webview.vscodeApi.api,
            utils.webview.vscodeContextApi.api,
        );
    }

    /**
     * Register
     * @param {import('vscode').ExtensionContext} context - vscode extension context
     * @param {string} command
     * @param {string} [htmlPath=path.join(context.extensionPath, 'web', 'dist', 'index.html')]
     * @returns {this}
     * @memberof WebviewPanel
     */
    // @ts-ignore
    register(context, command, htmlPath = undefined) {
        htmlPath = htmlPath || path.join(context.extensionPath, 'web', 'dist', 'index.html');
        return super.register(context, { command, htmlPath });
    }
}

/**
 * @template T
 * `EGWebViewView` business class
 * @class EGWebViewView
 * @extends {WebviewView<T>}
 */
 class EGWebViewView extends WebviewView {
    /**
     * Creates an instance of EGWebViewView.
     * @param {string} name
     * @memberof EGWebViewView
     */
    constructor(name) {
        super({ name });
        this.handler.addApi(
            utils.webview.vscodeApi.api,
            utils.webview.vscodeContextApi.api,
        );
    }

    /**
     * Register
     * @param {import('vscode').ExtensionContext} context vscode extension context
     * @param {string} viewId
     * @param {string} [htmlPath=path.join(context.extensionPath, 'web', 'dist', 'index.html')]
     * @returns {this}
     * @memberof WebviewPanel
     */
    // @ts-ignore
    register(context, viewId, htmlPath = undefined) {
        htmlPath = htmlPath || path.join(context.extensionPath, 'web', 'dist', 'index.html');
        return super.register(context, { viewId, htmlPath });
    }
}

module.exports = {
    EGWebViewPanel,
    EGWebViewView,
};