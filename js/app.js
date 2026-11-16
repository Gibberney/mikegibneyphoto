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
    var img = document.createElement("img");
    img.src = p.thumb;
    img.alt = p.title || "";
    img.loading = i < 10 ? "eager" : "lazy";
    d.appendChild(img);
    frag.appendChild(d);
  });
  thumbs.appendChild(frag);
  var thumbEls = thumbs.querySelectorAll(".thumb");

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
