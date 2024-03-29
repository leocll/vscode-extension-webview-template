/**
 * @typedef {{cmd: string, args?: {[name: string]: any}, reply?: boolean, p2p?: boolean, timeout?: number}} CMD - Post cmd
 * @typedef {CMD & {data: any}} Message - Message
 * @typedef {import('./web.vscode').VscodeOrigin} VscodeOrigin - Origin vscodeApi
 */
/**
 * Message center
 * @param {VscodeOrigin} poster
 */
function MessageCenter(poster) {
    this.index = 0;
    this.handlers = {};

    /**
     * On received message
     * @type {(event: MessageEvent) => void}
     * @typedef {{data: Message}} MessageEvent
     */
    this.received = event => {
        const message = event.data;
        this.emit(message);
    };

    /**
     * Post message
     * @type {({cmd, args, reply, p2p, timeout}: CMD, ext?: {[name: string]: any}) => Promise<Message>|undefined}
     */
    this.post = ({ cmd, args = undefined, reply = true, p2p = true, timeout = 0 }, ext = {}) => {
        ext.cmd = cmd;
        ext.args = args;
        ext.reply = reply;
        if (reply && p2p) {
            this.index += 1;
            ext.index = this.index; // 1 on 1
        }
        if (reply) {
            return new Promise((resolve, _) => {
                const f = (message) => {
                    resolve(message);
                };
                try {
                    const ff = () => {
                        p2p && (f.index = this.index);
                        this.on(cmd, f);
                        timeout > 0 && setTimeout(() => {
                            ext.data = { status: 0, description: 'Operate timeout.' }
                            f(ext);
                            this.off(cmd, f);
                        }, timeout);
                    };
                    const promise = poster && poster.postMessage && poster.postMessage(ext);
                    if (promise && promise.then) {
                        promise.then((err) => {
                            if (err) {
                                ext.data = { status: 0, description: err ? (err.message || err.toString()) : 'Unknown error.' };
                                f(ext);
                            } else {
                                ff();
                            }
                        });
                    } else {
                        ff();
                    }
                } catch (e) {
                    ext.data = { status: 0, description: e ? (e.message || e.toString()) : 'Unknown error.' }
                    f(ext);
                }
            });
        } else {
            poster && poster.postMessage && poster.postMessage(ext);
        }
    };

    /**
     * Subscribe message. `times`: times of receiving message, `times = 0`: always receive.
     * @type {(cmd: string, handler: (msg: Message) => void, times=1) => MessageCenter}
     */
    this.on = (cmd, handler, times = 1) => {
        if (handler && typeof handler === 'function') {
            times === 0 && (times = -1); // `-1`: always receive, `0`: clear the handler  
            handler.times = times;
        } else {
            return this;
        }
        this.handlers[cmd] || (this.handlers[cmd] = []);
        this.handlers[cmd].push(handler);
        return this;
    };

    /**
     * Emit message
     * @type {(message: Message) => MessageCenter}
     */
    this.emit = (message) => {
        console.log(`Received message：${message.cmd}`);
        console.log(message.data);
        if (!message || !message.cmd || !this.handlers || !this.handlers[message.cmd]) {
            console.log(`Not Found message: ${message.cmd}\n`);
            return this;
        }
        const hs = this.handlers[message.cmd];
        for (let i = 0, length = hs.length; i < length; i++) {
            const h = hs[i];
            if (message.p2p) {
                if (message.index === h.index) {
                    h.times = 0;
                    h(message);
                    break;
                }
            } else {
                h.times > 0 && (h.times = h.times - 1);
                h(message);
            }
        }
        for (let i = hs.length - 1; i >= 0; i--) {
            if (hs[i].times === 0) {
                hs.splice(i, 1);
            }
        }
        return this;
    };

    /**
     * Remove message handler
     * @type {(cmd: string, handler: (message: Message) => {}) => MessageCenter}
     */
    this.off = (cmd, handler) => {
        var hs = this.handlers[cmd];
        if (hs) {
            for (var i = hs.length - 1; i >= 0; i--) {
                if (hs[i] === handler) {
                    hs.splice(i, 1);
                }
            }
        }
        return this;
    };
}

export default MessageCenter;