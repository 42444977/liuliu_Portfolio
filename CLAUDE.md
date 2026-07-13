# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概覽

一個純靜態的繪畫作品集網站——純 HTML/CSS/vanilla JS，沒有框架、沒有建置工具、沒有套件管理器。直接部署到 GitHub Pages（repo：`42444977/liuliu_Portfolio`）。直接在瀏覽器打開 `index.html` 即可預覽，沒有 dev server 或建置步驟。

## 架構

內容與行為刻意分離，讓日常更新不需要動到 markup 或邏輯：

- `js/works.js` — **唯一需要為了更新內容而編輯的檔案。** 存放 `SITE`（筆名、副標題、自介文字）與 `WORKS` 陣列（作品項目：`{ src, title, note }`）。新增作品的方式是把圖片放進 `images/`，再把一筆資料加到 `WORKS` 最前面（陣列順序 = 顯示順序，最新的在最前面）。
- `js/main.js` — 渲染引擎。讀取 `works.js` 的 `SITE`/`WORKS` 並填入 DOM：網頁標題/頁首/頁尾、關於區塊、瀑布流作品牆（`.work` 按鈕包著 `<figure>`），以及可點擊開啟、支援上一張/下一張/Esc 的燈箱（`openLightbox`/`closeLightbox`/`step`/`render`）。這個檔案是設定驅動的，本身沒有任何內容，通常不需要修改。
- `index.html` — 靜態外殼，內含空的掛載點（`#works`、`#aboutText`、`#lightbox`），由 `main.js` 在載入時填入內容。腳本依序載入：`works.js` 要在 `main.js` 之前，因為 `main.js` 在載入時會同步讀取全域變數 `SITE`/`WORKS`（沒有 modules/bundler）。
- `css/style.css` — 所有樣式都由 `:root` 中集中定義的 CSS 自訂屬性驅動（`--ink`、`--gray`、`--line`、`--bg`）。作品牆是用 CSS 多欄（multi-column）做瀑布流排版（`column-count`，在 900px/560px 有響應式斷點），不是用 CSS grid 或 JS 排版。
- `images/` — `works.js` 裡 `src` 路徑指向的作品圖檔，以及 favicon 的來源/衍生檔（`favicon.png`，從另一個 logo 素材裁切置中而成）。

## 開發慣例

- 不要把內容（筆名、自介文字、作品標題）寫死在 `index.html` 或 `main.js` 裡——這些都應該放在 `js/works.js`。
- `main.js` 不應包含屬於 `SITE`/`WORKS` 的字面字串；它應該保持純機械性（DOM 建構 + 燈箱狀態管理）。
- 沒有測試套件、linter、或建置/部署指令——「部署」就只是 `git push` 到 `main`，GitHub Pages 會直接提供服務。
