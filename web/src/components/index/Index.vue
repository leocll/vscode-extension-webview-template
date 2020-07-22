<template>
    <div>
        <button style="margin: 30px 25% 10px; width: 50%; height: 24px; color: var(--vscode-button-foreground); background-color: var(--vscode-button-background);" @click="getRootPath">root path</button>
        <button style="margin: 10px 25%; width: 50%; height: 24px; color: var(--vscode-button-foreground); background-color: var(--vscode-button-background);" @click="selectFile">select file</button>
        <button style="margin: 10px 25%; width: 50%; height: 24px; color: var(--vscode-button-foreground); background-color: var(--vscode-button-background);" @click="alert">alert</button>
        <button style="margin: 10px 25%; width: 50%; height: 24px; color: var(--vscode-button-foreground); background-color: var(--vscode-button-background);" @click="output">output</button>
        <div style="margin-top: 20px; padding: 20px 20px; background-color: var(--vscode-editorGroupHeader-tabsBackground); word-wrap: break-word;word-break: break-all;overflow: hidden;">{{msg}}</div>
    </div>
</template>

<script>
export default {
    name: "Index",
    data() {
        return {
            msg: ""
        };
    },
    methods: {
        getRootPath() {
            this.msg = window.webviewData.rootPath;
        },
        selectFile() {
            window.vscode.showOpenDialog({canSelectFiles: true}).then(msg => {
                if (msg && msg.data) {
                    this.msg = msg.data[0];
                }
            });
        },
        alert() {
            window.vscode.showMessage({ txt: `this is a alert.` });
        },
        output() {
            window.vscode.showTxt2Output({txt: `this is output dialog.`});
        }
    }
};
</script>
