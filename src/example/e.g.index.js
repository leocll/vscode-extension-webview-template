const vscode = require('vscode');
const utils = require('../vscode/vscode.utils');
const EGWebView = require('./e.g.webview');

const name = 'Example';
const webview = new EGWebView(name);

/**
 * @param {vscode.ExtensionContext} context
 */
const activate = (context) => {
    utils.activate(context, name, webview.bridgeData);
    // example.webview
    webview.activate(context, 'example.webview');
    // example.helloWorld
    context.subscriptions.push(
        vscode.commands.registerCommand('example.helloWorld', function () {
            utils.Api.showMessage({txt: 'Hello World!'});
        })    
    );
};

const deactivate = () => {
    webview.deactivate();
    utils.deactivate();
};

module.exports = {
    name,
	activate,
	deactivate
};