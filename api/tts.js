const { synthesizeSpeech } = require('../lib/azureTts');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const result = await synthesizeSpeech(req.body || {});
        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Cache-Control', 'no-store');
        if (result.requestId) {
            res.setHeader('X-Azure-Request-Id', result.requestId);
        }
        res.status(200).send(result.audio);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            error: error.message || '语音合成失败。',
            requestId: error.requestId || undefined
        });
    }
};
