# 微软语音合成 (Azure TTS)

基于微软 Azure 认知服务 Speech SDK 的浏览器端文本转语音工具，支持 35+ 种中文音色。

## 功能

- 文本转语音合成（Azure Neural TTS / Dragon HD Flash）
- 丰富的音色选择（Dragon HD Flash、标准 Neural、多语言、方言等）
- 音频在线播放与 WAV 下载
- API 密钥本地持久化 / CI 环境变量注入

## 部署到 Vercel

1. Fork 本仓库
2. 在 Vercel 中导入项目，自动识别 `vercel.json` 配置
3. 在 Vercel 项目 **Settings → Environment Variables** 中添加：
   - `SPEECH_KEY` = Azure 语音服务 API 密钥
   - `SPEECH_REGION` = `southeastasia`（推荐，支持 Dragon HD Flash + 预览版音色）
4. 部署后用户无需填写密钥，打开即用

## 本地使用

直接打开 `index.html`，展开 API 配置手动填入密钥和区域。密钥会自动保存到浏览器 localStorage。

## Azure 服务配置建议

| 项目 | 推荐值 |
|------|--------|
| 区域 | `southeastasia` |
| 定价层 | Free F0（每月 50 万字符免费） |

## 技术栈

- 原生 HTML / CSS / JavaScript
- [Microsoft Cognitive Services Speech SDK](https://learn.microsoft.com/zh-cn/azure/ai-services/speech-service/)
