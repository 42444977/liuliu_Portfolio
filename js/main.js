/* 讀取 js/works.js 的設定,渲染整個網站。一般情況不需要改這個檔案。 */

/* ---- 套用網站名稱 ---- */
document.title = SITE.name + "｜作品集";
document.getElementById("siteName").textContent = SITE.name;
document.getElementById("siteSubtitle").textContent = SITE.subtitle;
document.getElementById("footerText").textContent =
  "© " + new Date().getFullYear() + " " + SITE.name;

/* ---- 關於作者 ---- */
const aboutEl = document.getElementById("aboutText");
SITE.about.forEach(function (line) {
  const p = document.createElement("p");
  p.textContent = line;
  aboutEl.appendChild(p);
});

/* ---- 圖片載入輔助:縮圖路徑 + 找不到縮圖時退回原圖 ---- */
function thumbSrcOf(src) {
  return src.replace("images/", "images/thumb/");
}

function useThumbWithFallback(img, src) {
  img.src = thumbSrcOf(src);
  img.onerror = function () {
    img.onerror = null;
    img.src = src;
  };
}

/* ---- 背景預載原圖:頁面(縮圖)載完後,依作品順序逐張把原圖抓進快取,
   點開燈箱時若原圖已載好就直接顯示清晰圖,完全不用等 ---- */
const preloadCache = new Map(); // src -> Image
function preloadFull(src) {
  let img = preloadCache.get(src);
  if (!img) {
    img = new Image();
    img.src = src;
    preloadCache.set(src, img);
  }
  return img;
}

function isFullReady(src) {
  const img = preloadCache.get(src);
  return !!(img && img.complete && img.naturalWidth > 0);
}

window.addEventListener("load", function () {
  /* 一張載完再載下一張,避免同時搶頻寬 */
  let queue = WORKS.map(function (w) { return w.src; });
  (function next() {
    const src = queue.shift();
    if (!src) return;
    const img = preloadFull(src);
    if (img.complete) { next(); return; }
    img.addEventListener("load", next);
    img.addEventListener("error", next);
  })();
});

/* ---- 作品牆 ---- */
const gallery = document.getElementById("works");

WORKS.forEach(function (w, i) {
  const btn = document.createElement("button");
  btn.className = "work";
  btn.setAttribute("aria-label", "放大檢視:" + w.title);

  const fig = document.createElement("figure");
  const img = document.createElement("img");
  useThumbWithFallback(img, w.src);
  img.alt = w.title;
  img.loading = "lazy";
  img.decoding = "async";

  const cap = document.createElement("figcaption");
  cap.textContent = w.title;

  fig.appendChild(img);
  fig.appendChild(cap);
  btn.appendChild(fig);
  btn.addEventListener("click", function () { openLightbox(i); });
  gallery.appendChild(btn);
});

/* ---- 燈箱 ---- */
const lightbox = document.getElementById("lightbox");
const lbImage = document.getElementById("lbImage");
const lbCaption = document.getElementById("lbCaption");
let current = 0;

function openLightbox(i) {
  current = i;
  render();
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function render() {
  const w = WORKS[current];
  lbImage.alt = w.title;
  lbCaption.textContent = w.title + (w.note ? "　·　" + w.note : "");

  /* 原圖已在快取:直接顯示清晰圖,跳過縮圖與模糊過場 */
  if (isFullReady(w.src)) {
    lbImage.onerror = null;
    lbImage.classList.remove("is-loading");
    lbImage.src = w.src;
    return;
  }

  /* 原圖還沒好:先顯示縮圖(通常已從作品牆快取),原圖載完再淡入替換 */
  lbImage.classList.add("is-loading");
  useThumbWithFallback(lbImage, w.src);

  const fullImg = preloadFull(w.src);
  fullImg.addEventListener("load", function () {
    if (WORKS[current] !== w) return;
    lbImage.onerror = null;
    lbImage.src = w.src;
    lbImage.classList.remove("is-loading");
  }, { once: true });
}

function step(dir) {
  current = (current + dir + WORKS.length) % WORKS.length;
  render();
}

document.getElementById("lbClose").addEventListener("click", closeLightbox);
document.getElementById("lbPrev").addEventListener("click", function () { step(-1); });
document.getElementById("lbNext").addEventListener("click", function () { step(1); });

lightbox.addEventListener("click", function (e) {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", function (e) {
  if (!lightbox.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
});
