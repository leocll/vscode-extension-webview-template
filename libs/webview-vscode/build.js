const fs = require('fs');
const path = require('path');
const jsDocParser = require('../jsdoc-parser');

const rootDir = path.dirname(path.dirname(__dirname));
const vscodeDir = path.join('src', 'vscode');

/**
 * @typedef {import('../jsdoc-parser').ApiFile} ApiFile
 * @typedef {import('../jsdoc-parser').Api} Api
 * @typedef {import('../jsdoc-parser').ApiClass} ApiClass
 * @typedef {{file?: String, gen: (doc: ApiClass[]) => String}} DocOptions
 */

const VscodeApi = {
    file: path.join(__dirname, 'src', 'vscode.api.js'),
    className: 'VscodeApi',
}

function main() {
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
    const docs = jsDocParser.parse(apiFiles, rootDir);
    const doc = gen_vscode_api(docs);
    VscodeApi.file && fs.writeFileSync(VscodeApi.file, doc);
    return doc;
}

/**
 * @typedef {import('vscode').ExtensionContext} ExtensionContext
 */


/**
 * @param {ApiClass[]} doc 
 */
function gen_vscode_api(doc) {
    const expands = [
        [
            `import * as vscode from "vscode";`,
            `import * as fs from "fs";`,
        ].join('\n'),
        `/**
* @typedef {import('NodeJS').Platform} Platform
* @typedef {{index: number, name: string, folder: string}} WorkspaceFolder
* @typedef {{name?: string, uri: string}} AddWorkspaceFolder
*/
/**
* @template A
* @template R
* @typedef {(args: A) => Promise<{data: R}>} ${ApiFuncDocName}
*/`,
    ];
    let idx = 0;
    const templateMap = doc/*.filter(c => c.classTemplates.length > 0)*/.map(c => {
        return {
            [`${c.file}:${c.className}`]: c.classTemplates.map(t => {
                const tmp = {[t]: `T${idx}`};
                idx += 1;
                return tmp
            }).reduce((a, b) => Object.assign(a, b), {}),
        };
    }).reduce((a, b) => Object.assign(a, b), {});
    const apiDoc = doc.map(c => {
        const cTemplateMap = templateMap[`${c.file}:${c.className}`];
        const props = c.apis.map(a => {
            const typName = a.type.name === 'WebviewAsyncFunction' || a.type.name === 'WebviewSyncFunction' ? ApiFuncDocName : a.type.name;
            const docType = a.type.args.length === 0 ? typName : `${typName}<${a.type.args.map(a => (cTemplateMap[a] || a)).join(', ')}>`;
            const docTags = [a.comment, `@type {${docType}}`].filter(x => x);
            const doc = docTags ? `/**\n * ${docTags.join('\n * ')}\n */` : undefined;
            const funcArgsName = 'args';
            const [funcArgs, funcArgsPost] = a.type.args.length >= 0 && a.type.args[0] !== 'void' ? [funcArgsName, `, args: ${funcArgsName}`] : ['', ''];
            // TODO: isOn，是否为监听
            const isOn = false;
            const func = isOn
                ? `${a.name} = (${funcArgs}) => {\n\treturn this.post({ cmd: ${a.name}${funcArgsPost} });\n}`
                : `${a.name} = (${funcArgs}) => {\n\treturn this.on(${a.name}, ...${funcArgs});\n}`;
            return `${doc}\n${func}`;
        });
        return `// ${c.className}\n${props.join('\n\n')}`;
    }).join('\n\n');
    const classDoc = (() => {
        const doc = idx > 0 ? `/**\n * ${(new Array(idx).fill(1)).map((_, i) => `@template T${i}`).join('\n * ')}\n */` : '';
        const cls = `class ${VscodeApi.className} {\n\t${apiDoc.replace(/\n/g, '\n\t')}\n}`;
        return `${doc}\n${cls}`;
        // let [templates, docNames] = getTemplatesAndDocNames(doc);
        // const name = templates.length ? `WebApi<${templates.join(', ')}>` : 'WebApi';
        // return `export class ${name} extends ${docNames.join(', ')} {}`;
    })();
    return [...expands, classDoc].join('\n\n');
}

const ApiFuncDocName = 'WebApiFunction';


const tsdoc = main();
console.log(tsdoc);