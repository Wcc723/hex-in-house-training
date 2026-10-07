# 互動式簡報開發指南

六角學院內部教育訓練用的互動式簡報。固定 1920×1080 的 16:9 舞台、Playground 貼紙風（奶油色點陣紙 + 墨紫粗描邊 + 硬邊陰影 + 糖果色 pop 填色 + 六角形徽章），內容以**內嵌互動範例**為主，程式碼是需要時才叫出來的配角。

---

## 專案結構

```
src/
├── styles/
│   ├── theme.css            # 色票與字體（全站唯一色彩來源）
│   └── index.css            # 入口，@import tailwindcss + theme
├── stage/
│   └── Stage.tsx            # 1920×1080 舞台，等比縮放置中
├── types/slide.ts           # SlideBody / Step 型別
├── template/
│   └── SlideTemplate.tsx    # 主版型：鍵盤操作、網址同步、頁首頁尾
├── components/
│   ├── SlideBodyView.tsx    # 依 SlideBody.kind 分派到各版型
│   ├── SlideHeader.tsx
│   ├── NavigationControls.tsx
│   ├── MenuButton.tsx
│   ├── CodeBlock.tsx / CodeTabs.tsx / codeTheme.ts
│   ├── HexBadge.tsx         # 六角形徽章（頁碼、條列號碼、區塊標題）
│   └── Asset.tsx            # 取用貼紙素材
├── assets/
│   ├── manifest.ts          # 素材目錄（id 有型別提示）
│   └── img/*.webp           # 素材本體（Codex Image 產的貼紙，512×512 透明底）
├── data/courses.ts          # 首頁與選單的課程清單
├── pages/Home.tsx
├── showcase/版型示範/        # ★ 參考標準，開新課程從這裡複製
└── 內部教育訓練/Cloudflare 入門/  # 內部教育訓練：Cloudflare 入門（24 頁）
```

每一份簡報固定四個檔案：

| 檔案 | 內容 |
| --- | --- |
| `slides.ts` | 簡報資料（標題、步驟、版型） |
| `demos.tsx` | 互動範例元件 |
| `diagrams.tsx` | SVG 圖解 |
| `index.tsx` | 套上 `SlideTemplate` 的入口 |

---

## 核心型別

```ts
interface Step {
  id: string;            // 唯一識別碼，也是切換動畫的 key
  title: string;         // 頁首顯示的步驟名稱
  description?: string;  // 內容區上方的導言
  body: SlideBody;       // 這一頁的版型與內容
}
```

`SlideBody` 有九種，其中 `split` 可以遞迴組合：

| kind | 用途 | 主要欄位 |
| --- | --- | --- |
| `title` | 章節封面 | `kicker` `heading` `lead` `assetId` `image` |
| `demo` | 內嵌 React 互動範例（主力） | `render` `caption` `bare` |
| `html` | 內嵌原生 HTML/CSS/JS，跑在 sandbox iframe | `html` `css` `caption` |
| `diagram` | 手繪 SVG 圖解 | `render` `caption` |
| `code` | 程式碼，多筆自動變分頁 | `blocks` |
| `points` | 重點條列 | `heading` `items` |
| `assets` | 素材展示牆 | `heading` `items` |
| `table` | 表格，儲存格可放外部連結 | `heading` `columns` `rows` `note` |
| `split` | 左右分割，可巢狀 | `left` `right` `ratio` |

`title` 的 `lead` 給陣列就會分成多段；`assetId`（素材庫共用 SVG）與 `image`（這份簡報專用的點陣圖）二選一。
`points` 的項目與 `table` 的儲存格都可以帶 `href`，渲染成新分頁開啟的外部連結。
`table` 的儲存格另外可以帶 `note`，會在主文上方加一行 16px 的 faint 小標（用來標示這一格屬於哪一類），
與 body 層級的 `note`（表格下方的補充說明）不是同一個欄位。

`ratio` 可用 `1:1`、`3:2`、`2:3`、`2:1`、`1:2`，預設 `1:1`。

### 範例

```ts
// 滿版互動範例
{
  id: 'try-it',
  title: '實際體驗',
  description: '試試看：改左邊的輸入框，右邊四個區塊會同時跟上。',
  body: { kind: 'demo', render: SeparationDemo, caption: '資料只有一份' },
}

// 左圖右碼
{
  id: 'explain',
  title: '請求流程',
  body: {
    kind: 'split',
    ratio: '1:1',
    left: { kind: 'diagram', render: RequestFlowDiagram },
    right: { kind: 'code', blocks: [{ language: 'javascript', filename: 'state.js', code: '…' }] },
  },
}
```

---

## 配色

所有顏色定義在 `src/styles/theme.css` 的 `@theme`，Tailwind 會自動產生對應的 utility（`bg-panel`、`text-acid`、`border-line`…）。**不要在元件裡寫死色碼。**

| 分組 | token | 用途 |
| --- | --- | --- |
| 基底 | `ink` `ink-soft` `panel` `panel-lift` `line` `line-soft` `letterbox` | 背景與描邊。`panel` 是純白（像貼紙本身）、`ink` 是奶油紙、`ink-soft` 再深一階；`line` 是墨紫粗描邊，也是硬邊陰影的顏色；`letterbox` 目前跟 `ink` 同值（邊界隱形） |
| 前景 | `paper` `muted` `faint` `on-accent` | 文字的三個層級，加上疊在實心強調色色塊上的白色挖空字 |
| 強調 | `acid` `coral` `teal` `blue` | 主色系，一頁最多用兩個。可以當文字色，也可以當實心色塊配白字 |
| 延伸 | `lime` `sky` `violet` `amber` `danger` | 圖解需要更多可辨識色時 |
| pop | `acid-pop` `coral-pop` … `amber-pop` | 每支強調色的糖果版，**只當不透明的填色**（卡片底、徽章、標籤、表頭），上面壓 `paper` / `muted` |
| 語意 | `ok` `warn` `error` `info` | 狀態優先，改色只改這一段 |
| 角色 | `role-user` `role-client` `role-server` `role-data` | 前後端與資料流圖解共用 |
| 語言 | `lang-html` `lang-css` `lang-javascript` … | CodeTabs 的標籤點 |
| 素材 | `icon-outline` `icon-border` `icon-yellow` … | 貼紙素材生圖時指定的色，僅供對照與補圖時寫 prompt |

另外有三支硬邊陰影 `shadow-pop-sm`（3px，按鈕與標籤）、`shadow-pop`（6px，卡片與面板）、`shadow-pop-lg`（10px，封面主視覺），與 `index.css` 的幾個小工具：`bg-dots`（點陣紙）、`pressable`（按下去會沉的按鈕）、`clip-hex` / `hex-shadow`（六角形）、`marker`（螢光筆底線）。

強調色的 token 名稱是**角色**不是色相：`acid` 是桃紅、`lime` 是草綠。名字沿用早期深色時代是為了不動 `Accent` 型別與各 deck 的既有寫法，選色請看 `theme.css` 註解寫的用途，不要照名字猜顏色。

語意、角色、語言這三組共 14 個 token 都是上面強調色的 `var()` 別名，不是複製的色值 —— 換掉一支強調色，它們會自動跟著換。（`warn` 指向 `amber` 而不是 `acid`：`acid` 已經是 CTA 色，共用會失去語意。）

**pop 色只當底，字交給 `paper`。** pop 色對紙面只有 1.3–1.7:1，拿來當文字等於看不見；反過來 `paper` 壓在任何一支 pop 上都有 ≥9.47:1、`muted` 有 ≥5.47:1。`faint` 與強調色**不要**壓在 pop 上（最低只剩 4.26 與 3.44:1，稽核會擋）。

**低透明度的填色不得單獨承擔語意。** 投影機做不出黑、環境光又會把黑階抬高，淡色填色在教室後排會整片被吃掉。要標示狀態就再加一個不透明的元素 —— `points` 卡片靠左邊的實心六角號碼徽章、`CodeBlock` 的 `highlightLines` 靠 6px 的實心左粗條。程式碼高亮列的填色是 `bg-amber-pop/45`，不能再往上加，再高 `acid` 關鍵字會掉到 4.5 以下。

`theme.css` 用的是 `@theme static`，這是必要的：Tailwind v4 預設只輸出「有被 utility 用到」的變數，但這裡的 token 也會被 SVG 圖解以 `var(--color-*)` 引用、被色票頁即時讀取，少了 `static` 那些變數不會出現在產出的 CSS 裡。

**對比度**：三個文字層級對 `panel` 的對比是 15.81:1 / 9.14:1 / 7.11:1，對最深的表面 `ink-soft` 也還有 13.87 / 8.02 / 6.23；九支強調色對四個表面都 ≥4.94:1，全站文字都通過 WCAG AA。投影與直播壓縮會再吃掉一些對比，所以**不要降低這個差距**，也不要用 `line-soft` 當文字色。

`/showcase/layouts` 的「專案色票」那一頁會即時從 CSS 變數讀出目前的值，改完 `theme.css` 打開那頁就能對照。

---

## 貼紙素材

素材是 Codex Image（`image_gen`）產的點陣貼紙：墨紫粗描邊 `#24203A`、外圍一圈白色裁切邊、糖果色平塗（`#FFD43B` `#FF8FB8` `#74C0FC` `#B197FC` `#FF922B` `#63E6BE`）、主體上有一張小笑臉。512×512 透明底 WebP，每張 25–45 KB；封面吉祥物 `hex-mascot` 是 1024 寬的橫圖。

貼紙自帶白邊與深色描邊，所以奶油紙、白色面板、糖果色底、甚至深色底上都站得住，**不需要底板**。`title` 版型把它放在一塊歪掉的大六角形上，`assets` 版型墊一顆輪替的糖果色圓底。

> 上一版（2026-08）的 12 個 technical-editorial SVG 是奶白線稿、為深底畫的，必須墊 `bg-paper` 深色底板。那批檔案與相關說明收在 `_backup/2026-10-06-before-playful.tar.gz`；現在的貼紙不要再墊深色底板。

新增素材：

1. 用 `.claude/skills/interactive-slide-deck/references/images.md` 的「貼紙素材」配方產圖（帶 `hex-mascot` 或 `frontend-web` 當風格參考），再用 `scripts/sticker.py` 去背、裁切、輸出 WebP
2. 放進 `src/assets/img/<id>.webp`（**檔名就是 id**）
3. 在 `src/assets/manifest.ts` 的 `assets` 補一筆 `{ id, name, purpose, tags }`
4. 用 `<Asset id="<id>" size={220} />` 取用，`id` 會有型別提示

---

## SVG 圖解慣例

- 不畫自己的背景矩形，讓面板的 `bg-panel` 透出來
- 顏色一律寫 `var(--color-*)`，換色票時圖解自動跟著換
- 節點畫成貼紙：pop 填色 + 3px `line` 描邊 + 往右下偏 6px 的實心 `line` 矩形當陰影；節點內的字用 `paper` / `muted`
- 強調色只用在箭頭與箭頭上的標籤：去程 `coral` 實線、回程 `teal` 圓點虛線
- viewBox 用 16:9 附近的比例；放進 `split` 單欄時 820×560 剛好
- 文字最小 16（舞台座標）

參考 `src/showcase/版型示範/diagrams.tsx`。

---

## 舞台與尺寸

`Stage` 固定 1920×1080，用 `transform: scale()` 等比縮放並置中（letterbox）。

因此**所有排版都直接寫舞台像素**，不需要寫 RWD：

```
1080 = 頁首 84 + 內容 920 + 頁尾 76
內容區左右 padding 48、上下 36 → 實際可用約 1824 × 848
```

字級參考：內文 24、次要 19–21、程式碼 20、步驟標題 30、封面大標 92。字體是 Fredoka（標題拉丁字）、Nunito（內文拉丁字）、Huninn（jf 粉圓，中文），從 Google Fonts 載入，離線時退回蘋方。按 `H` 隱藏頁首頁尾時，內容區會擴張到 1008 高。

---

## 簡報操作

| 按鍵 | 動作 |
| --- | --- |
| `→` `↓` `Space` `PageDown` | 下一步 |
| `←` `↑` `PageUp` | 上一步 |
| `Home` / `End` | 第一步 / 最後一步 |
| `F` | 全螢幕 |
| `B` | 黑幕（任意鍵離開） |
| `H` | 隱藏頁首頁尾（滿版） |

- 簡報筆送出的就是 `PageUp` / `PageDown`
- 游標在 `input` / `textarea` 時，方向鍵與空白鍵交還給範例，不會翻頁
- 點過 `html` 版型的 iframe 之後焦點會落在 iframe 裡，父層收不到鍵盤事件。srcDoc 內有一段轉發程式會把翻頁鍵 `postMessage` 回簡報，所以操作過範例還是能直接用鍵盤翻頁
- 目前步驟記在網址 `?s=3`，可以直接跳頁或分享單頁連結
- 頁尾的進度條每一段都可以點擊跳頁
- 翻頁動畫是 CSS（`.slide-enter`）而非 JS 動畫函式庫：元素的基準狀態就是可見的，內容不會因為動畫沒跑完而看不到

---

## 新增一份簡報

1. 複製 `src/showcase/版型示範/` 成 `src/weekN/課程名稱/`
2. 改寫 `slides.ts`、`demos.tsx`、`diagrams.tsx`
3. `index.tsx` 改元件名稱
4. `src/router.tsx` 註冊路由
5. `src/data/courses.ts` 的 `publicCourses` 補一筆（`week` 給週次；不給就會歸在「參考範本」）。
   只給自己看的簡報改放 `internalCourses`，並且路由要註冊在 `internalOnlyRoutes` —— 見下面的〈內部版與對外版〉

---

## 內部版與對外版

同一份程式碼有兩種面貌，由環境變數 `VITE_DECK_MODE` 切換，唯一的判斷點是 `src/env.ts`。

| | internal（內部版） | public（對外版） |
| --- | --- | --- |
| 簡報 | 全部看得到 | `internalCourses` 那幾份整份 tree-shake 掉，連標題字串都不在產物裡 |
| 浮水印 | 不顯示 | 每一頁角落顯示六角學院商標 |
| 何時是這個模式 | `pnpm dev` | `pnpm dev:public`、`pnpm build`、`pnpm preview`、`pnpm deploy:pages` |

`import.meta.env.VITE_DECK_MODE` 是 build 時就被換成字面值的常數，不是執行期判斷，
所以對外版的產物裡內部簡報是「根本沒被打包」而不是「連不到」。三個 .env 檔都要進版控：
少了 `.env` 的那一行，Vite 就換不掉這個變數，整段會退回執行期判斷，內部簡報反而會被打包出去。

要新增一份只給自己看的簡報，兩邊都要動，沒有自動關聯：

- `src/data/courses.ts` 的 `internalCourses`（少一筆＝選單看不到）
- `src/router.tsx` 的 `internalOnlyRoutes`（少一筆＝路由連不上）

`internalCourses` 目前是空的，機制留著等下一份不公開的簡報。〈版型示範〉原本放在那裡，
後來改成公開：它只是版型與色票的參考標準，沒有不能給人看的內容；而且擺在內部版有個
實際的壞處 —— 浮水印只在對外版渲染，內部版永遠看不到，等於整個 repo 沒有任何一頁能
驗證浮水印會不會壓到內容。

⚠️ tree-shaking 還依賴 `package.json` 的 `sideEffects` 宣告。少了它，Rollup 會把 deck 的
`demos.tsx` / `diagrams.tsx` 當成有副作用而整個保留 —— 路由確實連不到，但程式碼還是
進了對外產物（實測 bundle 會多出約 90KB）。

浮水印在 `src/components/Watermark.tsx`，位置改 `WATERMARK_POSITION` 一行即可，
四個角落的座標都已經定義好。它是絕對定位、`pointer-events-none`，
按 `H` 隱藏頁首頁尾時位置不變，按 `B` 黑幕時會被黑幕蓋掉。

### ⚠️ 本地端看到的不等於部署出去的

`pnpm dev` 跑的是內部版，部署出去的不是。兩種模式的差異在平常開發時完全看不到，
所以**發佈前一定要看一次對外版**：

```bash
pnpm dev:public   # 對外版 + 熱更新，開發途中用這個
pnpm preview      # 真正的建置產物，deploy 前用這個
```

三個會安靜出事的地方：

- **新簡報預設是對外的。** 放進 `publicCourses` 就等於發佈出去。只給自己看的簡報
  必須同時放進 `internalCourses` 和 `internalOnlyRoutes`，漏掉任何一邊都不會在本地
  報錯，而是直接上線。
- **`pnpm dev` 永遠看不到浮水印。** demo 如果把右上角塞滿，本地看起來正常，
  只有 `pnpm dev:public`（或 `pnpm preview`）才會疊在一起。
  右上角是量過的：〈版型示範〉10 頁逐頁掃四個角落，撞到內容的元素數是
  右上 0 ／右下 6 ／左下 7 ／左上 9，右上是唯一 0 衝突的角落（細節見 `Watermark.tsx` 的註解）。
  但**新簡報不會自動安全** —— 任何把內容推到右上的版面都要重新確認。
- **從內部簡報 import 東西，會把它整份拉回對外產物。** 移除是靠「沒有任何地方引用到」
  達成的，共用或對外的程式碼只要有一行 `import` 指向 `src/showcase/`，
  隔離就破了，而且 build 依然是綠的看不出來。要用就用複製的。

改 `.env` 不用手動重啟，Vite 偵測到就會自己重啟 dev server。
但 `VITE_*` 的值會被打進前端產物，任何人打開網站都讀得到 ——
這幾個檔案是用來切模式的，不要拿來放密鑰。

---

## 開發指令

```bash
pnpm dev         # 開發伺服器（內部版）
pnpm dev:public  # 開發伺服器（對外版）—— 不用 build 就能看到浮水印與過濾後的選單
pnpm build       # TypeScript 編譯 + Vite 建置（對外版）
pnpm lint        # ESLint
pnpm preview     # 預覽建置產物
pnpm deploy:pages # 建置並發佈到 GitHub Pages（原始儲存庫會被防呆擋下）
```
