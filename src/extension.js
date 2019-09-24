// @ts-nocheck
const example = require('./example/e.g.index');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log(`Extension(${example.name}) is activated.`);
	example.activate(context);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
	console.log(`Extension(${example.name}) is deactivated.`);
}

module.exports = {
	activate,
	deactivate
};
