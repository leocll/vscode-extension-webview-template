const path = require('os').platform() === 'win32' ? require('path').win32 : require('path');
const vscode = require('vscode');
const { WebviewPanel, WebviewView } = require('../vscode/vscode.webview.view');
const { VscodeApi, VscodeContextApi } = require('../vscode/vscode.webview.api');

const name = 'Example';

/**
 * @param {vscode.ExtensionContext} context
 */
const activate = (context) => {
    const htmlPath = path.join(context.extensionPath, 'web', 'dist', 'index.html');
    const api1 = new VscodeApi({ name });
    const api2 = new VscodeContextApi(context);

    // example.webvie
    /**@type {WebviewPanel<{a: String, b: String}>} */
    const webviewPanel = new WebviewPanel({
        name,
        data: {
            a: 'a',
            b: 'b',
        }
    });
    webviewPanel.handler.addApi(api1.api, api2.api);
    webviewPanel.register(context, {
        command: 'example.webview',
        htmlPath,
    });
    // example.helloWorld
    context.subscriptions.push(
        vscode.commands.registerCommand('example.helloWorld', function() {
            vscode.window.showErrorMessage('Hello World!');
        })
    );
    // views
    const viewIds = ['leocll_example_activitybar.view1', 'leocll_example_activitybar.view2', 'leocll_example_panel.view1', 'leocll_example_panel.view2'];
    viewIds.forEach(id => {
        const webviewView = new WebviewView({
            name: id,
        });
        webviewView.handler.addApi(api1.api, api2.api);
        webviewView.register(context, {
            viewId: id,
            htmlPath
        });
    });
};

const deactivate = () => {
};

module.exports = {
    name,
    activate,
    deactivate
};