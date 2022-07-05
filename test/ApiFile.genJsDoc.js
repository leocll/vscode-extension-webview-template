const fs = require('fs');
const path = require('path');
const { parse } = require('./ApiFile.parse');

const rootDir = path.dirname(__dirname);
const vscodeDir = path.join('src', 'vscode');

/**
 * @typedef {import('./ApiFile.parse').ApiFile} ApiFile
 * @typedef {import('./ApiFile.parse').Api} Api
 * @typedef {import('./ApiFile.parse').ApiClass} ApiClass
 */

const ApiFuncDocName = 'WebApiFunction';
const ApiFuncDoc = `/**
 * @template A
 * @template R
 * @typedef {(args: A) => Promise<{data: R}>} ${ApiFuncDocName}
 */`;

function genJsDoc() {
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
    const doc = parse(apiFiles, rootDir);
    let jsDoc = doc.map(c => {
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
    jsDoc = `${ApiFuncDoc}\n\n${jsDoc}\n\nexport {};`;
    console.log(jsDoc);
    const jsDocFile = path.join(vscodeDir, 'web.api.type.js');
    fs.writeFileSync(jsDocFile, jsDoc);
    return jsDoc;
}
const doc = genJsDoc();
console.log(doc);
console.log('leocll');