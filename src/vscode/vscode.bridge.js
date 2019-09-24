class BridgeData {
    constructor() {
        this.cache = {};
        this.syncHandler = undefined;
    }
    syncAll() {
        this.syncHandler && this.syncHandler(this.cache);
    }
    setItem(key, value, isSync=true) {
        this.cache[key] = value;
        if (isSync && this.syncHandler) {
            const t = {};
            t[key] = value;
            this.syncHandler(t);
        }
    }
    updateItems(items, isSync=true) {
        for (const key in items) {
            this.setItem(key, items[key], false);
        }
        isSync && this.syncHandler && this.syncHandler(items);
    };
    getItem(key, dft=undefined) {
        return this.cache[key] || dft;
    };
    removeItem(key) {
        this.cache[key] = undefined;
    };
    clearItem() {
        this.cache = {};
    };
}

module.exports = {
    BridgeData
};