# 圖片與素材

## 決策順序

需要視覺元素時，**依序**考慮：

| 順位 | 方式 | 適用 |
| --- | --- | --- |
| 1 | 既有 SVG 素材庫 | 前端／後端／資料庫／終端機／檔案這類概念圖示 |
| 2 | 手繪 SVG 圖解 | 流程、關係、資料流向、對照 — **這類一律手繪，不要生圖** |
| 3 | Codex Image | 點陣插圖、示意畫面、風格化視覺、找不到替代的具象圖 |

生成式圖片在教學簡報裡是最後手段。結構性內容（箭頭、方框、流程）用 SVG 畫出來才精準、才能跟著色票走、才可以逐步強調。

## 1. 既有素材庫

```tsx
import { Asset } from '../../components';

<Asset id="api-server" size={220} />
```

`id` 有型別提示，清單在 `src/assets/manifest.ts`。目前 20 張：`hex-mascot`（封面吉祥物「六角小教練」，橫圖）`frontend-web` `api-server` `database` `chat-mode` `work-mode` `codex-mode` `planning-copy` `site-files-edit` `local-folder` `terminal-tools` `website-inspection` `authorized-app`，以及〈Cloudflare 入門〉補的 `cf-cloud` `domain-sign` `pages-upload` `worker-bot` `r2-bucket` `rocket-launch` `node-install`。

素材是 Codex Image 產的**點陣貼紙**：墨紫粗描邊、外圍一圈白色裁切邊、糖果色平塗、主體上一張小笑臉。512×512 透明底 WebP（吉祥物 1024 寬），放在 `src/assets/img/<id>.webp`。貼紙自帶白邊與深色描邊，**任何表面都站得住，不需要底板**。

新增素材：

1. 照下面「貼紙素材」的配方產圖、用 `scripts/sticker.py` 後製
2. 放進 `src/assets/img/<id>.webp`（**檔名就是 id**）
3. `manifest.ts` 的 `assets` 補一筆 `{ id, name, purpose, tags }`
4. `AssetId` 會自動更新

> 2026-08 那一版的 12 個 technical-editorial SVG（奶白線稿、為深底畫的、要墊 `bg-paper` 底板）收在
> `_backup/2026-10-06-before-playful.tar.gz`。下面第 3 節後半「深底板素材 / 紙面素材」兩條路線是那一版的流程，
> 留著當紀錄；**現在新增素材走「貼紙素材」**。

## 2. 手繪圖解

見 `visual-rules.md` 的「SVG 圖解慣例」。

## 3. Codex Image

### 何時用

- 需要具象插圖（人物、場景、物件）而素材庫沒有
- 需要示意畫面（假的 UI 截圖、假的儀表板）
- 需要風格化的封面視覺

### 產圖

完整細節見使用者層級的 `codex-cli-image` skill。本專案要點：

```bash
codex exec --enable image_generation -s workspace-write --skip-git-repo-check \
  '$imagegen <PROMPT>'
```

- `$imagegen` prefix 是必要的，少了它 codex 會當成一般對話、exit 0 但不產圖
- `-s workspace-write` 必加，預設 sandbox 是唯讀
- 輸出落在 `$HOME/.codex/generated_images/<uuid>/`

**檔名與尺寸會隨 codex 版本改變，不要寫死。** 實測 codex-cli 0.147.0 產出的是
`exec-<uuid>.png`、1254×1254，而不是舊文件寫的 `ig_<hash>.png`、1024×1024。
用 `*.png` 比對，不要用特定前綴。

**codex 會自己迭代**：同一次呼叫可能在同一個 uuid 目錄產出多張（初稿 + 修正），
要取 **mtime 最新的那張**，不是第一張。

**不要用 `ls -t | head -1` 找檔**，`generated_images/` 累積數百個目錄後會 SIGPIPE。
記錄呼叫前的時間戳，之後用 `find -newermt`：

```bash
START=$(date +%s); sleep 1
codex exec --enable image_generation -s workspace-write --skip-git-repo-check '$imagegen ...'
RAW=$(find "$HOME/.codex/generated_images" -name '*.png' -newermt "@$START" -print0 2>/dev/null \
        | xargs -0 ls -t 2>/dev/null | head -n 1)
```

### 貼紙素材（目前的路線）

20 張貼紙都是 2026-10-06 用這份配方產的（〈Cloudflare 入門〉的封面 `images/cover.webp` 也是，帶 `hex-mascot` 當參考）。**一張一次呼叫**，帶一張既有貼紙當 `-r` 風格參考，
畫風才會是一家（方形素材帶 `frontend-web`，角色類帶 `hex-mascot`）。同一時間最多跑 2 個 Codex。

```bash
S=~/.claude/skills/codex-image/scripts/codex-image.sh
REF=<既有貼紙的 Codex 原圖或 src/assets/img/frontend-web.webp 轉成的 png>
"$S" -o raw/<id>.png -s 512 -k "#00FF00" -r "$REF" "<下面的配方全文>"
grep '原始檔：' <log>     # ← 後製要用這一張，不是 raw/<id>.png
```

配方（只改 Subject 那一行；`<…>` 以外照抄）：

```text
Style reference: the attached image (same sticker style, outline weight, white die-cut border, face style and level of detail). Do not copy its subject.
Use case: illustration sticker for a playful internal company training slide deck
Asset type: square die-cut sticker icon shown at 140 to 280 px on a warm cream slide
Subject: <主體，例如 a smiling stacked database cylinder made of three thick disks (sky blue with a darker blue shade), a few tiny data dots floating out of the top>
Style/medium: cute kawaii flat vector sticker illustration. Chunky rounded shapes, thick uniform dark outline in #24203A, flat fills with one simple hard-edged darker shade per shape (no gradients), a tiny happy face (two dot eyes, a small smile, little pink blush) on the main object, one or two small four-point sparkle doodles near the object. A thick white die-cut sticker border (#FFFFFF) wraps the whole silhouette, like a vinyl laptop sticker.
Color palette: sunny yellow #FFD43B, bubblegum pink #FF8FB8, sky blue #74C0FC, lilac #B197FC, tangerine #FF922B, mint #63E6BE, white #FFFFFF, outline and dark parts #24203A. Use 3 to 4 of these colors, not all.
Composition/framing: a single subject centered, filling about 78% of the canvas, even padding on all four sides, slight 3/4 front view, square composition.
Background: one flat solid pure green #00FF00 filling the entire canvas behind the white sticker border, no gradient, no texture, no shadow on the background. Never use #00FF00 or any neon green on the subject itself.
Avoid: any text, letters, digits, code characters or symbols (use simple rounded colored bars to suggest text or code), real brand logos, watermarks, cast shadows, thin hairlines, busy textures, photorealism, 3D render look.
```

- **key 色用純綠不用洋紅**：主體有泡泡糖粉 `#FF8FB8`，離洋紅太近。
- 「程式碼」「文字」一律請它畫成圓角色條，模型畫的字幾乎都是亂碼。
- 終端機的提示字元畫成「粉紅 V 形 + 薄荷色游標條」，不要寫 `>_`（那是字元，會被當成文字禁掉或畫歪）。

後製：

```bash
PY=~/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3
$PY .claude/skills/interactive-slide-deck/scripts/sticker.py <Codex 原始檔.png> src/assets/img/<id>.webp
$PY .claude/skills/interactive-slide-deck/scripts/sticker.py <原始檔.png> src/assets/img/<id>.webp --wide 1024  # 橫圖
```

**不要直接用 `codex-image.sh -k` 去背好的檔案。** 它的 soft matte 只看顏色距離，薄荷色 `#63E6BE` 離純綠只有 216，
勾勾、山丘、鏡片這類薄荷色區塊會被判成半透明 —— 在奶油紙上看起來只是「淡了一點」，放到 pop 色或深色底上就透出底色
（2026-10-06 實測 12 張裡 4 張中）。`sticker.py` 改用連通性：只挖跟外圍背景相連的區域與被圍住的純 key 色小洞，
主體內的綠色系一律不透明；再補一圈「白邊 × 綠底」混色的去溢色，最後裁到主體、置中、輸出 WebP（q88）。

驗收：把每張放在奶油紙、白色、`amber-pop`、深色四種底上並排看（實際顯示尺寸 150px），
薄荷色區塊不能透底、白邊外不能有綠線、圖上不能有字。

### 先決定：深底板素材，還是紙面素材（2026-08 SVG 版的流程，現在不用）

轉成亮色主題之後產圖有兩條路，**先選一條再開始 prompt**。選錯的話顏色全部要重來。

| | A. 深底板素材（預設） | B. 紙面素材（淺色版） |
| --- | --- | --- |
| 素材長相 | 奶白線稿 + 近黑填色 | 深墨線稿 + 紙色填色 |
| 放在哪 | `bg-paper` 近黑底板上 | 直接放在 `bg-panel` / `bg-ink` 上 |
| 主線稿 | `#F7F2E7` | `#211F19` |
| 內部填色 | `#121A21` | `#FFFDF9` |
| accent | `#FF6B5A` `#C8F04B` `#42D7C2` | `#883A20` `#126625` `#095C5A` |
| normalize | 預設 | 加 `--light` |
| 跟現有 12 個 | 一致，可混用 | **不能混用** |

**目前 12 個素材全部是 A**，而且 `SlideBodyView` 已經幫它們墊好底板（title 版型 420px 圓角畫框、assets 版型卡片內的 176px 底板）。要加素材到現有的素材牆就走 A。

B 是留給「哪天決定整批重畫」的路：深墨線稿對三個亮色表面分別是 `panel` 16.22:1、`ink` 14.59:1、`ink-soft` 13.08:1，全部站得住，所以不需要底板，紙頁上也不會出現深色方塊。代價是**不能跟 A 並排** —— 一面素材牆上同時有「深底板上的奶白線稿」和「紙面上的深墨線稿」會像兩套系統。要換就整批換。

### Prompt 要對齊專案風格

不論走哪條路，這幾條都一樣：

- 一律要求**透明背景**或**純色 chroma-key 背景**（之後去背），不要白底
- 指定 technical-editorial、high-contrast、flat 或 subtle-dimensional 的調性
- **明確禁止圖片內出現文字**（生成的文字幾乎都是亂碼，而且無法本地化）
- 主體置中、留安全邊距

配色照上表指定。兩個常見的錯：

- **走 A 卻拿 theme.css 現在的強調色去 prompt。** 那組是為紙面調深的，放到近黑底板上會太暗。A 要的是 `--color-icon-*` 那一組。
- **走 B 卻只講「淺色版」。** 生成模型會理解成「淺色的線」，產出一張放到紙上就消失的圖。B 要明講**深色線稿、淺色填色**，用「dark ink line art on off-white fill」這種講法。

⚠ `normalize.py` 的 `DARK_TOKENS` **不等於** `--color-icon-*`：它是深色時代的 UI 色票（`#F4F0E6` / `#F6FF70` / `#FF7557` / `#61E8D2` / `#78A7FF`），跟素材的實際用色差一階。兩者接近到吸附後不會出事，但新素材若要跟現有 12 個嚴格對齊，請用第三個參數自己指定色票、或直接改那個 dict。

範例 prompt 骨架：

```
$imagegen A single centered <SUBJECT>, flat technical illustration, bold clean outlines,
off-white #F4F0E6 line work on a solid pure magenta #FF00FF chroma-key background,
accent colors limited to #FF7557 #F6FF70 #61E8D2, no text, no watermark,
no gradients on the background, generous margin around the subject, square composition
```

### 去背與縮放

```bash
python3 "$HOME/.codex/skills/.system/imagegen/scripts/remove_chroma_key.py" \
  --input raw.png --out cutout.png \
  --auto-key border --soft-matte \
  --transparent-threshold 12 --opaque-threshold 220

# 殘色邊 → 加 --edge-contract 1
# 鋸齒明顯 → 加 --edge-feather 0.25
# 輸出檔已存在 → 加 --force，否則它只是印一行 Error 就跳過，
#                 後面的步驟會拿到上一輪的舊檔而不自知

sips -s format png --resampleHeightWidthMax 512 cutout.png --out final.png
```

**不要加 `--despill`，除非主體真的沾到了 key 色。** 它為了消除殘色會壓抑通道：
洋紅 key 會把 R/B 壓向 G，暖色整個變黑 —— 實測亮黃圓點與 coral 圓點全部歸零，
吸色後變成一片 ink，而且因為圓點面積小，看縮圖不容易發現。

**多色插畫建議整段自己做，不要用這支。** 就算關掉 despill，
它仍會把亮黃（250,220,60）判成洋紅 key 而挖成透明。
主體只要確定不含 key 色，最可靠的做法是對 key 色做 RGB 歐氏距離硬切，
再往內縮 1–2 px 削掉混色環（混色環若留著，吸色時會被拉成 coral 描邊）：

```python
key = 四邊各 3px 的中位數
solid = 每個像素到 key 的距離² > 120²      # 主體用色離洋紅最近的是 coral（約 175），有餘裕
solid = erode(solid, 2)                    # 削掉混色環
其餘像素 alpha = 0，剩下的吸附到專案色票
```

平面向量插畫承受得起硬邊，最後 LANCZOS 縮到展示尺寸就看不出鋸齒了。

### 放哪裡

**單一簡報專用的圖**（預設走這條，不用改任何共用程式）：

```
src/weekN/課程名稱/images/<name>.png
```

```tsx
import heroUrl from './images/hero.png';

<img src={heroUrl} alt="說明文字" width={420} height={420} />
```

**要跨簡報重複使用的圖**：放 `src/assets/img/<id>.webp` 並在 `src/assets/manifest.ts` 補 metadata（manifest glob 的是 `./img/*.webp`，id 就是檔名）。

### 生成圖的顏色一定會漂移

實測要求 `#FF7557` 會拿到橘色、要求 `#F6FF70` 會拿到過飽和的黃。**不要相信它的 RGB，只相信它的形狀**：去背之後用 `scripts/normalize.py` 把每個不透明像素吸附到最接近的專案色票，alpha 保留原本的邊緣過渡；它同時做 alpha bbox 自動裁切與置中，可以一併修掉構圖偏移。

```bash
# 預設是 favicon 標記用的四色（paper / acid / coral / teal），深底板色票
python3 .claude/skills/interactive-slide-deck/scripts/normalize.py cutout.png mark.png

# 多色插畫要自己指定色票組合
python3 .claude/skills/interactive-slide-deck/scripts/normalize.py \
  cutout.png final.png paper,acid,coral,teal,blue,ink

# 走路線 B（紙面素材）：加 --light，整組色票換成深墨版
python3 .claude/skills/interactive-slide-deck/scripts/normalize.py \
  cutout.png final.png paper,coral,lime,teal,ink --light
```

`--light` 換的是 `LIGHT_TOKENS`，key 的意義不變、值相反：`paper` 仍然是「主線稿的顏色」（只是變成深墨 `#211F19`），`ink` 仍然是「內部填色的顏色」（變成紙色 `#FFFDF9`）。所以既有的指令寫法不用改，只多一個旗標。

**有深色填充的圖一定要帶 `ink`。** 少了它，near-black 的區塊會被吸到最接近的亮色
（實測會整片變成 coral），整張圖就毀了。可用的 token：
`paper` `acid` `coral` `teal` `blue` `violet` `amber` `ink`。
⚠ `normalize.py` 的色票是**素材／生圖用的深底色票**，沿用轉亮色之前的值：
這裡的 `paper` 是淺色 `#F4F0E6`、`ink` 是近黑 `#0A0A09`，跟 theme.css 現在的
`--color-paper`（#211F19）／`--color-ink`（#F4F1E8）剛好相反，不要互相套用。

**但 `ink`（#0A0A09）在深色底板（`bg-paper` #211F19）上等於隱形。**
只要是「淺色色塊外圍包一圈深色描邊」，深色描邊消失反而像乾淨去背，沒問題；
但**獨立存在的深色元素會整個不見** —— 實測封面上連接兩個主體的黑色箭頭，
在深色底板上完全看不到，構圖的敘事就斷了。
與其為此換掉整組色票（描邊全變 coral，淺底上的圖形對比會下降），
不如只把那一個元素挑出來改色：它通常是一塊獨立的連通區，
用 BFS 從裡面一點填色即可，其餘描邊維持 `ink`。

### 走淺色版（`--light`）額外的兩個陷阱

這兩個都是實測出來的，而且方向跟直覺相反。

**一、亮色像素會被吸成紙白，不是吸成 accent。** 淺色色票的九支 accent 全部是深油墨色，
所以 RGB 距離的計算結果跟深色時代完全不同。實測拿一個亮黃綠 `rgb(200,240,90)`
去吸附：深色色票會落在 `lime #C8F04B`，淺色色票卻落在紙色 `#FFFDF9` ——
到 `lime #126625` 的距離幾乎是到紙白的兩倍。**結果是那塊圖形整個消失。**

所以走 B 的 prompt 一定要直接要求深色油墨，不能產亮色再指望 normalize 幫你壓深。
產完先用下面的驗收步驟合成到 `bg-panel` 上確認，不要只看透明圖。

**二、opacity 要往上調，不是往下調。** 很容易反過來想「紙面比較亮所以線可以淡一點」，
實測是相反的：同一個 alpha 在紙面上比在深底上更不明顯。

| 深色版 alpha | 對比 | 淺色版要用 | 對比 |
| --- | --- | --- | --- |
| `.07` | 1.19 | `.09` | 1.19 |
| `.16` | 1.59 | `.23` | 1.59 |
| `.22` | 1.95 | `.31` | 1.95 |
| `.35` | 3.02 | `.48` | 2.98 |
| `.45` | 4.12 | `.58` | 4.10 |
| `.68` | 7.82 | `.78` | 7.81 |
| `.78` | 9.88 | `.84` | 9.73 |

低段大約要 ×1.3，高段收斂到 ×1.1。不透明的主線稿不用動：奶白對近黑填色是 15.73:1，
深墨對紙面是 16.22:1，本來就同級。

（方向跟 UI 的透明階一致 —— `bg-acid/8` → `/14` 也是往上調。會搞混是因為
「紙面比較亮」的直覺，但決定可見度的是前景與背景的**明度差**，不是背景多亮。）

**驗收要合成到底板色 `bg-paper` 上看**（走 B 則合成到 `bg-panel` `#FFFDF9`），不要只看去背後的透明圖 —
在編輯器的白底預覽裡，淺色線條看起來很清楚，放到深色底板上才會發現對比不足或殘留白邊：

```python
from PIL import Image
img = Image.open('final.png').convert('RGBA')
bg = Image.new('RGBA', img.size, (33, 31, 25, 255))   # bg-paper #211F19
Image.alpha_composite(bg, img).save('preview.png')
```

### 圖示類素材要自帶底板

`paper #F4F0E6` 這種淺色線條放在透明底上，在淺色分頁列或淺色投影片上會整個消失。favicon 或會出現在未知背景上的圖示，一定要用 `scripts/plate.py` 合成到深色圓角底板（底板色對齊 `--color-paper` `#211F19`，跟 `SlideBodyView` 給素材墊的那塊同一支；圓角 22%、主體佔 74%）再輸出。

```bash
python3 .claude/skills/interactive-slide-deck/scripts/plate.py mark.png favicon.png
```

兩支腳本都需要 Pillow。系統 python3 通常沒有，用 venv：
`python3 -m venv venv && ./venv/bin/pip install Pillow`

### 驗收

- **在淺色與深色背景上都看過**，不要只在一種底色上驗
- 縮到實際使用尺寸看（favicon 要看 32px 與 16px）
- 在實際的深色底板（`bg-paper`，`#211F19`）上看，邊緣沒有白邊、沒有殘留的 key 色
- 四角 alpha 完全透明
- 縮到實際顯示尺寸仍然看得懂
- 圖片內沒有文字、浮水印、重複肢體
- **不要把點陣圖偽裝成 SVG**：生成的 PNG 就標成 PNG，不要幫它捏造一個 SVG 兄弟檔

### 授權與紀錄

在 commit message 或 manifest 的 metadata 註明是 Codex `image_generation` 生成，以及使用的 prompt。之後要重製或調整才有依據。
