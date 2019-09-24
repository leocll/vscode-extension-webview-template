const utils = require('./vscode.utils');

class Message {
    static create(cmd, data) {
        return {cmd, data};
    }
    static webviewDidPose(data) {
        return {cmd: `webviewDidPose`, data};
    }
    static webviewDidDispose(data) {
        return {cmd: `webviewDidDispose`, data};
    }
    static webviewDidChangeViewState(data) {
        return {cmd: `webviewDidChangeViewState`, data};
    }
    static syncBridgeData(data) {
        return {cmd: `syncBridgeData`, data};
    }
}

class Executor {    
    constructor () {
        for (const key in utils.Api) {
            if (utils.Api.hasOwnProperty(key)) {
                this[key] = utils.Api[key];
            }
        }
    }
    get(key) {
        return this[key];
    }
}

class Handler {
    constructor(executors=[new Executor()]) {
        this.executors = executors;
        this.received = (poster, message) => {
            const cmd = message.cmd;
            const args = message.args;
            const func = (_ => {
                for(var i = 0,len = this.executors.length; i < len; i++){
                    if (this.executors[i].get(cmd)) {
                        return this.executors[i].get(cmd);
                    }
                }
                return undefined;
            })();
            if (func) {
                const p = func(args);
                if (message.reply && poster) {
                    if (p) {
                        p.then(data => {
                            message.data = data;
                            poster.postMessage(message);
                        });
                    } else {
                        poster.postMessage(message);
                    }
                }
            }
        };
    }
}

module.exports = {
    Message,
    Executor, 
    Handler
};