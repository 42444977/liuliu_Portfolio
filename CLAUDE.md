# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概覽

一個純靜態的繪畫作品集網站——純 HTML/CSS/vanilla JS，沒有框架、沒有建置工具、沒有套件管理器。直接部署到 GitHub Pages（repo：`42444977/liuliu_Portfolio`）。直接在瀏覽器打開 `index.html` 即可預覽，沒有 dev server 或建置步驟。

## 架構

內容與行為刻意分離，讓日常更新不需要動到 markup 或邏輯：

- `js/works.js` — **唯一需要為了更新內容而編輯的檔案。** 存放 `SITE`（筆名、副標題、自介文字）與 `WORKS` 陣列（作品項目：`{ src, title, note }`）。新增作品的方式是把圖片放進 `images/`，再把一筆資料加到 `WORKS` 最前面（陣列順序 = 顯示順序，最新的在最前面）。
- `js/main.js` — 渲染引擎。讀取 `works.js` 的 `SITE`/`WORKS` 並填入 DOM：網頁標題/頁首/頁尾、關於區塊、作品牆、燈箱、分享按鈕。作品牆是 JS 分欄的瀑布流（`buildGallery`，依視窗寬度分 3/2/1 欄、round-robin 塞進 `.gallery-col`，resize 時欄數變了才重建）——刻意不用 CSS multi-column，因為它先填滿整欄再換欄，作品一多順序不符直覺。燈箱支援上一張/下一張/Esc/手機左右滑動/張數指示，關閉走 history 機制（開啟時 `pushState`，實際關閉只在 `popstate` handler 做，讓手機返回鍵關燈箱而非離開網站）。頁面載入後會逐張背景預載原圖（`preloadCache`），點開燈箱若原圖已就緒直接顯示，否則縮圖模糊頂著、原圖載完淡入。這個檔案是設定驅動的，本身沒有任何內容。
- `index.html` — 靜態外殼，內含空的掛載點（`#works`、`#aboutText`、`#lightbox`），由 `main.js` 在載入時填入內容。腳本依序載入：`works.js` 要在 `main.js` 之前，因為 `main.js` 在載入時會同步讀取全域變數 `SITE`/`WORKS`（沒有 modules/bundler）。**例外**：`<head>` 裡的 Open Graph 分享預覽標籤是全站唯一寫死筆名與圖片網址的地方——爬蟲不執行 JS，無法從 `works.js` 讀，換預覽圖直接改 `og:image` 那行。
- `css/style.css` — 所有樣式都由 `:root` 中集中定義的 CSS 自訂屬性驅動（`--ink`、`--gray`、`--line`、`--bg`）。作品牆欄位分配在 `main.js`（斷點 900px/560px 寫在 JS 的 `colCountFor`），CSS 只負責 `.gallery` flex 容器與欄內外觀。燈箱用 opacity/visibility 過場（不是 display 切換），作品圖載入完成才由 `.is-loaded` 淡入。
- `images/` — `works.js` 裡 `src` 路徑指向的作品圖檔，以及 favicon 的來源/衍生檔（`favicon.png`，從另一個 logo 素材裁切置中而成）。
- `images/thumb/` — 對應原圖的縮圖版本（檔名相同，`ffmpeg -vf "scale=700:700:force_original_aspect_ratio=decrease" -q:v 4`）。作品牆與燈箱都先載入這個版本，`main.js` 的 `useThumbWithFallback` 找不到縮圖時會自動退回原圖。新增作品時建議也補一張縮圖，沒補也不會壞，只是那張圖沒有加速效果。

## 開發慣例

- 不要把內容（筆名、自介文字、作品標題）寫死在 `index.html` 或 `main.js` 裡——這些都應該放在 `js/works.js`。
- `main.js` 不應包含屬於 `SITE`/`WORKS` 的字面字串；它應該保持純機械性（DOM 建構 + 燈箱狀態管理）。
- 沒有測試套件、linter、或建置/部署指令——「部署」就只是 `git push` 到 `main`，GitHub Pages 會直接提供服務。
