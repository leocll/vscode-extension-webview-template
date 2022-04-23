const path = require('os').platform() === 'win32' ? require('path').win32 : require('path');
const vscode = require('vscode');
const { utils } = require('../vscode/extension.utils');
const { EGWebViewPanel, EGWebViewView } = require('./e.g.webview');

const name = 'Example';
/**
 * @param {vscode.ExtensionContext} context
 */
const activate = (context) => {
    const htmlPath = path.join(context.extensionPath, 'web', 'dist', 'index.html');
    utils.activate(context, name);
    // example.helloWorld
    context.subscriptions.push(
        vscode.commands.registerCommand('example.helloWorld', function() {
            vscode.window.showErrorMessage('Hello World!');
        })
    );
    // example.webvie
    /**@type {EGWebViewPanel<{a: String, b: String}>} */
    const webviewPanel = new EGWebViewPanel({id: 'example.webview', name, htmlPath});
    webviewPanel.register(context);
    utils.webview.add(webviewPanel);
    // activity-bar views
    const viewIds = ['leocll_example_activitybar.view1', 'leocll_example_activitybar.view2', 'leocll_example_panel.view1', 'leocll_example_panel.view2'];
    viewIds.forEach((id, i) => {
        const webviewView = new EGWebViewView({id, name, htmlPath});
        webviewView.register(context, { retainContextWhenHidden: Boolean(i % 2)});
        utils.webview.add(webviewView);
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