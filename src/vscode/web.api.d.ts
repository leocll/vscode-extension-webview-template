/**
 * @typedef {Object} WebviewVscodeApi
 * @property {WebviewSyncFunction<void, String>} getWorkspaceFile
 * @property {WebviewSyncFunction<void, WorkspaceFolder[]>} getWorkspaceFolders
 * @property {WebviewSyncFunction<{start: number, deleteCount: number, add?: AddWorkspaceFolder[]}, Boolean>} updateWorkspaceFolders
 * @property {WebviewAsyncFunction<{include: string, exclude?: string}, string[]>} findFileInWorkspace
 * @property {WebviewSyncFunction<void, Platform>} getPlatform
 * @property {WebviewAsyncFunction<{txt: string, btns?: string[]}, string>} showMessage
 * @property {WebviewAsyncFunction<{txt: string, btns?: string[]}, string>} showError
 * @property {WebviewAsyncFunction<{txt: string, btns?: string[]}, string>} showWarn
 * @property {WebviewAsyncFunction<vscode.InputBoxOptions, string>} showInputBox
 * @property {WebviewAsyncFunction<showOpenDialogOptions, string[]>} showOpenDialog
 * @property {WebviewAsyncFunction<{defaultUri?: string, filters?: {string: string[]}, saveLabel?: string}, string>} showSaveDialog
 * @property {WebviewAsyncFunction<{items: string[]|Promise<string[]>, canPickMany?: boolean, ignoreFocusOut?: boolean, matchOnDescription?: boolean, matchOnDetail?: boolean, placeHolder?: string}, string>} showQuickPick
 * @property {WebviewAsyncFunction<{filePath: string, viewColumn?: number, preserveFocus?: boolean, preview?: boolean, revealRange?: {startLine?: Number, endLine?: Number}, revealType?: vscode.TextEditorRevealType}, void>} showTextDocument
 * @property {WebviewSyncFunction<{txt: string, preserveFocus?: boolean, line?: boolean, show?: boolean}, void>} showTxt2Output
 * @property {WebviewSyncFunction<{cmd: string, addNewLine?: boolean, preserveFocus?: boolean}, void>} sendCmd2Terminal
 * @property {WebviewSyncFunction<{path: string}, Boolean>} exists4Path
 * @property {WebviewSyncFunction<{path: string}, {error?: string, data?: {isFile: boolean, isDirectory: boolean, isSymbolicLink: boolean}}>} getStat4Path
 * @property {WebviewSyncFunction<{path: string, options?: 'hex'|'json'|'string'}, {error?: string, data?: any}>} readFile
 * @property {WebviewAsyncFunction<{path: string, data: string|Array|object, options?: fs.WriteFileOptions}, {error?: string}>} writeFile
 * @property {WebviewAsyncFunction<{url: string, method?: string, data?: {[x: string]: any}, headers?: {[x: string]: string|number}}, {error?: string, body: any, statusCode: number, statusMessage: string}>} request
 */

/**
 * @template T
 * @typedef {Object} WebviewVscodeContextApi
 * @property {WebviewSyncFunction<void, string>} getExtensionPath
 * @property {WebviewSyncFunction<void, string>} getStoragePath
 * @property {WebviewSyncFunction<void, string>} getGlobalStoragePath
 * @property {WebviewSyncFunction<void, T>} getWorkspaceState
 * @property {WebviewSyncFunction<T, void>} updateWorkspaceState
 * @property {WebviewSyncFunction<void, T>} getGlobalState
 * @property {WebviewSyncFunction<T, void>} updateGlobalState
 * @property {WebviewSyncFunction<void, T>} getExtensionState
 */

/**
 * @template T
 * @typedef {Object} WebviewDataApi
 * @property {() => Promise<T>} getWebviewData
 * @property {(items: T) => Promise<void>} updateWebviewData
 */