# 微软语音合成 (Azure TTS)

基于微软 Azure 认知服务 Speech SDK 的浏览器端文本转语音工具，支持 35+ 种中文音色。

## 功能

- 文本转语音合成（Azure Neural TTS）
- 丰富的音色选择（Dragon HD Flash、标准 Neural、多语言、方言等）
- 音频在线播放与 WAV 下载
- API 密钥本地持久化存储

## 使用方式

1. 打开 `index.html`（或部署到任意静态服务器）
2. 展开 **API 配置**，输入 Azure 语音服务的 API 密钥和区域
3. 输入文本，选择音色，点击 **生成音频**

## 获取 API 密钥

前往 [Azure 门户](https://portal.azure.com/) 创建语音服务资源，获取密钥和区域。

## 部署

本项目为纯静态页面，可直接部署到：

- GitHub Pages
- Vercel / Netlify
- 任意静态文件服务器

## 技术栈

- 原生 HTML / CSS / JavaScript
- [Microsoft Cognitive Services Speech SDK](https://learn.microsoft.com/zh-cn/azure/ai-services/speech-service/)
