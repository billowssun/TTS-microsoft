let audioData = null;

async function synthesizeSpeech() {
    console.log('synthesizeSpeech function called');
    const apiKey = document.getElementById('apiKey').value;
    const region = document.getElementById('region').value;
    const text = document.getElementById('text').value;
    const voiceName = document.getElementById('voiceName').value;

    if (!apiKey || !region || !text || !voiceName) {
        alert('请填写所有字段');
        return;
    }

    try {
        const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(apiKey, region);
        speechConfig.speechSynthesisVoiceName = voiceName;
        
        // 创建一个 PullAudioOutputStream 来接收音频数据
        const audioOutputStream = SpeechSDK.AudioOutputStream.createPullStream();
        const audioConfig = SpeechSDK.AudioConfig.fromStreamOutput(audioOutputStream);
        
        // 创建合成器，使用自定义音频输出
        const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

        console.log('Starting synthesis...');
        
        // 使用 Promise 包装语音合成过程
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

        if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
            console.log("语音合成成功");
            
            // 保存音频数据供下载使用
            window.audioData = result.audioData;
            
            // 创建音频 Blob
            const blob = new Blob([result.audioData], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            
            // 设置音频播放器
            const audioPlayer = document.getElementById('audioPlayer');
            audioPlayer.src = url;
            audioPlayer.style.display = 'block';
            
            // 显示下载按钮
            document.getElementById('downloadButton').style.display = 'block';
            
            // 当音��播放完毕时释放 URL
            audioPlayer.onended = () => {
                URL.revokeObjectURL(url);
            };

            // 准备好后暂停，让用户手动控制播放
            audioPlayer.addEventListener('loadeddata', () => {
                audioPlayer.pause();
            });
        } else {
            console.error("语音合成失败:", result);
            alert("语音合成失败: " + result.errorDetails);
        }
    } catch (error) {
        console.error("发生错误:", error);
        alert("错误: " + error.message);
    }
}

function downloadAudio() {
    if (!window.audioData) {
        alert('请先生成音频');
        return;
    }

    // 获取文本内容的前10个字符作为文件名
    const text = document.getElementById('text').value;
    const fileName = text.slice(0, 10).trim() || '语音合成';
    
    // 创建 Blob 对象
    const blob = new Blob([window.audioData], { type: 'audio/wav' });
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${fileName}.wav`;
    
    // 触发下载
    document.body.appendChild(a);
    a.click();
    
    // 清理
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// 等待页面加载完成
document.addEventListener('DOMContentLoaded', () => {
    console.log('正在初始化语音合成系统...');
    
    // 绑定合成按钮事件
    const synthesizeButton = document.getElementById('synthesizeButton');
    if (synthesizeButton) {
        synthesizeButton.addEventListener('click', synthesizeSpeech);
        console.log('合成按钮事件监听器已添加');
    } else {
        console.error('找不到合成按钮');
    }
    
    // 绑定下载按钮事件
    const downloadButton = document.getElementById('downloadButton');
    if (downloadButton) {
        downloadButton.addEventListener('click', downloadAudio);
        console.log('下载按钮事件监听器已添加');
    } else {
        console.error('找不到下载按钮');
    }
});