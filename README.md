# 繪畫作品集網站

純白簡約風格的靜態作品集

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
