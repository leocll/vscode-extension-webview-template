const fs = require('fs');
const path = require('path');
const jsDocParser = require('../jsdoc-parser');

const libsDir = path.dirname(__dirname);
const rootDir = path.dirname(libsDir);

/**
 * @typedef {import('../jsdoc-parser').ApiFile} ApiFile
 * @typedef {import('../jsdoc-parser').Api} Api
 * @typedef {import('../jsdoc-parser').ApiClass} ApiClass
 * @typedef {{file?: String, gen: (doc: ApiClass[]) => String}} DocOptions
 */

const ApiFuncDocName = 'WebApiFunction';

const VscodeApi = {
    file: path.join(__dirname, 'lib', 'vscode.api.js'),
    className: 'VscodeApi',
    /**@type {ApiFile[]} */
    apiFiles: [{
        name: path.join(libsDir, 'vscode-webview', 'lib', 'api.js'),
        classNames: ['WebviewVscodeApi', 'WebviewVscodeContextApi'],
        getDocName: (n) => ({'WebviewVscodeApi': 'WebVscodeApi', 'WebviewVscodeContextApi': 'WebVscodeContextApi'}[n] || n),
    }, {
        name: path.join(libsDir, 'vscode-webview', 'lib', 'data.js'),
        classNames: ['WebviewDataApi'],
        getDocName: (n) => ({'WebviewDataApi': 'WebDataApi'}[n] || n),
    }],
    extends: ['VscodeBaseApi'],
    expands: [
        `
/**
* @typedef {import('NodeJS').Platform} Platform
* @typedef {{index: number, name: string, folder: string}} WorkspaceFolder
* @typedef {{name?: string, uri: string}} AddWorkspaceFolder
*/
/**
* @template A
* @template R
* @typedef {(args: A) => Promise<{data: R}>} ${ApiFuncDocName}
*/`.trim(),
        `
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
}`.trim(),
    ]
}

function main() {
    const docs = jsDocParser.parse(VscodeApi.apiFiles, rootDir);
    const doc = gen_vscode_api(docs);
    VscodeApi.file && fs.writeFileSync(VscodeApi.file, doc);
    return doc;
}

/**
 * @param {ApiClass[]} targetDocs
 */
function gen_vscode_api(targetDocs) {
    const expands = VscodeApi.expands;
    let idx = 0;
    const templateMap = targetDocs.map(c => {
        return {
            [`${c.file}:${c.className}`]: c.classTemplates.map(t => {
                // @ts-ignore
                const tmp = {[t]: `T${idx}`};
                idx += 1;
                return tmp
            }).reduce((a, b) => Object.assign(a, b), {}),
        };
    }).reduce((a, b) => Object.assign(a, b), {});
    const apiDoc = targetDocs.map(c => {
        const cTemplateMap = templateMap[`${c.file}:${c.className}`];
        const props = c.apis.map(a => {
            const typName = a.type.name === 'WebviewAsyncFunction' || a.type.name === 'WebviewSyncFunction' ? ApiFuncDocName : a.type.name;
            const docType = a.type.args.length === 0 ? typName : `${typName}<${a.type.args.map(a => (cTemplateMap[a] || a)).join(', ')}>`;
            const docTags = [a.comment, `@type {${docType}}`].filter(x => x);
            const doc = !docTags ? '' : `
/**
 * ${docTags.join('\n * ')}
 */
`.trim();
            const funcArgsName = 'args';
            const [funcArgs, funcArgsPost] = a.type.args.length >= 0 && a.type.args[0] !== 'void' ? [funcArgsName, `, args: ${funcArgsName}`] : ['', ''];
            // TODO: isOn，是否为监听
            const isOn = false;
            const func = isOn
                ? `${a.name} = (${funcArgs}) => {\n\treturn this.$on(${a.name}, ...${funcArgs});\n}`
                : `${a.name} = (${funcArgs}) => {\n\treturn this.$post({ cmd: '${a.name}'${funcArgsPost} });\n}`;
            return `${doc}\n${func}`;
        });
        return `// ${c.className}\n${props.join('\n\n')}`;
    }).join('\n\n');
    const classDoc = (() => {
        const doc = idx < 0 ? '' : `
/**
 * ${(new Array(idx).fill(1)).map((_, i) => `@template T${i}`).join('\n * ')}
 */
`.trim();
        const cls = `
class ${VscodeApi.className} extends ${VscodeApi.extends.join(',')} {
    ${apiDoc.replace(/\n/g, '\n\t')}
}

export default ${VscodeApi.className};
`.trim();
        return `${doc}\n${cls}`;
    })();
    return [...expands, classDoc].join('\n\n');
}

const tsdoc = main();
console.log(tsdoc);