import MessageCenter from './web.message';

/**
 * @typedef {import('./web.message').CMD} CMD - CMD
 * @typedef {import('./web.message').Message<any>} Message - Message
 * @typedef {{postMessage: (msg: CMD) => void, setState: (key: string, value: any) => void, getState: (key: string) => any}} VscodeOrigin - Origin vscodeApi
 */
/**
 * @template T0
 * @template T1
 * @typedef {import('../../../../libs/vscode-webview-api').WebViewApi<T0, T1>} WebApi
 */

// @ts-ignore
import { WebApi } from './web.api';
import { WebViewApi } from 'webview-vscode-api';

const w = new WebViewApi();
w.

/**
 * Vscode api for web
 * @template T0
 * @template T1
 * @extends {WebApi<T0, T1>}
 */
class Vscode extends WebApi {
    /**
     * @param {MessageCenter} [msgCenter=undefined]
     */
    constructor(msgCenter=undefined) {
        super();
        if (msgCenter) {
            this.$messageCenter = msgCenter;
        } else {
            /**@type {VscodeOrigin} */
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

    /**
     * @param {MessageCenter} [msgCenter=undefined]
     */
    static Proxy(msgCenter=undefined) {
        const target = new this(msgCenter);
        return new Proxy(target, target.__ProxyHandler());
    }

    /**
     * @returns {ProxyHandler<Vscode<T0, T1>>}
     */
    __ProxyHandler() {
        return {
            get: (target, p, receiver) => {
                const v = Reflect.get(target, p, receiver);
                return v === undefined ? new VscodeProperty(target.$messageCenter, String(p)) : v;
            },
        };
    }
}

const w = new WebApi();

const v = new Vscode();

class VscodeProperty {
    /**
     * @param {MessageCenter} center
     * @param {string} name
     * @param {boolean} [inOn=false]
     */
    constructor(center, name, inOn=false) {
        this.__info__ = { center, name, inOn, isOn: false };
        this.__info__.isOn = this.__isOn__();
        // @ts-ignore
        return new Proxy((...argArray) => this.__call__(...argArray), {
            get: (_target, p) => {
                return new VscodeProperty(center, `${name}.${String(p)}`, this.__info__.isOn);
            },
        });
    }

    __call__(...argArray) {
        const { center, name, isOn } = this.__info__;
        if (isOn) {
            // @ts-ignore
            return center.on(...argArray);
        } else {
            return center.post({ cmd: name, args: argArray[0], p2p: true });
        }
    }

    __isOn__() {
        const { name, inOn } = this.__info__;
        return inOn || Boolean(name.split('.').find(n => n === '$on'));
    }
}

/**
 * Vscode api for web
 * @template T0
 * @template T1
 * @extends {Vscode<T0, T1>}
 */
class VscodeProxy {
    /**
     * @param {Vscode<T0, T1>} target
     */
    constructor(target) {
        return new Proxy(target, {
            get: (target, p, receiver) => {
                const v = Reflect.get(target, p, receiver);
                return v === undefined ? new VscodeProperty(target.$messageCenter, String(p)) : v;
            },
        });
    }
}

/**
 * @template T0
 * @template T1
 * @extends {Vscode<T0, T1>}
 * @param {Vscode<T0, T1>} target
 */
function A(target) {
    return new Proxy(target, {
        get: (target, p, receiver) => {
            const v = Reflect.get(target, p, receiver);
            return v === undefined ? new VscodeProperty(target.$messageCenter, String(p)) : v;
        }
    });
}

// /**@type {WebApi<any, any>} */
const v = new Vscode();

// const vp = A(v)
// vp.$messageCenter
// vp.$messageCenter

export {
    Vscode,
    VscodeProperty,
    VscodeProxy,
};