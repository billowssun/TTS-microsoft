(function() {
    var INJECTED_KEY = '__SPEECH_KEY__';
    var INJECTED_REGION = '__SPEECH_REGION__';

    var VOICES = [
        { g: 'Dragon HD Omni · 最新旗舰 (自然流畅)', v: [
            ['zh-CN-Yunqi:DragonHDOmniLatestNeural', '云奇 · 自然男声'],
            ['zh-CN-Xiaoyue:DragonHDOmniLatestNeural', '晓月 · 自然女声']
        ]},
        { g: 'Dragon HD / Flash · 极速高保真', v: [
            ['zh-CN-Xiaoxiao:DragonHDFlashLatestNeural', '晓晓 Flash · 智能女声'],
            ['zh-CN-Xiaoxiao2:DragonHDFlashLatestNeural', '晓晓2 Flash · 情感女声'],
            ['zh-CN-Yunfan:DragonHDLatestNeural', '云帆 HD · 清爽男声'],
            ['zh-CN-Xiaochen:DragonHDLatestNeural', '晓晨 HD · 标准女声'],
            ['zh-CN-Xiaochen:DragonHDFlashLatestNeural', '晓晨 Flash · 亲切女声'],
            ['zh-CN-Xiaohan:DragonHDFlashLatestNeural', '晓涵 Flash · 温暖女声'],
            ['zh-CN-Xiaoyi:DragonHDFlashLatestNeural', '晓伊 Flash · 温柔女声'],
            ['zh-CN-Xiaoyou:DragonHDFlashLatestNeural', '晓游 Flash · 活泼女声'],
            ['zh-CN-Xiaoyu:DragonHDFlashLatestNeural', '晓语 Flash · 甜美女声'],
            ['zh-CN-Xiaoshuang:DragonHDFlashLatestNeural', '晓爽 Flash · 清晰女声'],
            ['zh-CN-Yunxiao:DragonHDFlashLatestNeural', '云晓 Flash · 年轻男声'],
            ['zh-CN-Yunyi:DragonHDFlashLatestNeural', '云逸 Flash · 成熟男声'],
            ['zh-CN-Yunxia:DragonHDFlashLatestNeural', '云霞 Flash · 儒雅男声'],
            ['zh-CN-Yunye:DragonHDFlashLatestNeural', '云野 Flash · 沉稳男声'],
            ['zh-CN-Yunxi:DragonHDFlashLatestNeural', '云希 Flash · 阳光男声'],
            ['zh-CN-Yunhan:DragonHDFlashLatestNeural', '云汉 Flash · 醇厚男声']
        ]},
        { g: '标准 Neural 女声', v: [
            ['zh-CN-XiaoxiaoNeural', '晓晓 · 温暖女声'],
            ['zh-CN-XiaoyiNeural', '晓伊 · 温柔女声'],
            ['zh-CN-XiaochenNeural', '晓辰 · 标准女声'],
            ['zh-CN-XiaohanNeural', '晓涵 · 活泼女声'],
            ['zh-CN-XiaomengNeural', '晓梦 · 甜美女声'],
            ['zh-CN-XiaomoNeural', '晓墨 · 清新女声'],
            ['zh-CN-XiaoqiuNeural', '晓秋 · 成熟女声'],
            ['zh-CN-XiaorouNeural', '晓柔 · 温婉女声'],
            ['zh-CN-XiaoruiNeural', '晓睿 · 干练女声'],
            ['zh-CN-XiaoshuangNeural', '晓双 · 可爱童声'],
            ['zh-CN-XiaoyanNeural', '晓燕 · 亲切女声'],
            ['zh-CN-XiaozhenNeural', '晓珍 · 柔和女声']
        ]},
        { g: '标准 Neural 男声', v: [
            ['zh-CN-YunxiNeural', '云希 · 年轻男声'],
            ['zh-CN-YunyangNeural', '云扬 · 成熟男声'],
            ['zh-CN-YunfengNeural', '云枫 · 儒雅男声'],
            ['zh-CN-YunzeNeural', '云泽 · 温和男声'],
            ['zh-CN-YunjianNeural', '云剑 · 铿锵男声'],
            ['zh-CN-YunhaoNeural', '云浩 · 浑厚男声'],
            ['zh-CN-YunjieNeural', '云捷 · 爽朗男声'],
            ['zh-CN-YunxiaNeural', '云夏 · 亲和男声'],
            ['zh-CN-YunyeNeural', '云野 · 沉稳男声']
        ]},
        { g: '多语言 Neural (中英日韩混合)', v: [
            ['zh-CN-XiaoxiaoMultilingualNeural', '晓晓 Multilingual'],
            ['zh-CN-XiaoyuMultilingualNeural', '晓宇 Multilingual'],
            ['zh-CN-XiaochenMultilingualNeural', '晓晨 Multilingual'],
            ['zh-CN-XiaoshuangMultilingualNeural', '晓爽 Multilingual'],
            ['zh-CN-XiaoyouMultilingualNeural', '晓游 Multilingual'],
            ['zh-CN-YunfanMultilingualNeural', '云帆 Multilingual'],
            ['zh-CN-YunxiaoMultilingualNeural', '云晓 Multilingual'],
            ['zh-CN-YunyiMultilingualNeural', '云逸 Multilingual']
        ]},
        { g: '方言 Neural (地方口音)', v: [
            ['zh-CN-liaoning-XiaobeiNeural', '晓北 · 东北口音女声'],
            ['zh-CN-liaoning-YunbiaoNeural', '云飙 · 东北口音男声'],
            ['zh-CN-shaanxi-XiaoniNeural', '晓妮 · 陕西口音女声'],
            ['zh-CN-sichuan-YunxiNeural', '云玺 · 四川口音男声'],
            ['zh-CN-shandong-YunxiangNeural', '云翔 · 山东口音男声'],
            ['zh-CN-XiaoxiaoDialectsNeural', '晓晓 · 方言混合女声']
        ]},
        { g: '粤语 / 吴语 / 台湾国语', v: [
            ['zh-HK-HiuMaanNeural', '晓曼 · 粤语女声'],
            ['zh-HK-WanLungNeural', '云龙 · 粤语男声'],
            ['zh-HK-HiuGaaiNeural', '晓佳 · 粤语女声'],
            ['yue-CN-XiaoMinNeural', '晓敏 · 粤语简体女声'],
            ['yue-CN-YunSongNeural', '云松 · 粤语简体男声'],
            ['wuu-CN-XiaotongNeural', '晓桐 · 吴语女声'],
            ['wuu-CN-YunzheNeural', '云哲 · 吴语男声'],
            ['zh-TW-HsiaoChenNeural', '晓晨 · 台湾国语女声'],
            ['zh-TW-YunJheNeural', '云哲 · 台湾国语男声'],
            ['zh-TW-HsiaoYuNeural', '晓宇 · 台湾国语女声']
        ]}
    ];

    function isPlaceholder(val) {
        return !val || val.indexOf('__SPEECH_') === 0;
    }

    document.addEventListener('DOMContentLoaded', function() {
        // 加载 SDK
        var sdkScript = document.createElement('script');
        sdkScript.src = 'https://cdn.jsdelivr.net/npm/microsoft-cognitiveservices-speech-sdk@latest/distrib/browser/microsoft.cognitiveservices.speech.sdk.bundle-min.js';
        sdkScript.onerror = function() {
            alert('Speech SDK 加载失败，请检查网络后刷新页面');
        };
        document.head.appendChild(sdkScript);

        // 构建音色下拉
        var voiceSelect = document.getElementById('voiceName');
        var frag = document.createDocumentFragment();
        VOICES.forEach(function(group) {
            var og = document.createElement('optgroup');
            og.label = group.g;
            group.v.forEach(function(v) {
                var opt = document.createElement('option');
                opt.value = v[0];
                opt.textContent = v[1];
                og.appendChild(opt);
            });
            frag.appendChild(og);
        });
        voiceSelect.appendChild(frag);
        voiceSelect.value = 'zh-CN-Xiaoxiao:DragonHDFlashLatestNeural';

        // DOM refs
        var synthesizeBtn = document.getElementById('synthesizeButton');
        var btnText = document.getElementById('btnText');
        var btnSpinner = document.getElementById('btnSpinner');
        var downloadBtn = document.getElementById('downloadButton');
        var audioPlayer = document.getElementById('audioPlayer');
        var outputCard = document.getElementById('outputCard');
        var textInput = document.getElementById('text');
        var charCount = document.getElementById('charCount');

        var audioData = null;

        // 启用按钮
        synthesizeBtn.disabled = false;

        // 字符计数
        textInput.addEventListener('input', function() {
            var len = this.value.length;
            charCount.textContent = len + ' 字';
            charCount.className = len > 10000 ? 'char-count over' : 'char-count';
        });

        // 合成
        synthesizeBtn.addEventListener('click', function() {
            if (!window.SpeechSDK) {
                alert('Speech SDK 尚未就绪，请稍后');
                return;
            }

            var text = textInput.value.trim();
            if (!text) {
                alert('请输入文本内容');
                return;
            }
            if (text.length > 10000) {
                alert('文本过长，请控制在 10000 字以内');
                return;
            }

            if (isPlaceholder(INJECTED_KEY) || isPlaceholder(INJECTED_REGION)) {
                alert('未配置 API 密钥。请通过 Vercel 环境变量 SPEECH_KEY / SPEECH_REGION 部署。');
                return;
            }

            // 停止当前播放
            if (!audioPlayer.paused) {
                audioPlayer.pause();
                audioPlayer.currentTime = 0;
            }

            // 加载态
            synthesizeBtn.disabled = true;
            btnText.textContent = '合成中...';
            btnSpinner.style.display = 'block';
            outputCard.style.display = 'none';

            var speechConfig = SpeechSDK.SpeechConfig.fromSubscription(INJECTED_KEY, INJECTED_REGION);
            speechConfig.speechSynthesisVoiceName = voiceSelect.value;

            var synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, null);

            synthesizer.speakTextAsync(
                text,
                function(result) {
                    synthesizer.close();

                    audioData = result.audioData;
                    var blob = new Blob([audioData], { type: 'audio/wav' });
                    var url = URL.createObjectURL(blob);

                    audioPlayer.src = url;
                    outputCard.style.display = 'block';

                    synthesizeBtn.disabled = false;
                    btnText.textContent = '生成音频';
                    btnSpinner.style.display = 'none';
                },
                function(error) {
                    synthesizer.close();
                    console.error('合成失败:', error);
                    alert('语音合成失败: ' + (error.message || error));
                    synthesizeBtn.disabled = false;
                    btnText.textContent = '生成音频';
                    btnSpinner.style.display = 'none';
                }
            );
        });

        // 下载
        downloadBtn.addEventListener('click', function() {
            if (!audioData) return;

            var blob = new Blob([audioData], { type: 'audio/wav' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = (textInput.value.trim().slice(0, 10) || '语音合成') + '.wav';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    });
})();
