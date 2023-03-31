import * as vscode from "vscode";
import * as fs from "fs";

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
 * @template T0
 * @template T1
 */
class VscodeApi {
	// WebviewVscodeApi
	/**
	 * Get workspace file
	 * @type {WebApiFunction<void, String>}
	 */
	getWorkspaceFile = () => {
		return this.on(getWorkspaceFile, ...);
	}
	
	/**
	 * Get workspace folders
	 * @type {WebApiFunction<void, WorkspaceFolder[]>}
	 */
	getWorkspaceFolders = () => {
		return this.on(getWorkspaceFolders, ...);
	}
	
	/**
	 * Update workspace folders
	 * @type {WebApiFunction<{start: number, deleteCount: number, add?: AddWorkspaceFolder[]}, Boolean>}
	 */
	updateWorkspaceFolders = (args) => {
		return this.on(updateWorkspaceFolders, ...args);
	}
	
	/**
	 * Find file in current workspace
	 * @type {WebApiFunction<{include: string, exclude?: string}, string[]>}
	 */
	findFileInWorkspace = (args) => {
		return this.on(findFileInWorkspace, ...args);
	}
	
	/**
	 * Get current platform
	 * @type {WebApiFunction<void, Platform>}
	 */
	getPlatform = () => {
		return this.on(getPlatform, ...);
	}
	
	/**
	 * Show message alert
	 * @type {WebApiFunction<{txt: string, btns?: string[]}, string>}
	 */
	showMessage = (args) => {
		return this.on(showMessage, ...args);
	}
	
	/**
	 * Show error alert
	 * @type {WebApiFunction<{txt: string, btns?: string[]}, string>}
	 */
	showError = (args) => {
		return this.on(showError, ...args);
	}
	
	/**
	 * Show warn alert
	 * @type {WebApiFunction<{txt: string, btns?: string[]}, string>}
	 */
	showWarn = (args) => {
		return this.on(showWarn, ...args);
	}
	
	/**
	 * Show Input Box
	 * @type {WebApiFunction<vscode.InputBoxOptions, string>}
	 */
	showInputBox = (args) => {
		return this.on(showInputBox, ...args);
	}
	
	/**
	 * Show open dialog, select a or some local files or folders.
	vscode的bug，在ubuntu下既选文件又选文件夹会很诡异，据官方文档windows也会出现诡异情况，https://code.visualstudio.com/api/references/vscode-api#OpenDialogOptions
	在ubuntu和windows下不要 canSelectFiles 和 canSelectFolders 同时为 true
	 * @type {WebApiFunction<showOpenDialogOptions, string[]>}
	 */
	showOpenDialog = (args) => {
		return this.on(showOpenDialog, ...args);
	}
	
	/**
	 * Show save dialog, select a local file path
	 * @type {WebApiFunction<{defaultUri?: string, filters?: {string: string[]}, saveLabel?: string}, string>}
	 */
	showSaveDialog = (args) => {
		return this.on(showSaveDialog, ...args);
	}
	
	/**
	 * Show pick dialog
	 * @type {WebApiFunction<{items: string[]|Promise<string[]>, canPickMany?: boolean, ignoreFocusOut?: boolean, matchOnDescription?: boolean, matchOnDetail?: boolean, placeHolder?: string}, string>}
	 */
	showQuickPick = (args) => {
		return this.on(showQuickPick, ...args);
	}
	
	/**
	 * Show file
	 * @type {WebApiFunction<{filePath: string, viewColumn?: number, preserveFocus?: boolean, preview?: boolean, revealRange?: {startLine?: Number, endLine?: Number}, revealType?: vscode.TextEditorRevealType}, void>}
	 */
	showTextDocument = (args) => {
		return this.on(showTextDocument, ...args);
	}
	
	/**
	 * Show txt to output channel
	 * @type {WebApiFunction<{txt: string, preserveFocus?: boolean, line?: boolean, show?: boolean}, void>}
	 */
	showTxt2Output = (args) => {
		return this.on(showTxt2Output, ...args);
	}
	
	/**
	 * Send cmd to terminal
	 * @type {WebApiFunction<{cmd: string, addNewLine?: boolean, preserveFocus?: boolean}, void>}
	 */
	sendCmd2Terminal = (args) => {
		return this.on(sendCmd2Terminal, ...args);
	}
	
	/**
	 * *************************** File System ****************************
	 * @type {WebApiFunction<{path: string}, Boolean>}
	 */
	exists4Path = (args) => {
		return this.on(exists4Path, ...args);
	}
	
	/**
	 * Get stat for path
	 * @type {WebApiFunction<{path: string}, {error?: string, data?: {isFile: boolean, isDirectory: boolean, isSymbolicLink: boolean}}>}
	 */
	getStat4Path = (args) => {
		return this.on(getStat4Path, ...args);
	}
	
	/**
	 * Read file
	 * @type {WebApiFunction<{path: string, options?: 'hex'|'json'|'string'}, {error?: string, data?: any}>}
	 */
	readFile = (args) => {
		return this.on(readFile, ...args);
	}
	
	/**
	 * Write file
	 * @type {WebApiFunction<{path: string, data: string|Array|object, options?: fs.WriteFileOptions}, {error?: string}>}
	 */
	writeFile = (args) => {
		return this.on(writeFile, ...args);
	}
	
	/**
	 * Request
	 * @type {WebApiFunction<{url: string, method?: string, data?: {[x: string]: any}, headers?: {[x: string]: string|number}}, {error?: string, body: any, statusCode: number, statusMessage: string}>}
	 */
	request = (args) => {
		return this.on(request, ...args);
	}
	
	// WebviewVscodeContextApi
	/**
	 * Get extension path
	 * @type {WebApiFunction<void, string>}
	 */
	getExtensionPath = () => {
		return this.on(getExtensionPath, ...);
	}
	
	/**
	 * Get storage path
	 * @type {WebApiFunction<void, string>}
	 */
	getStoragePath = () => {
		return this.on(getStoragePath, ...);
	}
	
	/**
	 * Get global storage path
	 * @type {WebApiFunction<void, string>}
	 */
	getGlobalStoragePath = () => {
		return this.on(getGlobalStoragePath, ...);
	}
	
	/**
	 * Get workspace state
	 * @type {WebApiFunction<void, T0>}
	 */
	getWorkspaceState = () => {
		return this.on(getWorkspaceState, ...);
	}
	
	/**
	 * Update workspace state
	 * @type {WebApiFunction<T0, void>}
	 */
	updateWorkspaceState = (args) => {
		return this.on(updateWorkspaceState, ...args);
	}
	
	/**
	 * Get global state
	 * @type {WebApiFunction<void, T0>}
	 */
	getGlobalState = () => {
		return this.on(getGlobalState, ...);
	}
	
	/**
	 * Update global state
	 * @type {WebApiFunction<T0, void>}
	 */
	updateGlobalState = (args) => {
		return this.on(updateGlobalState, ...args);
	}
	
	/**
	 * Get extension state, `Object.assign(globalState, workspaceState)`
	 * @type {WebApiFunction<void, T0>}
	 */
	getExtensionState = () => {
		return this.on(getExtensionState, ...);
	}
	
	// WebviewDataApi
	/**
	 * @type {() => Promise<T>}
	 */
	getWebviewData = (args) => {
		return this.on(getWebviewData, ...args);
	}
	
	/**
	 * @type {(items: T) => Promise<void>}
	 */
	updateWebviewData = (args) => {
		return this.on(updateWebviewData, ...args);
	}
}