const fs = require('fs');
const os = require('os');
const request = require('request');
const vscode = require('vscode');

const ApiPromise = (callBack) => {
    return new Promise((resolve, reject) => {
        callBack(resolve, reject);
    });
};

// Api
class WebviewApi {
    constructor () {
        // BridgeData
        this.getBridgeData = () => {
            return ApiPromise((resolve) => {
                resolve(this.bridgeData.cache);
            });
        };
        this.updateBridgeData = (items) => {
            return ApiPromise((resolve) => {
                this.bridgeData.updateItems(items, false);
                resolve();
            });
        };
        // Path
        this.getExtensionPath = () => {
            return ApiPromise((resolve) => {
                resolve(this.context.extensionPath);
            });
        };
        this.getWorkspacePath = () => {
            return ApiPromise((resolve) => {
                resolve(vscode.workspace.rootPath);
            });
        };
        this.getStoragePath = () => {
            return ApiPromise((resolve) => {
                resolve(this.context.storagePath);
            });
        };
        this.getGlobalStoragePath = () => {
            return ApiPromise((resolve) => {
                resolve(this.context.globalStoragePath);
            });
        };
        // State
        this.getWorkspaceState = () => {
            return ApiPromise((resolve) => {
                resolve(this.context.workspaceState._value);
            });
        };
        this.updateWorkspaceState = (states) => {
            return ApiPromise((resolve) => {
                for (const key in states) {
                    if (states.hasOwnProperty(key)) {
                        const value = states[key];
                        this.context.workspaceState.update(key, value);
                    }
                }
                resolve();
            });
        };
        this.getGlobalState = () => {
            return ApiPromise((resolve) => {
                resolve(this.context.globalState._value);
            });
        };
        this.updateGlobalState = (states) => {
            return ApiPromise((resolve) => {
                for (const key in states) {
                    if (states.hasOwnProperty(key)) {
                        const value = states[key];
                        this.context.globalState.update(key, value);
                    }
                }
                resolve();
            });
        };
        // Find
        this.findFileInWorkspace = ({include, exclude=undefined}) => {
            return ApiPromise((resolve) => {
                vscode.workspace.findFiles(include, exclude).then((uris) => {
                    resolve(uris.map((uri) => {
                        return uri.path;
                    }));
                }, () => {
                    resolve([]);
                });
            });
        };
        // Platform
        this.getPlatform = () => {
            return ApiPromise((resolve) => {
                resolve(os.platform());
            });
        };
        // Message
        this.showMessage = ({txt, btns=undefined}) => {
            txt = `[${this.name}] ${txt}`;
            return vscode.window.showInformationMessage(txt, ...(btns||[]));
            // .then(btn => {})
        };
        // Error
        this.showError = ({txt, btns=undefined}) => {
            txt = `[${this.name}] ${txt}`;
            return vscode.window.showErrorMessage(txt, ...(btns||[]));
            // .then(btn => {})
        };
        // Warn
        this.showWarn = ({txt, btns=undefined}) => {
            txt = `[${this.name}] ${txt}`;
            return vscode.window.showWarningMessage(txt, ...(btns||[]));
            // .then(btn => {})
        };
        // Input Box
        this.showInputBox = ({value, prompt='', placeHolder='', password=false, ignoreFocusOut=true, validateInput=undefined}) => {
            const options = {};
            options.value = value;
            prompt && (options.prompt = prompt);
            placeHolder && (options.placeHolder = placeHolder);
            password && (options.password = password);
            ignoreFocusOut && (options.ignoreFocusOut = ignoreFocusOut);
            validateInput && (options.validateInput = validateInput);
            return vscode.window.showInputBox(options);
        };
        // 选择本地文件
        // vscode的bug，在ubuntu下既选文件又选文件夹会很诡异，据官方文档windows也会出现诡异情况，https://code.visualstudio.com/api/references/vscode-api#OpenDialogOptions
        // 在ubuntu和windows下不要 canSelectFiles 和 canSelectFolders 同时为 true
        this.showOpenDialog = ({canSelectFiles=true, canSelectFolders=false, canSelectMany=false, defaultUri=undefined, filters=undefined, openLabel=undefined}) => {
            // canSelectFiles:true, // 是否可选文件
            // canSelectFolders:false, // 是否可选文件夹
            // canSelectMany:true, // 是否可以选择多个
            // defaultUri:undefined, // 默认打开本地路径
            // filters:undefined, // 筛选器，例如：{'Images': ['png', 'jpg'], 'TypeScript': ['ts', 'tsx']}
            // openLabel:undefined // 按钮文字
            const options = {};
            options.canSelectFiles = canSelectFiles;
            options.canSelectFolders = canSelectFolders;
            options.canSelectMany = canSelectMany;
            defaultUri && (options.defaultUri = vscode.Uri.file(defaultUri));
            filters && (options.filters = filters);
            openLabel && (options.openLabel = openLabel);
            return vscode.window.showOpenDialog(options);
            // .then(function(msg){ console.log(msg.path);})
        };
        // 选择框（原生下拉选择框，貌似在webview中没用）
        this.showQuickPick = ({items, canPickMany=false, ignoreFocusOut=true, matchOnDescription=true, matchOnDetail=true, placeHolder=undefined}) => {
            // canPickMany:false,  // 是否可多选，如果为true，则结果是一个选择数组
            // ignoreFocusOut:true, // 默认false，设置为true时鼠标点击别的地方输入框不会消失
            // matchOnDescription:false, // 过滤选择时包含描述的可选标志
            // matchOnDetail:true, // 过滤选择时包含细节的可选标志
            // placeHolder:undefined, // 输入框内的提示
            const options = {};
            options.canPickMany = canPickMany;
            options.ignoreFocusOut = ignoreFocusOut;
            options.matchOnDescription = matchOnDescription;
            options.matchOnDetail = matchOnDetail;
            placeHolder && (options.placeHolder = placeHolder);
            return vscode.window.showQuickPick(items, options);
            // .then(function(msg) { console.log(msg);})
        };
        // output
        this.showTxt2Output = ({txt, preserveFocus=true, line=true}) => {
            if (line) {
                this.output.appendLine(txt);
            } else {
                this.output.append(txt);
            }
            this.output.show(preserveFocus);
        };
        // terminal
        this.sendCmd2Terminal = ({text, addNewLine=true, preserveFocus=true}) => {
            this.terminal.sendText(text, addNewLine);
            this.terminal.show(preserveFocus);
        };
        /***************************** File System *****************************/
        // Exists
        this.exists4Path = ({path}) => {
            return ApiPromise((resolve) => {
                fs.exists(path, resolve);
            });
        };
        // Stat
        this.getStat4Path = ({path}) => {
            return ApiPromise((resolve) => {
                fs.stat(path, (err, stats) => {
                    resolve({error: err, data: stats ? {
                        isFile: stats.isFile(),
                        isDirectory: stats.isDirectory(),
                        // isBlockDevice: stats.isDirectory(),
                        // isCharacterDevice: stats.isCharacterDevice(),
                        isSymbolicLink: stats.isSymbolicLink(),
                        // isFIFO: stats.isFIFO(),
                        // isSocket: stats.isSocket(),
                    } : undefined});
                });
            });
        };
        // Read file
        this.readFile = ({path, options=undefined}) => {
            return ApiPromise((resolve) => {
                fs.readFile(path, (err, data) => {
                    let oerr = undefined;
                    let odata = undefined;
                    if (!err) {
                        if (!options) {
                            odata = data.toString();
                        } else if (options === 'hex') {
                            odata = data.toString('hex');
                        } else if (options === 'json') {
                            odata = (() => {
                                try {
                                    return JSON.parse(data.toString());
                                } catch (e) {
                                    err = e.message || e.toString();
                                    return undefined;
                                }
                            })();
                        } else {
                            odata = data.toString();
                        }
                    } else {
                        oerr = `Failed to read file: ${path}`;
                    }
                    resolve({error: oerr || err, data: odata || data});
                });
            });
        };
        // Write file
        this.writeFile = ({path, data, options=undefined}) => {
            return ApiPromise((resolve) => {
                fs.writeFile(path, data, options, (err) => {
                    resolve({error: err && `Failed to write file: ${path}`});
                });
            });
        };
        // Request
        this.request = ({url, method='POST', data=undefined, headers={"content-type": "application/json"}}) => {
            return ApiPromise((resolve) => {
                request({url, method, headers, body: data}, (error, response, body) => {
                    error && typeof error !== 'string' && (error = error.message || error.toString());
                    resolve({error, response, body});
                });
            });
        };
    }
    get output() {
        this._output || (this._output = vscode.window.createOutputChannel(this.name));
        return this._output;
    }
    get terminal() {
        this._terminal || (this._terminal = vscode.window.createTerminal(this.name));
        return this._terminal;
    }
    get name() {
        return this._name;
    }
    get context() {
        return this._context;
    }
    get bridgeData() {
        return this._bridgeData;
    }
    activate(context, name, bridgeData) {
        this._context = context;
        this._name = name;
        this._bridgeData = bridgeData;
    }
    deactivate() {
    }
}

class Utils {
    constructor() {
        this._Api = new WebviewApi();
    }
    get Api() {
        return this._Api;    
    }
    get bridgeData() {
        return this.Api.bridgeData;
    }
    get context() {
        return this.Api.context;
    }
    get name() {
        return this.Api.name;
    }
    activate(context, name, bridgeData) {
        this.Api.activate(context, name, bridgeData);
    }
    deactivate() {
        this.Api.deactivate();
    }
}

const utils = new Utils();
module.exports = utils;