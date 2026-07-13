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

/* ---- 背景預載原圖:縮圖捲動到畫面附近時,悄悄把原圖抓進瀏覽器快取,
   等使用者真的點下去時燈箱就能直接秒開清晰圖 ---- */
const preloadedSrcs = new Set();
function preloadFull(src) {
  if (preloadedSrcs.has(src)) return;
  preloadedSrcs.add(src);
  const img = new Image();
  img.fetchPriority = "low";
  img.src = src;
}

const preloadObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        preloadFull(entry.target.dataset.fullSrc);
        obs.unobserve(entry.target);
      });
    }, { rootMargin: "600px 0px" })
  : null;

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
  btn.dataset.fullSrc = w.src;
  btn.addEventListener("click", function () { openLightbox(i); });
  gallery.appendChild(btn);

  if (preloadObserver) preloadObserver.observe(btn);
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

  /* 先顯示縮圖(通常已從作品牆快取),原圖載完再淡入替換 */
  lbImage.classList.add("is-loading");
  useThumbWithFallback(lbImage, w.src);

  const fullImg = new Image();
  fullImg.onload = function () {
    if (WORKS[current] !== w) return;
    lbImage.src = w.src;
    lbImage.classList.remove("is-loading");
  };
  fullImg.src = w.src;

  /* 預載上一張/下一張,連續按 prev/next 也不用等 */
  preloadFull(WORKS[(current + 1) % WORKS.length].src);
  preloadFull(WORKS[(current - 1 + WORKS.length) % WORKS.length].src);
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
