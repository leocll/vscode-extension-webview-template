/**
 * Bridge the data between `vscode` and `web`
 * @class BridgeData
 */
class BridgeData {
    /**
     * Creates an instance of BridgeData.
     * @memberof BridgeData
     */
    constructor() {
        this.cache = {};
        /**
         * Sync handler, post `syncBridgeData` message to `web`
         * @type {(data: {}) => void}
         */
        this.syncHandler = undefined;
    }

    /**
     * Sync all, post `syncBridgeData` message to `web`
     * @returns {this}
     * @memberof BridgeData
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
     * @memberof BridgeData
     */
    setItem(key, value, isSync = true) {
        this.cache[key] = value;
        if (isSync && this.syncHandler) {
            const t = {};
            t[key] = value;
            this.syncHandler(t);
        }
        return this;
    }

    /**
     * Update items, same as set some items
     * @param {{}} items
     * @param {boolean} [isSync=true]
     * @returns {this}
     * @memberof BridgeData
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
     * @memberof BridgeData
     */
    getItem(key, dft = undefined) {
        return this.cache[key] || dft;
    };

    /**
     * Remove item by key
     * @param {string} key
     * @returns
     * @memberof BridgeData
     */
    removeItem(key) {
        const value = this.cache[key];
        this.cache[key] = undefined;
        return value;
    };

    /**
     * Clear all items
     * @returns {this}
     * @memberof BridgeData
     */
    clear() {
        this.cache = {};
        return this;
    };
}

module.exports = BridgeData;