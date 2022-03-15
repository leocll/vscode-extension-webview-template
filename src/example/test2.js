const vscode = require("vscode");

function activate(context) {
    const provider = new ColorsViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(ColorsViewProvider.viewType, provider));
}
exports.activate = activate;
class ColorsViewProvider {
    /**
     * @param {vscode.Uri} _extensionUri 
     */
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    /**
     * @param {vscode.WebviewView} webviewView 
     * @param {vscode.WebviewViewResolveContext} context 
     * @param {vscode.CancellationToken} _token 
     */
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        const sourceDir = vscode.Uri.joinPath(this._extensionUri, 'web', 'dist');
        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [
                sourceDir
            ]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview, sourceDir);
        webviewView.webview.onDidReceiveMessage(data => {
        });
    }
    /**
     * @param {vscode.Webview} webview 
     * @param {vscode.Uri} sourceDir
     * @returns 
     */
    _getHtmlForWebview(webview, sourceDir) {
        // // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
        // const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        // // Do the same for the stylesheet.
        // const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
        // const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
        // const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));
        // // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();
        const convertUri = (uri) => {
            uri = vscode.Uri.joinPath(sourceDir, uri);
            return webview.asWebviewUri(uri);
        };
        return `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8" />
                <!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width,initial-scale=1" />
                <title>web</title>
                <link rel="stylesheet" href="${convertUri('static/css/vscode.css')}" />
                <link href="${convertUri('static/css/app.77daf5559d9245a93207d1bd415e7778.css')}" rel="stylesheet" />
            </head>
            <body>
                <div id="app">
                    leocll
                    <button class="add-color-button">Add Color1</button>
                </div>
                <div>1111111111</div>
                <button class="add-color-button">Add Color2</button>
                <script type="text/javascript" nonce="${nonce}" src="${convertUri('static/js/manifest.2ae2e69a05c33dfc65f8.js')}"></script>
                <script type="text/javascript" nonce="${nonce}" src="${convertUri('static/js/vendor.f21151be9a97c2bf8945.js')}"></script>
                <script type="text/javascript" nonce="${nonce}" src="${convertUri('static/js/app.f74486decec3c27eb4d9.js')}"></script>
            </body>
        </html>`;
        // return `<!DOCTYPE html>
		// 	<html lang="en">
		// 	<head>
		// 		<meta charset="UTF-8">

		// 		<!--
		// 			Use a content security policy to only allow loading images from https or from our extension directory,
		// 			and only allow scripts that have a specific nonce.
		// 		-->
		// 		<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

		// 		<meta name="viewport" content="width=device-width, initial-scale=1.0">

		// 		<link href="${styleResetUri}" rel="stylesheet">
		// 		<link href="${styleVSCodeUri}" rel="stylesheet">
		// 		<link href="${styleMainUri}" rel="stylesheet">
				
		// 		<title>Cat Colors</title>
		// 	</head>
		// 	<body>
		// 		<ul class="color-list">
		// 		</ul>

		// 		<button class="add-color-button">Add Color</button>

		// 		<script nonce="${nonce}" src="${scriptUri}"></script>
		// 	</body>
		// 	</html>`;
    }
}
ColorsViewProvider.viewType = 'leocll_example_activitybar.view1';
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=extension.js.map