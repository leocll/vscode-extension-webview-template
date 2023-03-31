import { EventEmitter } from "events";
/**
 * @typedef {{cmd: string, args?: {[name: string]: any}, reply?: boolean, p2p?: boolean, timeout?: number}} CMD - Post cmd
 * @typedef {Message<any> & {index?: number}} _Message
 * @typedef {(msg: _Message) => void} MessageHandler
 * @typedef {{postMessage: (msg: _Message) => Promise|void}} MessagePoster
 */
/**
 * @template T
 * @typedef {CMD & {data: T}} Message - Message
 */

/**
 * @param {_Message} msg
 * @returns {string}
 */
function getCmdFromMessage(msg) {
    return msg.index === undefined ? msg.cmd : `${msg.cmd}&&${msg.index}`;
}
/**
 * @param {MessageCenter} center
 * @param {string} cmd
 * @returns {string[]}
 */
function getEventNamesForCmd(center, cmd) {
    // @ts-ignore
    return center._emitter.eventNames().filter(n => n.startsWith(`${cmd}&&`));
}

class MessageCenter {
    /**
     * @param {MessagePoster} poster
     */
    constructor(poster) {
        this._index = 0;
        this._emitter = new EventEmitter();
        /**
         * On received message
         * @type {(event: MessageEvent) => MessageCenter}
         * @typedef {{data: _Message}} MessageEvent
         */
        this.received = (event) => this._emitMessage(event.data);

        /**
         * Post message
         * @type {({cmd, args, reply, p2p, timeout}: CMD, ext?: {[name: string]: any}) => Promise<_Message>|undefined}
         */
        this.post = ({ cmd, args=undefined, reply=true, p2p=true, timeout=0 }, ext={}) => {
            ext.cmd = cmd;
            ext.args = args;
            ext.reply = reply;
            ext.p2p = p2p;
            if (reply && p2p) {
                this._index += 1;
                ext.index = this._index; // 1 on 1
            }
            if (reply) {
                return new Promise((resolve, _) => {
                    try {
                        const ff = () => {
                            const cmd = getCmdFromMessage(ext);
                            this.on(cmd, resolve);
                            timeout > 0 && setTimeout(() => {
                                ext.data = { status: 0, description: 'Operate timeout.' }
                                resolve(ext);
                                this.off(cmd, resolve);
                            }, timeout);
                        };
                        const promise = poster && poster.postMessage && poster.postMessage(ext);
                        if (promise && promise.then) {
                            promise.then((err) => {
                                if (err) {
                                    ext.data = { status: 0, description: err ? (err.message || err.toString()) : 'Unknown error.' };
                                    resolve(ext);
                                } else {
                                    ff();
                                }
                            });
                        } else {
                            ff();
                        }
                    } catch (e) {
                        ext.data = { status: 0, description: e ? (e.message || e.toString()) : 'Unknown error.' }
                        resolve(ext);
                    }
                });
            } else {
                poster && poster.postMessage && poster.postMessage(ext);
            }
        };

        /**
         * Subscribe message.
         * @type {(cmd: string, handler: MessageHandler, once?: boolean) => MessageCenter}
         */
        this.on = (cmd, handler, once=true) => {
            (once ? this._emitter.once : this._emitter.on)(cmd, handler);
            return this;
        };

        /**
         * Emit message
         * @type {(message: _Message) => MessageCenter}
         */
        this._emitMessage = (message) => {
            const cmd = getCmdFromMessage(message);
            console.log(`Received message: ${cmd}\n`, message.data);
            this._emitter.emit(cmd, message.data) || console.log(`Not Found message handler: ${cmd}\n`);
            return this;
        };

        /**
         * Remove message handler
         * @type {(cmd: string, handler: MessageHandler) => MessageCenter}
         */
        this.off = (cmd, handler) => {
            this._emitter.removeListener(cmd, handler);
            return this;
        };

        /**
         * Remove message handlers
         * @type {(cmd?: string) => MessageCenter}
         */
        this.offAll = (cmd=undefined) => {
            if (cmd === undefined) {
                this._emitter.eventNames().forEach(e => this._emitter.removeAllListeners(e));
            } else {
                getEventNamesForCmd(this, cmd).forEach(e => this._emitter.removeAllListeners(e));
            }
            return this;
        };
    }
}

export default MessageCenter;