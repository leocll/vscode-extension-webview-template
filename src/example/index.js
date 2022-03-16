const vscode = require('vscode');
const utils = require('../vscode/vscode.utils');
const EGWebView = require('./e.g.webview');
const { WebviewViewProvider } = require('../vscode/vscode.webview.provider');

const name = 'Example';
const webview = new EGWebView();

/**
 * @param {vscode.ExtensionContext} context
 */
const activate = (context) => {
    // example.webview
    webview.activate(context, name, 'example.webview');
    // example.helloWorld
    context.subscriptions.push(
        vscode.commands.registerCommand('example.helloWorld', function() {
            utils.Api.showMessage({ txt: 'Hello World!' });
        })
    );
    // views
    const viewIds = ['leocll_example_activitybar.view1', 'leocll_example_activitybar.view2', 'leocll_example_panel.view1', 'leocll_example_panel.view2'];
    const provider1 = new WebviewViewProvider();
    provider1.activate(context, {viewId: viewIds[0]});
    const provider2 = new WebviewViewProvider();
    provider2.activate(context, {viewId: viewIds[1]});
};

const deactivate = () => {
    webview.deactivate();
};

module.exports = {
    name,
    activate,
    deactivate
};