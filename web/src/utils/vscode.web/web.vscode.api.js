import MessageCenter from './web.message';

/**
 * @typedef {import('./web.message').Message} Message - Message
 * @typedef {{postMessage: (msg: Message) => void, setState: (key: string, value: any) => void, getState: (key: string) => any}} VscodeOrigin - Origin vscodeApi
 * 
 * @typedef {import('../../../../src/vscode/vscode.webviewApi').WorkspaceFolder} WorkspaceFolder
 * @typedef {import('../../../../src/vscode/vscode.webviewApi').AddWorkspaceFolder} AddWorkspaceFolder
 */
/**
 * Vscode api for web
 * @class VscodeApi
 */
class VscodeApi {
    constructor() {
        /** @type {VscodeOrigin} */
        this._origin = (_ => {
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
        this._messageCenter = new MessageCenter(this._origin);
        this._received = this.messageCenter.received;
        this._post = this.messageCenter.post;
        this._on = this.messageCenter.on;
        this._off = this.messageCenter.off;
        // @ts-ignore
        window && window.addEventListener && window.addEventListener('message', this._received);
        // proxyHandler
        const proxyHandler = (obj, prop) => {
            if (prop === '$emit' || prop === '$on') {
                return obj && obj[prop];
            } else {
                const cmd = obj.key ? `${obj.key}.${prop}`: prop;
                return new Proxy({
                    $p2p: () => {
                        this._post({ cmd, args: Array.prototype.slice.call(arguments), reply: true });
                    },
                    $post: () => {
                        this._post({ cmd, args: Array.prototype.slice.call(arguments), reply: false });
                    },
                    /**@type {(callBack: (msg: Message) => void, times?: Number) => void} */
                    $on: (callBack, times = 0) => {
                        this._on(cmd, callBack, times);
                    },
                    /**@type {(callBack: (msg: Message) => void) => void} */
                    $once: (callBack) => {
                        this._on(cmd, callBack, 1);
                    }
                }, {
                    get: proxy
                });
            }
        }
    }
    get messageCenter() { return this._messageCenter; }
}
