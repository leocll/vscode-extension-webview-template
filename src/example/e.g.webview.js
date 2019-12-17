const { WebView } = require('../vscode/vscode.webview');
const { Executor, Handler } = require('../vscode/vscode.message');

/**
 *WebView API of business
 *
 * @class EGExecutor
 * @extends {Executor}
 */
class EGExecutor extends Executor {
    constructor() {
        super();
        // this.api1 = () => {};
        // this.api2 = () => {};
    }
}

/**
 *Add business
 *
 * @class EGWebView
 * @extends {WebView}
 */
class EGWebView extends WebView {
    /**
     * Creates an instance of EGWebView.
     * @param {string} name
     * @memberof EGWebView
     */
    constructor(name) {
        super(name, new Handler([new EGExecutor()]));
    }
}

module.exports = EGWebView;