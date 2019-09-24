import EGVscode from './e.g.vscode';
import { EGData } from './e.g.data';

// vscode
const vscode = new EGVscode();
// webviewData
const webviewData = new EGData(vscode);
vscode.webviewData = webviewData;
// activate, get data
webviewData.$activate();

window.vscode = vscode;
window.webviewData = webviewData;

const example = {
    activate: () => {
        webviewData.$activate();
    }
};

export default example;
