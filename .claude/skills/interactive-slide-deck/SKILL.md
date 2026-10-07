---
name: interactive-slide-deck
version: 2026-10-06
description: 在本專案（2026 課程用互動簡報）新增或修改一份互動式教學簡報的完整流程。Trigger 任何「做一份簡報」「新增課程簡報」「加一頁投影片」「Week N 的簡報」「改簡報版型／配色」「產生教學簡報」等需求。涵蓋版型選用、1920×1080 舞台的尺寸預算、色票與對比度硬規則、SVG 圖解慣例、素材取用與 Codex Image 生圖、以及交付前必跑的溢出與對比稽核。
---

# 互動式教學簡報製作流程

本專案是六角學院內部教育訓練用、固定 1920×1080 的 16:9 教學簡報系統，風格是 Playground 貼紙風（奶油點陣紙 + 墨紫粗描邊 + 硬邊陰影 + 糖果色 pop 填色 + 六角形徽章）。內容以**內嵌互動範例**為主，程式碼是需要時才叫出來的配角。

**核心原則：一頁只講一件事，能互動就不要只放圖，能放圖就不要只放字。**

## 適用情境

- 新增一份課程簡報（`src/weekN/課程名稱/`）
- 為既有簡報增修頁面、圖解或互動範例
- 調整版型系統、色票或舞台設定
- 從零重建整套簡報系統（見 `references/rebuild.md`）

## 不適用

- 純文件、部落格文章、README → 直接寫 Markdown
- 需要逐頁自由排版、拖拉定位的簡報 → 用「2026-直播用簡報工具」那套 canvas
- 一次性的臨時展示 → 開個 HTML 檔比較快

## 開工前必讀（依序）

1. `CLAUDE.md` — 專案慣例摘要
2. `docs/readme-presentation.md` — 完整撰寫指南
3. `src/showcase/版型示範/slides.ts` — **參考標準**，九種版型各有一頁實例
4. `src/types/slide.ts` — `SlideBody` 的型別定義就是版型的合約

不要憑印象寫。這套系統的尺寸、色票、版型都是硬規格，猜錯會在最後的稽核階段被打回。

---

## 流程

### Step 1 — 先規劃步驟大綱，不要直接寫 code

列出每一頁的「概念 → 版型」對應，跟使用者確認之後再動手。格式：

```
1. cover        title    課程封面
2. problem      split    圖解（舊做法的問題）+ 程式碼
3. try-it       demo     互動體驗：讓學員自己踩一次坑
4. concept      split    圖解（新做法）+ 程式碼
5. try-it-2     demo     互動體驗：對照組
6. recap        points   重點回顧
```

判斷準則：

- **每一頁只承載一個概念**。講不完就拆成兩頁，不要把版面塞滿。
- **概念 → 體驗 → 概念 → 體驗** 的節奏比「連續五頁講解」有效。
- 只有真的需要逐行讀的程式碼才給 `code` 版型；示意性質的用圖解。
- 開場給 `title`，收尾給 `points`。

版型的完整選用指南見 `references/layouts.md`。

### Step 2 — 從參考標準複製，不要從零開始

```bash
cp -r "src/showcase/版型示範" "src/weekN/課程名稱"
```

一份簡報固定四個檔案：

| 檔案 | 內容 |
| --- | --- |
| `slides.ts` | 簡報資料：標題、步驟、版型 |
| `demos.tsx` | 互動範例元件 |
| `diagrams.tsx` | SVG 圖解 |
| `index.tsx` | 套上 `SlideTemplate` 的入口 |

資料夾用中文課程名稱、路由用英文 kebab-case，這是既有慣例。

### Step 3 — 寫 slides.ts

```ts
import type { Step } from '../../types/slide';

export const slideTitle = '課程名稱';
export const slideSubtitle = 'English Subtitle';   // 可省略

export const steps: Step[] = [
  {
    id: 'unique-id',        // 也是切換動畫的 key，同一份簡報內不可重複
    title: '頁首顯示的步驟名稱',
    description: '內容區上方的導言，一到兩句，可省略',
    body: { kind: 'demo', render: MyDemo, caption: '一句話說明這在示範什麼' },
  },
];
```

`description` 是講者的提詞，也是學員的閱讀線索。寫「試試看：⋯」「注意⋯」這種帶動作的句子，不要重複標題。

### Step 4 — 寫 demos.tsx 與 diagrams.tsx

**互動範例（demos.tsx）**

- 用專案色票的 Tailwind class（`bg-panel` `text-muted` `border-teal/55`），不要寫死色碼
- 字級要撐得起舞台：卡片主文 26–32px、說明 19–22px、標籤 16–17px
- 內容寬度用 `max-w-[1400px]` 之類撐開，不要縮在中間一小塊
- 有輸入框很好（`SlideTemplate` 已處理打字不翻頁）

**SVG 圖解（diagrams.tsx）**

- **不畫背景矩形**，讓面板的 `bg-panel` 透出來
- 顏色一律 `var(--color-*)`，換色票時圖解自動跟著換
- viewBox 用 820×560（放進 `split` 單欄剛好）
- 文字最小 16（viewBox 座標）

完整視覺規則見 `references/visual-rules.md`。

### Step 5 — 需要圖片時

依序考慮：

1. **既有貼紙素材庫** — `src/assets/manifest.ts` 有 20 張 Codex Image 產的貼紙（含封面吉祥物 `hex-mascot` 與一組 Cloudflare 主題），
   用 `<Asset id="api-server" />` 取用。貼紙自帶白邊與墨紫描邊，任何表面都站得住，**不需要底板**
2. **手繪 SVG 圖解** — 流程、關係、對照這類結構性內容，一律手繪，不要生圖
3. **Codex Image** — 素材庫沒有的具象插圖、示意畫面、章節主視覺

Codex Image 的完整流程見 `references/images.md` 的「貼紙素材」。簡言之：
照配方寫 prompt、帶一張既有貼紙當 `-r` 風格參考、畫在純綠 `#00FF00` 上 →
拿 Codex 的**原始檔**跑 `scripts/sticker.py` 去背、裁切、輸出 WebP → 放到落點。落點有兩條路，**預設走第一條**：

- **單一簡報專用的圖** → `src/weekN/課程名稱/images/`，在 `slides.ts` 用 `body.image` 引用，不進 manifest
- **要跨簡報重複使用的素材** → `src/assets/img/<id>.webp`，在 `manifest.ts` 補一筆 metadata，用 `<Asset id="…" />` 取用

⚠ 不要直接用 `codex-image.sh -k` 去背好的檔案：它的 soft matte 會把薄荷色（離純綠只有 216）判成半透明，
勾勾、鏡片在糖果色或深色底上會透出底色。`sticker.py` 改用連通性判斷背景，主體內的綠色系不受影響。

### Step 6 — 註冊

1. `src/router.tsx` 加路由
2. `src/data/courses.ts` 加一筆（給 `week` 就歸在該週；不給就歸在「參考範本」）

### Step 7 — 驗證（不可跳過）

```bash
pnpm lint && pnpm build
```

然後**開瀏覽器實測**。這套系統有兩類問題只有跑起來才看得到：

- **內容溢出**：舞台高度是固定的，多一行字就會被裁掉
- **對比不足**：紙面上的次要文字與低透明度填色很容易低於 WCAG AA

把 `scripts/audit-slides.js` 注入頁面後執行，它會逐頁掃描這兩件事：

```js
// 在瀏覽器 console 或 MCP 的 javascript_tool 內貼上 scripts/audit-slides.js 的內容，然後：
await __slideAudit('#/weekN/my-course', 7);
```

**兩份報告都必須全部通過才算完成。** 溢出的處理順序是：先收緊間距 → 再縮字級 → 最後才拆頁。不要用捲軸解決，簡報不該需要捲動。

---

## 硬規則（違反就是 bug）

| 項目 | 規則 |
| --- | --- |
| 色彩 | 只能用 `src/styles/theme.css` 的 token。元件裡出現 hex 就是錯的 |
| 尺寸 | 直接寫舞台像素（1920×1080 座標），不要寫 RWD |
| 高度預算 | 頁首 84 + 內容 920 + 頁尾 76。內容區扣掉 padding 後實際可用約 1824×848 |
| 對比 | 文字對背景 ≥ 4.5:1（大字 ≥ 3:1）。不要降低 `muted` / `faint` 對背景的對比，不要拿 `line-soft` 當文字色 |
| pop 色 | `*-pop` 只當不透明的填色，上面的字一律 `paper` 或 `muted`。**`faint` 與強調色不要壓在 pop 上**（最低 4.26 / 3.44:1），pop 色也不要當文字色（對紙面只有 1.3–1.7:1） |
| 語意 | **淡色填色不得單獨承擔語意。** 投影機做不出黑、環境光會抬高黑階，淡色填色在教室後排會整片被吃掉。要傳達狀態就再加一個不透明的實心訊號（`points` 卡片的實心六角號碼徽章、`CodeBlock` 的 `highlightLines` 的 6px 左粗條） |
| 陰影 | 只用硬邊位移陰影 `shadow-pop-sm` / `shadow-pop` / `shadow-pop-lg`，不要暈開的柔和陰影。放在 `overflow-auto` 容器裡的卡片，容器要留 `pr-1.5 pb-1.5`，不然陰影會被裁掉 |
| 旋轉 | 歪貼的效果（`-rotate-2`）只用在**不會捲動**的容器裡。`overflow-auto` 裡的旋轉元素會撐出捲動範圍，稽核會報溢出；需要動態感就用 hover 時的 `wiggle` |
| 動畫 | 翻頁用 CSS `.slide-enter`。**不要引入 JS 動畫函式庫**，理由見 `references/rebuild.md` |
| 素材 | 貼紙是點陣 WebP，不要改成 `currentColor` 或重新上色。新貼紙要帶既有貼紙當風格參考產圖，畫風才會是一家 |

## 交付檢查清單

- [ ] `pnpm lint` 與 `pnpm build` 都通過
- [ ] 每一頁都在瀏覽器開過，溢出稽核全部 OK
- [ ] 對比稽核全部通過（含 SVG `fill` 文字）
- [ ] 互動範例真的能操作，不是靜態畫面
- [ ] 鍵盤 `→` `←` `Home` `End` 翻頁正常
- [ ] 路由與 `courses.ts` 都註冊了，首頁與課程選單看得到
- [ ] 沒有在元件裡寫死色碼
- [ ] 若有新增素材，`manifest.ts` 補了 metadata 且 `AssetId` 有型別提示

## 參考文件

| 檔案 | 內容 |
| --- | --- |
| `references/layouts.md` | 九種版型的完整規格、選用決策表、尺寸預算 |
| `references/visual-rules.md` | 色票分組、對比基準、字級、SVG 圖解慣例 |
| `references/images.md` | 素材庫用法、Codex Image 生圖與後製流程 |
| `references/rebuild.md` | 從零重建整套系統的架構決策與**已知陷阱** |
| `scripts/audit-slides.js` | 瀏覽器內的溢出與對比稽核腳本 |
| `scripts/sticker.py` | **貼紙素材用**：Codex 原圖（純綠底）→ 用連通性去背、去綠邊、裁切置中 → WebP |
| `scripts/normalize.py` | 把生成圖吸附回色票並自動裁切置中（上一版 SVG 風格素材用，貼紙不需要） |
| `scripts/plate.py` | 把去背後的標記合成到深色圓角底板。理由不是「簡報是深色」而是**標記本身是奶白線稿**，favicon 會出現在未知背景上（favicon 用） |

---

## 版本

版本以日期定義（`YYYY-MM-DD`）。同一天內若修改多次，加上 24 小時制時間（`YYYY-MM-DD-HHMM`）。
更新時同步修改本檔 frontmatter 的 `version` 與下方紀錄。

### 2026-10-06

- 風格整個換成 **Playground 貼紙風**（六角學院內部教育訓練用）：奶油點陣紙 `#FFF6E3`、墨紫粗描邊 `#231F3A`、
  硬邊位移陰影、糖果色 `*-pop` 填色、六角形徽章（`HexBadge`，頁碼／條列號碼／區塊標題）、
  Fredoka + Nunito + Huninn（jf 粉圓）圓體字、翻頁改成帶一點回彈的 CSS 動畫。token 名稱全部沿用，值換掉；
  新增 `--color-*-pop` 八支、`--shadow-pop-*` 三支，`index.css` 新增 `bg-dots` `pressable` `clip-hex` `hex-shadow` `marker`。
- 12 個 technical-editorial SVG 素材換成 Codex Image 產的點陣貼紙（`src/assets/img/*.webp`），
  另加封面吉祥物 `hex-mascot`（六角小教練）；`manifest.ts` 改 glob `./img/*.webp`。
  貼紙自帶白邊，`SlideBodyView` 拿掉了 `bg-paper` 深色底板。favicon 換成吉祥物頭像。
  舊的 SVG、favicon 與整份改版前原始碼收在 `_backup/2026-10-06-before-playful.tar.gz`。
- 新增 `scripts/sticker.py`：`codex-image.sh -k` 的 soft matte 把薄荷色判成半透明（12 張裡 4 張中），
  改用「跟外圍背景相連」判斷背景，再補一圈白邊 × 綠底混色的去溢色。
- `scripts/audit-slides.js` 的 `parseColor` 改成用 1×1 canvas 換算。`bg-amber-pop/45`、`color-mix()`
  在 computed style 裡是 `oklab(...)` / `color(srgb ...)`，舊版抓前三個數字當 RGB，淡色底全被讀成近黑，
  深字反而被判成 1.x:1 不合格。

### 2026-08-15

- `--color-letterbox` 改成跟 `--color-ink` 同值（淨白米 `#F4F1E8`），舞台邊界隱形。
  原本放深色是為了避免「翻淺之後上下多出兩條亮帶」，實際看過之後決定不要那兩條——
  深色框反而把 16:9 的邊界畫得很明顯。token 仍然分開，以便單獨調整。
- 〈版型示範〉從 `internalCourses` 改到 `publicCourses`。它只是版型與色票的參考標準，
  沒有不能公開的內容；而擺在內部版有個實際壞處——浮水印只在對外版渲染，
  等於整個 repo 沒有任何一頁能驗證浮水印會不會壓到內容。
  雙模式機制原封不動保留，`internalCourses` 與 `internalOnlyRoutes` 現在是空的。
- 浮水印的位置第一次在這個 repo 量到：`pnpm dev:public` 下逐頁掃四個角落，
  撞到內容的元素數是右上 0 ／右下 6 ／左下 7 ／左上 9。右上維持不變。
- `scripts/normalize.py` 新增 `LIGHT_TOKENS` 與 `--light` 旗標，支援產「紙面素材」
  （深墨線稿 + 紙色填色，不需要底板）。`references/images.md` 補上兩條路線的決策表、
  prompt 寫法差異，以及淺色版特有的兩個陷阱：亮色像素會被吸成紙白（實測亮黃綠會落在
  紙色而不是 lime，圖形整個消失）、以及 opacity 要往上調而不是往下調（附換算表）。

### 2026-08-14-2240

- 色票由深色改為 technical-editorial light（淨白米紙面 `#F4F1E8` + 墨色文字 `#211F19`）。
  token 名稱維持不變但改成「角色」語意：`acid` 現在是品紅、`lime` 是松綠。
  新增 `--color-letterbox`（投影舞台外框）與 `--color-on-accent`（實心強調色上的挖空文字）；
  語意色 / 角色色 / 語言色共 14 個 token 改成 `var()` 別名，theme.css 的「改色只改這一段」現在是真的。
- 透明階整體上調一階（底色 `/8` → `/14`、強調底色 `/16` → `/20`、邊框 `/35`~`/45` → `/55`），
  並新增硬規則「低透明度填色不得單獨承擔語意」。
- 12 個 SVG 素材檔案零修改，改在 `SlideBodyView` 的 `TitleBody`（420px 畫框）與 `AssetsBody`
  （176px 內層底板）墊 `bg-paper` 深色底板。`--color-icon-*` 對照 token 刻意沒有跟著轉亮色。
- `scripts/audit-slides.js` 的 `STAGE_BG` 改成執行期讀 `--color-ink`，不再寫死深色值。
- 舊的課程簡報移回原專案 `2026-interactive-presentive`，本專案只剩 `src/showcase/版型示範`（10 頁，
  仍是 internal-only）。internal / public 雙模式機制原封不動保留，`publicCourses` 目前是空陣列，
  對外版首頁走 `Home.tsx` 的空狀態。

### 2026-08-11-2320

- 依「Markdown 與 AI」那份簡報的實作經驗修正 `references/images.md` 的去背流程：
  `remove_chroma_key.py` 的 `--despill` 會把暖色壓成黑色（洋紅 key 壓 R/B 向 G），
  關掉之後它仍會把亮黃判成 key 挖成透明，所以多色插畫改成自己做 RGB 距離硬切 + 內縮；
  另補上輸出檔已存在時要加 `--force`，否則會靜靜沿用上一輪的舊檔。
- 補上「`ink` 描邊在 `bg-panel` 上等於隱形」這條：`ink` 與 `panel` 只差一階，
  兩者誰亮誰暗都一樣看不見（換成亮色主題後仍然成立）。包在其他色塊外的描邊消失沒關係，
  但只靠 `ink` 存在的元素會整個不見，用連通區填色單獨挑出來改色即可。

### 2026-08-11-1930

- `title` 版型的 `lead` 改成 `string | string[]`，給陣列就分段渲染；
  新增 `image` 欄位（`{ src, alt }`）放這份簡報專用的點陣圖，與 `assetId` 二選一。
- `scripts/normalize.py` 第三個參數可以指定色票組合（預設仍是 favicon 用的四色）。
  **多色插畫一定要自己指定並帶上 `ink`** — 少了它，near-black 的填充會被吸到最接近的亮色，整張圖會爛掉。

### 2026-08-11-1900

- 新增第九種版型 `table`（支援連結儲存格）。規格見 `references/layouts.md`，
  實例在 `src/showcase/版型示範/slides.ts` 的 `table` 步驟。

### 2026-08-11-1724

- 依實際跑過一輪 Codex Image 的結果修正 `references/images.md`：
  產出檔名是 `exec-<uuid>.png` 而非 `ig_<hash>.png`、尺寸 1254 而非 1024（會隨版本變，改用 `*.png` 比對）；
  codex 會自行迭代多張，要取 mtime 最新的那張。
- 補上兩條實測結論：生成圖的顏色一定會漂移（只信形狀、事後吸附回色票），
  以及淺色線條圖示必須自帶深色底板才能在未知背景上存活——這是圖示自身筆畫顏色的結果，
  跟簡報主題是深是亮無關。

### 2026-08-11

- 初版。對應簡報系統改版為 1920×1080 固定舞台、八種 `SlideBody` 版型、`@theme static` 色票、CSS 翻頁動畫的狀態。
- 保留一份參考簡報：`src/showcase/版型示範`（版型與色票的活文件）。
