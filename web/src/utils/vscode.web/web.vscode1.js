import MessageCenter from './web.message';

/**
 * @typedef {import('./web.message').CMD} CMD - CMD
 * @typedef {import('./web.message').Message<any>} Message - Message
 * @typedef {{postMessage: (msg: CMD) => void, setState: (key: string, value: any) => void, getState: (key: string) => any}} VscodeOrigin - Origin vscodeApi
 * 
 * @typedef {import('../../../../src/vscode/webview.api').WorkspaceFolder} WorkspaceFolder
 * @typedef {import('../../../../src/vscode/webview.api').AddWorkspaceFolder} AddWorkspaceFolder
 */
/**
 * @template T0
 * @template T1
 * @typedef {import('../../../../src/vscode/web.api').WebApi<T0, T1>} WebApi
 */

class VscodeBase {
    /**
     * @param {MessageCenter} [msgCenter=undefined] 
     */
     constructor(msgCenter=undefined) {
        if (msgCenter) {
            this.$messageCenter = msgCenter;
        } else {
            /** @type {VscodeOrigin} */
            const origin = (_ => {
                try {
                    // @ts-ignore
                    // eslint-disable-next-line no-undef
                    return acquireVsCodeApi();
                } catch (_) {
                    return {
                        /**@type {(msg: CMD) => void} */
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
            this.$messageCenter = new MessageCenter(origin);
            // @ts-ignore
            window && window.addEventListener && window.addEventListener('message', this.$messageCenter.received);
        }
    }
}

class VscodeBaseApi extends VscodeBase {
    /**
     * Post message
     * @param {CMD} msg
     */
    post = (msg) => {
        return this.$messageCenter.post(msg);
    }
}

class VscodeBaseOn extends VscodeBase {
    /**
     * On received message
     * @param {String} cmd
     * @param {(msg: Message) => void} callBack
     * @param {number} [times=1]
     */
    on = (cmd, callBack, times = 1) => {
        return this.$messageCenter.on(cmd, callBack, times);
    }
}

/**
 * Vscode api for web
 * @template T0
 * @template T1
 * @class Vscode
 * @implements {WebApi<T0, T1>}
 */
// class Vscode1 {
// }
// const t = new Vscode1();
// t.

/**
 * Vscode api for web
 * @template T0
 * @template T1
 * @class Vscode
 */
class Vscode extends VscodeBase {
    /**
     * @param {MessageCenter} [msgCenter=undefined] 
     */
    constructor(msgCenter=undefined) {
        super(msgCenter);
        /**@type {VscodeBaseApi & WebApi<T0, T1>} */
        // @ts-ignore
        this.$api = new Proxy(new VscodeBaseApi(this.$messageCenter), {
            get(target, property, receiver) {
                const v = Reflect.get(target, property);
                // @ts-ignore
                return v === undefined ? (data) => target.post({ cmd: property, args: data, reply: true }) : v;
            }
        });
        this.$on = new Proxy(new VscodeBaseOn(this.$messageCenter), {
            get(target, property, receiver) {
                const v = Reflect.get(target, property);
                // @ts-ignore
                return v === undefined ? (callBack, times = 1) => target.on(property, callBack, times) : v;
            }
        });
    }

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
     * On received message of sync webview data
     * @param {(msg: Message) => void} callBack
     * @param {number} times
     * @memberof Vscode
     */
    onSyncWebviewData = (callBack, times = 1) => {
        this.on(`syncWebviewData`, callBack, times);
        return this;
    }

    /**
     * On received message of workspace folders changed
     * @param {(msg: Message) => void} callBack
     * @param {number} times
     * @memberof Vscode
     */
    onDidChangeWorkspaceFolders = (callBack, times = 1) => {
        this.on(`onDidChangeWorkspaceFolders`, callBack, times);
        return this;
    }
}

const vscode = new Vscode();
vscode.$api.showError({txt: ''})
vscode.$on
export {
    VscodeBase,
    VscodeBaseApi,
    VscodeBaseOn,
    Vscode,
};