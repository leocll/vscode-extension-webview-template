import { WebviewData } from '../vscode.web/web.data';

class EGData extends WebviewData {
    constructor(vscode) {
        super(vscode);
        this.startPath = '';// start path
        this.rootPath = ''; // current work space path
    }
}

export {
    EGData
};