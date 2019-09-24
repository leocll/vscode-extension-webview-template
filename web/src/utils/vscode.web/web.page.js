import { EventEmitter } from 'events';

class Page {
    constructor() {
        this._number = 0;
        this._eventEmitter = new EventEmitter();
    }
    get number() {
        return this._number;
    }
    get eventEmitter() {
        return this._eventEmitter;
    }
    static getShowIdentifier(number) {
        return `show_page_${number}`;
    }
    static getHideIdentifier(number) {
        return `hide_page_${number}`;
    }
    onTo(callBack) {
        if (!callBack) { return; }
        this.__to__ = callBack;
    }
    show(to) {
        if (this._number === to) { return; }
        const from = this._number;
        this._number = to;
        this._emit(from, to);
    }
    onShow = (number, callBack) => {
        callBack && this.eventEmitter.on(Page.getShowIdentifier(number), (data) => {
            callBack({show: data.show, hide: data.hide});
        });
    };
    onHide = (number, callBack) => {
        callBack && this.eventEmitter.on(Page.getHideIdentifier(number), (data) => {
            callBack({show: data.show, hide: data.hide});
        });
    };
    _emit = (hide, show) => {
        this.__to__(show, hide);
        this.eventEmitter.emit(Page.getHideIdentifier(hide), {show, hide});
        this.eventEmitter.emit(Page.getShowIdentifier(show), {show, hide});
    };
}

export default Page;
