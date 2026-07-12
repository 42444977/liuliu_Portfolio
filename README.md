# 繪畫作品集網站

純白簡約風格的靜態作品集,無需任何框架或建置工具,可直接部署到 GitHub Pages。

## 檔案結構

```
繪畫作品集/
├── index.html        網站主頁(通常不用動)
├── css/style.css     樣式(顏色、排版)
├── js/works.js       ★ 網站設定+作品清單,更新網站只要改這個檔案
├── js/main.js        功能程式(通常不用動)
└── images/           作品圖片
```

## 如何修改內容(都在 `js/works.js`)

- 筆名:改 `SITE.name`
- 自介:改 `SITE.about` 陣列,每一項是一段文字
- 新增作品:
  1. 把圖片放進 `images/`
  2. 在 `WORKS` 陣列最前面加一行:
     `{ src: "images/新圖.jpg", title: "作品名稱", note: "" },`

## 部署到 GitHub Pages

1. 到 <https://github.com/new> 建立新的 repository(例如取名 `portfolio`),設為 Public
2. 在 repo 頁面點「uploading an existing file」,把這個資料夾裡的**所有檔案和資料夾**(index.html、css、js、images)拖進去,按 Commit changes
3. 進入 repo 的 **Settings → Pages**,Source 選 `Deploy from a branch`,Branch 選 `main` / `(root)`,按 Save
4. 等 1–2 分鐘,網站就會出現在:
   `https://<你的帳號>.github.io/portfolio/`

之後更新作品:在 repo 的 `images/` 上傳新圖 → 編輯 `js/works.js` 加一行即可,存檔後約 1 分鐘自動更新。

> 進階:若熟悉 git,也可以 `git init` 後 push 上去,效果相同。

## 本機預覽

直接雙擊 `index.html` 就能在瀏覽器打開預覽。
