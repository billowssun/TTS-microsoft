const http = require('http');
const fs = require('fs');
const path = require('path');
const { synthesizeSpeech } = require('./lib/azureTts');

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = __dirname;
const PUBLIC_ROOT = path.resolve(PUBLIC_DIR) + path.sep;
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
    });
    res.end(JSON.stringify(payload));
}

function readJson(req) {
    return new Promise(function(resolve, reject) {
        var chunks = [];
        req.on('data', function(chunk) {
            chunks.push(chunk);
            if (Buffer.concat(chunks).length > 128 * 1024) {
                reject(new Error('请求体过大。'));
                req.destroy();
            }
        });
        req.on('end', function() {
            if (!chunks.length) {
                resolve({});
                return;
            }
            try {
                resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
            } catch (error) {
                reject(new Error('请求体不是有效 JSON。'));
            }
        });
        req.on('error', reject);
    });
}

async function handleTts(req, res) {
    if (req.method !== 'POST') {
        res.writeHead(405, { Allow: 'POST' });
        res.end('Method not allowed');
        return;
    }

    try {
        var body = await readJson(req);
        var result = await synthesizeSpeech(body);
        res.writeHead(200, {
            'Content-Type': 'audio/wav',
            'Cache-Control': 'no-store',
            'X-Azure-Request-Id': result.requestId || ''
        });
        res.end(result.audio);
    } catch (error) {
        sendJson(res, error.statusCode || 500, {
            error: error.message || '语音合成失败。',
            requestId: error.requestId || undefined
        });
    }
}

function serveStatic(req, res) {
    var urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    var filePath = urlPath === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, urlPath);
    var resolved = path.resolve(filePath);

    if (resolved !== path.resolve(PUBLIC_DIR) && !resolved.startsWith(PUBLIC_ROOT)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(resolved, function(error, content) {
        if (error) {
            res.writeHead(error.code === 'ENOENT' ? 404 : 500);
            res.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
            return;
        }

        res.writeHead(200, {
            'Content-Type': MIME_TYPES[path.extname(resolved)] || 'application/octet-stream'
        });
        res.end(content);
    });
}

http.createServer(function(req, res) {
    if ((req.url || '').split('?')[0] === '/api/tts') {
        handleTts(req, res);
        return;
    }
    serveStatic(req, res);
}).listen(PORT, function() {
    console.log('Local server running at http://localhost:' + PORT);
});
