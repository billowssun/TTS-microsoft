# 微软语音合成 (Azure TTS)

基于 Azure AI Speech 的文本转语音工具，前端负责输入和播放，服务端 API 负责调用 Azure TTS，避免把订阅密钥暴露到浏览器。

## 功能

- 文本转语音合成，支持 Azure Neural TTS / Dragon HD / Flash 音色
- 63 种中文、方言、粤语、吴语、台式国语等音色
- 在线预览与 WAV 下载
- Azure 订阅密钥只保存在服务端环境变量中

## 部署到 Vercel

1. Fork 或导入本项目。
2. 在 Vercel 项目 Settings -> Environment Variables 中添加：
   - `SPEECH_KEY`：Azure 语音服务 API 密钥
   - `SPEECH_REGION`：Azure 区域，例如 `southeastasia`
3. 部署后打开页面即可使用。

`vercel.json` 会执行 `npm run build`，静态文件输出到 `dist`，`api/tts.js` 作为服务端函数处理语音合成请求。

## 本地使用

需要 Node.js 18 或更高版本。

```powershell
$env:SPEECH_KEY="你的 Azure Speech Key"
$env:SPEECH_REGION="southeastasia"
npm start
```

然后访问 `http://localhost:3000`。

直接双击打开 `index.html` 无法调用 `/api/tts`，因此不会完成语音合成。

## Azure 服务配置建议

| 项目 | 推荐值 |
|------|--------|
| 区域 | `southeastasia` |
| 定价层 | Free F0 或按实际用量选择 |

## 技术栈

- 原生 HTML / CSS / JavaScript
- Node.js 服务端 API
- Azure AI Speech TTS REST API
