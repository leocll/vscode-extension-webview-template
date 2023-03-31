const path = require('path');
const jsDocParser = require('./index');

class Test {
    constructor() {
        this.api = {
            /**
             * - api.func
             * @type {(a: Number) => Boolean}
             */
            func: (a) => Boolean(a),
        };
    }
}

const doc = jsDocParser.parse([{
    name: __filename,
    classNames: ['Test'],
}], __dirname);

console.log(doc);
console.log('over');

// function test() {
//     const rootDir = path.dirname(__dirname);
//     /**@type {ApiFile[]} */
//     const apiFiles = [{
//         name: path.join(rootDir, 'src', 'vscode', 'webview.api.js'),
//         classNames: ['WebviewVscodeApi', 'WebviewVscodeContextApi'],
//     }, {
//         name: path.join(rootDir, 'src', 'vscode', 'webview.data.js'),
//         classNames: ['WebviewDataApi'],
//     }];
//     const doc = parse(apiFiles, rootDir);
//     console.log(doc);
//     console.log('over');
// }