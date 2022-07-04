const path = require("path");
const ts = require('typescript/lib/tsserverlibrary');

const rootDir = path.dirname(__dirname);
const apiFiles = [
    path.join(rootDir, 'src', 'vscode', 'webview.api.js'),
    path.join(rootDir, 'src', 'vscode', 'webview.data.js'),
];

const program = ts.createProgram({
    rootNames: apiFiles,
    options: {
        allowJs: true,
        rootDir,
    },
});

// program.getProjectReferences();
// const files = program.getSourceFiles();
// const files_f = files.map(f => f.fileName);
const file = program.getSourceFile(apiFiles[0]);
console.log(file.statements);
console.log(file);