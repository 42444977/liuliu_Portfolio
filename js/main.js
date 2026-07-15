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

/* ---- 聯絡方式 ---- */
if (SITE.contact && SITE.contact.length) {
  const list = document.createElement("ul");
  list.className = "about-contact";
  SITE.contact.forEach(function (c) {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.className = "contact-label";
    label.textContent = c.label;
    li.appendChild(label);
    let value;
    if (c.href) {
      value = document.createElement("a");
      value.href = c.href;
      value.target = "_blank";
      value.rel = "noopener";
    } else {
      value = document.createElement("span");
    }
    value.textContent = c.value;
    li.appendChild(value);
    list.appendChild(li);
  });
  aboutEl.appendChild(list);
}

/* ---- 分享按鈕:手機用系統分享面板,桌機退回複製連結 ---- */
const shareBtn = document.getElementById("shareBtn");
shareBtn.addEventListener("click", function () {
  if (navigator.share) {
    navigator.share({ title: document.title, url: location.href }).catch(function () {});
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(location.href).then(function () {
      shareBtn.textContent = "已複製連結";
      setTimeout(function () { shareBtn.textContent = "分享"; }, 1600);
    }).catch(function () {});
  }
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

/* ---- 作品牆:JS 分欄的瀑布流,作品順序由左至右逐列排 ----
   (改用 JS 而不是 CSS multi-column,是因為 multi-column 會先填滿
   整欄再換欄,作品一多順序就不符直覺) */
const gallery = document.getElementById("works");
let galleryCols = 0;

function colCountFor() {
  if (window.innerWidth <= 560) return 1;
  if (window.innerWidth <= 900) return 2;
  return 3;
}

function buildGallery() {
  const n = colCountFor();
  if (n === galleryCols) return;
  galleryCols = n;

  gallery.innerHTML = "";
  const cols = [];
  for (let c = 0; c < n; c++) {
    const col = document.createElement("div");
    col.className = "gallery-col";
    gallery.appendChild(col);
    cols.push(col);
  }

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

    /* 載入完成才淡入(重建版面時已快取的圖會直接顯示) */
    function markLoaded() { img.classList.add("is-loaded"); }
    if (img.complete && img.naturalWidth > 0) {
      markLoaded();
    } else {
      img.addEventListener("load", markLoaded);
      img.addEventListener("error", markLoaded);
    }

    const cap = document.createElement("figcaption");
    cap.textContent = w.title;

    fig.appendChild(img);
    fig.appendChild(cap);
    btn.appendChild(fig);
    btn.addEventListener("click", function () { openLightbox(i); });
    cols[i % n].appendChild(btn);
  });
}

buildGallery();
window.addEventListener("resize", buildGallery);

/* ---- 燈箱 ---- */
const lightbox = document.getElementById("lightbox");
const lbImage = document.getElementById("lbImage");
const lbCaption = document.getElementById("lbCaption");
const lbCounter = document.getElementById("lbCounter");
let current = 0;

function openLightbox(i) {
  current = i;
  render();
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  /* 塞一筆歷史紀錄,讓手機返回鍵是「關燈箱」而不是「離開網站」 */
  history.pushState({ lightbox: true }, "");
}

/* 實際關閉動作只在 popstate 裡做,按鈕/Esc/返回鍵最後都走同一條路 */
function doClose() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function closeLightbox() { history.back(); }

window.addEventListener("popstate", function () {
  if (lightbox.classList.contains("open")) doClose();
});

function render() {
  const w = WORKS[current];
  lbImage.alt = w.title;
  lbCaption.textContent = w.title + (w.note ? "　·　" + w.note : "");
  lbCounter.textContent = (current + 1) + " / " + WORKS.length;

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
  if (fullImg.complete) {
    /* 已載完卻不可用 = 原圖載入失敗(如 404),放棄替換、解除模糊 */
    lbImage.classList.remove("is-loading");
    return;
  }
  fullImg.addEventListener("load", function () {
    if (WORKS[current] !== w) return;
    lbImage.onerror = null;
    lbImage.src = w.src;
    lbImage.classList.remove("is-loading");
  }, { once: true });
  fullImg.addEventListener("error", function () {
    if (WORKS[current] !== w) return;
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
  /* 剛完成滑動手勢的話,忽略隨之而來的 click,避免滑一下卻把燈箱關了 */
  if (justSwiped) { justSwiped = false; return; }
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", function (e) {
  if (!lightbox.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
});

/* ---- 手機左右滑動切換 ---- */
let touchX = null, touchY = null;
let justSwiped = false;
lightbox.addEventListener("touchstart", function (e) {
  touchX = e.touches[0].clientX;
  touchY = e.touches[0].clientY;
}, { passive: true });

lightbox.addEventListener("touchend", function (e) {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  const dy = e.changedTouches[0].clientY - touchY;
  touchX = touchY = null;
  /* 水平位移要夠大、且明顯大於垂直位移,才視為滑動切換 */
  if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    justSwiped = true;
    step(dx < 0 ? 1 : -1);
  }
}, { passive: true });
