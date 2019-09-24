import MessageCenter from './web.message';

class Vscode {
    constructor() {
        // origin vscodeApi
        this.origin = (_ => {
            try {
                // @ts-ignore
                // eslint-disable-next-line no-undef
                return acquireVsCodeApi();
            } catch (_) {
                return {
                    postMessage: () => { console.log("Not Found: 'acquireVsCodeApi'"); },
                    setState: () => { console.log("Not Found: 'acquireVsCodeApi'"); },
                    getState: () => { console.log("Not Found: 'acquireVsCodeApi'"); }
                };
            }
        })();
        // message center
        this._messageCenter = new MessageCenter(this.origin);
        this.received = this.messageCenter.received;
        this.post = this.messageCenter.post;
        this.on = this.messageCenter.on;
        this.off = this.messageCenter.off;
        this.webviewData = undefined;
        // @ts-ignore
        window && window.addEventListener && window.addEventListener('message', this.received);
    }
    get messageCenter() {
        return this._messageCenter;
    }
    // Lift Cycle
    onWebviewDidPose(callBack) {    // init webview
        this.on(`webviewDidPose`, callBack, 1);
        return this;
    }
    // onwebviewDidDispose(callBack) { // dismiss webview
    //     this.on(`webviewDidDispose`, callBack, 1);
    //     return this;
    // }
    // onwebviewDidChangeViewState(callBack, times=1) {
    //     this.on(`webviewDidChangeViewState`, callBack, times);
    //     return this;
    // }
    // BridgeData
    onSyncBridgeData = (callBack, times=1) => {
        this.on(`syncBridgeData`, callBack, times);
        return this;
    }
    getBridgeData = () => {
        return this.post({cmd: `getBridgeData`});
    }
    updateBridgeData = (data) => {
        return this.post({cmd: `updateBridgeData`, args: data, reply: false});
    }
    // Path
    getExtensionPath = () => {
        return this.post({cmd: `getExtensionPath`});
    }
    getWorkspacePath = () => {
        return this.post({cmd: `getWorkspacePath`});
    }
    getStoragePath = () => {
        return this.post({cmd: `getStoragePath`});
    }
    getGlobalStoragePath = () => {
        return this.post({cmd: `getGlobalStoragePath`});
    }
    // State
    getWorkspaceState = () => {
        return this.post({cmd: `getWorkspaceState`});
    }
    updateWorkspaceState = (states) => {
        return this.post({cmd: `updateWorkspaceState`, args: states, reply: false});
    }
    getGlobalState = () => {
        return this.post({cmd: `getGlobalState`});
    }
    updateGlobalState = (states) => {
        return this.post({cmd: `updateGlobalState`, args: states, reply: false});
    }
    // Find
    findFileInWorkspace = ({include, exclude=undefined}) => {
        return this.post({cmd: `findFileInWorkspace`, args: {include, exclude}});
    }
    // Platform
    getPlatform = () => {
        return this.post({cmd: `getPlatform`});
    }
    // Show
    showTxt2Output = ({txt, preserveFocus=true}) => {
        return this.post({cmd: `showTxt2Output`, args: {txt, preserveFocus}});
    }
    showOpenDialog = ({canSelectFiles=true, canSelectFolders=false, canSelectMany=false, defaultUri=undefined, filters=undefined}) => {
        !defaultUri && this.webviewData && (defaultUri = this.webviewData.rootPath);
        return this.post({cmd: `showOpenDialog`, args: {canSelectFiles, canSelectFolders, canSelectMany, defaultUri, filters}});
    }
    showMessage = ({txt, btns=undefined}) => {
        return this.post({cmd: `showMessage`, args: {txt, btns}, reply: btns});
    }
    showError = ({txt, btns=undefined}) => {
        if (txt && typeof txt !== 'string') {
            txt = txt['message'] || txt.toString();
        }
        return this.post({cmd: `showError`, args: {txt, btns}, reply: btns});
    }
    showWarn = ({txt, btns=undefined}) => {
        return this.post({cmd: `showWarn`, args: {txt, btns}, reply: btns});
    }
    // fs
    exists4Path = ({path}) => {
        return this.post({cmd: `exists4Path`, args: {path}});
    }
    getStat4Path = ({path}) => {
        return this.post({cmd: `getStat4Path`, args: {path}});
    }
    readFile = ({path, options=undefined}) => {
        return this.post({cmd: `readFile`, args: {path, options}});
    }
    writeFile = ({path, options=undefined}) => {
        return this.post({cmd: `writeFile`, args: {path, options}});
    }
    // request
    request = ({url, method='POST', data=undefined, headers={"content-type": "application/json"}}) => {
        return this.post({cmd: `request`, args: {url, method, data, headers}});
    }
}

export default Vscode;