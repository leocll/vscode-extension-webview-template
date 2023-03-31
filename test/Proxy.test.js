/**
 * @typedef {import('../src/vscode/web.api').WebApi} WebApi
 */
/**@type {WebApi} */
const webApi = {};

class VscodeProperty extends Function {
    /**
     * @param {any} center
     * @param {string} name
     * @param {boolean} [inOn=false]
     */
    constructor(center, name, inOn=false) {
        super();
        this.__info__ = { center, name, inOn, isOn: false };
        this.__info__.isOn = this.__isOn__();
        // @ts-ignore
        return new Proxy(this, {
            apply: (target, _thisArg, argArray) => target.__call__(...argArray),
            get: (target, p) => {
                if (p in target) {//target.hasOwnProperty(p)) {
                    return p === 'name' ? name : target[p];
                }
                return new VscodeProperty(center, `${name}.${String(p)}`, target.__info__.isOn);
            },
        });
    }

    __call__(...argArray) {
        const { name } = this.__info__;
        return console.log(`__call__`, name, argArray);
        // if (isOn) {
        //     // @ts-ignore
        //     return center.on(...argArray);
        // } else {
        //     return center.post({ cmd: name, args: argArray[0], p2p: true });
        // }
    }

    __isOn__() {
        const { name, inOn } = this.__info__;
        return inOn || Boolean(name.split('.').find(n => n === '$on'));
    }
}

class VscodeProxy {
    constructor(o) {
        return new Proxy(o, {
            get: (target, p, receiver) => {
                /**@type {string} */
                // @ts-ignore
                const property = p;
                const v = Reflect.get(target, property, receiver);
                return v === undefined ? new VscodeProperty(undefined, property) : v;
            }
        });
    }
}

const t1 = {};
const p1 = new VscodeProxy(t1);
console.log(p1.leocll.leo.cll.name);
console.log(p1.leocll.leo.cll.__info__);
console.log(p1.leocll.leo.cll.__call__);
console.log(p1.leocll.leo.cll({a: 1, b: 2}));
console.log();