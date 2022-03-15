const vscode = require('vscode');
const utils = require('../vscode/vscode.utils');
const EGWebView = require('./e.g.webview');
const { WebviewViewProvider } = require('../vscode/vscode.webview.provider');

const name = 'Example';
const webview = new EGWebView();
const temp = [];
const provider = new WebviewViewProvider();

/**
 * @param {vscode.ExtensionContext} context
 */
const activate = (context) => {
    // example.webview
    webview.activate(context, name, 'example.webview');
    // // example.helloWorld
    // context.subscriptions.push(
    //     vscode.commands.registerCommand('example.helloWorld', function() {
    //         utils.Api.showMessage({ txt: 'Hello World!' });
    //     })
    // );
    // views
    const viewIds = ['leocll_example_activitybar.view1'];//, 'leocll_example_activitybar.view2', 'leocll_example_panel.view1', 'leocll_example_panel.view2'];
    // temp.push(...viewIds.map(viewId => {
    //     const provider = new WebviewViewProvider();
    //     provider.activate(context, {viewId});
    //     return provider;
    // }));
    // provider.activate(context, {viewId: viewIds[0]});
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(viewIds[0], provider),
    );
};

const deactivate = () => {
    webview.deactivate();
};

module.exports = {
    name,
    activate,
    deactivate
};