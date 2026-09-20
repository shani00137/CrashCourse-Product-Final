/**
 * Builds an inline HTML document that renders a PDF inside the preview WebView.
 * PDF.js is loaded from a pinned CDN and renders one page at a time (fit-to-width,
 * pinch/button zoom) so each rendered page number is reported back to React Native
 * and can be persisted and restored on next open.
 *
 * The PDF bytes are not embedded in this document (that broke large books).
 * Instead React Native streams base64 chunks in with `window.__ccFeed(...)` and
 * finishes with `window.__ccEnd()`, so a readable copy only ever lives in memory.
 *
 * Navigation is handled by the native toolbar in React Native via
 * `window.__nav("next" | "prev" | "in" | "out")` — there are no in-page nav
 * buttons or tap zones inside the viewer.
 *
 * When zoomed in beyond the screen width the page can be scrolled/paned
 * (the canvas sits inside a scroll container), so zooming a tall page no
 * longer clips the bottom off.
 *
 * Renders are single-flight: before drawing a new page the previous render task is
 * cancelled, so rapid taps can never hit pdf.js's
 * "Cannot use the same canvas during multiple render() operations" guard (which
 * otherwise freezes navigation on the second tap).
 */
export function buildPdfViewerHtml(url: string, initialPage: number): string {
  const safeUrl = JSON.stringify(url);
  const startPage = String(Math.max(1, Math.floor(initialPage) || 1));

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>
  * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:rgba(0,0,0,0); }
  html, body { width:100%; height:100%; overflow:hidden; background:#525252; }
  #viewer { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; }
  #scroll { position:absolute; inset:0; overflow:auto; -webkit-overflow-scrolling:touch; display:flex; }
  #stage { margin:auto; }
  #pdf { background:#fff; box-shadow:0 2px 14px rgba(0,0,0,.45); display:block; }
  #spinner { position:absolute; top:14px; left:0; right:0; text-align:center; color:#fff;
    font:600 13px -apple-system, system-ui, sans-serif; text-shadow:0 1px 3px rgba(0,0,0,.5); }
  #err { display:none; position:absolute; inset:0; align-items:center; justify-content:center;
    padding:32px; color:#fff; font:14px -apple-system, system-ui, sans-serif; text-align:center; }
</style>
</head>
<body>
<div id="viewer"><div id="scroll"><div id="stage"><canvas id="pdf"></canvas></div></div></div>
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
  var scrollEl = document.getElementById('scroll');
  var spinner = document.getElementById('spinner');
  var errEl = document.getElementById('err');
  var pdfDoc = null;
  var maxPages = 0;
  var pageNum = startPage;
  var scale = 1;
  var feedOffset = 0;
  var pendingData = null;
  var feedComplete = false;
  var started = false;
  var engineFailed = false;
  // Currently active render task. Kept single-flight: each draw() cancels the
  // previous one so rapid taps can never trip pdf.js's same-canvas guard.
  var renderTask = null;
  var renderSeq = 0;

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
    var seq = ++renderSeq;
    if (renderTask) {
      // Cancel the in-flight render before touching the canvas again. pdf.js
      // frees the canvas for reuse inside cancel(), and the cancelled task's
      // promise rejects with RenderingCancelledException, which we ignore.
      try { renderTask.cancel(); } catch (e) {}
      renderTask = null;
    }
    spinner.style.display = 'block';
    spinner.textContent = 'Page ' + pageNum + ' of ' + maxPages + '…';
    pdfDoc.getPage(pageNum).then(function (page) {
      if (seq !== renderSeq) return; // superseded by a newer draw()
      var vp = viewportFor(page);
      canvas.width = Math.floor(vp.width);
      canvas.height = Math.floor(vp.height);
      canvas.style.width = canvas.width + 'px';
      canvas.style.height = canvas.height + 'px';
      renderTask = page.render({ canvasContext: ctx, viewport: vp });
      renderTask.promise.then(function () {
        if (seq !== renderSeq) return;
        renderTask = null;
        spinner.style.display = 'none';
        send({ type: 'page', page: pageNum, pages: maxPages });
      }).catch(function (e) {
        if (seq !== renderSeq) return;
        renderTask = null;
        if (e && (e.name === 'RenderingCancelledException' || /cancell/i.test(String(e && e.message)))) {
          return; // expected when the next tap superseded this render
        }
        showErr(e && e.message ? e.message : 'Rendering failed.');
      });
    }).catch(function (e) {
      if (seq !== renderSeq) return;
      showErr(e && e.message ? e.message : 'Could not open this page.');
    });
  }

  function navNext() {
    if (!pdfDoc || pageNum >= maxPages) return;
    pageNum++;
    resetScroll();
    draw();
  }
  function navPrev() {
    if (!pdfDoc || pageNum <= 1) return;
    pageNum--;
    resetScroll();
    draw();
  }
  // Start each new page at the top. Zoom in/out deliberately keeps the current
  // scroll position so you stay where you were looking.
  function resetScroll() {
    try { if (scrollEl) { scrollEl.scrollTop = 0; scrollEl.scrollLeft = 0; } } catch (e) {}
  }
  function navIn() { scale = Math.min(4, Math.round(scale * 1.25 * 100) / 100); draw(); }
  function navOut() { scale = Math.max(0.4, Math.round(scale / 1.25 * 100) / 100); draw(); }

  window.__nav = function (cmd) {
    if (cmd === 'next') navNext();
    else if (cmd === 'prev') navPrev();
    else if (cmd === 'in') navIn();
    else if (cmd === 'out') navOut();
  };

  function tryLoad() {
    if (started || !pendingData || !feedComplete) return;
    var lib = window.pdfjsLib;
    if (!lib) return;
    started = true;
    try { lib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'; } catch (e) {}
    lib.getDocument({ data: pendingData, disableWorker: true, isEvalSupported: false }).promise.then(function (doc) {
      pdfDoc = doc;
      maxPages = doc.numPages;
      if (pageNum > maxPages) pageNum = Math.max(1, maxPages);
      errEl.style.display = 'none';
      draw();
    }).catch(function (e) {
      started = false;
      showErr('Could not open the PDF. ' + (e ? e.message : ''));
    });
  }

  window.__ccBegin = function (total) {
    pendingData = new Uint8Array(total >>> 0);
    feedOffset = 0;
  };

  window.__ccFeed = function (chunk) {
    if (!pendingData || typeof chunk !== 'string' || !chunk) return;
    var bin = atob(chunk);
    for (var i = 0; i < bin.length && feedOffset < pendingData.length; i++) {
      pendingData[feedOffset++] = bin.charCodeAt(i);
    }
  };

  window.__ccEnd = function () {
    feedComplete = true;
    spinner.style.display = 'block';
    spinner.textContent = 'Opening PDF…';
    tryLoad();
  };

  window.__ccFail = function (m) {
    showErr(m || 'Could not open the PDF.');
  };

  var attempts = 0;
  var poll = setInterval(function () {
    if (window.pdfjsLib) {
      if (feedComplete && !started) { clearInterval(poll); tryLoad(); }
      return;
    }
    attempts++;
    if (attempts > 150 && !engineFailed) {
      engineFailed = true;
      clearInterval(poll);
      showErr('Could not load the PDF engine. Check your connection and try again.');
    }
  }, 200);

  send({ type: 'ready' });
})();
</script>
</body>
</html>`;
}

/** Storage key (same PDF URL) under which the last-read page is kept. */
export function pdfPageKey(url: string): string {
  return `pdf:lastpage:${url}`;
}