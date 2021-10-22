import { WebviewData } from '../vscode.web';

class EGData extends WebviewData {
    constructor(vscode) {
        super(vscode);
        this.egdata = undefined;
    }
}

export {
    EGData
};