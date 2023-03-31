import MessageCenter from './web.message';

/**
 * @typedef {import('./web.message').CMD} CMD - CMD
 * @typedef {import('./web.message').Message<any>} Message - Message
 * @typedef {{postMessage: (msg: CMD) => void, setState: (key: string, value: any) => void, getState: (key: string) => any}} VscodeOrigin - Origin vscodeApi
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
                                console.error("Not Found: 'acquireVsCodeApi'");
                            } else {
                                console.error("Not Found: 'acquireVsCodeApi'");
                            }
                        },
                        setState: (key, value) => { console.error("Not Found: 'acquireVsCodeApi'"); },
                        getState: (key) => { console.error("Not Found: 'acquireVsCodeApi'"); }
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
 * @class Vscode
 */
class Vscode extends VscodeBase {
    /**
     * @param {MessageCenter} [msgCenter=undefined] 
     */
    constructor(msgCenter=undefined) {
        super(msgCenter);
        return new Proxy(this, {
            get: (target, property, receiver) => {
                const v = Reflect.get(target, property);
                // @ts-ignore
                return v === undefined ? (data) => this.$messageCenter.post({ cmd: property, args: data, reply: true }) : v;
            }
        });
    }
}

export {
    VscodeBase,
    VscodeBaseApi,
    VscodeBaseOn,
    Vscode,
};