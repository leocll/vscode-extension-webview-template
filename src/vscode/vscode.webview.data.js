/**
 * @template T object
 * - Bridge the data between `vscode` and `web`
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
         * Sync handler, post `syncBridgeData` message to `web`
         * @type {(data: T) => void}
         */
        this.syncHandler = undefined;
    }
    get cache() { return this._cache; }

    /**
     * Sync all, post `syncBridgeData` message to `web`
     * @returns {this}
     * @memberof WebviewData
     */
    syncAll() {
        this.syncHandler && this.syncHandler(this.cache);
        return this;
    }

    /**
     * Set item
     * @param {string} key
     * @param {any} value
     * @param {boolean} [isSync=true]
     * @returns {this}
     * @memberof WebviewData
     */
    setItem(key, value, isSync = true) {
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
     * @param {boolean} [isSync=true]
     * @returns {this}
     * @memberof WebviewData
     */
    updateItems(items, isSync = true) {
        for (const key in items) {
            this.setItem(key, items[key], false);
        }
        isSync && this.syncHandler && this.syncHandler(items);
        return this;
    };

    /**
     * Get item
     * @param {string} key
     * @param {any} [dft=undefined] default value
     * @returns
     * @memberof WebviewData
     */
    getItem(key, dft = undefined) {
        return this.cache[key] || dft;
    };

    /**
     * Remove item by key
     * @param {string} key
     * @returns
     * @memberof WebviewData
     */
    removeItem(key) {
        const value = this.cache[key];
        delete this.cache[key];
        return value;
    };

    /**
     * Clear all items
     * @returns {this}
     * @memberof WebviewData
     */
    clear() {
        // this.cache = {};
        Object.keys(this.cache).forEach(k => {
            delete this.cache[k];
        });
        return this;
    };
}

module.exports = {
    WebviewData,
};