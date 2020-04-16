import MessageCenter from './web.message';

/**
 * @typedef {{cmd: string, args?: any, reply?: boolean, p2p?: boolean, timeout?: number, data?: any}} Message Message
 */
/**
 * Vscode api for web
 * @class Vscode
 */
class Vscode {
    constructor() {
        /**
         * Origin vscodeApi
         * @type {Webvscode}
         * @typedef {{postMessage: (msg: Message) => void, setState: (key: string, value: any) => void, getState: (key: string) => any}} Webvscode
         * @property {(msg: Message) => void} postMessage
         * @property {(key: string, value: any) => void} setState
         * @property {(key: string) => any} getState
         */
        this.origin = (_ => {
            try {
                // @ts-ignore
                // eslint-disable-next-line no-undef
                return acquireVsCodeApi();
            } catch (_) {
                return {
                    /**
                     * @type {(msg: Message) => void}
                     */
                    postMessage: (msg) => {
                        if (msg.cmd === 'showMessage' || msg.cmd === 'showError' || msg.cmd === 'showWarn' || msg.cmd === 'showTxt2Output') {
                            console.log(msg.args.txt);
                        } else if (msg.cmd === 'showOpenDialog') {
                            /* try {
                                let fileEle = document.getElementById('browser-get-file');
                                if (!fileEle) {
                                    const indexEle = document.getElementById('Index');
                                    indexEle.innerHTML += '<input type="file" id="browser-get-file" name="file" style="display: none;" />';
                                    fileEle = document.getElementById('browser-get-file');
                                    fileEle.onchange = function() {
                                        console.log('change ==>');
                                        console.log(this);
                                        console.log(this.files);
                                    };
                                }
                                console.log(fileEle);
                                fileEle.click();
                            } catch (e) {
                                console.error(e.message);
                            } */
                            console.log("Not Found: 'acquireVsCodeApi'");
                        } else {
                            console.log("Not Found: 'acquireVsCodeApi'");
                        }
                    },
                    setState: (key, value) => { console.log("Not Found: 'acquireVsCodeApi'"); },
                    getState: (key) => { console.log("Not Found: 'acquireVsCodeApi'"); }
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
    get messageCenter() { return this._messageCenter; }

    // Lift Cycle
    onWebviewDidPose(callBack) { // init webview
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

    /**
     * On recrived message of sync bridge data
     * @param {(msg: Message) => void} callBack
     * @param {number} times
     * @memberof Vscode
     */
    onSyncBridgeData = (callBack, times = 1) => {
        this.on(`syncBridgeData`, callBack, times);
        return this;
    }

    /**
     * Get bridge data
     * @type {() => Promise<{data: any}>}
     */
    getBridgeData = () => {
        return this.post({ cmd: `getBridgeData` });
    }

    /**
     * Update bridge data
     * @type {{data: any} =>  void}
     */
    updateBridgeData = (data) => {
        this.post({ cmd: `updateBridgeData`, args: data, reply: false });
    }

    /**
     * Get extension path
     * @type {() => Promise<{data: string}>}
     */
    getExtensionPath = () => {
        return this.post({ cmd: `getExtensionPath` });
    }

    /**
     * Get workspace path
     * @type {() => Promise<{data: string}>}
     */
    getWorkspacePath = () => {
        return this.post({ cmd: `getWorkspacePath` });
    }

    /**
     * Get storage path
     * @type {() => Promise<{data: string}>}
     */
    getStoragePath = () => {
        return this.post({ cmd: `getStoragePath` });
    }

    /**
     * Get global storage path
     * @type {() => Promise<{data: string}>}
     */
    getGlobalStoragePath = () => {
        return this.post({ cmd: `getGlobalStoragePath` });
    }

    /**
     * Get workspace state
     * @type {() => Promise<{data: any}>}
     */
    getWorkspaceState = () => {
        return this.post({ cmd: `getWorkspaceState` });
    }

    /**
     * Update workspace state
     * @type {(states: any) => void}
     */
    updateWorkspaceState = (states) => {
        this.post({ cmd: `updateWorkspaceState`, args: states, reply: false });
    }

    /**
     * Get global state
     * @type {() => Promise<{data: any}>}
     */
    getGlobalState = () => {
        return this.post({ cmd: `getGlobalState` });
    }

    /**
     * Update global state
     * @type {(states: any) => void}
     */
    updateGlobalState = (states) => {
        this.post({ cmd: `updateGlobalState`, args: states, reply: false });
    }

    /**
     * Find file in current workspace
     * @type {({include, exclude}: {include: string, exclude?: string}) => Promise<{data?: string[]}>}
     */
    findFileInWorkspace = ({ include, exclude = undefined }) => {
        return this.post({ cmd: `findFileInWorkspace`, args: { include, exclude } });
    }

    /**
     * Get current platform
     * @type {() => Promise<{data: 'aix'|'android'|'darwin'|'freebsd'|'linux'|'openbsd'|'sunos'|'win32'|'cygwin'|'netbsd'}>}
     */
    getPlatform = () => {
        return this.post({ cmd: `getPlatform` });
    }

    /**
     * Show message alert
     * @type {({txt, btns}: {txt: string, btns?: string[]}) => Promise<{data: string}>}
     */
    showMessage = ({ txt, ouput = false, btns = undefined }) => {
        ouput && this.showTxt2Output({ txt });
        return this.post({ cmd: `showMessage`, args: { txt, btns }, reply: !!btns });
    }

    /**
     * Show error alert
     * @type {({txt, btns}: {txt: string, btns?: string[]}) => Promise<{data: string}>}
     */
    showError = ({ txt, ouput = false, btns = undefined }) => {
        if (txt && typeof txt !== 'string') {
            txt = txt['message'] || txt.toString();
        }
        ouput && this.showTxt2Output({ txt });
        return this.post({ cmd: `showError`, args: { txt, btns }, reply: !!btns });
    }

    /**
     * Show warn alert
     * @type {({txt, btns}: {txt: string, btns?: string[]}) => Promise<{data: string}>}
     */
    showWarn = ({ txt, ouput = false, btns = undefined }) => {
        ouput && this.showTxt2Output({ txt });
        return this.post({ cmd: `showWarn`, args: { txt, btns }, reply: !!btns });
    }

    /**
     * Show open dialog, select a or some local files or folders
     * @param {showOpenDialogOptions} any
     * @typedef {{canSelectFiles?: boolean, canSelectFolders?: boolean, canSelectMany?: boolean, defaultUri?: string, filters?: {[name: string]: string[]}, openLabel?: string}} showOpenDialogOptions
     * @property {{[name: string]: string[]}} filters e.g.: `{'Images': ['png', 'jpg'], 'TypeScript': ['ts', 'tsx']}`
     * @returns {Promise<{data?: string[]}>}
     */
    showOpenDialog = ({ canSelectFiles = true, canSelectFolders = false, canSelectMany = false, defaultUri = undefined, filters = undefined }) => {
        return this.post({ cmd: `showOpenDialog`, args: { canSelectFiles, canSelectFolders, canSelectMany, defaultUri, filters } });
    }

    /**
     * Show save dialog, select a local file path
     * @type {({defaultUri, filters, saveLabel}: {defaultUri?: string, filters?: {string: string[]}, saveLabel?: string}) => Promise<{data?: string}>}
     * @property filters e.g.: {'Images': ['png', 'jpg'], 'TypeScript': ['ts', 'tsx']}
     */
    showSaveDialog = ({ defaultUri = undefined, filters = undefined, saveLabel = undefined }) => {
        return this.post({ cmd: `showSaveDialog`, args: { defaultUri, filters, saveLabel } });
    }

    /**
     * Show file
     * @type {({filePath, viewColumn, preserveFocus, preview}: {filePath: string, viewColumn?: number, preserveFocus?: boolean, preview?: boolean}) => void}
     */
    showTextDocument = ({ filePath, viewColumn = 1, preserveFocus = false, preview = false }) => {
        const args = { filePath };
        viewColumn && (args.viewColumn = viewColumn);
        preserveFocus && (args.preserveFocus = preserveFocus);
        preview && (args.preview = preview);
        this.post({ cmd: `showTextDocument`, args, reply: false });
    }

    /**
     * Show txt to output
     * @type {({txt, preserveFocus, line}: {txt: string, preserveFocus?: boolean, line?: boolean}) => void}
     */
    showTxt2Output = ({ txt, preserveFocus = false }) => {
        this.post({ cmd: `showTxt2Output`, args: { txt, preserveFocus }, reply: false });
    }

    /**
     * Send cmd to terminal
     * @type {({cmd, addNewLine, preserveFocus}: {cmd: string, addNewLine?: boolean, preserveFocus?: boolean}) => void}
     */
    sendCmd2Terminal = ({ cmd, addNewLine = true, preserveFocus = false }) => {
        this.post({ cmd: `sendCmd2Terminal`, args: { cmd, addNewLine, preserveFocus }, reply: false });
    }

    /**
     * a File or folder if exists
     * @type {({path}: {path: string}) => Promise<{data: boolean}>}
     */
    exists4Path = ({ path }) => {
        return this.post({ cmd: `exists4Path`, args: { path } });
    }

    /**
     * Get stat for path
     * @type {({path}: {path: string}) => Promise<{data: {error?: string, data: undefined|{isFile: boolean, isDirectory: boolean, isSymbolicLink: boolean}}>}
     */
    getStat4Path = ({ path }) => {
        return this.post({ cmd: `getStat4Path`, args: { path } });
    }

    /**
     * Read file
     * @type {({path, options}: {path: string, options?: 'hex'|'json'|'string'}) => Promise<{data: {error?: string, data: any}}>}
     */
    readFile = ({ path, options = undefined }) => {
        return this.post({ cmd: `readFile`, args: { path, options } });
    }

    /**
     * Write file
     * @type {({path, data, options}: {path: string, data: string|[]|{}, options?: {encoding?: string|undefined, mode?: number|string, flag?: string}|string|undefined}) => Promise<{data: {error?: string|undefined}}>}
     */
    writeFile = ({ path, data, options = undefined }) => {
        return this.post({ cmd: `writeFile`, args: { path, data, options } });
    }

    /**
     * Request
     * @type {({}: {url: string, method?: string, data?: {}, headers?: {}}) => Promise<{data: {error?: string, body: any, statusCode: number, statusMessage:string}}>}
     */
    request = ({ url, method = 'POST', data = undefined, headers = { "content-type": "application/json" } }) => {
        return this.post({ cmd: `request`, args: { url, method, data, headers } });
    }
}

export default Vscode;