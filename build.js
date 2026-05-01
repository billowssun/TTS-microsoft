const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

let scriptContent = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf-8');

var speechKey = process.env.SPEECH_KEY || '__SPEECH_KEY__';
var speechRegion = process.env.SPEECH_REGION || '__SPEECH_REGION__';

scriptContent = scriptContent
    .replace(/__SPEECH_KEY__/g, speechKey)
    .replace(/__SPEECH_REGION__/g, speechRegion);

fs.writeFileSync(path.join(distDir, 'script.js'), scriptContent);

['index.html', 'style.css'].forEach(function(file) {
    var src = path.join(__dirname, file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(distDir, file));
    }
});

console.log('Build complete. SPEECH_KEY injected: ' + (speechKey !== '__SPEECH_KEY__'));
console.log('Build complete. SPEECH_REGION injected: ' + (speechRegion !== '__SPEECH_REGION__'));
