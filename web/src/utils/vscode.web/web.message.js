function MessageCenter(poster) {
    this.index = 0;
    this.handlers = {};
    // 接收到消息
    this.received = event => {
        const message = event.data; // JSON数据
        this.emit(message);
    };
    // 发送
    this.post = ({cmd, args=undefined, reply=true, p2p=true, timeout=0, ext={}}) => {
        ext.cmd = cmd;  // 执行命令
        ext.args = args;  // 执行命令参数
        ext.reply = reply;  // 是否回复
        if (reply && p2p) {
            this.index += 1;
            ext.index = this.index;  // 保证消息1对1处理
        }
        poster && poster.postMessage && poster.postMessage(ext);
        if (reply) {
            return new Promise((resolve, _) => {
                const f = (message) => {
                    resolve(message);
                };
                p2p && (f.index = this.index);
                this.on(cmd, f);
                timeout > 0 && setTimeout(() => {
                    f({error: 'Operate timeout.'});
                    this.off(cmd, f);
                }, timeout);
            });
        }
    };
    // 订阅消息，times=0，表示一直接收，不移除
    this.on = (cmd, handler, times=1) => {
        if (handler && typeof handler === 'function') {
            times === 0 && (times = -1);// -1，表示一直接收，为0时清除
            handler.times = times;
        } else {
            return this;
        }
        this.handlers[cmd] || (this.handlers[cmd] = []);
        this.handlers[cmd].push(handler);
        return this;
    };
    // 触发消息
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
    // 删除消息事件
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