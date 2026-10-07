# 視覺規則

色票的唯一來源是 `src/styles/theme.css`。**元件裡出現 hex 就是錯的。**

## 色票分組

| 分組 | token | 用途 |
| --- | --- | --- |
| 基底 | `ink` `ink-soft` `panel` `panel-lift` `line` `line-soft` `letterbox` | 背景與描邊。`panel` 純白（貼紙本身）、`ink` 奶油紙、`ink-soft` 再深一階；`line` 是墨紫粗描邊，也是硬邊陰影的顏色；`letterbox` 目前跟 `ink` 同值 |
| 前景 | `paper` `muted` `faint` `on-accent` | 文字的三個層級，外加實心強調色塊上的白色挖空字 |
| 強調 | `acid` `coral` `teal` `blue` | 主色系。**名字是角色不是色相**（`acid` 是桃紅、`lime` 是草綠），選色看 `theme.css` 的註解，不要照名字猜 |
| 延伸 | `lime` `sky` `violet` `amber` `danger` | 圖解需要更多可辨識色時 |
| pop | `acid-pop` `coral-pop` `teal-pop` `blue-pop` `lime-pop` `sky-pop` `violet-pop` `amber-pop` | 每支強調色的糖果版，**只當不透明的填色**：卡片底、徽章、貼紙標籤、表頭、進度點、圖解節點 |
| 語意 | `ok` `warn` `error` `info` | 狀態優先。這四個是強調色的 `var()` 別名，改上面的強調色就會跟著走 |
| 角色 | `role-user` `role-client` `role-server` `role-data` | 前後端與資料流圖解共用 |
| 語言 | `lang-html` `lang-css` `lang-javascript` `lang-typescript` `lang-jsx` `lang-tsx` | CodeTabs 的標籤點 |
| 素材 | `icon-outline` `icon-border` `icon-yellow` `icon-pink` `icon-sky` `icon-lilac` `icon-tangerine` `icon-mint` | 貼紙生圖時 prompt 指定的色，**僅供對照與補圖時照抄**，改了不會讓既有的圖跟著變 |
| 陰影 | `shadow-pop-sm` `shadow-pop` `shadow-pop-lg` | 硬邊位移陰影 3 / 6 / 10px，顏色是 `line`。按鈕與標籤用 sm、卡片與面板用預設、封面主視覺用 lg |

用法：

```tsx
<div className="rounded-2xl border-3 border-line bg-panel shadow-pop">   {/* 貼紙卡片 */}
<div className="border-3 border-line bg-teal-pop text-paper">            {/* pop 底一律壓 paper */}
<button className="pressable rounded-full border-2 border-line bg-acid text-on-accent">
<HexBadge size={48} fillClass="bg-acid">01</HexBadge>                   {/* 六角形徽章 */}
<rect fill="var(--color-teal-pop)" stroke="var(--color-line)" />        {/* SVG 用 CSS 變數 */}
```

`index.css` 的小工具：`bg-dots`（奶油點陣紙）、`pressable`（hover 浮起、按下沉到陰影的位置）、`clip-hex` + `hex-shadow`（六角形與跟著形狀走的陰影）、`marker`（螢光筆底線，封面大標用）、`.float` / `.wiggle-on-hover` / `.bounce-in`（裝飾性動畫，`prefers-reduced-motion` 時全部關掉）。

### pop 色只當底，字交給 paper

pop 色對紙面只有 1.3–1.7:1，拿來當文字等於看不見。反過來 `paper` 壓在任何一支 pop 上都 ≥9.47:1、`muted` ≥5.47:1。**`faint` 與強調色不要壓在 pop 上**：`faint` 最低只剩 4.26:1，強調色壓在自己的 pop 上只有 3.44–4.73:1。連結文字在 pop 卡片上也維持 `paper`，顏色改放在底線（`decoration-acid`）。

### 淡色填色不得單獨承擔語意

pop 色、`bg-amber-pop/45` 這類淡色填色對白色面板只有 1.3–1.7:1。投影機做不出黑、教室環境光又會把黑階整個抬高，後排看到的就是一片白。**只要一塊填色是在表達「這一項不一樣」，就必須再配一個不靠淡色的訊號** —— `points` 卡片是左邊那顆實心的六角號碼徽章、`CodeBlock` 的 `highlightLines` 是 6px 的實心左粗條。反過來也成立：不要為了搶存在感把透明度一路往上調，程式碼高亮列停在 `/45`，再高 `acid` 關鍵字會掉出 4.5:1。

### 貼紙素材不需要底板

貼紙素材（`src/assets/img/*.webp`）自帶白色裁切邊與墨紫描邊，奶油紙、白色面板、pop 色、深色底上都站得住，直接放就好。`title` 版型把它放在一塊歪掉的大六角形上，`assets` 版型墊一顆輪替的 pop 色圓底，都是裝飾而不是為了對比。

> 上一版（2026-08）的 SVG 素材是奶白線稿、為深底畫的，必須墊 `bg-paper` 深色底板。那批檔案已經收進 `_backup/`，**新的貼紙不要再墊深色底板**。

### 歪貼與陰影的兩個坑

- **`overflow-auto` 會裁掉陰影。** 硬邊陰影畫在元素外面，捲動容器的邊界會把它切掉。條列、素材牆這種放在 `overflow-auto` 裡的卡片，容器要留 `pr-1.5 pb-1.5`。
- **`overflow-auto` 裡不要放旋轉的元素。** `transform` 會撐大捲動範圍，稽核會報溢出，畫面上還可能冒出捲軸。歪貼（`-rotate-2`）只用在頁首標籤、封面 kicker 這類不捲動的地方；素材牆要動態感就用 hover 時的 `wiggle`（只動圖、不動卡片）。

### 語意優先

有語意 token 就用語意 token。「這是錯誤狀態」寫 `text-error`，不要寫 `text-coral`；「這是後端」寫 `var(--color-role-server)`，不要寫 `var(--color-acid)`。這樣之後調色票只要改一段。

### 一頁最多兩個強調色

超過兩個，重點就沒有重點了。需要更多可辨識色時（例如四個角色的流程圖）才動用延伸色。

### `@theme static` 是必要的

Tailwind v4 預設**只輸出有被 utility 用到的變數**。本專案的 token 還會被 SVG 以 `var(--color-*)` 引用、被色票頁 `getComputedStyle` 即時讀取，所以 `theme.css` 必須用 `@theme static`，否則 `ok` / `warn` / `info` / `danger` / `role-*` 這些沒有對應 class 的變數不會出現在產出的 CSS 裡（swatch 會變透明、`getPropertyValue` 回傳空字串）。

## 對比度

三個文字層級對 `panel` 的對比是 **15.81:1 / 9.14:1 / 7.11:1**，對最深的表面 `ink-soft` 也還有 13.87 / 8.02 / 6.23；九支強調色對四個表面都 ≥4.94:1、對白色挖空字 ≥5.63:1，全站文字通過 WCAG AA。

- 投影機與直播壓縮會再吃掉一些對比，**不要降低 `muted` / `faint` 對背景的對比**（往哪個方向調隨主題而異，要守的是對比值本身）
- **不要拿 `line-soft` 當文字色**，那是分隔線與點陣色（`line` 雖然夠深，但它的角色是描邊，文字請用 `paper`）
- 程式碼註解是教學時最常唸的內容，對比不能再壓低（目前是 `--color-faint`，對程式碼井 6.23:1、對高亮列 5.84:1）
- 新增顏色組合後跑 `scripts/audit-slides.js`，它會連 SVG 的 `fill` 一起驗

## 字級

見 `layouts.md` 的尺寸預算。下限 15px，一般內文不低於 19px。

字體：`font-sans`（內文，Nunito + Huninn）、`font-display`（標題與數字，Fredoka + Huninn）、`font-mono`（程式碼與 token 名稱）。圓體字從 Google Fonts 載入（`index.html`），離線時退回蘋方。

Huninn（jf 粉圓）只有一個字重，所以 `body` 開了 `font-synthesis: weight`，中文粗體是合成的。合成粗體比 Nunito 600 粗，**中英混排的粗體字用 `font-bold`**，英文才不會看起來比中文細一截。

## SVG 圖解慣例

```tsx
export function MyDiagram() {
  return (
    <svg width={820} height={560} viewBox="0 0 820 560" role="img">
      <title>一句話描述這張圖在說什麼</title>
      {/* 硬邊陰影：同尺寸的實心矩形往右下偏 6 */}
      <rect x={46} y={106} width={200} height={120} rx={22} fill="var(--color-line)" />
      <rect x={40} y={100} width={200} height={120} rx={22}
            fill="var(--color-blue-pop)" stroke="var(--color-line)" strokeWidth={3} />
      <text x={140} y={165} textAnchor="middle"
            fill="var(--color-paper)" fontSize={26} fontWeight={600}>前端網頁</text>
    </svg>
  );
}
```

規則：

1. **不畫背景矩形** — 讓面板的 `bg-panel` 透出來。畫了背景就等於把圖解跟主題綁死
2. **顏色一律 `var(--color-*)`** — 換色票時圖解自動跟著換
3. **viewBox 820×560** — 放進 `split` 單欄剛好；滿版圖解可用 900×480
4. **文字最小 16**（viewBox 座標），一定要有 `<title>`
5. **節點畫成貼紙**：pop 填色 + 3px `line` 描邊 + 往右下偏 6px 的實心 `line` 矩形當陰影，節點內的字用 `paper` / `muted`。不要整塊填實心強調色再挖空文字
6. 強調色只用在箭頭與箭頭上的標籤：去程 `coral` 實線、回程 `teal` 圓點虛線（`strokeDasharray="2 10"` + `strokeLinecap="round"`）
7. 重複的節點／箭頭抽成同檔案內的小元件（見 `src/showcase/版型示範/diagrams.tsx` 的 `Node` / `Arrow`）

`marker` 的 `id` 在同一頁可能碰撞，用有意義的前綴（`flow-req`、`flow-res`）。
