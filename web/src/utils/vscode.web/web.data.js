class GlobalState {
    constructor(vscode) {
        this._vscode = vscode;
        this.data = {};
    }
    get vscode() {
        return this._vscode;
    }
    _update = (state, isSync) => {
        if (!this.data) { return this; }
        for (const key in state) {
            if (state.hasOwnProperty(key)) {
                this.data[key] = state[key];
            }
        }
        isSync && this._sync();
        return this;
    }
    update = (state) => {
        return this._update(state, true);
    }
    activate = () => {
        this.data && this.vscode.getGlobalState().then((msg) => {
            msg.data && this._update(msg.data, false);
        });
    }
    deactivate = () => {
        this._vscode = undefined;
        this._data = undefined;
    }
    _sync = (state) => {
        this.vscode.updateGlobalState(state);
    }
}

class WorkspaceState extends GlobalState {
    activate = () => {
        this.data && this.vscode.getWorkspaceState().then((msg) => {
            msg.data && this._update(msg.data, false);
        });
    }
    _sync = (state) => {
        this.vscode.updateWorkspaceState(state);
    }
}

class BridgeData extends GlobalState {
    constructor(vscode) {
        super(vscode);
        vscode.onSyncBridgeData((msg) => {
            msg.data && this._update(msg.data, false);
        }, 0);
    }
    activate = () => {
        this.data && this.vscode.getBridgeData().then((msg) => {
            msg.data && this._update(msg.data, false);
        });
    }
    _sync = (state) => {
        this.vscode.updateBridgeData(state);
    }
}

class WebviewData {
    constructor(vscode) {
        this.__vscode__ = vscode;
        this.__globalState__ = new GlobalState(vscode);
        this.__workspaceState__ = new WorkspaceState(vscode);
        this.__bridgeData__ = new BridgeData(vscode);
        this.$globalState.data = this;
        this.$workspaceState.data = this;
        this.$bridgeData.data = this;
        // this.$vscode.onwebviewDidDispose(() => {
        //     this.$deactivate();
        // });
    }
    get $vscode() {
        return this.__vscode__;
    }
    get $globalState() {
        return this.__globalState__;
    }
    get $workspaceState() {
        return this.__workspaceState__;
    }
    get $bridgeData() {
        return this.__bridgeData__;
    }
    $activate() {
        this.$globalState.activate();
        this.$workspaceState.activate();
        this.$bridgeData.activate();
    }
    $deactivate() {
        this.$globalState.deactivate();
        this.$workspaceState.deactivate();
        this.$bridgeData.deactivate();
    }
}

export {
    WebviewData,
    GlobalState,
    WorkspaceState,
    BridgeData
};