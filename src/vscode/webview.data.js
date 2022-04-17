/**
 * Data between `vscode` and `web`
 * @template T
 * @class WebviewData
 */
class WebviewData {
    /**
     * Creates an instance of WebviewData.
     * @param {T} [cache=undefined]
     * @memberof WebviewData
     */
    constructor(cache = undefined) {
        /**@type {T} */
        // @ts-ignore
        this._cache = cache || {};
        /**
         * Sync handler, post `syncWebviewData` message to `web`
         * @type {(data: T) => void}
         */
        this.syncHandler = undefined;
    }
    get cache() { return this._cache; }

    /**
     * Sync, post `syncWebviewData` message to `web`
     * @returns {this}
     * @memberof WebviewData
     */
    sync() {
        this.syncHandler && this.syncHandler(this.cache);
        return this;
    }

    /**
     * Set item
     * @param {string} key
     * @param {any} value
     * @param {boolean} [isSync=true] - default `true`
     * @returns {this}
     * @memberof WebviewData
     */
    set(key, value, isSync = true) {
        this.cache[key] = value;
        if (isSync && this.syncHandler) {
            // @ts-ignore
            this.syncHandler({[key]: value});
        }
        return this;
    }

    /**
     * Update items, same as set some items
     * @param {T} items
     * @param {boolean} [isSync=true] - default `true`
     * @returns {this}
     * @memberof WebviewData
     */
    update(items, isSync = true) {
        Object.assign(this.cache, items);
        isSync && this.syncHandler && this.syncHandler(items);
        return this;
    };

    /**
     * Get item
     * @param {string} key
     * @param {any} [dft=undefined] - default `undefined`
     * @returns
     * @memberof WebviewData
     */
    get(key, dft = undefined) {
        return this.cache[key] || dft;
    };

    /**
     * Remove item by key
     * @param {string} key
     * @returns
     * @memberof WebviewData
     */
    pop(key) {
        const value = this.cache[key];
        delete this.cache[key];
        return value;
    };

    // /**
    //  * Clear all items
    //  * @returns {this}
    //  * @memberof WebviewData
    //  */
    // clear() {
    //     // this.cache = {};
    //     Object.keys(this.cache).forEach(k => {
    //         delete this.cache[k];
    //     });
    //     return this;
    // };
}

/**
 * @template T
 */
 class WebviewDataApi {
    /**
     * @param {WebviewData<T>} data 
     */
    constructor(data) {
        /**@type {WebviewData<T>} */
        this.data = data;
        this.api = {
            /**@type {() => Promise<T>} - Get webview data */
            getWebviewData: async () => {
                return {...this.data.cache};
            },
            /**@type {(items: T) => Promise<void>} - Update webview data */
            updateWebviewData: async (items) => {
                this.data.update(items, false);
            },
        };
    }
}

module.exports = {
    WebviewData,
    WebviewDataApi,
};