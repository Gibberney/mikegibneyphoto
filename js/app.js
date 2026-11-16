/* ==========================================================================
   app.js — single-page gallery.
   Reads window.PHOTOS (from galleries/manifest.js), builds the thumbnail grid,
   drives the left-hand viewer, and the fullscreen expand.
   ========================================================================== */
(function () {
  var photos = window.PHOTOS || [];
  var thumbs = document.getElementById("thumbs");
  var vImg = document.getElementById("viewer-img");
  var vTitle = document.getElementById("viewer-title");
  var vCap = document.getElementById("viewer-caption");
  var expandBtn = document.getElementById("expand-btn");

  var fs = document.getElementById("fullscreen");
  var fsImg = document.getElementById("fs-img");
  var fsClose = document.getElementById("fs-close");
  var fsPrev = document.getElementById("fs-prev");
  var fsNext = document.getElementById("fs-next");

  if (!photos.length) {
    if (thumbs) thumbs.innerHTML =
      '<p style="grid-column:1/-1;color:#8c8a86;padding:2rem;font-size:.9rem">' +
      'No photos yet. Add images to the <code>photography/</code> folder and run ' +
      '<code>python3 tools/process-photos.py</code>.</p>';
    return;
  }

  var current = 0;

  // ----- Build thumbnail grid -------------------------------------------
  var frag = document.createDocumentFragment();
  photos.forEach(function (p, i) {
    var d = document.createElement("div");
    d.className = "thumb";
    d.setAttribute("data-index", i);
    d.setAttribute("role", "button");
    d.setAttribute("tabindex", "0");
    d.setAttribute("aria-label", p.title || "Photograph " + (i + 1));
    d.style.setProperty("--ar", (p.w && p.h ? p.w / p.h : 1.5).toFixed(4));
    var img = document.createElement("img");
    img.src = p.thumb;
    img.alt = p.title || "";
    img.loading = i < 10 ? "eager" : "lazy";
    d.appendChild(img);
    frag.appendChild(d);
  });
  var end = document.createElement("a");
  end.className = "thumbs-end";
  end.href = "#about";
  end.innerHTML = "<span>About &amp; Contact</span><span class=\"chev\"></span>";
  frag.appendChild(end);
  thumbs.appendChild(frag);
  var thumbEls = thumbs.querySelectorAll(".thumb");

  // ----- Pack thumbnails into full-width rows (no lone photo on the last row)
  var TARGET_H = 88, GAP = 8;
  function packThumbs() {
    var els = Array.prototype.slice.call(thumbEls);
    if (window.matchMedia("(max-width: 900px)").matches) {
      els.forEach(function (el) { el.style.width = ""; el.style.height = ""; });
      return;
    }
    var W = thumbs.clientWidth - 2 * GAP;
    var ar = function (el) { return parseFloat(el.style.getPropertyValue("--ar")) || 1.5; };
    var rows = [], cur = [], sum = 0;
    els.forEach(function (el) {
      cur.push(el); sum += ar(el);
      if (sum * TARGET_H + (cur.length - 1) * GAP >= W) { rows.push(cur); cur = []; sum = 0; }
    });
    if (cur.length) {
      if (cur.length === 1 && rows.length) rows[rows.length - 1].push(cur[0]);
      else rows.push(cur);
    }
    rows.forEach(function (row) {
      var s = row.reduce(function (a, el) { return a + ar(el); }, 0);
      var h = (W - (row.length - 1) * GAP) / s;
      row.forEach(function (el) {
        el.style.height = h.toFixed(2) + "px";
        el.style.width = (Math.floor(ar(el) * h * 100) / 100 - 0.01).toFixed(2) + "px";
      });
    });
  }
  packThumbs();
  var packTimer;
  window.addEventListener("resize", function () { clearTimeout(packTimer); packTimer = setTimeout(packThumbs, 120); });

  // ----- Viewer ----------------------------------------------------------
  function select(i, scrollIntoView) {
    current = (i + photos.length) % photos.length;
    var p = photos[current];
    vImg.classList.remove("loaded");
    var pre = new Image();
    pre.onload = function () { vImg.src = p.src; vImg.alt = p.title || ""; vImg.classList.add("loaded"); };
    pre.src = p.src;
    // fallback in case it's cached and onload is instant
    vImg.src = p.src; vImg.alt = p.title || "";
    requestAnimationFrame(function () { vImg.classList.add("loaded"); });

    vTitle.textContent = p.title || "";
    vCap.textContent = p.caption || "";

    thumbEls.forEach(function (el, idx) {
      el.classList.toggle("active", idx === current);
      if (idx === current) el.setAttribute("aria-current", "true");
      else el.removeAttribute("aria-current");
    });
    if (scrollIntoView && thumbEls[current]) {
      thumbEls[current].scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
    if (fs.classList.contains("open")) fsImg.src = p.src;
  }

  thumbs.addEventListener("click", function (e) {
    var t = e.target.closest(".thumb");
    if (t) select(+t.getAttribute("data-index"));
  });
  thumbs.addEventListener("keydown", function (e) {
    var t = e.target.closest(".thumb");
    if (t && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); select(+t.getAttribute("data-index")); }
  });

  // ----- Fullscreen ------------------------------------------------------
  function openFS() {
    fsImg.src = photos[current].src;
    fsImg.alt = photos[current].title || "";
    fs.classList.add("open");
    fs.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeFS() {
    fs.classList.remove("open");
    fs.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  expandBtn.addEventListener("click", openFS);
  vImg.addEventListener("click", openFS);
  fsClose.addEventListener("click", function (e) { e.stopPropagation(); closeFS(); });
  fsPrev.addEventListener("click", function (e) { e.stopPropagation(); select(current - 1, true); });
  fsNext.addEventListener("click", function (e) { e.stopPropagation(); select(current + 1, true); });
  fs.addEventListener("click", closeFS); // click anywhere out

  document.addEventListener("keydown", function (e) {
    if (fs.classList.contains("open")) {
      if (e.key === "Escape") closeFS();
      if (e.key === "ArrowLeft") select(current - 1, true);
      if (e.key === "ArrowRight") select(current + 1, true);
    } else if (document.activeElement && document.activeElement.closest(".thumbs")) {
      if (e.key === "ArrowRight") { e.preventDefault(); select(current + 1, true); }
      if (e.key === "ArrowLeft") { e.preventDefault(); select(current - 1, true); }
    }
  });

  // ----- Splash + About portrait ----------------------------------------
  var splash = document.getElementById("splash-img");
  if (splash && window.SITE && window.SITE.splash) {
    splash.addEventListener("load", function () { splash.classList.add("loaded"); });
    splash.src = window.SITE.splash;
    splash.alt = "Mike Gibney Photography";
    if (splash.complete) splash.classList.add("loaded");
  }
  var portrait = document.getElementById("about-portrait");
  if (portrait && window.SITE && window.SITE.portrait) portrait.src = window.SITE.portrait;

  // Start on the first photo
  select(0);
})();
