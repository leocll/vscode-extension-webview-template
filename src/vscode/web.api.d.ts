import * as vscode from "vscode";
import * as fs from "fs";

export type Platform = NodeJS.Platform;

export type WebApiFunction<A, R> = (args: A) => Promise<{data: R}>;

export interface WorkspaceFolder {
    index: number;
    name: string;
    folder: string;
}

export interface AddWorkspaceFolder {
    name?: string;
    uri: string;
}

export interface WebVscodeApi {
	getWorkspaceFile: WebApiFunction<void, String>;
	getWorkspaceFolders: WebApiFunction<void, WorkspaceFolder[]>;
	updateWorkspaceFolders: WebApiFunction<{start: number, deleteCount: number, add?: AddWorkspaceFolder[]}, Boolean>;
	findFileInWorkspace: WebApiFunction<{include: string, exclude?: string}, string[]>;
	getPlatform: WebApiFunction<void, Platform>;
	showMessage: WebApiFunction<{txt: string, btns?: string[]}, string>;
	showError: WebApiFunction<{txt: string, btns?: string[]}, string>;
	showWarn: WebApiFunction<{txt: string, btns?: string[]}, string>;
	showInputBox: WebApiFunction<vscode.InputBoxOptions, string>;
	showOpenDialog: WebApiFunction<showOpenDialogOptions, string[]>;
	showSaveDialog: WebApiFunction<{defaultUri?: string, filters?: {string: string[]}, saveLabel?: string}, string>;
	showQuickPick: WebApiFunction<{items: string[]|Promise<string[]>, canPickMany?: boolean, ignoreFocusOut?: boolean, matchOnDescription?: boolean, matchOnDetail?: boolean, placeHolder?: string}, string>;
	showTextDocument: WebApiFunction<{filePath: string, viewColumn?: number, preserveFocus?: boolean, preview?: boolean, revealRange?: {startLine?: Number, endLine?: Number}, revealType?: vscode.TextEditorRevealType}, void>;
	showTxt2Output: WebApiFunction<{txt: string, preserveFocus?: boolean, line?: boolean, show?: boolean}, void>;
	sendCmd2Terminal: WebApiFunction<{cmd: string, addNewLine?: boolean, preserveFocus?: boolean}, void>;
	exists4Path: WebApiFunction<{path: string}, Boolean>;
	getStat4Path: WebApiFunction<{path: string}, {error?: string, data?: {isFile: boolean, isDirectory: boolean, isSymbolicLink: boolean}}>;
	readFile: WebApiFunction<{path: string, options?: 'hex'|'json'|'string'}, {error?: string, data?: any}>;
	writeFile: WebApiFunction<{path: string, data: string|Array|object, options?: fs.WriteFileOptions}, {error?: string}>;
	request: WebApiFunction<{url: string, method?: string, data?: {[x: string]: any}, headers?: {[x: string]: string|number}}, {error?: string, body: any, statusCode: number, statusMessage: string}>;
}

export interface WebVscodeContextApi<T> {
	getExtensionPath: WebApiFunction<void, string>;
	getStoragePath: WebApiFunction<void, string>;
	getGlobalStoragePath: WebApiFunction<void, string>;
	getWorkspaceState: WebApiFunction<void, T>;
	updateWorkspaceState: WebApiFunction<T, void>;
	getGlobalState: WebApiFunction<void, T>;
	updateGlobalState: WebApiFunction<T, void>;
	getExtensionState: WebApiFunction<void, T>;
}

export interface WebDataApi<T> {
	getWebviewData: () => Promise<T>;
	updateWebviewData: (items: T) => Promise<void>;
}

export interface WebApi<T0, T1> extends WebVscodeApi, WebVscodeContextApi<T0>, WebDataApi<T1> {}