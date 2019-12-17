const example = require('./example');

/**
 * Called when the extension is activated
 * @param {import('vscode').ExtensionContext} context
 */
function activate(context) {
    console.log(`Extension(${example.name}) is activated.`);
    example.activate(context);
}
exports.activate = activate;

/**
 * Called when the extension is deactivated
 */
function deactivate() {
    example.deactivate();
    console.log(`Extension(${example.name}) is deactivated.`);
}

module.exports = {
    activate,
    deactivate
};