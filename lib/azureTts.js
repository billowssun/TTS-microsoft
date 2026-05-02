const MAX_TEXT_LENGTH = 10000;
const DEFAULT_REGION = 'southeastasia';

function getConfig() {
    return {
        key: process.env.SPEECH_KEY,
        region: process.env.SPEECH_REGION || DEFAULT_REGION
    };
}

function xmlEscape(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function validatePayload(payload) {
    var text = payload && typeof payload.text === 'string' ? payload.text.trim() : '';
    var voice = payload && typeof payload.voice === 'string' ? payload.voice.trim() : '';

    if (!text) {
        return { error: '请输入文本内容。' };
    }

    if (text.length > MAX_TEXT_LENGTH) {
        return { error: '文本过长，请控制在 10000 字以内。' };
    }

    if (!voice) {
        return { error: '请选择音色。' };
    }

    return { text: text, voice: voice };
}

async function synthesizeSpeech(payload) {
    var valid = validatePayload(payload);
    if (valid.error) {
        var validationError = new Error(valid.error);
        validationError.statusCode = 400;
        throw validationError;
    }

    var config = getConfig();
    if (!config.key || !config.region) {
        var configError = new Error('服务端未配置 SPEECH_KEY 或 SPEECH_REGION。');
        configError.statusCode = 500;
        throw configError;
    }

    var endpoint = 'https://' + config.region + '.tts.speech.microsoft.com/cognitiveservices/v1';
    var ssml = [
        '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN">',
        '<voice name="', xmlEscape(valid.voice), '">',
        xmlEscape(valid.text),
        '</voice>',
        '</speak>'
    ].join('');

    var response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': config.key,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
            'User-Agent': 'tts-microsoft'
        },
        body: ssml
    });

    var requestId = response.headers.get('x-requestid') || '';

    if (!response.ok) {
        var detail = await response.text().catch(function() { return ''; });
        var upstreamError = new Error(detail || ('Azure TTS 请求失败，HTTP ' + response.status));
        upstreamError.statusCode = response.status >= 400 && response.status < 500 ? 400 : 502;
        upstreamError.requestId = requestId;
        throw upstreamError;
    }

    var arrayBuffer = await response.arrayBuffer();
    return {
        audio: Buffer.from(arrayBuffer),
        requestId: requestId
    };
}

module.exports = {
    MAX_TEXT_LENGTH: MAX_TEXT_LENGTH,
    synthesizeSpeech: synthesizeSpeech,
    validatePayload: validatePayload
};
