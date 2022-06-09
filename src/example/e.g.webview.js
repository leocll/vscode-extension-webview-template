const { WebviewPanel, WebviewView } = require('../vscode/webview.view');

/**
 * `EGWebViewPanel` business class
 * @template T
 * @class EGWebViewPanel
 * @extends {WebviewPanel<T>}
 */
class EGWebViewPanel extends WebviewPanel {
    _setupHandler(handler) {
        super._setupHandler(handler);
        // webview business api
        // this.addApi({
        //     api: {
        //         // 
        //     }
        // });
    }
}

/**
 * `EGWebViewView` business class
 * @template T
 * @class EGWebViewView
 * @extends {WebviewView<T>}
 */
class EGWebViewView extends WebviewView {
    _setupHandler(handler) {
        super._setupHandler(handler);
        // webview business api
        // this.addApi({
        //     api: {
        //         // 
        //     }
        // });
    }
}

module.exports = {
    EGWebViewPanel,
    EGWebViewView,
};