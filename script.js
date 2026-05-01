(function() {
    // ---- CI 注入配置（部署时由 GitHub Actions 替换，勿手动修改） ----
    var INJECTED_KEY = '__SPEECH_KEY__';
    var INJECTED_REGION = '__SPEECH_REGION__';

    var STORAGE_KEY = 'azureTtsConfig';

    function isPlaceholder(val) {
        return !val || val.indexOf('__SPEECH_') === 0;
    }

    function loadSavedConfig() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                if (parsed.key && parsed.region) {
                    return parsed;
                }
            }
        } catch (e) {
            // ignore
        }
        return null;
    }

    function persistConfig(key, region) {
        if (key && region) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                key: btoa(key),
                region: region
            }));
        }
    }

    function createAsterisks(length) {
        return '*'.repeat(length);
    }

    document.addEventListener('DOMContentLoaded', function() {
        var sdkScript = document.createElement('script');
        sdkScript.src = 'https://cdn.jsdelivr.net/npm/microsoft-cognitiveservices-speech-sdk@latest/distrib/browser/microsoft.cognitiveservices.speech.sdk.bundle-min.js';
        sdkScript.onerror = function() {
            var el = document.querySelector('.progress-text');
            if (el) {
                el.textContent = 'Speech SDK 加载失败，请检查网络连接后刷新页面';
                el.style.color = '#ef4444';
            }
            var pi = document.getElementById('progressIndicator');
            if (pi) pi.style.display = 'block';
        };
        document.head.appendChild(sdkScript);

        var apiKeyInput = document.getElementById('apiKey');
        var regionInput = document.getElementById('region');
        var synthesizeButton = document.getElementById('synthesizeButton');
        var downloadButton = document.getElementById('downloadButton');
        var audioPlayer = document.getElementById('audioPlayer');
        var audioPlayerContainer = document.getElementById('audioPlayerContainer');
        var progressIndicator = document.getElementById('progressIndicator');
        var textInput = document.getElementById('text');
        var voiceSelect = document.getElementById('voiceName');

        var audioData = null;
        var currentAudioPlayer = audioPlayer;
        var hasInjectedConfig = false;

        // 优先使用 CI 注入的配置
        if (!isPlaceholder(INJECTED_KEY) && !isPlaceholder(INJECTED_REGION)) {
            apiKeyInput.value = createAsterisks(32);
            apiKeyInput.dataset.apiKey = btoa(INJECTED_KEY);
            regionInput.value = INJECTED_REGION;
            hasInjectedConfig = true;
            var settingsSection = document.getElementById('settingsSection');
            if (settingsSection) settingsSection.style.display = 'none';
        } else {
            // 回退到 localStorage 中保存的配置
            var savedConfig = loadSavedConfig();
            if (savedConfig) {
                apiKeyInput.value = createAsterisks(32);
                apiKeyInput.dataset.apiKey = savedConfig.key;
                regionInput.value = savedConfig.region;
            } else {
                // 本地开发无密钥时，自动展开 API 配置区
                var settingsSection = document.getElementById('settingsSection');
                if (settingsSection) {
                    settingsSection.classList.remove('collapsed');
                    settingsSection.classList.add('expanded');
                }
            }
        }

        var togglePassword = document.querySelector('.toggle-password');
        var eyeIcon = document.querySelector('.eye-icon');
        var eyeOffIcon = document.querySelector('.eye-off-icon');

        togglePassword.addEventListener('click', function() {
            var type = apiKeyInput.type === 'password' ? 'text' : 'password';
            apiKeyInput.type = type;
            eyeIcon.style.display = type === 'password' ? 'block' : 'none';
            eyeOffIcon.style.display = type === 'password' ? 'none' : 'block';
        });

        apiKeyInput.addEventListener('input', function() {
            if (this.value.length > 0) {
                this.dataset.apiKey = btoa(this.value);
                if (!hasInjectedConfig) {
                    persistConfig(this.value, regionInput.value.trim());
                }
            } else {
                this.dataset.apiKey = '';
            }
        });

        regionInput.addEventListener('input', function() {
            if (apiKeyInput.value && apiKeyInput.dataset.apiKey && !hasInjectedConfig) {
                persistConfig(apiKeyInput.value, this.value.trim());
            }
        });

        synthesizeButton.addEventListener('click', function() {
            if (!window.SpeechSDK) {
                alert('Speech SDK 尚未加载，请稍后重试或检查网络连接');
                return;
            }

            var apiKey = apiKeyInput.dataset.apiKey ? atob(apiKeyInput.dataset.apiKey) : '';
            var region = regionInput.value.trim();
            var text = textInput.value.trim();
            var voice = voiceSelect.value;

            if (!apiKey) {
                alert('请先在 API 配置中输入 Azure 语音服务 API 密钥');
                return;
            }
            if (!region) {
                alert('请先在 API 配置中输入 Azure 服务区域');
                return;
            }
            if (!text) {
                alert('请输入要转换的文本内容');
                return;
            }

            if (currentAudioPlayer && !currentAudioPlayer.paused) {
                currentAudioPlayer.pause();
                currentAudioPlayer.currentTime = 0;
            }

            synthesizeButton.disabled = true;
            downloadButton.style.display = 'none';
            audioPlayerContainer.style.display = 'none';
            progressIndicator.style.display = 'block';

            var speechConfig = SpeechSDK.SpeechConfig.fromSubscription(apiKey, region);
            speechConfig.speechSynthesisVoiceName = voice;

            var audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
            var synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

            if (window.audioContext) {
                window.audioContext.suspend();
            }
            window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            window.audioContext.suspend();

            synthesizer.speakTextAsync(
                text,
                function(result) {
                    synthesizer.close();

                    audioData = result.audioData;
                    var blob = new Blob([audioData], { type: 'audio/wav' });
                    var url = URL.createObjectURL(blob);

                    audioPlayer.src = url;
                    audioPlayerContainer.style.display = 'block';
                    downloadButton.style.display = 'block';

                    audioPlayer.onplay = null;
                    audioPlayer.onended = null;

                    var playAudio = function() {
                        audioPlayer.play().catch(function(err) {
                            console.warn('自动播放被阻止:', err);
                        });
                        audioPlayer.removeEventListener('canplay', playAudio);
                    };

                    audioPlayer.addEventListener('canplay', playAudio, { once: true });
                    audioPlayer.load();

                    audioPlayer.addEventListener('play', function() {
                        var updateProgress = function() {
                            if (!audioPlayer.paused && audioPlayer.duration) {
                                var progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
                                var progressBar = document.querySelector('.progress-bar-value');
                                if (progressBar) {
                                    progressBar.style.transform = 'translateX(' + (progress - 100) + '%)';
                                }
                                requestAnimationFrame(updateProgress);
                            }
                        };
                        updateProgress();
                    });

                    audioPlayer.onended = function() {
                        URL.revokeObjectURL(url);
                    };

                    synthesizeButton.disabled = false;
                    progressIndicator.style.display = 'none';
                },
                function(error) {
                    synthesizer.close();
                    console.error('语音合成失败:', error);
                    alert('语音合成失败: ' + (error.message || error));
                    synthesizeButton.disabled = false;
                    progressIndicator.style.display = 'none';
                }
            );
        });

        downloadButton.addEventListener('click', function() {
            if (!audioData) return;

            var blob = new Blob([audioData], { type: 'audio/wav' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = (textInput.value.slice(0, 10) || '语音合成') + '.wav';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    });
})();
