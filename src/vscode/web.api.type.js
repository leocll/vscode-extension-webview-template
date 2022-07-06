/**
 * @template A
 * @template R
 * @typedef {(args: A) => Promise<{data: R}>} WebApiFunction
 */

/**
 * @typedef {Object} WebVscodeApi
 * @property {WebApiFunction<void, String>} getWorkspaceFile
 * @property {WebApiFunction<void, WorkspaceFolder[]>} getWorkspaceFolders
 * @property {WebApiFunction<{start: number, deleteCount: number, add?: AddWorkspaceFolder[]}, Boolean>} updateWorkspaceFolders
 * @property {WebApiFunction<{include: string, exclude?: string}, string[]>} findFileInWorkspace
 * @property {WebApiFunction<void, Platform>} getPlatform
 * @property {WebApiFunction<{txt: string, btns?: string[]}, string>} showMessage
 * @property {WebApiFunction<{txt: string, btns?: string[]}, string>} showError
 * @property {WebApiFunction<{txt: string, btns?: string[]}, string>} showWarn
 * @property {WebApiFunction<vscode.InputBoxOptions, string>} showInputBox
 * @property {WebApiFunction<showOpenDialogOptions, string[]>} showOpenDialog
 * @property {WebApiFunction<{defaultUri?: string, filters?: {string: string[]}, saveLabel?: string}, string>} showSaveDialog
 * @property {WebApiFunction<{items: string[]|Promise<string[]>, canPickMany?: boolean, ignoreFocusOut?: boolean, matchOnDescription?: boolean, matchOnDetail?: boolean, placeHolder?: string}, string>} showQuickPick
 * @property {WebApiFunction<{filePath: string, viewColumn?: number, preserveFocus?: boolean, preview?: boolean, revealRange?: {startLine?: Number, endLine?: Number}, revealType?: vscode.TextEditorRevealType}, void>} showTextDocument
 * @property {WebApiFunction<{txt: string, preserveFocus?: boolean, line?: boolean, show?: boolean}, void>} showTxt2Output
 * @property {WebApiFunction<{cmd: string, addNewLine?: boolean, preserveFocus?: boolean}, void>} sendCmd2Terminal
 * @property {WebApiFunction<{path: string}, Boolean>} exists4Path
 * @property {WebApiFunction<{path: string}, {error?: string, data?: {isFile: boolean, isDirectory: boolean, isSymbolicLink: boolean}}>} getStat4Path
 * @property {WebApiFunction<{path: string, options?: 'hex'|'json'|'string'}, {error?: string, data?: any}>} readFile
 * @property {WebApiFunction<{path: string, data: string|Array|object, options?: fs.WriteFileOptions}, {error?: string}>} writeFile
 * @property {WebApiFunction<{url: string, method?: string, data?: {[x: string]: any}, headers?: {[x: string]: string|number}}, {error?: string, body: any, statusCode: number, statusMessage: string}>} request
 */

/**
 * @template T
 * @typedef {Object} WebVscodeContextApi
 * @property {WebApiFunction<void, string>} getExtensionPath
 * @property {WebApiFunction<void, string>} getStoragePath
 * @property {WebApiFunction<void, string>} getGlobalStoragePath
 * @property {WebApiFunction<void, T>} getWorkspaceState
 * @property {WebApiFunction<T, void>} updateWorkspaceState
 * @property {WebApiFunction<void, T>} getGlobalState
 * @property {WebApiFunction<T, void>} updateGlobalState
 * @property {WebApiFunction<void, T>} getExtensionState
 */

/**
 * @template T
 * @typedef {Object} WebDataApi
 * @property {() => Promise<T>} getWebviewData
 * @property {(items: T) => Promise<void>} updateWebviewData
 */

/**
 * @template T0
 * @template T1
 * @typedef {WebVscodeApi & WebVscodeContextApi<T0> & WebDataApi<T1>} WebApi
 */

export {};