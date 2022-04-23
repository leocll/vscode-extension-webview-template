const { WebviewPanel, WebviewView } = require('../vscode/webview.view');

/**
 * `EGWebViewPanel` business class
 * @template T
 * @class EGWebViewPanel
 * @extends {WebviewPanel<T>}
 */
class EGWebViewPanel extends WebviewPanel {
    //
}

/**
 * `EGWebViewView` business class
 * @template T
 * @class EGWebViewView
 * @extends {WebviewView<T>}
 */
class EGWebViewView extends WebviewView {
    //
}

module.exports = {
    EGWebViewPanel,
    EGWebViewView,
};