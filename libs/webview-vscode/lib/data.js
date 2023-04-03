/**
 * Data for saving and synchronizing
 * @template T
 * @class SyncData
 */
class SyncData {
    /**
     * Creates an instance of SyncData.
     * @param {T} [cache=undefined]
     * @memberof SyncData
     */
    constructor(cache=undefined) {
        /**@type {T} */
        // @ts-ignore
        this._cache = cache || {};
        /**@type {(data: T) => void} */
        this.syncHandler = undefined;
    }
    get cache() { return this._cache; }

    /**
     * Sync
     * @param {T} state
     * @memberof SyncData
     */
    sync = (state) => {
        this.syncHandler && this.syncHandler(state);
        return this;
    }

    /**
     * Update
     * @param {T} state
     * @param {boolean} [isSync=true] - default `true`
     * @memberof SyncData
     */
    update = (state, isSync=true) => {
        if (!this.cache) { return this; }
        Object.assign(this.cache, state)
        isSync && this.sync(state);
        return this;
    }

    /**
     * Set
     * @param {string} key
     * @param {any} value
     * @param {boolean} [isSync=true] - default `true`
     * @memberof SyncData
     */
    set = (key, value, isSync=true) => {
        if (!this.cache) { return this; }
        this.cache[key] = value;
        isSync && this.sync({[key]: value});
        return this;
    }

    /**
     * Get
     * @param {string} key
     * @param {any} [dft=undefined] - default `undefined`
     * @memberof SyncData
     */
    get = (key, dft=undefined) => {
        return (this.cache || {})[key] || dft;
    };

    /**
     * Activate
     * @param {() => Promise<{data: T}>} [initHandler=undefined]
     * @memberof SyncData
     */
    activate = (initHandler=undefined) => {
        initHandler && initHandler().then((msg) => {
            msg.data && this.update(msg.data, false);
        });
        return this;
    }

    /**
     * Deactivate
     * @memberof SyncData
     */
    deactivate = () => {
    }
}
/**
 * @typedef {import('./vscode').default} Vscode - Vscode hook in web
 * @typedef {import('@leocll/vscode-webview/lib/view').DefaultWebviewData} DefaultWebviewData
 */
/**
 * Data for `globalState`,`workspaceState`,`webviewData`
 * @template T1
 * @template T2
 * @class WebviewData
 */
class WebviewData {
    /**
     * Creates an instance of WebviewData.
     * @param {T1 & T2 & DefaultWebviewData} []
     * @memberof WebviewData
     */
    constructor(cache=undefined) {
        /**@type {T1 & T2 & DefaultWebviewData} */
        this._cache = Object.assign({}, this._getDefaultCache(), cache || {});
        /**@type {SyncData<T1>} */
        this._globalState = this._initCacheData();
        /**@type {SyncData<T1>} */
        this._workspaceState = this._initCacheData();
        /**@type {SyncData<T2 & DefaultWebviewData>} */
        this._webviewData = this._initCacheData();
    }
    get cache() { return this._cache; }
    get globalState() { return this._globalState; }
    get workspaceState() { return this._workspaceState; }
    get webviewData() { return this._webviewData; }

    /**
     * @private
     * @returns {DefaultWebviewData}
     */
    _getDefaultCache() {
        return {
            /**- current os platform*/
            platform: 'darwin',
            /**- current path sep */
            pathSep: '/',
            /**- current extension folder path */
            extensionPath: '',
            /**- current workspace file */
            workspaceFile: '',
            /**- current workspace folders */
            workspaceFolders: [],
            /**- start path */
            startPath: '',
        };
    }
    
    /**
     * @private
     * @returns {SyncData}
     */
    _initCacheData() {
        return new SyncData(this.cache);
    }

    /**
     * Activate
     * @param {Vscode} [vscode]
     * @memberof GlobalState
     */
    $activate(vscode) {
        if (!vscode) { throw Error("vscode can't be null."); }
        this.globalState.syncHandler = vscode.updateGlobalState;
        this.workspaceState.syncHandler = vscode.updateWorkspaceState;
        this.webviewData.syncHandler = vscode.updateWebviewData;
        this.globalState.activate(vscode.getGlobalState);
        this.workspaceState.activate(vscode.getWorkspaceState);
        this.webviewData.activate(vscode.getWebviewData);
        return this;
    }

    /**
     * Deactivate
     * @memberof WebviewData
     */
    $deactivate() {
        this.globalState.deactivate();
        this.workspaceState.deactivate();
        this.webviewData.deactivate();
    }
}

export {
    SyncData,
    WebviewData,
};