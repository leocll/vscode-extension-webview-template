# vscode-extension-webview-template

This is a `webview` template of `vscode extension`. It contains `vscode` and `webview` two-way communication API, quick and easy to build vscode web extension.

## Main Files
- `vscode`
    - `vscode.webview.js`
    - `vscode.message.js`
    - `vscode.bridge.js`
    - `vscode.utils.js`
- `web`
    - `web.data.js`
    - `web.index.js`
    - `web.message.js`
    - `web.page.js`
    - `web.vscode.js`

## Scripts
- `npm run build`: build extension.
- `npm run buildweb`: build `web`, be equal to `npm run build` in `web` folder.
- `npm run startweb`: start `web`, be equal to `npm run dev` in `web` folder.
