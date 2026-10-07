/**
 * Builds an inline HTML document that renders a PDF inside the preview WebView.
 * PDF.js is loaded from a pinned CDN and renders one page at a time
 * (fit-to-width) so each rendered page number is reported back to React Native
 * and can be persisted and restored on next open.
 *
 * The PDF bytes are not embedded in this document (that broke large books).
 * Instead React Native streams base64 chunks in with `window.__ccFeed(...)` and
 * finishes with `window.__ccEnd()`, so a readable copy only ever lives in memory.
 *
 * Navigation and zoom are touch-driven inside the viewer:
 *   - Swipe left / right to go to the next / previous page (at fit width).
 *   - Pinch to zoom in and out; drag to pan while zoomed in.
 * There are no in-page nav or zoom buttons. `window.__nav(...)` is still kept
 * for programmatic control (`next` / `prev` / `in` / `out` / `reset`).
 *
 * The page canvas keeps a fixed on-screen size (fit-to-width). Committed zoom is
 * applied as a CSS transform, and the canvas is re-rendered at the new
 * resolution on release so zoomed text stays sharp while panning stays smooth.
 *
 * Renders are single-flight: before drawing a new page the previous render task is
 * cancelled, so rapid gestures can never hit pdf.js's
 * "Cannot use the same canvas during multiple render() operations" guard (which
 * otherwise freezes navigation on the second gesture).
 */
export function buildPdfViewerHtml(url: string, initialPage: number): string {
  const safeUrl = JSON.stringify(url);
  const startPage = String(Math.max(1, Math.floor(initialPage) || 1));

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
<style>
  * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:rgba(0,0,0,0); }
  html, body { width:100%; height:100%; overflow:hidden; background:#525252;
    overscroll-behavior:none; -webkit-user-select:none; user-select:none; }
  #viewer { position:absolute; inset:0; overflow:hidden; touch-action:none; }
  #pdf { position:absolute; top:0; left:0; transform-origin:0 0; background:#fff;
    box-shadow:0 2px 14px rgba(0,0,0,.45); display:block; touch-action:none; will-change:transform; }
  #pdf.snap { transition:transform .18s ease-out; }
  #spinner { position:absolute; top:14px; left:0; right:0; text-align:center; color:#fff;
    font:600 13px -apple-system, system-ui, sans-serif; text-shadow:0 1px 3px rgba(0,0,0,.5); pointer-events:none; }
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

  // Zoom is a multiplier on the fit-to-width size (1 = fit width).
  var MIN_ZOOM = 1;
  var MAX_ZOOM = 5;
  var zoom = 1;

  // Fit-to-width geometry for the current page, in CSS pixels at zoom 1.
  var fitScale = 1;
  var baseW = 0;
  var baseH = 0;

  // Pan offset (CSS pixels) applied with the zoom transform.
  var tx = 0;
  var ty = 0;

  var feedOffset = 0;
  var pendingData = null;
  var feedComplete = false;
  var started = false;
  var engineFailed = false;

  // Currently active render task. Kept single-flight: each draw() cancels the
  // previous one so rapid gestures can never trip pdf.js's same-canvas guard.
  var renderTask = null;
  var renderSeq = 0;

  // Active touch gesture state, or null when idle.
  var gesture = null;

  var SWIPE_THRESHOLD = 55; // px of horizontal travel that flips the page

  function send(obj) {
    try { window.ReactNativeWebView.postMessage(JSON.stringify(obj)); } catch (e) {}
  }

  function showErr(m) {
    spinner.style.display = 'none';
    errEl.style.display = 'flex';
    errEl.textContent = m;
    send({ type: 'error', message: String(m) });
  }

  function clamp(v, min, max) {
    return v < min ? min : (v > max ? max : v);
  }

  function applyTransform(z, x, y) {
    canvas.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + z + ')';
  }

  // Keep the page inside the viewport: centred when it is smaller than the
  // screen, otherwise clamped so there is never a gap at an edge.
  function clampPan() {
    var vw = viewer.clientWidth;
    var vh = viewer.clientHeight;
    var cw = baseW * zoom;
    var ch = baseH * zoom;
    if (cw <= vw) tx = (vw - cw) / 2; else tx = clamp(tx, vw - cw, 0);
    if (ch <= vh) ty = (vh - ch) / 2; else ty = clamp(ty, vh - ch, 0);
  }

  function draw(keepPan) {
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
      var base = page.getViewport({ scale: 1 });
      var avail = Math.max(220, viewer.clientWidth - 16);
      fitScale = avail / base.width;
      baseW = avail;
      baseH = base.height * fitScale;
      if (!keepPan) { tx = 0; ty = 0; }
      clampPan();

      var vp = page.getViewport({ scale: fitScale * zoom });
      canvas.width = Math.max(1, Math.floor(vp.width));
      canvas.height = Math.max(1, Math.floor(vp.height));
      // Fixed on-screen size; the zoom transform expands it visually so panning
      // never has to wait for a re-render.
      canvas.style.width = baseW + 'px';
      canvas.style.height = baseH + 'px';
      applyTransform(zoom, tx, ty);

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
          return; // expected when the next draw() superseded this render
        }
        showErr(e && e.message ? e.message : 'Rendering failed.');
      });
    }).catch(function (e) {
      if (seq !== renderSeq) return;
      showErr(e && e.message ? e.message : 'Could not open this page.');
    });
  }

  function goToPage(p) {
    if (!pdfDoc) return false;
    p = clamp(p, 1, maxPages);
    if (p === pageNum) return false;
    pageNum = p;
    draw(false);
    return true;
  }

  function zoomTo(z, keepPan) {
    if (!pdfDoc) return;
    zoom = clamp(z, MIN_ZOOM, MAX_ZOOM);
    draw(keepPan === true);
  }

  window.__nav = function (cmd) {
    if (cmd === 'next') goToPage(pageNum + 1);
    else if (cmd === 'prev') goToPage(pageNum - 1);
    else if (cmd === 'in') zoomTo(zoom * 1.25, true);
    else if (cmd === 'out') zoomTo(zoom / 1.25, true);
    else if (cmd === 'reset') { zoom = 1; tx = 0; ty = 0; draw(false); }
  };

  // Jump straight to a page (used by the React Native page slider).
  window.__goToPage = function (p) {
    var n = Math.floor(Number(p));
    if (!isFinite(n)) return;
    goToPage(n);
  };

  // ---- Touch gestures: swipe to turn pages, pinch to zoom, drag to pan ------

  function pointOf(touch) {
    var r = viewer.getBoundingClientRect();
    return { x: touch.clientX - r.left, y: touch.clientY - r.top };
  }

  function pinchInfo(e) {
    var a = e.touches[0];
    var b = e.touches[1];
    var dx = a.clientX - b.clientX;
    var dy = a.clientY - b.clientY;
    return {
      dist: Math.max(1, Math.sqrt(dx * dx + dy * dy)),
      mid: pointOf({ clientX: (a.clientX + b.clientX) / 2, clientY: (a.clientY + b.clientY) / 2 })
    };
  }

  function onTouchStart(e) {
    if (e.touches.length === 2) {
      var info = pinchInfo(e);
      gesture = {
        type: 'pinch',
        startDist: info.dist,
        startZoom: zoom,
        startTx: tx,
        startTy: ty,
        startMid: info.mid,
        preview: zoom,
        changed: false
      };
      if (canvas.classList) canvas.classList.remove('snap');
      e.preventDefault();
    } else if (e.touches.length === 1) {
      var p = pointOf(e.touches[0]);
      gesture = {
        type: 'pending',
        startX: p.x,
        startY: p.y,
        startTx: tx,
        startTy: ty,
        startZoom: zoom,
        dx: 0
      };
      e.preventDefault();
    }
  }

  function onTouchMove(e) {
    if (!gesture) return;

    if (gesture.type === 'pinch') {
      if (e.touches.length < 2) return;
      e.preventDefault();
      var info = pinchInfo(e);
      var z = clamp(gesture.startZoom * (info.dist / gesture.startDist), MIN_ZOOM, MAX_ZOOM);
      var mid = info.mid;
      // Keep the content point that sat under the initial midpoint fixed under
      // the fingers: content = (screen - translate) / scale.
      var cx = (gesture.startMid.x - gesture.startTx) / gesture.startZoom;
      var cy = (gesture.startMid.y - gesture.startTy) / gesture.startZoom;
      var nx = mid.x - cx * z;
      var ny = mid.y - cy * z;
      var vw = viewer.clientWidth;
      var vh = viewer.clientHeight;
      var cw = baseW * z;
      var ch = baseH * z;
      if (cw <= vw) nx = (vw - cw) / 2; else nx = clamp(nx, vw - cw, 0);
      if (ch <= vh) ny = (vh - ch) / 2; else ny = clamp(ny, vh - ch, 0);
      tx = nx;
      ty = ny;
      gesture.preview = z;
      gesture.changed = gesture.changed || Math.abs(z - gesture.startZoom) > 0.01;
      applyTransform(z, nx, ny);
      return;
    }

    if (e.touches.length !== 1) return;
    e.preventDefault();
    var pt = pointOf(e.touches[0]);
    var dx = pt.x - gesture.startX;
    var dy = pt.y - gesture.startY;

    if (gesture.type === 'pending') {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      if (gesture.startZoom <= 1.02 && Math.abs(dx) > Math.abs(dy)) {
        gesture.type = 'swipe';
      } else {
        gesture.type = 'pan';
      }
    }

    if (gesture.type === 'swipe') {
      // Follow the finger horizontally, with resistance past the first/last page.
      var atStart = pageNum <= 1 && dx > 0;
      var atEnd = pageNum >= maxPages && dx < 0;
      var offset = (atStart || atEnd) ? dx * 0.35 : dx;
      gesture.dx = dx;
      applyTransform(zoom, gesture.startTx + offset, ty);
      return;
    }

    // pan: vertical at fit width, both axes while zoomed in
    var ntx = gesture.startTx + dx;
    var nty = gesture.startTy + dy;
    var vw2 = viewer.clientWidth;
    var vh2 = viewer.clientHeight;
    var cw2 = baseW * zoom;
    var ch2 = baseH * zoom;
    if (cw2 <= vw2) ntx = (vw2 - cw2) / 2; else ntx = clamp(ntx, vw2 - cw2, 0);
    if (ch2 <= vh2) nty = (vh2 - ch2) / 2; else nty = clamp(nty, vh2 - ch2, 0);
    tx = ntx;
    ty = nty;
    applyTransform(zoom, ntx, nty);
  }

  function snapBack() {
    if (canvas.classList) canvas.classList.add('snap');
    // Force a reflow so the transition is registered before we change the
    // transform; otherwise the class and the new value are applied together
    // and the browser skips the animation.
    void canvas.offsetWidth;
    clampPan();
    applyTransform(zoom, tx, ty);
    setTimeout(function () { if (canvas.classList) canvas.classList.remove('snap'); }, 220);
  }

  function onTouchEnd(e) {
    if (!gesture) return;
    var g = gesture;

    if (g.type === 'pinch') {
      if (e.touches.length > 0) return; // wait until every finger is lifted
      gesture = null;
      zoom = clamp(g.preview, MIN_ZOOM, MAX_ZOOM);
      clampPan();
      // Re-render at the new resolution so zoomed text is crisp.
      draw(true);
      return;
    }

    gesture = null;

    if (g.type === 'swipe') {
      var dx = g.dx || 0;
      var turned = false;
      if (dx <= -SWIPE_THRESHOLD) {
        turned = goToPage(pageNum + 1);
      } else if (dx >= SWIPE_THRESHOLD) {
        turned = goToPage(pageNum - 1);
      }
      // If the swipe was too short, or there is no page left in that direction,
      // animate the page back to rest instead of leaving it hanging offset.
      if (!turned) snapBack();
      return;
    }

    if (g.type === 'pan') {
      clampPan();
      applyTransform(zoom, tx, ty);
    }
  }

  function onTouchCancel() {
    if (!gesture) return;
    var g = gesture;
    gesture = null;
    if (g.type === 'pinch') {
      zoom = clamp(g.preview, MIN_ZOOM, MAX_ZOOM);
      clampPan();
      draw(true);
    } else {
      snapBack();
    }
  }

  viewer.addEventListener('touchstart', onTouchStart, { passive: false });
  viewer.addEventListener('touchmove', onTouchMove, { passive: false });
  viewer.addEventListener('touchend', onTouchEnd, { passive: false });
  viewer.addEventListener('touchcancel', onTouchCancel, { passive: false });

  // Block iOS' native pinch/gesture zoom; we handle zooming ourselves.
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); }, { passive: false });
  document.addEventListener('gesturechange', function (e) { e.preventDefault(); }, { passive: false });
  document.addEventListener('gestureend', function (e) { e.preventDefault(); }, { passive: false });

  window.addEventListener('resize', function () {
    if (pdfDoc && !gesture) draw(true);
  });

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
      draw(false);
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
