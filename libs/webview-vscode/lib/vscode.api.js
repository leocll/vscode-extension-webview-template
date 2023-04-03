/**
* @typedef {import('NodeJS').Platform} Platform
* @typedef {{index: number, name: string, folder: string}} WorkspaceFolder
* @typedef {{name?: string, uri: string}} AddWorkspaceFolder
*/
/**
* @template A
* @template R
* @typedef {(args: A) => Promise<{data: R}>} WebApiFunction
*/

/**
 * @abstract
 */
class VscodeBaseApi {
    constructor() {
		/**@type {import('./message').default} */
		this.$messageCenter = undefined;
        this.$post = this.$messageCenter.post;
        this.$on = this.$messageCenter.on;
    }
}

/**
 * @template T0
 * @template T1
 */
class VscodeApi extends VscodeBaseApi {
    // WebviewVscodeApi
	/**
	 * Get workspace file
	 * @type {WebApiFunction<void, String>}
	 */
	getWorkspaceFile = () => {
		return this.$post({ cmd: 'getWorkspaceFile' });
	}
	
	/**
	 * Get workspace folders
	 * @type {WebApiFunction<void, WorkspaceFolder[]>}
	 */
	getWorkspaceFolders = () => {
		return this.$post({ cmd: 'getWorkspaceFolders' });
	}
	
	/**
	 * Update workspace folders
	 * @type {WebApiFunction<{start: number, deleteCount: number, add?: AddWorkspaceFolder[]}, Boolean>}
	 */
	updateWorkspaceFolders = (args) => {
		return this.$post({ cmd: 'updateWorkspaceFolders', args: args });
	}
	
	/**
	 * Find file in current workspace
	 * @type {WebApiFunction<{include: string, exclude?: string}, string[]>}
	 */
	findFileInWorkspace = (args) => {
		return this.$post({ cmd: 'findFileInWorkspace', args: args });
	}
	
	/**
	 * Get current platform
	 * @type {WebApiFunction<void, Platform>}
	 */
	getPlatform = () => {
		return this.$post({ cmd: 'getPlatform' });
	}
	
	/**
	 * Show message alert
	 * @type {WebApiFunction<{txt: string, btns?: string[]}, string>}
	 */
	showMessage = (args) => {
		return this.$post({ cmd: 'showMessage', args: args });
	}
	
	/**
	 * Show error alert
	 * @type {WebApiFunction<{txt: string, btns?: string[]}, string>}
	 */
	showError = (args) => {
		return this.$post({ cmd: 'showError', args: args });
	}
	
	/**
	 * Show warn alert
	 * @type {WebApiFunction<{txt: string, btns?: string[]}, string>}
	 */
	showWarn = (args) => {
		return this.$post({ cmd: 'showWarn', args: args });
	}
	
	/**
	 * Show Input Box
	 * @type {WebApiFunction<vscode.InputBoxOptions, string>}
	 */
	showInputBox = (args) => {
		return this.$post({ cmd: 'showInputBox', args: args });
	}
	
	/**
	 * Show open dialog, select a or some local files or folders.
	vscode的bug，在ubuntu下既选文件又选文件夹会很诡异，据官方文档windows也会出现诡异情况，https://code.visualstudio.com/api/references/vscode-api#OpenDialogOptions
	在ubuntu和windows下不要 canSelectFiles 和 canSelectFolders 同时为 true
	 * @type {WebApiFunction<OpenDialogOptions, string[]>}
	 */
	showOpenDialog = (args) => {
		return this.$post({ cmd: 'showOpenDialog', args: args });
	}
	
	/**
	 * Show save dialog, select a local file path
	 * @type {WebApiFunction<{defaultUri?: string, filters?: {string: string[]}, saveLabel?: string}, string>}
	 */
	showSaveDialog = (args) => {
		return this.$post({ cmd: 'showSaveDialog', args: args });
	}
	
	/**
	 * Show pick dialog
	 * @type {WebApiFunction<{items: string[]|Promise<string[]>, canPickMany?: boolean, ignoreFocusOut?: boolean, matchOnDescription?: boolean, matchOnDetail?: boolean, placeHolder?: string}, string>}
	 */
	showQuickPick = (args) => {
		return this.$post({ cmd: 'showQuickPick', args: args });
	}
	
	/**
	 * Show file
	 * @type {WebApiFunction<{filePath: string, viewColumn?: number, preserveFocus?: boolean, preview?: boolean, revealRange?: {startLine?: Number, endLine?: Number}, revealType?: vscode.TextEditorRevealType}, void>}
	 */
	showTextDocument = (args) => {
		return this.$post({ cmd: 'showTextDocument', args: args });
	}
	
	/**
	 * Show txt to output channel
	 * @type {WebApiFunction<{txt: string, preserveFocus?: boolean, line?: boolean, show?: boolean}, void>}
	 */
	showTxt2Output = (args) => {
		return this.$post({ cmd: 'showTxt2Output', args: args });
	}
	
	/**
	 * Send cmd to terminal
	 * @type {WebApiFunction<{cmd: string, addNewLine?: boolean, preserveFocus?: boolean}, void>}
	 */
	sendCmd2Terminal = (args) => {
		return this.$post({ cmd: 'sendCmd2Terminal', args: args });
	}
	
	/**
	 * *************************** File System ****************************
	 * @type {WebApiFunction<{path: string}, Boolean>}
	 */
	exists4Path = (args) => {
		return this.$post({ cmd: 'exists4Path', args: args });
	}
	
	/**
	 * Get stat for path
	 * @type {WebApiFunction<{path: string}, {error?: string, data?: {isFile: boolean, isDirectory: boolean, isSymbolicLink: boolean}}>}
	 */
	getStat4Path = (args) => {
		return this.$post({ cmd: 'getStat4Path', args: args });
	}
	
	/**
	 * Read file
	 * @type {WebApiFunction<{path: string, options?: 'hex'|'json'|'string'}, {error?: string, data?: any}>}
	 */
	readFile = (args) => {
		return this.$post({ cmd: 'readFile', args: args });
	}
	
	/**
	 * Write file
	 * @type {WebApiFunction<{path: string, data: string|Array|object, options?: fs.WriteFileOptions}, {error?: string}>}
	 */
	writeFile = (args) => {
		return this.$post({ cmd: 'writeFile', args: args });
	}
	
	/**
	 * Request
	 * @type {WebApiFunction<{url: string, method?: string, data?: {[x: string]: any}, headers?: {[x: string]: string|number}}, {error?: string, body: any, statusCode: number, statusMessage: string}>}
	 */
	request = (args) => {
		return this.$post({ cmd: 'request', args: args });
	}
	
	// WebviewVscodeContextApi
	/**
	 * Get extension path
	 * @type {WebApiFunction<void, string>}
	 */
	getExtensionPath = () => {
		return this.$post({ cmd: 'getExtensionPath' });
	}
	
	/**
	 * Get storage path
	 * @type {WebApiFunction<void, string>}
	 */
	getStoragePath = () => {
		return this.$post({ cmd: 'getStoragePath' });
	}
	
	/**
	 * Get global storage path
	 * @type {WebApiFunction<void, string>}
	 */
	getGlobalStoragePath = () => {
		return this.$post({ cmd: 'getGlobalStoragePath' });
	}
	
	/**
	 * Get workspace state
	 * @type {WebApiFunction<void, T0>}
	 */
	getWorkspaceState = () => {
		return this.$post({ cmd: 'getWorkspaceState' });
	}
	
	/**
	 * Update workspace state
	 * @type {WebApiFunction<T0, void>}
	 */
	updateWorkspaceState = (args) => {
		return this.$post({ cmd: 'updateWorkspaceState', args: args });
	}
	
	/**
	 * Get global state
	 * @type {WebApiFunction<void, T0>}
	 */
	getGlobalState = () => {
		return this.$post({ cmd: 'getGlobalState' });
	}
	
	/**
	 * Update global state
	 * @type {WebApiFunction<T0, void>}
	 */
	updateGlobalState = (args) => {
		return this.$post({ cmd: 'updateGlobalState', args: args });
	}
	
	/**
	 * Get extension state, `Object.assign(globalState, workspaceState)`
	 * @type {WebApiFunction<void, T0>}
	 */
	getExtensionState = () => {
		return this.$post({ cmd: 'getExtensionState' });
	}
	
	// WebviewDataApi
	/**
	 * Get webview data
	 * @type {WebApiFunction<void, T1>}
	 */
	getWebviewData = () => {
		return this.$post({ cmd: 'getWebviewData' });
	}
	
	/**
	 * Update webview data
	 * @type {WebApiFunction<T1, void>}
	 */
	updateWebviewData = (args) => {
		return this.$post({ cmd: 'updateWebviewData', args: args });
	}
}

export default VscodeApi;