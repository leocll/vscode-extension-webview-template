import { Parser } from "htmlparser2";

export interface ApiFile {
	name: String;           // 文件路径
	content?: String;       // 文件内容
	classNames: String[];   // 需要解析的name
	getDocName?: (className: String) => String;
}

export interface ApiType {
	name: String;
	args: String[];
}

export interface Api {
	name: String;
	type: ApiType;
	comment?: String;
}

export interface ApiClass {
	file: String;
	classTemplates: String[];
	className: String;
	docName: String;
	apis: Api[];
}

export interface ParseOptions {
	target: ApiFile,
	getText: (pos: Number, end?: Number) => String
}

export function parse(apiFiles: ApiFile[], rootDir?: String): ApiClass[];