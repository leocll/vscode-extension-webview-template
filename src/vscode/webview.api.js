const fs = require('fs');
const os = require('os');
const vscode = require('vscode');

/**
 * @typedef {{index: number, name: string, folder: string}} WorkspaceFolder
 * @typedef {{name?: string, uri: string}} AddWorkspaceFolder
 * @typedef {NodeJS.Platform} Platform
 */
/**
 * @template A
 * @template R
 * @typedef {(args: A) => R} WebviewSyncApi
 */
/**
 * @template A
 * @template R
 * @typedef {(args: A) => Promise<R>} WebviewAsyncApi
 */
/**
 * @template A
 * @template R
 * @typedef {WebviewSyncApi<A, R>|WebviewAsyncApi<A, R>} WebviewApi
 */
/**
 * Communication Api from `web` to `vscode`, `api` name same to `ReceivedMessageObject.cmd`
 * @class WebviewVscodeApi
 */
class WebviewVscodeApi {
    /**
     * @param {{name: String, outputChannel?: vscode.OutputChannel, terminal?: vscode.Terminal}} options 
     */
    constructor(options) {
        this.options = options;
        this.api = {
            /**
             * Get workspace file
             * @type {WebviewSyncApi<void, String>}
             */
            getWorkspaceFile: () => {
                return vscode.workspace.workspaceFile && vscode.workspace.workspaceFile.fsPath;
            },
            /**
             * Get workspace folders
             * @type {WebviewSyncApi<void, WorkspaceFolder[]>}
             */
            getWorkspaceFolders: () => {
                return vscode.workspace.workspaceFolders.map(wf => {
                    return { index: wf.index, name: wf.name, folder: wf.uri.fsPath };
                });
            },
            /**
             * Update workspace folders
             * @type {WebviewSyncApi<{start: number, deleteCount: number, add?: AddWorkspaceFolder[]}, Boolean>}
             */
            updateWorkspaceFolders: ({ start, deleteCount, add = undefined}) => {
                return vscode.workspace.updateWorkspaceFolders(start, deleteCount, ...(add || []).map(wf => { return {name: wf.name, uri: vscode.Uri.file(wf.uri)}; }));
            },
            /**
             * Find file in current workspace
             * @type {WebviewAsyncApi<{include: string, exclude?: string}, string[]>}
             */
            findFileInWorkspace: async ({ include, exclude = undefined }) => {
                try {
                    const uris = await vscode.workspace.findFiles(include, exclude);
                    return uris.map((uri) => uri.fsPath);
                } catch (e) {
                    console.error(e);
                    return [];
                }
            },
            /**
             * Get current platform
             * @type {WebviewSyncApi<void, Platform>}
             */
            getPlatform: () => {
                return os.platform();
            },
            /**
             * Show message alert
             * @type {WebviewAsyncApi<{txt: string, btns?: string[]}, string>}
             */
            showMessage: async ({ txt, btns = undefined }) => {
                txt = `[${this.name}] ${txt}`;
                return await vscode.window.showInformationMessage(txt, ...(btns || []));
            },
            /**
             * Show error alert
             * @type {WebviewAsyncApi<{txt: string, btns?: string[]}, string>}
             */
            showError: async ({ txt, btns = undefined }) => {
                txt = `[${this.name}] ${txt}`;
                return await vscode.window.showErrorMessage(txt, ...(btns || []));
            },
            /**
             * Show warn alert
             * @type {WebviewAsyncApi<{txt: string, btns?: string[]}, string>}
             */
            showWarn: async ({ txt, btns = undefined }) => {
                txt = `[${this.name}] ${txt}`;
                return await vscode.window.showWarningMessage(txt, ...(btns || []));
            },
            /**
             * Show Input Box
             * @type {WebviewAsyncApi<vscode.InputBoxOptions, string>}
             */
            showInputBox: async (options) => {
                /**@type {vscode.InputBoxOptions} */
                const opts = {
                    // value: undefined,
                    // prompt: '',
                    // placeHolder: '',
                    password: false,
                    ignoreFocusOut: true,
                    // validateInput: undefined,
                };
                Object.assign(opts, options || {});
                return await vscode.window.showInputBox(opts);
            },
            /**
             * Show open dialog, select a or some local files or folders.
             * vscode的bug，在ubuntu下既选文件又选文件夹会很诡异，据官方文档windows也会出现诡异情况，https://code.visualstudio.com/api/references/vscode-api#OpenDialogOptions
             * 在ubuntu和windows下不要 canSelectFiles 和 canSelectFolders 同时为 true
             * @typedef {{canSelectFiles?: boolean, canSelectFolders?: boolean, canSelectMany?: boolean, defaultUri?: string, filters?: {[name: string]: string[]}, openLabel?: string}} showOpenDialogOptions
             * @property {boolean} canSelectFiles if can select files
             * @property {boolean} canSelectFolders if can select folders
             * @property {boolean} canSelectMany if can select many
             * @property {string} defaultUri default open path
             * @property {{[name: string]: string[]}} filters e.g.: `{'Images': ['png', 'jpg'], 'TypeScript': ['ts', 'tsx']}`
             * @property {string} openLabel button label, default: `open`
             * @type {WebviewAsyncApi<showOpenDialogOptions, string[]>}
             */
            showOpenDialog: async (options) => {
                // filters:undefined, // 筛选器，例如：{'Images': ['png', 'jpg'], 'TypeScript': ['ts', 'tsx']}
                /**@type {showOpenDialogOptions} */
                const opts = {
                    canSelectFiles: true,
                    canSelectFolders: false,
                    canSelectMany: false,
                    // defaultUri: undefined,
                    // filters: undefined,
                    // openLabel: undefined,
                };
                Object.assign(opts, options || {});
                // @ts-ignore
                opts.defaultUri && (opts.defaultUri = vscode.Uri.file(opts.defaultUri));
                // @ts-ignore
                const uris = await vscode.window.showOpenDialog(opts);
                return uris && uris.map(uri => uri.fsPath);
            },
            /**
             * Show save dialog, select a local file path
             * @type {WebviewAsyncApi<{defaultUri?: string, filters?: {string: string[]}, saveLabel?: string}, string>}
             * @property filters e.g.: `{'Images': ['png', 'jpg'], 'TypeScript': ['ts', 'tsx']}`
             */
            showSaveDialog: async ({ defaultUri = undefined, filters = undefined, saveLabel = undefined }) => {
                const options = {};
                defaultUri && (options.defaultUri = vscode.Uri.file(defaultUri));
                filters && (options.filters = filters);
                saveLabel && (options.openLabel = saveLabel);
                const uri = await vscode.window.showSaveDialog(options);
                return uri ? uri.fsPath : undefined;
            },
            /**
             * Show pick dialog
             * @type {WebviewAsyncApi<{items: string[]|Promise<string[]>, canPickMany?: boolean, ignoreFocusOut?: boolean, matchOnDescription?: boolean, matchOnDetail?: boolean, placeHolder?: string}, string>}
             */
            showQuickPick: async ({ items, canPickMany = false, ignoreFocusOut = true, matchOnDescription = true, matchOnDetail = true, placeHolder = undefined }) => {
                const options = {};
                options.canPickMany = canPickMany;
                options.ignoreFocusOut = ignoreFocusOut;
                options.matchOnDescription = matchOnDescription;
                options.matchOnDetail = matchOnDetail;
                placeHolder && (options.placeHolder = placeHolder);
                return await vscode.window.showQuickPick(items, options);
            },
            /**
             * Show file
             * @type {WebviewAsyncApi<{filePath: string, viewColumn?: number, preserveFocus?: boolean, preview?: boolean, revealRange?: {startLine?: Number, endLine?: Number}, revealType?: vscode.TextEditorRevealType}, void>}
             */
            showTextDocument: async ({ filePath, viewColumn = undefined, preserveFocus = false, preview = false, revealRange = undefined, revealType = vscode.TextEditorRevealType.Default }) => {
                try {
                    /**@type {vscode.TextEditor} */
                    let textEdit = vscode.window.visibleTextEditors.find(te => {
                        return te.document.uri.fsPath === filePath;
                    });
                    if (textEdit) {
                        viewColumn = typeof viewColumn === 'number' ? viewColumn : textEdit.viewColumn;
                        textEdit = await vscode.window.showTextDocument(textEdit.document, viewColumn);
                    } else {
                        viewColumn = typeof viewColumn === 'number' ? viewColumn : vscode.ViewColumn.One;
                        textEdit = await vscode.window.showTextDocument(vscode.Uri.file(filePath), { viewColumn, preserveFocus, preview });
                    }
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
                } catch (reason) {
                    reason = reason || `cannot open '${filePath}'`;
                    reason = typeof reason === 'string' ? reason : (reason.message || reason.toString());
                    this.api.showError({txt: reason});
                }
            },
            /**
             * Show txt to output channel
             * @type {WebviewSyncApi<{txt: string, preserveFocus?: boolean, line?: boolean, show?: boolean}, void>}
             */
            showTxt2Output: ({ txt, preserveFocus = true, line = true, show = true }) => {
                const outputChannel = this.outputChannel;
                if (!outputChannel) {
                    console.error(`Don't have output channel.`);
                    return;
                }
                if (line) {
                    outputChannel.appendLine(txt);
                } else {
                    outputChannel.append(txt);
                }
                if (show) {
                    outputChannel.show(preserveFocus);
                }
            },
            /**
             * Send cmd to terminal
             * @type {WebviewSyncApi<{cmd: string, addNewLine?: boolean, preserveFocus?: boolean}, void>}
             */
            sendCmd2Terminal: ({ cmd, addNewLine = true, preserveFocus = false }) => {
                const terminal = this.terminal;
                if (!terminal) {
                    console.error(`Don't have terminal.`);
                    return;
                }
                terminal.sendText(cmd, addNewLine);
                terminal.show(preserveFocus);
            },
            /***************************** File System *****************************/
            /**
             * a File or folder if exists
             * @type {WebviewSyncApi<{path: string}, Boolean>}
             */
            exists4Path: ({ path }) => {
                return fs.existsSync(path);
            },
            /**
             * Get stat for path
             * @type {WebviewSyncApi<{path: string}, {error?: string, data?: {isFile: boolean, isDirectory: boolean, isSymbolicLink: boolean}}>}
             */
            getStat4Path: ({ path }) => {
                try {
                    const stats = fs.statSync(path);
                    return {
                        data: {
                            isFile: stats.isFile(),
                            isDirectory: stats.isDirectory(),
                            // isBlockDevice: stats.isDirectory(),
                            // isCharacterDevice: stats.isCharacterDevice(),
                            isSymbolicLink: stats.isSymbolicLink(),
                            // isFIFO: stats.isFIFO(),
                            // isSocket: stats.isSocket(),
                        }
                    };
                } catch (e) {
                    console.error(e);
                    return { error: e.message || e.toString() };
                }
            },
            /**
             * Read file
             * @type {WebviewSyncApi<{path: string, options?: 'hex'|'json'|'string'}, {error?: string, data?: any}>}
             */
            readFile: ({ path, options = undefined }) => {
                try {
                    const data = fs.readFileSync(path);
                    let odata = undefined;
                    if (!options) {
                        odata = data.toString();
                    } else if (options === 'hex') {
                        odata = data.toString('hex');
                    } else if (options === 'json') {
                        odata = JSON.parse(data.toString());
                    } else {
                        odata = data.toString();
                    }
                    return { data: odata };
                } catch (e) {
                    console.error(e);
                    return { error: e.message || e.toString() };
                }
            },
            /**
             * Write file
             * @type {WebviewAsyncApi<{path: string, data: string|Array|object, options?: fs.WriteFileOptions}, {error?: string}>}
             */
            writeFile: ({ path, data, options = undefined }) => {
                return new Promise((resolve) => {
                    const d = typeof data === 'string' ? data : JSON.stringify(data);
                    fs.writeFile(path, d, options, (err) => {
                        resolve({ error: err ? (err.message || err.toString()) : undefined });
                    });
                });
            },
            /**
             * Request
             * @type {WebviewAsyncApi<{url: string, method?: string, data?: {[x: string]: any}, headers?: {[x: string]: string|number}}, {error?: string, body: any, statusCode: number, statusMessage: string}>}
             */
            request: ({ url, method = 'POST', data = undefined, headers = { "content-type": "application/json" } }) => {
                return new Promise((resolve) => {
                    const request = require('request');
                    request({ url, method, headers, body: data }, (error, response, body) => {
                        error && typeof error !== 'string' && (error = error.message || error.toString());
                        resolve({ error, body, statusCode: response.statusCode, statusMessage: response.statusMessage });
                    });
                });
            },
        };
    }
    get outputChannel() {
        if (!this._outputChannel) {
            const options = this.options;
            this._outputChannel = options.outputChannel || vscode.window.createOutputChannel(this.name);
            this._outputChannel.show(true);
        }
        return this._outputChannel;
    }
    get terminal() {
        if (!this._terminal) {
            const options = this.options;
            this._terminal = options.terminal || vscode.window.createTerminal(this.name);
        }
        return this._terminal;
    }
    get name() { return this.options.name; }
}

/**
 * Communication Api from `web` to `vscode`, `api` name same to `ReceivedMessageObject.cmd`
 * @template T
 * @class WebviewVscodeContextApi
 */
class WebviewVscodeContextApi {
    /**
     * @param {vscode.ExtensionContext} context 
     */
    constructor(context) {
        /**@type {vscode.ExtensionContext} */
        this.context = context;
        this.api = {
            /**
             * Get extension path
             * @type {WebviewSyncApi<void, string>}
             */
            getExtensionPath: () => {
                return this.context.extensionPath;
            },
            /**
             * Get storage path
             * @type {WebviewSyncApi<void, string>}
             */
            getStoragePath: () => {
                return this.context.storagePath || this.context.storageUri.fsPath;
            },
            /**
             * Get global storage path
             * @type {WebviewSyncApi<void, string>}
             */
            getGlobalStoragePath: () => {
                return this.context.globalStoragePath || this.context.globalStorageUri.fsPath;
            },
            /**
             * Get workspace state
             * @type {WebviewSyncApi<void, T>}
             */
            getWorkspaceState: () => {
                // @ts-ignore
                return this.context.workspaceState._value || Object.assign({}, {}, ...this.context.workspaceState.keys().map(key => {
                    return {[key]: this.context.workspaceState.get(key)};
                }));
            },
            /**
             * Update workspace state
             * @type {WebviewSyncApi<T, void>}
             */
            updateWorkspaceState: (states) => {
                Object.entries(states).forEach(([key, value]) => {
                    this.context.workspaceState.update(key, value);
                });
            },
            /**
             * Get global state
             * @type {WebviewSyncApi<void, T>}
             */
            getGlobalState: () => {
                // @ts-ignore
                return this.context.globalState._value || Object.assign({}, {}, ...this.context.globalState.keys().map(key => {
                    return {[key]: this.context.globalState.get(key)};
                }));
            },
            /**
             * Update global state
             * @type {WebviewSyncApi<T, void>}
             */
            updateGlobalState: (states) => {
                Object.entries(states).forEach(([key, value]) => {
                    this.context.globalState.update(key, value);
                });
            },
            /**
             * Get merged state, `Object.assign(globalState, workspaceState)`
             * @type {WebviewSyncApi<void, T>}
             */
            getMergedState: () => {
                const globalState = this.api.getGlobalState();
                const workspaceState = this.api.getWorkspaceState();
                return Object.assign(globalState, workspaceState);
            },
        };
    }
}

module.exports = {
    WebviewVscodeApi,
    WebviewVscodeContextApi,
};