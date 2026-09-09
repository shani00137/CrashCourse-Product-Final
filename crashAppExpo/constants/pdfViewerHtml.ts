/**
 * Builds an inline HTML document that renders a PDF inside the preview WebView.
 * PDF.js is loaded from a pinned CDN and renders one page at a time (fit-to-width,
 * pinch/button zoom) so each rendered page number is reported back to React Native
 * and can be persisted and restored on next open.
 */
export function buildPdfViewerHtml(url: string, initialPage: number): string {
  const safeUrl = JSON.stringify(url);
  const startPage = String(Math.max(1, Math.floor(initialPage) || 1));

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:100%; height:100%; overflow:hidden; background:#525252; }
  #viewer { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; }
  #pdf { background:#fff; box-shadow:0 2px 14px rgba(0,0,0,.45); }
  #spinner { position:absolute; top:14px; left:0; right:0; text-align:center; color:#fff;
    font:600 13px -apple-system, system-ui, sans-serif; text-shadow:0 1px 3px rgba(0,0,0,.5); }
  #err { display:none; position:absolute; inset:0; align-items:center; justify-content:center;
    padding:32px; color:#fff; font:14px -apple-system, system-ui, sans-serif; text-align:center; }
</style>
</head>
<body>
<div id="viewer"><canvas id="pdf"></canvas></div>
<div id="spinner">Opening PDF…</div>
<div id="err"></div>
<script src="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js"></script>
<script>
(function () {
  var url = ${safeUrl};
  var startPage = ${startPage};
  var canvas = document.getElementById('pdf');
  var ctx = canvas.getContext('2d');
  var viewer = document.getElementById('viewer');
  var spinner = document.getElementById('spinner');
  var errEl = document.getElementById('err');
  var pdfDoc = null;
  var maxPages = 0;
  var pageNum = startPage;
  var scale = 1;

  function send(obj) {
    try { window.ReactNativeWebView.postMessage(JSON.stringify(obj)); } catch (e) {}
  }

  function showErr(m) {
    spinner.style.display = 'none';
    errEl.style.display = 'flex';
    errEl.textContent = m;
    send({ type: 'error', message: String(m) });
  }

  function viewportFor(page) {
    var base = page.getViewport({ scale: 1 });
    var avail = Math.max(220, viewer.clientWidth - 16);
    var sx = (avail / base.width) * scale;
    return page.getViewport({ scale: sx });
  }

  function draw() {
    if (!pdfDoc) return;
    spinner.style.display = 'block';
    spinner.textContent = 'Page ' + pageNum + ' of ' + maxPages + '…';
    pdfDoc.getPage(pageNum).then(function (page) {
      var vp = viewportFor(page);
      canvas.width = Math.floor(vp.width);
      canvas.height = Math.floor(vp.height);
      canvas.style.width = canvas.width + 'px';
      canvas.style.height = canvas.height + 'px';
      page.render({ canvasContext: ctx, viewport: vp }).then(function () {
        spinner.style.display = 'none';
        send({ type: 'page', page: pageNum, pages: maxPages });
      }).catch(function (e) {
        showErr(e && e.message ? e.message : 'Rendering failed.');
      });
    }).catch(function (e) {
      showErr(e && e.message ? e.message : 'Could not open this page.');
    });
  }

  function next() { if (pageNum < maxPages) { pageNum++; draw(); } }
  function prev() { if (pageNum > 1) { pageNum--; draw(); } }
  function zoomIn() { scale = Math.min(4, Math.round(scale * 1.25 * 100) / 100); draw(); }
  function zoomOut() { scale = Math.max(0.4, Math.round(scale / 1.25 * 100) / 100); draw(); }

  window.__nav = function (cmd) {
    if (cmd === 'next') next();
    else if (cmd === 'prev') prev();
    else if (cmd === 'in') zoomIn();
    else if (cmd === 'out') zoomOut();
  };

  function load() {
    var lib = window.pdfjsLib;
    if (!lib) { showErr('Could not load the PDF engine. Check your connection and try again.'); return; }
    try { lib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'; } catch (e) {}
    lib.getDocument({ url: url, disableWorker: true, isEvalSupported: false }).promise.then(function (doc) {
      pdfDoc = doc;
      maxPages = doc.numPages;
      errEl.style.display = 'none';
      draw();
    }).catch(function (e) {
      showErr('Could not download the PDF. ' + (e ? e.message : ''));
    });
  }

  var attempts = 0;
  (function poll() {
    attempts++;
    if (window.pdfjsLib) { load(); return; }
    if (attempts > 100) { showErr('Could not load the PDF engine. Check your connection and try again.'); return; }
    setTimeout(poll, 200);
  })();
})();
</script>
</body>
</html>`;
}

/** Storage key (same PDF URL) under which the last-read page is kept. */
export function pdfPageKey(url: string): string {
  return `pdf:lastpage:${url}`;
}