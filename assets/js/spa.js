// spa.js — <main>だけ差し替えるSPAナビゲーション
// include.js / render.js はそのまま残す。このファイルをそれらの後に読み込む。

(function () {
    function isSameSite(url) {
      return (
        url.origin === location.origin &&
        /\.(html?)$/.test(url.pathname)
      );
    }
  
    async function navigate(href) {
      const res = await fetch(href);
      if (!res.ok) {
        // フォールバック: 通常遷移
        location.href = href;
        return;
      }
  
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
  
      // <main> を差し替え
      const newMain = doc.querySelector('main');
      const oldMain = document.querySelector('main');
      if (newMain && oldMain) {
        oldMain.replaceWith(newMain);
      }
  
      // data-page / data-page-title を更新
      document.body.dataset.page = doc.body.dataset.page || '';
      document.body.dataset.pageTitle = doc.body.dataset.pageTitle || '';
  
      // <title> 更新は applySiteMeta() が上書きするので不要だが念のため
      document.title = doc.title;
  
      history.pushState({ href }, '', href);
  
      // ナビのアクティブ状態を更新
      if (typeof highlightCurrentNav === 'function') {
        highlightCurrentNav();
      }
  
      // render.js の renderPage() を再実行
      if (typeof renderPage === 'function') {
        await renderPage();
      }
  
      // ページ先頭にスクロール
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  
    // リンククリックをインターセプト
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a || !a.href) return;
      // target="_blank" や修飾キーは除外
      if (a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  
      const url = new URL(a.href, location.origin);
      if (!isSameSite(url)) return;
  
      e.preventDefault();
      navigate(a.href);
    });
  
    // ブラウザの戻る/進む
    window.addEventListener('popstate', (e) => {
      navigate(e.state?.href || location.href);
    });
  })();