/* ============================================================
   網站設定檔 —— 只需要改這個檔案就能更新網站內容
   ============================================================ */

/* 網站名稱(筆名)與副標題 */
const SITE = {
  name: "卯柳",                       // ← 筆名
  subtitle: "Illustration Portfolio", // 副標題,可改成中文或留空 ""
  about: [
    "尼們好我是卯柳 我喜歡打遊戲吃餅乾 湊蟑螂衝擊！！",
  ],
  /* 聯絡方式:有 href 會變成可點的連結,沒有就純文字 */
  contact: [
    { label: "IG",      value: "mao_liu_",    href: "https://www.instagram.com/mao_liu_" },
    { label: "LINE ID", value: "11225200620" },
  ],
};

/* ============================================================
   作品清單 —— 新增作品的步驟:
   1. 把圖片放進 images/ 資料夾
   2. 在下面陣列「最前面」加一筆資料(最前面 = 顯示在最上面)
   格式: { src: "images/檔名.jpg", title: "作品名稱", note: "備註(可省略)" }
   ============================================================ */
const WORKS = [
  { src: "images/draft_1.jpg", title: "稿件_1",  note: "" },
  { src: "images/work_1.jpg",  title: "作品_1",  note: "" },
  { src: "images/copy_1.jpg",  title: "臨摹_1",  note: "" },
  { src: "images/copy_2.jpg",  title: "臨摹_2",  note: "" },
  { src: "images/copy_3.jpg",  title: "臨摹_3",  note: "" },
];
