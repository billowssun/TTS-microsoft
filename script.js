// 默认配置（加密存储）
const defaultConfig = {
    key: btoa('276c99e4645a4616829848e9dc75d05a'),
    region: btoa('eastasia')
};

// 创建星号字符串
function createAsterisks(length) {
    return '*'.repeat(length);
}

// 音频历史记录
let audioHistory = [];

// 创建历史记录项
function createHistoryItem(text, audioData, timestamp, index) {
    const container = document.createElement('div');
    container.className = 'history-item';
    
    const header = document.createElement('div');
    header.className = 'history-header';
    
    // 创建左侧信息容器
    const infoContainer = document.createElement('div');
    infoContainer.className = 'history-info';
    
    // 标题和时间放在左侧
    const title = document.createElement('div');
    title.className = 'history-title';
    // 限制标题长度为8个字符
    const shortText = text.slice(0, 8) + (text.length > 8 ? '...' : '');
    title.innerHTML = `<span class="history-index">${index}. </span>${shortText}`;
    title.title = text; // 添加完整文本作为提示
    
    const time = document.createElement('div');
    time.className = 'history-time';
    // 只显示时间（时:分）
    const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    time.textContent = timeStr;
    
    infoContainer.appendChild(title);
    infoContainer.appendChild(time);
    
    // 创建右侧按钮容器
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'history-buttons';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'history-delete';
    deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>';
    deleteBtn.title = '删除';
    deleteBtn.onclick = () => {
        const index = audioHistory.findIndex(item => item.timestamp === timestamp);
        if (index !== -1) {
            audioHistory.splice(index, 1);
            container.remove();
            URL.revokeObjectURL(audio.src);
            updateHistoryDisplay();
        }
    };
    
    buttonsContainer.appendChild(deleteBtn);
    
    header.appendChild(infoContainer);
    header.appendChild(buttonsContainer);
    
    // 音频播放器
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.preload = 'metadata';
    const blob = new Blob([audioData], { type: 'audio/wav' });
    audio.src = URL.createObjectURL(blob);
    
    container.appendChild(header);
    container.appendChild(audio);
    
    return container;
}

// 更新历史记录显示
function updateHistoryDisplay() {
    const historyContainer = document.getElementById('audioHistory');
    if (!historyContainer) return;
    
    historyContainer.innerHTML = '';
    if (audioHistory.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'history-empty';
        emptyMsg.textContent = '暂无历史记录';
        historyContainer.appendChild(emptyMsg);
        return;
    }
    
    // 按时间倒序排序并添加序号
    audioHistory.sort((a, b) => b.timestamp - a.timestamp)
        .forEach((item, index) => {
            const historyItem = createHistoryItem(item.text, item.audioData, item.timestamp, audioHistory.length - index);
            historyContainer.appendChild(historyItem);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    // 历史记录面板折叠功能
    const historyPanel = document.getElementById('historyPanel');
    const historyToggle = document.querySelector('.history-toggle');
    
    // 根据屏幕宽度设置初始状态
    const setInitialState = () => {
        if (window.innerWidth <= 1200) {
            historyPanel.classList.add('collapsed');
        } else {
            historyPanel.classList.remove('collapsed');
        }
    };
    
    setInitialState();
    window.addEventListener('resize', setInitialState);
    
    historyToggle.addEventListener('click', () => {
        historyPanel.classList.toggle('collapsed');
    });

    // 设置默认值（密钥显示为星号）
    const apiKeyInput = document.getElementById('apiKey');
    const regionInput = document.getElementById('region');
    
    // 将密钥显示为星号，地区正常显示
    apiKeyInput.value = createAsterisks(32);
    regionInput.value = atob(defaultConfig.region);

    // 存储实际的API密钥
    apiKeyInput.dataset.apiKey = defaultConfig.key;

    // 获取其他 DOM 元素
    const synthesizeButton = document.getElementById('synthesizeButton');
    const downloadButton = document.getElementById('downloadButton');
    const audioPlayer = document.getElementById('audioPlayer');
    const progressIndicator = document.getElementById('progressIndicator');
    const textInput = document.getElementById('text');
    const voiceSelect = document.getElementById('voiceName');

    let audioData = null;

    // 切换密码可见性
    const togglePassword = document.querySelector('.toggle-password');
    const eyeIcon = document.querySelector('.eye-icon');
    const eyeOffIcon = document.querySelector('.eye-off-icon');

    togglePassword.addEventListener('click', function() {
        const type = apiKeyInput.type === 'password' ? 'text' : 'password';
        apiKeyInput.type = type;
        eyeIcon.style.display = type === 'password' ? 'block' : 'none';
        eyeOffIcon.style.display = type === 'password' ? 'none' : 'block';
    });

    // 处理API密钥输入
    apiKeyInput.addEventListener('input', function(e) {
        // 直接更新API密钥
        if (this.value.length > 0) {
            this.dataset.apiKey = btoa(this.value);
        } else {
            this.dataset.apiKey = '';
        }
    });

    synthesizeButton.addEventListener('click', async () => {
        try {
            const apiKey = atob(apiKeyInput.dataset.apiKey);
            const region = regionInput.value.trim() || atob(defaultConfig.region);
            const text = textInput.value.trim();
            const voice = voiceSelect.value;

            if (!text) {
                alert('请输入要转换的文本内容');
                return;
            }

            synthesizeButton.disabled = true;
            downloadButton.style.display = 'none';
            audioPlayer.style.display = 'none';
            progressIndicator.style.display = 'block';

            const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(apiKey, region);
            speechConfig.speechSynthesisVoiceName = voice;
            
            // 创建一个自定义的音频输出流
            const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
            const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

            // 禁用默认的音频输出
            if (window.audioContext) {
                window.audioContext.suspend();
            }
            window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            window.audioContext.suspend();

            const result = await new Promise((resolve, reject) => {
                synthesizer.speakTextAsync(
                    text,
                    result => {
                        synthesizer.close();
                        resolve(result);
                    },
                    error => {
                        synthesizer.close();
                        reject(error);
                    }
                );
            });

            // 处理音频数据
            audioData = result.audioData;
            
            // 添加到历史记录
            audioHistory.push({
                text,
                audioData: new Uint8Array(audioData),
                timestamp: Date.now(),
                voice
            });
            updateHistoryDisplay();

            // 更新当前音频播放器
            const blob = new Blob([audioData], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            
            // 设置音频播放器
            audioPlayer.src = url;
            audioPlayer.style.display = 'block';
            downloadButton.style.display = 'block';
            
            // 确保不自动播放
            audioPlayer.autoplay = false;
            audioPlayer.load(); // 强制重新加载
            
            // 加载完成后的处理
            audioPlayer.addEventListener('loadedmetadata', () => {
                audioPlayer.pause();
                audioPlayer.currentTime = 0;
            }, { once: true });
            
            // 播放时的处理
            audioPlayer.addEventListener('play', () => {
                const updateProgress = () => {
                    if (!audioPlayer.paused) {
                        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
                        const progressBar = document.querySelector('.progress-bar-value');
                        if (progressBar) {
                            progressBar.style.transform = `translateX(${progress - 100}%)`;
                        }
                        requestAnimationFrame(updateProgress);
                    }
                };
                updateProgress();
            });

            // 清理
            audioPlayer.onended = () => {
                URL.revokeObjectURL(url);
            };

        } catch (error) {
            console.error('语音合成失败:', error);
            alert('语音合成失败: ' + error.message);
        } finally {
            synthesizeButton.disabled = false;
            progressIndicator.style.display = 'none';
        }
    });

    downloadButton.addEventListener('click', () => {
        if (!audioData) return;

        const blob = new Blob([audioData], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = (textInput.value.slice(0, 10) || '语音合成') + '.wav';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // 初始化历史记录显示
    updateHistoryDisplay();
});