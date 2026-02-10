// 状態メッセージを表示する関数
function showStatus(message, type) {
    const statusElement = document.getElementById('statusMessage');
    statusElement.textContent = message;
    statusElement.className = `status-message ${type}`;
}

// URLの検証
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// ファイル名をURLから取得
function getFilenameFromUrl(url) {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const filename = pathname.split('/').pop();
        return filename || 'video.mp4';
    } catch (_) {
        return 'video.mp4';
    }
}

// 動画をダウンロードする関数
async function downloadVideo() {
    const urlInput = document.getElementById('videoUrl');
    const downloadBtn = document.getElementById('downloadBtn');
    const url = urlInput.value.trim();

    // URLの検証
    if (!url) {
        showStatus('URLを入力してください。', 'error');
        return;
    }

    if (!isValidUrl(url)) {
        showStatus('有効なURLを入力してください。', 'error');
        return;
    }

    // ダウンロード開始
    downloadBtn.disabled = true;
    showStatus('ダウンロードを準備しています...', 'info');

    try {
        // fetchを使用して動画を取得
        const response = await fetch(url, {
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
        }

        // レスポンスをblobとして取得
        const blob = await response.blob();
        
        // ファイル名を取得
        const filename = getFilenameFromUrl(url);

        // blobからダウンロードリンクを作成
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = filename;
        
        // リンクをクリックしてダウンロード
        document.body.appendChild(a);
        a.click();
        
        // クリーンアップ
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);

        showStatus('ダウンロードが開始されました！', 'success');
        
    } catch (error) {
        console.error('ダウンロードエラー:', error);
        
        // CORS エラーの場合の代替方法
        if (error.message.includes('CORS') || error.name === 'TypeError') {
            showStatus('CORSエラーが発生しました。代替方法を使用します...', 'info');
            
            // 代替方法：直接リンクを開く
            const a = document.createElement('a');
            a.href = url;
            a.download = getFilenameFromUrl(url);
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            showStatus('新しいタブで動画を開きました。ブラウザの保存機能を使用してダウンロードしてください。', 'info');
        } else {
            showStatus(`エラーが発生しました: ${error.message}`, 'error');
        }
    } finally {
        downloadBtn.disabled = false;
    }
}

// Enterキーでダウンロード
document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('videoUrl');
    urlInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            downloadVideo();
        }
    });
});
