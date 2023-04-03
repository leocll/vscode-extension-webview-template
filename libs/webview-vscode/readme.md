# web.data
### 1、介绍
`GlobalState`: 全局持久缓存，只能存json  
`WorkspaceState`: 工作区持久缓存，只能存json  
`BridgeData`: 插件和`webview`之间共通数据，修改一方会自动通知另一方，内存缓存，只能存json  
`WebviewData`: `webview`的内存缓存，不限制类型

### 2、架构
`WebviewData` = `GlobalState` + `WorkspaceState` + `BridgeData`  
> 1. 修改`GlobalState`、`WorkspaceState`、`BridgeData`时，`WebviewData`的数据也会发生改变
> 2. 设计初衷是`WebviewData`为全局的`UI`提供数据绑定，`GlobalState`、`WorkspaceState`、`BridgeData`为`WebviewData`做数据驱动