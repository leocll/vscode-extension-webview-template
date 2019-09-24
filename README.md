# vscode-extension-webview-template

This is a `vscode` `webview` extension template. It contains `vscode` and `webview` two-way communication API, quick and easy to build vscode web extension.

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
- `npm run build`: build `web` and extension.
- `npm run buildext`: build extension, be equal to `vsce package`.
- `npm run buildweb`: build `web`, be equal to `npm run build` in `web` folder.
- `npm run startweb`: start `web`, be equal to `npm run dev` in `web` folder.

## Example
[`WebView Example`](https://marketplace.visualstudio.com/items?itemName=leocll.vscode-extension-webview-template) in marketplace of vscode.
- `example.webview`: `Example: WebView`
- `example.helloWorld`: `Example: Hello World`