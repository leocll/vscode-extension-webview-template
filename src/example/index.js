const vscode = require('vscode');
const { utils } = require('../vscode/webview.utils');
const { EGWebViewPanel, EGWebViewView } = require('./e.g.webview');

const name = 'Example';
/**
 * @param {vscode.ExtensionContext} context
 */
const activate = (context) => {
    utils.activate(context, name);
    // example.webvie
    /**@type {EGWebViewPanel<{a: String, b: String}>} */
    const webviewPanel = new EGWebViewPanel(name);
    webviewPanel.register(context, 'example.webview');
    // example.helloWorld
    context.subscriptions.push(
        vscode.commands.registerCommand('example.helloWorld', function() {
            vscode.window.showErrorMessage('Hello World!');
        })
    );
    // views
    const viewIds = ['leocll_example_activitybar.view1', 'leocll_example_activitybar.view2', 'leocll_example_panel.view1', 'leocll_example_panel.view2'];
    viewIds.forEach(id => {
        const webviewView = new EGWebViewView(name);
        webviewView.register(context, id);
    });
};

const deactivate = () => {
    utils.deactivate();
};

module.exports = {
    name,
    activate,
    deactivate
};