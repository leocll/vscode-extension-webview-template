const vscode = require('vscode');
const { WebviewVscodeApi, WebviewVscodeContextApi } = require('./webview.api');
/**
 * @typedef {import('./webview.view').Webview} Webview
 */
/**
 * @template T
 */
class ExtensionUtils {
    get activated() { return this._activated || false; }
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
     */
    activate(context, name) {
        this._activated = true;
        this._name = name;
        this._context = context;
        this._webview = {
            vscodeApi: new WebviewVscodeApi({ name }),
            /**@type {WebviewVscodeContextApi<T>} */
            vscodeContextApi: new WebviewVscodeContextApi(context),
            /**@type {ReadonlySet<Webview>} */
            views: new Set(),
            /**@type {(...views: Webview[]) => void} */
            add: (...views) => {
                if (!this.activated) {
                    throw new Error(`Please call 'activate', first`);
                }
                views.forEach(v => {
                    // @ts-ignore
                    this.webview.views.add(v);
                    v.addApi(this.webview.vscodeApi);
                    v.addApi(this.webview.vscodeContextApi);
                });
            },
        };
        return this;
    }
    /**
     * Deactivate
     * @returns {this}
     */
    deactivate() {
        this._context = undefined;
        this.webview.vscodeContextApi.context = undefined;
        return this;
    }
}

const _utils = new ExtensionUtils();
/**
 * - `ExtensionUtils` singleton
 * @template T
 * @type {ExtensionUtils<T>}
 */
const utils = new Proxy(_utils, {});
/**
 * - set `ExtensionUtils` singleton
 * @param {ExtensionUtils<any>} v
 */
const setUtils = (v) => {
    if (_utils.activated) {
        throw new Error(`Please call me before calling 'activate'`);
    }
    Object.assign(v, _utils);
};
module.exports = {
    ExtensionUtils,
    utils,
    setUtils,
};