import { WebviewData } from '../vscode.web';

class EGData extends WebviewData {
    constructor(vscode = undefined) {
        super(vscode);
        this.egdata = undefined;
    }
}

export {
    EGData
};