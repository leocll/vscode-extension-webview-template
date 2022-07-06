const fs = require('fs');
const path = require('path');
const { parse } = require('./ApiFile.parse');

const rootDir = path.dirname(__dirname);
const vscodeDir = path.join('src', 'vscode');

/**
 * @typedef {import('./ApiFile.parse').ApiFile} ApiFile
 * @typedef {import('./ApiFile.parse').Api} Api
 * @typedef {import('./ApiFile.parse').ApiClass} ApiClass
 * @typedef {{file?: String, gen: (doc: ApiClass[]) => String}} DocOptions
 */

/**@type {{js: DocOptions, ts: DocOptions}} */
const Doc = {
    js: {
        file: path.join(vscodeDir, 'web.api.type.js'),
        gen: genJsDoc,
    },
    ts: {
        file: path.join(vscodeDir, 'web.api.d.ts'),
        gen: genTsDoc,
    },
};
const ApiFuncDocName = 'WebApiFunction';

 /**
  * @param {DocOptions} options
  * @returns 
  */
function main(options) {
    /**@type {ApiFile[]} */
    const apiFiles = [{
        name: path.join(rootDir, 'src', 'vscode', 'webview.api.js'),
        classNames: ['WebviewVscodeApi', 'WebviewVscodeContextApi'],
        getDocName: (n) => ({'WebviewVscodeApi': 'WebVscodeApi', 'WebviewVscodeContextApi': 'WebVscodeContextApi'}[n] || n),
    }, {
        name: path.join(rootDir, 'src', 'vscode', 'webview.data.js'),
        classNames: ['WebviewDataApi'],
        getDocName: (n) => ({'WebviewDataApi': 'WebDataApi'}[n] || n),
    }];
    const docs = parse(apiFiles, rootDir);
    const doc = options.gen(docs);
    options.file && fs.writeFileSync(options.file, doc);
    return doc;
}

/**
 * @param {ApiClass[]} doc
 * @returns {[String[], String[]]}
 */
function getTemplatesAndDocNames(doc) {
    let [tCount, cNames] = [0, []];
    doc.forEach(c => {
        const len = c.classTemplates.length;
        cNames.push(len ? `${c.docName}<${new Array(len).fill(0).map((_, i) => `T${i+tCount}`).join(', ')}>` : c.docName);
        tCount += len;
    });
    return [new Array(tCount).fill(0).map((_, i) => `T${i}`), cNames];
}

/**
 * @param {ApiClass[]} doc 
 */
function genJsDoc(doc) {
    const ApiFuncDoc = `/**
 * @template A
 * @template R
 * @typedef {(args: A) => Promise<{data: R}>} ${ApiFuncDocName}
 */`;
    const jsDoc = doc.map(c => {
        const templates = c.classTemplates.map(t => `@template ${t}`);
        const def = `@typedef {Object} ${c.docName}`;
        const props = c.apis.map(a => {
            const typName = a.type.name === 'WebviewAsyncFunction' || a.type.name === 'WebviewSyncFunction' ? ApiFuncDocName : a.type.name;
            return {name: a.name, type: a.type.args.length === 0 ? typName : `${typName}<${a.type.args.join(', ')}>`};
        }).map(a => `@property {${a.type}} ${a.name}`);
        const elems = [...templates, def, ...props];
        const elemsDoc = elems.join(`\n * `);
        return `/**\n * ${elemsDoc}\n */`;
    }).join('\n\n');
    const webApiDoc = (() => {
        let [templates, docNames] = getTemplatesAndDocNames(doc);
        templates = templates.map((t) => `@template ${t}`);
        const def = `@typedef {${docNames.join(' & ')}} WebApi`;
        const t = [...templates, def].join(`\n * `);
        return `/**\n * ${t}\n */`;
    })();
    return [ApiFuncDoc, jsDoc, webApiDoc, 'export {};'].join('\n\n');
}

/**
 * @param {ApiClass[]} doc 
 */
function genTsDoc(doc) {
    const expands = [
        [
            `import * as vscode from "vscode";`,
            `import * as fs from "fs";`,
        ].join('\n'),
        `export type Platform = NodeJS.Platform;`,
        `export type ${ApiFuncDocName}<A, R> = (args: A) => Promise<{data: R}>;`,
        `export interface WorkspaceFolder {
    index: number;
    name: string;
    folder: string;
}`,
        `export interface AddWorkspaceFolder {
    name?: string;
    uri: string;
}`,
    ];
    const tsDoc = doc.map(c => {
        const templates = c.classTemplates.length > 0 ? `<${c.classTemplates.join(', ')}>` : '';
        const props = c.apis.map(a => {
            const typName = a.type.name === 'WebviewAsyncFunction' || a.type.name === 'WebviewSyncFunction' ? ApiFuncDocName : a.type.name;
            return {name: a.name, type: a.type.args.length === 0 ? typName : `${typName}<${a.type.args.join(', ')}>`};
        }).map(a => `${a.name}: ${a.type};`);
        return `export interface ${c.docName}${templates} {\n\t${props.join('\n\t')}\n}`;
    }).join('\n\n');
    const webApiDoc = (() => {
        let [templates, docNames] = getTemplatesAndDocNames(doc);
        const name = templates.length ? `WebApi<${templates.join(', ')}>` : 'WebApi';
        return `export interface ${name} extends ${docNames.join(', ')} {}`;
    })();
    return [...expands, tsDoc, webApiDoc].join('\n\n');
}

const jsdoc = main(Doc.js);
console.log(jsdoc);
const tsdoc = main(Doc.ts);
console.log(tsdoc);
console.log('over');