const { WebView } = require('../vscode/vscode.webview');

/**
 *Add business
 *
 * @class EGWebView
 * @extends {WebView}
 */
class EGWebView extends WebView {
    /**
     * Creates an instance of EGWebView.
     * @memberof EGWebView
     */
    constructor() {
        super();
        this.handler.addApi({
            // api1: () => {},
            // api2: () => {}
        });
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
        // custom code if need
        return super.activate(context, name, cmdName, htmlPath);
    }
}

module.exports = EGWebView;