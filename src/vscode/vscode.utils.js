const vscode = require('vscode');
const { WebviewVscodeApi, WebviewVscodeContextApi } = require('./vscode.webview.api');

/**
 * @template T
 */
class ExtensionUtils {
    get name() { return this._name; }
    get context() { return this._context; }
    get webview() { return this._webview; }
    get diagnosticCollection() {
        return this._diagnosticCollection || (this._diagnosticCollection = vscode.languages.createDiagnosticCollection(this.name));
    }
    /**
     * Activate
     * @param {import('vscode').ExtensionContext} context - vscode extension context
     * @param {string} name - extension name
     * @returns {this}
     * @memberof _Extension
     */
    activate(context, name) {
        this._name = name;
        this._context = context;
        this._webview = {
            vscodeApi: new WebviewVscodeApi({ name }),
            /**@type {WebviewVscodeContextApi<T>} */
            vscodeContextApi: new WebviewVscodeContextApi(context),
        };
        return this;
    }
    deactivate() {
        this._context = undefined;
    }
}
/**
 * - `ExtensionUtils` singleton
 * @template T
 * @type {ExtensionUtils<T>}
 */
let utils = new ExtensionUtils();
/**
 * - set `ExtensionUtils` singleton
 * @template T
 * @param {ExtensionUtils<T>} v
 */
const setUtils = (v) => {
    utils = v;
};
module.exports = {
    ExtensionUtils,
    utils,
    setUtils,
};