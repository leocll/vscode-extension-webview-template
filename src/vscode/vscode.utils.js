const vscode = require('vscode');
const WebviewApi = require('./vscode.webviewApi');

class Utils {
    static get Api() { return WebviewApi; }
    static get bridgeData() { return this.Api.bridgeData; }
    static get context() { return this.Api.context; }
    static get extName() { return this.Api.name; }
    static get diagnosticCollection() {
        return this._diagnosticCollection || (this._diagnosticCollection = vscode.languages.createDiagnosticCollection(this.extName));
    }
}

const utils = Utils;
module.exports = utils;