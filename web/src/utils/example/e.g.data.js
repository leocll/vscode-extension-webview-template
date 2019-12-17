import { WebviewData } from '../vscode.web';

class EGData extends WebviewData {
    constructor(vscode) {
        super(vscode);
        this.startPath = ''; // start path
        this.rootPath = ''; // current work space path
    }
}

export {
    EGData
};