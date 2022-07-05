const path = require('path');
const ts = require('typescript/lib/tsserverlibrary');

/**
 * @typedef {{name: String, classNames: String[]}} ApiFile
 * @typedef {{name: String, type: {name: String, args: String[]}}} Api
 * @typedef {{file: String, classTemplates: String[], className: String, apis: Api[]}} ApiClass
 * @typedef {{target: ApiFile, getText: (pos: number, end?: number) => String}} ParseOptions
 */

/**
 * @param {ApiFile} file 
 * @param {ts.Program} program
 */
function parseFile(file, program) {
    const sourceUnit = program.getSourceFile(file.name);
    const fs = require('fs');
    /**@type {String} */
    let content = undefined;
    const options = {
        target: file,
        getText: (pos, end) => {
            !content && (content = fs.readFileSync(file.name, {encoding: 'utf-8'}));
            return content.slice(pos, end);
        }
    };
    return sourceUnit.statements.map(s => {
        // @ts-ignore
        return s.kind === ts.SyntaxKind.ClassDeclaration ? parseClass(s, options) : undefined;
    }).filter(a => a);
}

/**
 * @param {ts.ClassDeclaration} cls
 * @param {ParseOptions} options
 * @returns {ApiClass}
 */
function parseClass(cls, options) {
    const file = options.target;
    if (cls.name && file.classNames.find(cName => cName === cls.name.escapedText)) {
        // @ts-ignore
        const classTemplates = parseClassJsDoc(cls.jsDoc, options);
        for (const m of cls.members) {
            if (m.kind === ts.SyntaxKind.Constructor) {
                /**@type {ts.ConstructorDeclaration} */
                // @ts-ignore
                const func = m;
                if (func.body) {
                    for (const s of func.body.statements) {
                        if (s.kind === ts.SyntaxKind.ExpressionStatement) {
                            /**@type {ts.ExpressionStatement} */
                            // @ts-ignore
                            const api = s;
                            if (api.expression.kind == ts.SyntaxKind.BinaryExpression) {
                                /**@type {ts.BinaryExpression} */
                                // @ts-ignore
                                const apiExp = api.expression;
                                if (apiExp.operatorToken && apiExp.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
                                    /**@type {[ts.PropertyAccessExpression, ts.ObjectLiteralExpression]} */
                                    // @ts-ignore
                                    const [left, right] = [apiExp.left, apiExp.right];
                                    if (left.name.escapedText === 'api' && right.kind === ts.SyntaxKind.ObjectLiteralExpression) {
                                        // @ts-ignore
                                        return {file: file.name, classTemplates, className: cls.name.escapedText, apis: right.properties.map(p => parseApi(p, options))};
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
 * @param {ts.JSDoc[]} jsDocs
 * @param {ParseOptions} options
 */
 function parseClassJsDoc(jsDocs, options) {
    const jsDoc = (jsDocs || []).pop();
    return (!jsDoc || !jsDoc.tags) ? [] : jsDoc.tags.map(tag => {
        // @ts-ignore
        return tag.kind !== ts.SyntaxKind.JSDocTemplateTag ? undefined : tag.typeParameters.map(a => parseJsDocTypeArgument(a, options));
    }).filter(a => a).reduce((a, b) => [...a, ...b], []);
}

/**
 * @param {ts.PropertyAssignment} api
 * @param {ParseOptions} options
 */
function parseApi(api, options) {
    if (api.kind !== ts.SyntaxKind.PropertyAssignment) {
        throw new Error(`Kind error: 'api.kind' equal ${api.kind}`);
    }
    /**@type {[ts.Identifier, ts.JSDoc[]]} */
    // @ts-ignore
    const [name, jsDocs] = [api.name, api.jsDoc];
    return {name: name.escapedText, type: parseApiJsDoc(jsDocs, options)};
}

/**
 * @param {ts.JSDoc[]} jsDocs
 * @param {ParseOptions} options
 */
function parseApiJsDoc(jsDocs, options) {
    for (const jsDoc of (jsDocs || [])) {
        for (const tag of (jsDoc.tags || [])) {
            // @ts-ignore
            if (tag.kind === ts.SyntaxKind.JSDocTypeTag && tag.typeExpression && tag.typeExpression.kind === ts.SyntaxKind.JSDocTypeExpression) {
                /**@type {ts.TypeReferenceNode} */
                // @ts-ignore
                const typ = tag.typeExpression.type;
                // @ts-ignore
                if (typ.typeName && typ.typeName.kind === ts.SyntaxKind.Identifier && ['WebviewSyncFunction', 'WebviewAsyncFunction'].find(n => n === typ.typeName.escapedText)) {
                    return {name: typ.typeName.escapedText, args: typ.typeArguments.map(a => parseJsDocTypeArgument(a, options))};
                } else {
                    return {name: parseJsDocTypeArgument(typ, options), args: []};
                }
            }
        }
    }
    throw new Error(`Not found type of api`);
}

/**
 * @param {ts.TypeNode} arg
 * @param {ParseOptions} options
 * @returns {String}
 */
function parseJsDocTypeArgument(arg, options) {
    switch (arg.kind) {
        case ts.SyntaxKind.VoidKeyword:
            return 'void';
        default:
            // console.log(`Unknown kind：${arg.kind}, ${options.getText(arg.pos, arg.end).trim()}`);
            return options.getText(arg.pos, arg.end).trim();
    }
}

/**
 * 
 * @param {ApiFile[]} apiFiles 
 * @param {String} rootDir
 */
function parse(apiFiles, rootDir=undefined) {
    rootDir || (rootDir = path.dirname(__dirname));
    const program = ts.createProgram({
        rootNames: apiFiles.map(f => f.name),
        options: {
            allowJs: true,
            rootDir,
        },
    });
    return apiFiles.map(f => parseFile(f, program)).reduce((a, b) => [...a, ...b], []);
}

function test() {
    const rootDir = path.dirname(__dirname);
    /**@type {ApiFile[]} */
    const apiFiles = [{
        name: path.join(rootDir, 'src', 'vscode', 'webview.api.js'),
        classNames: ['WebviewVscodeApi', 'WebviewVscodeContextApi'],
    }, {
        name: path.join(rootDir, 'src', 'vscode', 'webview.data.js'),
        classNames: ['WebviewDataApi'],
    }];
    const doc = parse(apiFiles, rootDir);
    console.log(doc);
    console.log('over');
}

module.exports = {
    parse,
    test,
};