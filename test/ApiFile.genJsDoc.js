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

function genJsDoc() {
    /**@type {ApiFile[]} */
    const apiFiles = [{
        name: path.join(rootDir, 'src', 'vscode', 'webview.api.js'),
        classNames: ['WebviewVscodeApi', 'WebviewVscodeContextApi'],
    }, {
        name: path.join(rootDir, 'src', 'vscode', 'webview.data.js'),
        classNames: ['WebviewDataApi'],
    }];
    const doc = parse(apiFiles, rootDir);
    const jsDoc = doc.map(c => {
        const templates = c.classTemplates.map(t => `@template ${t}`);
        const def = `@typedef {Object} ${c.className}`;
        const props = c.apis.map(a => {
            const name = 'WebviewAsyncFunction';
            // const name = a.name;
            return {name, type: a.type.args.length === 0 ? a.type.name : `${a.type.name}<${a.type.args.join(', ')}>`};
        }).map(a => `@property {${a.type}} ${a.name}`);
        const elems = [...templates, def, ...props];
        const elemsDoc = elems.join(`\n * `);
        return `/**\n * ${elemsDoc}\n */`;
    }).join('\n\n');
    console.log(jsDoc);
    const jsDocFile = path.join(vscodeDir, 'web.api.d.ts');
    fs.writeFileSync(jsDocFile, jsDoc);
    return jsDoc;
}
const doc = genJsDoc();
console.log(doc);
console.log('leocll');