const fs = require('fs');
const os = require('os');
const vscode = require('vscode');

/**
 * @typedef {{index: number, name: string, folder: string}} WorkspaceFolder
 * @typedef {{name?: string, uri: string}} AddWorkspaceFolder
 * @typedef {NodeJS.Platform} Platform
 */

/**
 * Communication Api from `web` to `vscode`, `api` name same to `ReceivedMessageObject.cmd`
 * @class VscodeApi
 */
class VscodeApi {
    /**
     * @param {{name?: String, outputChannel?: vscode.OutputChannel|String, terminal?: vscode.Terminal|String}} options 
     */
    constructor(options=undefined) {
        options = options || {};
        this.options = options;
        this.api = {
            /**
             * Get workspace file
             * @type {() => string|undefined}
             */
            getWorkspaceFile: () => {
                return vscode.workspace.workspaceFile && vscode.workspace.workspaceFile.fsPath;
            },
            /**
             * Get workspace folders
             * @type {() => WorkspaceFolder[]}
             */
            getWorkspaceFolders: () => {
                return vscode.workspace.workspaceFolders.map(wf => {
                    return { index: wf.index, name: wf.name, folder: wf.uri.fsPath };
                });
            },
            /**
             * Update workspace folders
             * @type {({start, deleteCount, add}: {start: number, deleteCount: number, add?: AddWorkspaceFolder[]}) => Boolean} 
             */
            updateWorkspaceFolders: ({ start, deleteCount, add = undefined}) => {
                return vscode.workspace.updateWorkspaceFolders(start, deleteCount, ...(add || []).map(wf => { return {name: wf.name, uri: vscode.Uri.file(wf.uri)}; }));
            },
            /**
             * Find file in current workspace
             * @type {({include, exclude}: {include: string, exclude?: string}) => Promise<string[]>}
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
             * @type {() => Platform}
             */
            getPlatform: () => {
                return os.platform();
            },
            /**
             * Show message alert
             * @type {({txt, btns}: {txt: string, btns?: string[]}) => Promise<string>}
             */
            showMessage: async ({ txt, btns = undefined }) => {
                txt = `[${this.name}] ${txt}`;
                return await vscode.window.showInformationMessage(txt, ...(btns || []));
            },
            /**
             * Show error alert
             * @type {({txt, btns}: {txt: string, btns?: string[]}) => Promise<string>}
             */
            showError: async ({ txt, btns = undefined }) => {
                txt = `[${this.name}] ${txt}`;
                return await vscode.window.showErrorMessage(txt, ...(btns || []));
            },
            /**
             * Show warn alert
             * @type {({txt, btns}: {txt: string, btns?: string[]}) => Promise<string>}
             */
            showWarn: async ({ txt, btns = undefined }) => {
                txt = `[${this.name}] ${txt}`;
                return await vscode.window.showWarningMessage(txt, ...(btns || []));
            },
            /**
             * Show Input Box
             * @type {({value, prompt, placeHolder, password, ignoreFocusOut, validateInput}: vscode.InputBoxOptions) => Promise<string>}
             */
            showInputBox: async ({ value, prompt = '', placeHolder = '', password = false, ignoreFocusOut = true, validateInput = undefined }) => {
                const options = {};
                options.value = value;
                prompt && (options.prompt = prompt);
                placeHolder && (options.placeHolder = placeHolder);
                password && (options.password = password);
                ignoreFocusOut && (options.ignoreFocusOut = ignoreFocusOut);
                validateInput && (options.validateInput = validateInput);
                return await vscode.window.showInputBox(options);
            },
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
             * @returns {Promise<string[]|undefined>}
             */
            showOpenDialog: async ({ canSelectFiles = true, canSelectFolders = false, canSelectMany = false, defaultUri = undefined, filters = undefined, openLabel = undefined }) => {
                // filters:undefined, // 筛选器，例如：{'Images': ['png', 'jpg'], 'TypeScript': ['ts', 'tsx']}
                const options = {};
                options.canSelectFiles = canSelectFiles;
                options.canSelectFolders = canSelectFolders;
                options.canSelectMany = canSelectMany;
                defaultUri && (options.defaultUri = vscode.Uri.file(defaultUri));
                filters && (options.filters = filters);
                openLabel && (options.openLabel = openLabel);
                const uris = await vscode.window.showOpenDialog(options);
                return uris && uris.map(uri => uri.fsPath);
            },
            /**
             * Show save dialog, select a local file path
             * @type {({defaultUri, filters, saveLabel}: {defaultUri?: string, filters?: {string: string[]}, saveLabel?: string}) => Promise<string|undefined>}
             * @property filters e.g.: {'Images': ['png', 'jpg'], 'TypeScript': ['ts', 'tsx']}
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
             * @type {({items, canPickMany, ignoreFocusOut, matchOnDescription, matchOnDetail, placeHolder}: {items: string[]|Promise<string[]>, canPickMany?: boolean, ignoreFocusOut?: boolean, matchOnDescription?: boolean, matchOnDetail?: boolean, placeHolder?: string}) => Promise<string>}
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
             * @type {({filePath, viewColumn, preserveFocus, preview, revealRange, revealType}: {filePath: string, viewColumn?: number, preserveFocus?: boolean, preview?: boolean, revealRange?: {startLine?: Number, endLine?: Number}, revealType?: vscode.TextEditorRevealType}) => void}
             */
            showTextDocument: ({ filePath, viewColumn = vscode.ViewColumn.One, preserveFocus = false, preview = false, revealRange = undefined, revealType = vscode.TextEditorRevealType.Default }) => {
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
                    this.api.showError({txt: reason});
                });
            },
            /**
             * Show txt to output channel
             * @type {({txt, preserveFocus, line}: {txt: string, preserveFocus?: boolean, line?: boolean, show?: boolean}) => void}
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
             * @type {({cmd, addNewLine, preserveFocus}: {cmd: string, addNewLine?: boolean, preserveFocus?: boolean}) => void}
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
             * @type {({path}: {path: string}) => Boolean}
             */
            exists4Path: ({ path }) => {
                return fs.existsSync(path);
            },
            /**
             * Get stat for path
             * @type {({path}: {path: string}) => {error?: string, data?: {isFile: boolean, isDirectory: boolean, isSymbolicLink: boolean}}}
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
             * @type {({path, options}: {path: string, options?: 'hex'|'json'|'string'}) => {error?: string, data?: any}}
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
             * @type {({path, data, options}: {path: string, data: string|[]|{}, options?: fs.WriteFileOptions}) => Promise<{error?: string|undefined}>}
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
             * @type {({}: {url: string, method?: string, data?: {}, headers?: {}}) => Promise<{error?: string, body: any, statusCode: number, statusMessage:string}>}
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
            if (!this.options.outputChannel) {
                return undefined;
            }
            const options = this.options;
            this._outputChannel = typeof options.outputChannel === 'string' ? vscode.window.createOutputChannel(this.name) : options.outputChannel;
            this._outputChannel.show(true);
        }
        return this._outputChannel;
    }
    get terminal() {
        if (!this._terminal) {
            if (!this.options.terminal) {
                return undefined;
            }
            const options = this.options;
            this._terminal = typeof options.terminal === 'string' ? vscode.window.createTerminal(this.name) : options.terminal;
        }
        return this._terminal;
    }
    get name() { return this.options.name; }
}

/**
 * @template T
 */
class VscodeContextApi {
    /**
     * @param {vscode.ExtensionContext} context 
     */
    constructor(context) {
        /**@type {vscode.ExtensionContext} */
        this.context = context;
        this.api = {
            /**
             * Get extension path
             * @type {() => Promise<string>}
             */
            getExtensionPath: async () => {
                return this.context.extensionPath;
            },
            /**
             * Get storage path
             * @type {() => Promise<string>}
             */
            getStoragePath: async () => {
                return this.context.storagePath || this.context.storageUri.fsPath;
            },
            /**
             * Get global storage path
             * @type {() => Promise<string>}
             */
            getGlobalStoragePath: async () => {
                return this.context.globalStoragePath || this.context.globalStorageUri.fsPath;
            },
            /**
             * Get workspace state
             * @type {() => Promise<{[x: string]: any}>}
             */
            getWorkspaceState: async () => {
                // @ts-ignore
                return this.context.workspaceState._value || this.context.workspaceState.keys().map(key => {
                    return {[key]: this.context.workspaceState.get(key)};
                }).reduce((a, b) => Object.assign({}, a, b), {});
            },
            /**
             * Update workspace state
             * @type {(states: T) => Promise<void>}
             */
            updateWorkspaceState: async (states) => {
                for (const key in states) {
                    if (states.hasOwnProperty(key)) {
                        const value = states[key];
                        this.context.workspaceState.update(key, value);
                    }
                }
            },
            /**
             * Get global state
             * @type {() => Promise<T>}
             */
            getGlobalState: async () => {
                // @ts-ignore
                return this.context.globalState._value || this.context.globalState.keys().map(key => {
                    return {[key]: this.context.globalState.get(key)};
                }).reduce((a, b) => Object.assign({}, a, b), {});
            },
            /**
             * Update global state
             * @type {(states: T) => Promise<void>}
             */
            updateGlobalState: async (states) => {
                for (const key in states) {
                    if (states.hasOwnProperty(key)) {
                        const value = states[key];
                        this.context.globalState.update(key, value);
                    }
                }
            },
        };
    }
}

/**
 * @template T
 * @typedef {import('./vscode.webview.data').WebviewData<T>} WebviewData
 */
/**
 * @template T
 */
class WebviewDataApi {
    /**
     * @param {WebviewData<T>} data 
     */
    constructor(data) {
        /**@type {WebviewData<T>} */
        this.data = data;
        this.api = {
            /**@type {() => Promise<T>} - Get bridge data */
            getBridgeData: async () => {
                return this.data.cache;
            },
            /**@type {(items: T) => Promise<void>} - Update bridge data */
            updateBridgeData: async (items) => {
                this.data.updateItems(items, false);
            },
        };
    }
}

module.exports = {
    VscodeApi,
    VscodeContextApi,
    WebviewDataApi,
};