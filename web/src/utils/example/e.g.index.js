import EGVscode from './e.g.vscode';
import { EGData } from './e.g.data';

// $vscode
const $vscode = new EGVscode();
// $data
const $data = new EGData();

window.$vscode = $vscode;
window.$data = $data;

const example = {
    $vscode,
    $data,
    activate: () => {
        $data.$activate($vscode);
    }
};

export default example;
export {
    $vscode,
    $data,
};