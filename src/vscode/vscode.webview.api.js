const fs = require('fs');
const os = require('os');
const path = os.platform() === 'win32' ? require('path').win32 : require('path');
const vscode = require('vscode');
const { WebViewMessageCenter } = require('./vscode.message');

/**
 * @typedef {import('./vscode.message').ResultHandler} ResultHandler
 * @typedef {import('./vscode.message').ReceivedMessageObject} ReceivedMessageObject
 */

const vscodeApi = {
    workspace: {
    }
};

class VSCodeWebViewApi extends WebViewMessageCenter {
    constructor() {
        super();
        this.workspace = {};
    }
    /**
     * @param {ResultHandler} resultHandler 
     * @param {ReceivedMessageObject} message 
     */
    onDidReceiveMessage(resultHandler, message) {
        if (message.cmd && message.cmd.startsWith('vscode.')) {
            resultHandler(this.handleReceiveMessage(message));
        }
    }
    /**
     * @param {ReceivedMessageObject} message
     */
    handleReceiveMessage(message) {
        try {
            const ps = message.cmd.split('.');
            let p = vscode;
            let i = 1;
            while (i < ps.length) {
                p = p[ps[i]];
            }
            return typeof p === 'function' ? p(...message.args) : p;
        } catch (e) {

        }
    }
}

const ApiPromise = (callBack) => {
    return new Promise((resolve, reject) => {
        callBack(resolve, reject);
    });
};

/**
 * @typedef {{index: number, name: string, folder: string}} WorkspaceFolder
 * @typedef {{name?: string, uri: string}} AddWorkspaceFolder
 * @typedef {NodeJS.Platform} Platform
 */
/**
 * @returns {WorkspaceFolder[]}
 */
function getSyncWorkspaceFolders() {
    return vscode.workspace.workspaceFolders.map(wf => {
        return { index: wf.index, name: wf.name, folder: wf.uri.fsPath };
    });
}

/**
 * Communication Api from `web` to `vscode`, `api` name same to `ReceivedMessageObject.cmd`
 * @class WebviewApi
 */
class _WebviewApi {
    constructor() {
        /**
         * Get bridge data
         * @type {() => Thenable<any>}
         */
        this.getBridgeData = () => {
            return ApiPromise((resolve) => {
                resolve(this.bridgeData.cache);
            });
        };
        /**
         * Update bridge data
         * @type {(items: {}) => Thenable<undefined>}
         */
        this.updateBridgeData = (items) => {
            return ApiPromise((resolve) => {
                this.bridgeData.updateItems(items, false);
                resolve();
            });
        };
        /**
         * Get extension path
         * @type {() => Thenable<string>}
         */
        this.getExtensionPath = () => {
            return ApiPromise((resolve) => {
                resolve(this.context.extensionPath);
            });
        };
        /**
         * Get workspace file
         * @type {() => Thenable<string|undefined>}
         */
        this.getWorkspaceFile = () => {
            return ApiPromise((resolve) => {
                resolve(vscode.workspace.workspaceFile && vscode.workspace.workspaceFile.fsPath);
            });
        };
        /**
         * Get workspace folders
         * @type {() => Thenable<WorkspaceFolder[]>}
         */
        this.getWorkspaceFolders = () => {
            return ApiPromise((resolve) => {
                resolve(getSyncWorkspaceFolders());
            });
        };
        /**
         * Update workspace folders
         * @type {({start, deleteCount, add}: {start: number, deleteCount: number, add?: AddWorkspaceFolder[]}) => Thenable<Boolean>} 
         */
        this.updateWorkspaceFolders = ({ start, deleteCount, add = undefined}) => {
            return ApiPromise((resolve) => {
                resolve(vscode.workspace.updateWorkspaceFolders(start, deleteCount, ...(add || []).map(wf => { return {name: wf.name, uri: vscode.Uri.file(wf.uri)}; })));
            });
        };
        /**
         * Get storage path
         * @type {() => Thenable<string>}
         */
        this.getStoragePath = () => {
            return ApiPromise((resolve) => {
                resolve(this.context.storagePath || this.context.storageUri.fsPath);
            });
        };
        /**
         * Get global storage path
         * @type {() => Thenable<string>}
         */
        this.getGlobalStoragePath = () => {
            return ApiPromise((resolve) => {
                resolve(this.context.globalStoragePath || this.context.globalStorageUri.fsPath);
            });
        };
        /**
         * Get workspace state
         * @type {() => Thenable<{[x: string]: any}>}
         */
        this.getWorkspaceState = () => {
            return ApiPromise((resolve) => {
                resolve(this.context.workspaceState._value || this.context.workspaceState.keys().map(key => {
                    return {[key]: this.context.workspaceState.get(key)};
                }).reduce((a, b) => Object.assign({}, a, b), {}));
            });
        };
        /**
         * Update workspace state
         * @type {(states: any) => Thenable<undefined>}
         */
        this.updateWorkspaceState = (states) => {
            return ApiPromise((resolve) => {
                for (const key in states) {
                    if (states.hasOwnProperty(key)) {
                        const value = states[key];
                        this.context.workspaceState.update(key, value);
                    }
                }
                resolve();
            });
        };
        /**
         * Get global state
         * @type {() => Thenable<any>}
         */
        this.getGlobalState = () => {
            return ApiPromise((resolve) => {
                resolve(this.context.globalState._value || this.context.globalState.keys().map(key => {
                    return {[key]: this.context.globalState.get(key)};
                }).reduce((a, b) => Object.assign({}, a, b), {}));
            });
        };
        /**
         * Update global state
         * @type {(states: any) => Thenable<void>}
         */
        this.updateGlobalState = (states) => {
            return ApiPromise((resolve) => {
                for (const key in states) {
                    if (states.hasOwnProperty(key)) {
                        const value = states[key];
                        this.context.globalState.update(key, value);
                    }
                }
                resolve();
            });
        };
        /**
         * Find file in current workspace
         * @type {({include, exclude}: {include: string, exclude?: string}) => Thenable<string[]>}
         */
        this.findFileInWorkspace = ({ include, exclude = undefined }) => {
            return ApiPromise((resolve) => {
                vscode.workspace.findFiles(include, exclude).then((uris) => {
                    resolve(uris.map((uri) => uri.fsPath));
                }, () => {
                    resolve(undefined);
                });
            });
        };
        /**
         * Get current platform
         * @type {() => Thenable<Platform>}
         */
        this.getPlatform = () => {
            return ApiPromise((resolve) => {
                resolve(os.platform());
            });
        };
        /**
         * Show message alert
         * @type {({txt, btns}: {txt: string, btns?: string[]}) => Thenable<string>}
         */
        this.showMessage = ({ txt, btns = undefined }) => {
            txt = `[${this.name}] ${txt}`;
            return vscode.window.showInformationMessage(txt, ...(btns || []));
            // .then(btn => {})
        };
        /**
         * Show error alert
         * @type {({txt, btns}: {txt: string, btns?: string[]}) => Thenable<string>}
         */
        this.showError = ({ txt, btns = undefined }) => {
            txt = `[${this.name}] ${txt}`;
            return vscode.window.showErrorMessage(txt, ...(btns || []));
            // .then(btn => {})
        };
        /**
         * Show warn alert
         * @type {({txt, btns}: {txt: string, btns?: string[]}) => Thenable<string>}
         */
        this.showWarn = ({ txt, btns = undefined }) => {
            txt = `[${this.name}] ${txt}`;
            return vscode.window.showWarningMessage(txt, ...(btns || []));
            // .then(btn => {})
        };
        /**
         * Show Input Box
         * @type {({value, prompt, placeHolder, password, ignoreFocusOut, validateInput}: vscode.InputBoxOptions) => Thenable<string>}
         */
        this.showInputBox = ({ value, prompt = '', placeHolder = '', password = false, ignoreFocusOut = true, validateInput = undefined }) => {
            const options = {};
            options.value = value;
            prompt && (options.prompt = prompt);
            placeHolder && (options.placeHolder = placeHolder);
            password && (options.password = password);
            ignoreFocusOut && (options.ignoreFocusOut = ignoreFocusOut);
            validateInput && (options.validateInput = validateInput);
            return vscode.window.showInputBox(options);
        };
        /**
         * Show open dialog, select a or some local files or folders.
         * vscode的bug，在ubuntu下既选文件又选文件夹会很诡异，据官方文档windows也会出现诡异情况，https://code.visualstudio.com/api/references/vscode-api#OpenDialogOptions
         * 在ubuntu和windows下不要 canSelectFiles 和 canSelectFolders 同时为 true
         * @param {showOpenDialogOptions} any
         * @typedef {{canSelectFiles?: boolean, canSelectFolders?: boolean, canSelectMany?: boolean, defaultUri?: string, filters?: {[name: string]: string[]}, openLabel?: string}} showOpenDialogOptions
         * @property {boolean} canSelectFiles if can select files
         * @property {boolean} canSelectFolders if can select folders
         * @property {boolean} canSelectMany if can select many
         * @property {string} defaultUri default open path
         * @property {{[name: string]: string[]}} filters e.g.: `{'Images': ['png', 'jpg'], 'TypeScript': ['ts', 'tsx']}`
         * @property {string} openLabel button label, default: `open`
         * @returns {Thenable<string[]|undefined>}
         */
        this.showOpenDialog = ({ canSelectFiles = true, canSelectFolders = false, canSelectMany = false, defaultUri = undefined, filters = undefined, openLabel = undefined }) => {
            // filters:undefined, // 筛选器，例如：{'Images': ['png', 'jpg'], 'TypeScript': ['ts', 'tsx']}
            const options = {};
            options.canSelectFiles = canSelectFiles;
            options.canSelectFolders = canSelectFolders;
            options.canSelectMany = canSelectMany;
            defaultUri && (options.defaultUri = vscode.Uri.file(defaultUri));
            filters && (options.filters = filters);
            openLabel && (options.openLabel = openLabel);
            return ApiPromise((resolve) => {
                vscode.window.showOpenDialog(options).then(uris => {
                    resolve(uris && uris.map(uri => uri.fsPath));
                });
            });
        };
        /**
         * Show save dialog, select a local file path
         * @type {({defaultUri, filters, saveLabel}: {defaultUri?: string, filters?: {string: string[]}, saveLabel?: string}) => Thenable<string|undefined>}
         * @property filters e.g.: {'Images': ['png', 'jpg'], 'TypeScript': ['ts', 'tsx']}
         */
        this.showSaveDialog = ({ defaultUri = undefined, filters = undefined, saveLabel = undefined }) => {
            const options = {};
            defaultUri && (options.defaultUri = vscode.Uri.file(defaultUri));
            filters && (options.filters = filters);
            saveLabel && (options.openLabel = saveLabel);
            return ApiPromise((resolve) => {
                vscode.window.showSaveDialog(options).then(uri => {
                    resolve(uri ? uri.fsPath : undefined);
                });
            });
        };
        /**
         * Show pick dialog
         * @type {({items, canPickMany, ignoreFocusOut, matchOnDescription, matchOnDetail, placeHolder}: {items: string[]|Thenable<string[]>, canPickMany?: boolean, ignoreFocusOut?: boolean, matchOnDescription?: boolean, matchOnDetail?: boolean, placeHolder?: string}) => Thenable<string>}
         */
        this.showQuickPick = ({ items, canPickMany = false, ignoreFocusOut = true, matchOnDescription = true, matchOnDetail = true, placeHolder = undefined }) => {
            const options = {};
            options.canPickMany = canPickMany;
            options.ignoreFocusOut = ignoreFocusOut;
            options.matchOnDescription = matchOnDescription;
            options.matchOnDetail = matchOnDetail;
            placeHolder && (options.placeHolder = placeHolder);
            return vscode.window.showQuickPick(items, options);
        };
        /**
         * Show file
         * @type {({filePath, viewColumn, preserveFocus, preview, revealRange, revealType}: {filePath: string, viewColumn?: number, preserveFocus?: boolean, preview?: boolean, revealRange?: {startLine?: Number, endLine?: Number}, revealType?: vscode.TextEditorRevealType}) => void}
         */
        this.showTextDocument = ({ filePath, viewColumn = vscode.ViewColumn.One, preserveFocus = false, preview = false, revealRange = undefined, revealType = vscode.TextEditorRevealType.Default }) => {
            const textEdit = vscode.window.visibleTextEditors.find(te => {
                return te.document.uri.fsPath === filePath;
            });
            /**@type {Thenable<vscode.TextEditor>} */
            let promise = undefined;
            if (textEdit) {
                promise = vscode.window.showTextDocument(textEdit.document, textEdit.viewColumn);
            } else {
                promise = vscode.window.showTextDocument(vscode.Uri.file(filePath), { viewColumn, preserveFocus, preview });
            }
            promise.then((textEdit) => {
                const lineCount = textEdit.document.lineCount;
                if (lineCount > 0 && revealRange && (typeof revealRange.startLine === 'number' || typeof revealRange.endLine === 'number')) {
                    let startLine = typeof revealRange.startLine === 'number' ? revealRange.startLine : 1;
                    let endLine = typeof revealRange.endLine === 'number' ? revealRange.endLine : lineCount;
                    startLine = 0 < startLine && startLine <= lineCount ? startLine : 1;
                    endLine = 0 < endLine && endLine < lineCount ? endLine : lineCount;
                    const startTextLine = textEdit.document.lineAt(startLine - 1);
                    const endTextLine = textEdit.document.lineAt(endLine - 1);
                    const range = new vscode.Range(startTextLine.range.start, endTextLine.range.end);
                    textEdit.revealRange(range, revealType);
                }
            }, (reason) => {
                reason = reason || `cannot open '${filePath}'`;
                reason = typeof reason === 'string' ? reason : (reason.message || reason.toString());
                // vscode.window.showErrorMessage(reason);
                this.showError({txt: reason});
            });
        };
        /**
         * Show txt to output
         * @type {({txt, preserveFocus, line}: {txt: string, preserveFocus?: boolean, line?: boolean, show?: boolean}) => void}
         */
        this.showTxt2Output = ({ txt, preserveFocus = true, line = true, show = true }) => {
            if (line) {
                this.output.appendLine(txt);
            } else {
                this.output.append(txt);
            }
            if (show) {
                this.output.show(preserveFocus);
            }
        };
        /**
         * Send cmd to terminal
         * @type {({cmd, addNewLine, preserveFocus}: {cmd: string, addNewLine?: boolean, preserveFocus?: boolean}) => void}
         */
        this.sendCmd2Terminal = ({ cmd, addNewLine = true, preserveFocus = false }) => {
            this.terminal.sendText(cmd, addNewLine);
            this.terminal.show(preserveFocus);
        };
        /***************************** File System *****************************/
        /**
         * a File or folder if exists
         * @type {({path}: {path: string}) => Thenable<boolean>}
         */
        this.exists4Path = ({ path }) => {
            return ApiPromise((resolve) => {
                resolve(fs.existsSync(path));
            });
        };
        /**
         * Get stat for path
         * @type {({path}: {path: string}) => Thenable<{error?: string, data: undefined|{isFile: boolean, isDirectory: boolean, isSymbolicLink: boolean}}>}
         */
        this.getStat4Path = ({ path }) => {
            return ApiPromise((resolve) => {
                fs.stat(path, (err, stats) => {
                    resolve({
                        error: err.message,
                        data: stats ? {
                            isFile: stats.isFile(),
                            isDirectory: stats.isDirectory(),
                            // isBlockDevice: stats.isDirectory(),
                            // isCharacterDevice: stats.isCharacterDevice(),
                            isSymbolicLink: stats.isSymbolicLink(),
                            // isFIFO: stats.isFIFO(),
                            // isSocket: stats.isSocket(),
                        } : undefined
                    });
                });
            });
        };
        /**
         * Read file
         * @type {({path, options}: {path: string, options?: 'hex'|'json'|'string'}) => Thenable<{error?: string, data?: any}>}
         */
        this.readFile = ({ path, options = undefined }) => {
            return ApiPromise((resolve) => {
                fs.readFile(path, (err, data) => {
                    let oerr = undefined;
                    let odata = undefined;
                    if (!err) {
                        if (!options) {
                            odata = data.toString();
                        } else if (options === 'hex') {
                            odata = data.toString('hex');
                        } else if (options === 'json') {
                            odata = (() => {
                                try {
                                    return JSON.parse(data.toString());
                                } catch (e) {
                                    err = e.message || e.toString();
                                    return undefined;
                                }
                            })();
                        } else {
                            odata = data.toString();
                        }
                    } else {
                        oerr = err.message || `Failed to read file: ${path}`;
                    }
                    resolve({ error: oerr, data: odata || data });
                });
            });
        };
        /**
         * Write file
         * @type {({path, data, options}: {path: string, data: string|[]|{}, options?: fs.WriteFileOptions}) => Thenable<{error?: string|undefined}>}
         */
        this.writeFile = ({ path, data, options = undefined }) => {
            return ApiPromise((resolve) => {
                const d = typeof data === 'string' ? data : JSON.stringify(data);
                fs.writeFile(path, d, options, (err) => {
                    resolve({ error: err ? (err.message || err.toString()) : undefined });
                });
            });
        };
        /**
         * Request
         * @type {({}: {url: string, method?: string, data?: {}, headers?: {}}) => Thenable<{error?: string, body: any, statusCode: number, statusMessage:string}>}
         */
        this.request = ({ url, method = 'POST', data = undefined, headers = { "content-type": "application/json" } }) => {
            return ApiPromise((resolve) => {
                const request = require('request');
                request({ url, method, headers, body: data }, (error, response, body) => {
                    error && typeof error !== 'string' && (error = error.message || error.toString());
                    resolve({ error, body, statusCode: response.statusCode, statusMessage: response.statusMessage });
                });
            });
        };
    }
    get output() {
        if (!this._output) {
            this._output = vscode.window.createOutputChannel(this.name);
            this._output.show(true);
        }
        return this._output;
    }
    get terminal() {
        this._terminal || (this._terminal = vscode.window.createTerminal(this.name));
        return this._terminal;
    }
    get name() { return this._name; }
    get context() { return this._context; }
    get bridgeData() { return this._bridgeData; }

    /**
     * Activate
     * @param {vscode.ExtensionContext} context
     * @param {string} name
     * @param {import('./vscode.bridge')} bridgeData
     * @returns {this}
     * @memberof WebviewApi
     */
    activate(context, name, bridgeData) {
        this._context = context;
        this._name = name;
        this._bridgeData = bridgeData;
        return this;
    }
    deactivate() {}
}
const WebviewApi = new _WebviewApi();
module.exports = WebviewApi;