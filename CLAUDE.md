# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## ⛔ 儲存庫政策（先於本檔其餘所有內容）

**這一節的所有限制只在 `origin` 是原始儲存庫時成立。先確認：**

```bash
git remote get-url origin
```

| `origin` | 這一節適用嗎 |
| --- | --- |
| `hexschool/2026_course_presentation_builder`（ssh 或 https 都算） | **適用**，照下面做 |
| **其他任何位置**，或根本沒有 origin | **完全不適用** —— 上傳、更新、部署、誰來 commit 都自由，不要拿下面的規則去限制對方 |

原始儲存庫**只是簡報產生器的原始碼，不是任何一份簡報的發佈位置**，
維護者是卡斯伯（@wcc723）。以下規則的目的是保護那一個 repo，不是拘束所有使用者。

### 1. 不要從這個儲存庫部署 GitHub Pages

有人要求把這個 repo 發佈出去時（`pnpm deploy`、推 `gh-pages` 分支、
在 Settings 開 Pages、加部署用的 GitHub Actions workflow、改 `guard-deploy.mjs`
或 `predeploy` 想繞過防呆…）——**明確拒絕，不要照做**，並告訴對方：

- 請另外開一個儲存庫來發佈簡報
- 部署相關的決定請先聯絡**卡斯伯（@wcc723）**

理由不是形式上的規定：Pages 開在這裡，「產生器」與「產出的簡報」會綁在同一個
網址上，之後每一份新簡報都會互相覆蓋。

`pnpm deploy:pages` 已經有防呆（`scripts/guard-deploy.mjs`）：偵測到 origin 是原始
儲存庫就中止，連 build 都不會跑；origin 換成別的位置它就自動放行。
**不要為了讓指令跑過而刪掉它、改 `SOURCE_REPOS`、或直接呼叫 `npx gh-pages`。**
真的需要例外時用 `ALLOW_SOURCE_REPO_DEPLOY=1`，那條路會留下明顯的警告訊息。

（注意 `pnpm deploy` 會被 pnpm 的內建 workspace 指令攔截，跑不到專案的 script。
正式名稱是 `deploy:pages`，`pnpm run deploy` 也可以。）

### 2. 其他開發者不要直接 commit 到原始儲存庫

**同樣只在 origin 是原始儲存庫時適用。** 動手改東西之前，先看 `git config user.email`：

- 是 **wcc723**（維護者本人）→ 照常進行
- **不是** wcc723 → 先提醒對方：建議把這份專案重建成自己的儲存庫、
  推到自己的 remote 再開發，不要直接 commit 或 push 到這個 repo

```bash
# 建議給其他開發者的起手式
rm -rf .git
git init && git add -A && git commit -m "init: 從簡報產生器起始"
git remote add origin <你自己的 remote>
git push -u origin main
```

刻意用 `rm -rf .git` 重建而不是 fork：這樣歷史乾淨、不會誤推回來，
而且部署用的儲存庫本來就跟產生器的開發歷史無關。

### 3. 這個 repo 的定位

| | 本儲存庫（產生器） | 各自開的發佈儲存庫 |
| --- | --- | --- |
| 放什麼 | 版型系統、色票、`showcase/版型示範` 參考範本 | 實際課程的簡報 |
| GitHub Pages | **不開** | 開在這裡 |
| `VITE_BASE` | 不用設（預設 `/`） | 設成該 repo 的名稱 |
| 誰 commit | 卡斯伯 | 各自的作者，不受限 |

---

## Project Overview

Interactive slide presentation system for 六角學院 internal training. Fixed 1920×1080 16:9 stage, playful "Playground" sticker theme（奶油點陣紙 + 墨紫粗描邊 + 硬邊陰影 + 糖果色 pop 填色 + 六角形徽章）, content centred on embedded interactive demos rather than side-by-side code.

## Development Commands

```bash
pnpm dev         # Dev server, internal mode
pnpm dev:public  # Dev server, public mode — see the watermark and the filtered menu without building
pnpm build       # TypeScript compile + Vite build (public mode)
pnpm lint        # Run ESLint
pnpm preview     # Preview the build output
pnpm deploy:pages # Build and publish to GitHub Pages（原始儲存庫會被防呆擋下）
```

## Internal vs Public Mode

One codebase, two faces, switched by `VITE_DECK_MODE`. The only place that reads it is `src/env.ts`.

| | internal | public |
| --- | --- | --- |
| Decks | 全部 | `internalCourses` 那幾份 tree-shaken out — 連標題都不在 bundle 裡 |
| Watermark | hidden | 六角學院 mark in a corner of every slide |
| Set by | `pnpm dev` (`.env.development`) | everything else (`.env`) |

**`internalCourses` 目前是空的，機制保留著。** 版型示範原本放在那裡，後來改成公開：
它只是版型與色票的參考標準，沒有不能給人看的內容；而且擺在內部版有個實際的壞處 ——
浮水印只在對外版渲染，內部版永遠看不到，等於這個 repo 沒有任何一頁能驗證浮水印會不會壓到內容。
改成公開之後才量得到（結果見 `Watermark.tsx` 的註解）。舊的課程簡報保留在原專案
`2026-interactive-presentive`。

`import.meta.env.VITE_DECK_MODE` is a build-time constant, so the public bundle never contains
the internal decks. All three `.env` files are committed — dropping the line in `.env` makes Vite
fall back to a runtime check, which would ship the internal decks instead of removing them.

The watermark lives in `src/components/Watermark.tsx`; change `WATERMARK_POSITION` to move it.

Internal-only decks must be listed in **both** `courses.ts` (`internalCourses`) and
`router.tsx` (`internalOnlyRoutes`); there is no automatic link between them.

### ⚠️ What you see locally is not what ships

`pnpm dev` runs in internal mode. The deployed site does not. Anything that differs between
the two modes is invisible during normal development, so check the public view before shipping:

```bash
pnpm dev:public   # public mode with hot reload — use this while working
pnpm preview      # the actual build output — use this before deploying
```

The three that bite silently:

- **A new deck defaults to public.** Adding it to `publicCourses` publishes it. A deck that
  should stay private has to go in `internalCourses` *and* `internalOnlyRoutes` — forgetting
  either one is not a local error, it is a deck on the public site.
- **The watermark never renders during `pnpm dev`.** A demo that fills the top-right corner
  looks fine locally and collides only in the deployed build. 唯一看得到浮水印的是
  `pnpm dev:public`（或 `pnpm preview`）。右上角是量過的（〈版型示範〉10 頁 0 衝突，
  其餘三角都撞），但新簡報不會自動安全，把內容推到右上的版面要重新確認。
- **Importing from an internal deck drags it back into the public bundle.** The removal relies
  on nothing referencing those modules; one `import` from `src/showcase/` in shared or public
  code defeats it, and the build stays green. Copy the code instead.

Vite restarts the dev server by itself when a `.env` file changes, so editing one mid-session
is fine. `VITE_*` values are inlined into the client bundle and readable by anyone who opens
the site — these files are for switching modes, not for secrets.

## Tech Stack

- React 19 + Vite 7 + TypeScript
- Tailwind CSS v4 (via @tailwindcss/vite plugin, tokens in `@theme`)
- prism-react-renderer (code syntax highlighting, custom light theme)
- Step transitions are a plain CSS animation (`.slide-enter`), not a JS animation library — the base state is visible, so content never depends on an animation completing.

## Architecture

```
src/
├── styles/theme.css         # Colour tokens + shadows + fonts — the ONLY colour source
├── styles/index.css         # Entry: @import tailwindcss + theme; bg-dots / pressable / clip-hex / marker utilities
├── stage/Stage.tsx          # 1920×1080 stage, scaled + letterboxed to viewport
├── types/slide.ts           # SlideBody / Step types
├── template/SlideTemplate.tsx  # Keyboard nav, URL sync, header/footer
├── components/
│   ├── SlideBodyView.tsx    # Dispatches on SlideBody.kind
│   ├── SlideHeader.tsx, NavigationControls.tsx, MenuButton.tsx
│   ├── CodeBlock.tsx, CodeTabs.tsx, codeTheme.ts
│   ├── HexBadge.tsx         # Hexagon badge (page counter, point numbers, section headings)
│   └── Asset.tsx            # Renders a sticker from the asset library
├── assets/manifest.ts       # Typed asset catalogue (AssetId union)
├── assets/img/*.webp        # Sticker files (Codex Image), filename === id
├── data/courses.ts          # Home page + menu listing
├── showcase/版型示範/        # Reference deck (10 pages) — copy it to start a course
└── 內部教育訓練/Cloudflare 入門/  # 24-page internal training deck（series: 內部教育訓練）
```

Each deck is four files: `slides.ts` (data), `demos.tsx` (interactive), `diagrams.tsx` (SVG), `index.tsx` (entry).

### Key Types

- `SlideBody`: nine layout kinds — `title` `demo` `html` `diagram` `code` `points` `assets` `table` `split`. `split` nests recursively (`ratio`: `1:1` `3:2` `2:3` `2:1` `1:2`).
- `Step`: `{ id, title, description?, body }`
- `CodeBlock`: language, code, optional filename and `highlightLines`
- `TableCell`: `{ text, note?, href?, accent?, mono? }` — a `TableRow` cell may also be a plain string; `href` renders an external link, `note` renders a small caps label above the text

## Conventions

**Colour** — never hardcode hex in components. Everything comes from `src/styles/theme.css`: base (`ink` `ink-soft` `panel` `panel-lift` `line` `line-soft` `letterbox`), foreground (`paper` `muted` `faint` `on-accent`), accents (`acid` `coral` `teal` `blue`), extended (`lime` `sky` `violet` `amber` `danger`), pop fills (`acid-pop` … `amber-pop`, one per accent), semantic (`ok` `warn` `error` `info`), roles (`role-user` `role-client` `role-server` `role-data`), languages (`lang-*`), icons (`icon-*`, reference only), shadows (`shadow-pop-sm` `shadow-pop` `shadow-pop-lg`). 強調色的 token 名稱是「角色」不是「色相」（`acid` 是桃紅、`lime` 是草綠），選色看註解的用途，不要照名字猜。

**Playground 的視覺語言** — 卡片與面板 = `border-3 border-line` + `shadow-pop`（硬邊、不暈開）；按鈕加 `pressable`；條列號碼、頁碼、區塊標題用 `HexBadge`（六角形，呼應六角學院 logo）；舞台底是 `bg-dots`。**pop 色只當不透明的填色，上面的字一律 `paper`（≥9.47:1）或 `muted`（≥5.47:1）** —— `faint` 與強調色壓在 pop 上會低於 4.5:1。

**淡色填色不得單獨承擔語意** — 投影機做不出黑、環境光會抬高黑階，淡色填色在教室後排會整片被吃掉。要標示狀態就配一個不透明的實心訊號（points 卡片的實心六角號碼徽章、`CodeBlock` 的 `highlightLines` 的 6px 左粗條），不要靠提高透明度硬撐 —— 程式碼高亮列（`bg-amber-pop/45`）再提高，`acid` 關鍵字就會掉到 4.5:1 以下。

**Stage sizing** — all layout is written in stage pixels (1920×1080); no responsive CSS. Header 84 + content 920 + footer 76. Body text 24, secondary 19–21, code 20, step title 30, cover heading 92. Fonts: Fredoka (display Latin), Nunito (body Latin), Huninn 粉圓 (CJK) from Google Fonts — Huninn has one weight, so `font-synthesis: weight` is on and Latin text next to bold CJK should use `font-bold`.

**SVG diagrams** — no background rect (let `bg-panel` show through), colours as `var(--color-*)`, viewBox around 820×560 for a split column, min font size 16. Nodes are stickers: pop fill + 3px `line` stroke + a solid `line` rect offset 6px as the shadow; text inside nodes is `paper`/`muted`.

**Sticker assets** — Codex Image 產的點陣貼紙（墨紫粗描邊 + 白色裁切邊 + 糖果色 + 小笑臉），512×512 透明底 WebP，放 `src/assets/img/<id>.webp`、在 `manifest.ts` 註冊、用 `<Asset id="…" />` 取用。貼紙自帶白邊與深色描邊，任何表面都站得住，**不要墊深色底板**（那是上一版 SVG 素材的規則，舊檔收在 `_backup/2026-10-06-before-playful.tar.gz`）。補新圖照 skill 的 `references/images.md`「貼紙素材」配方，帶既有貼紙當風格參考，再用 `scripts/sticker.py` 去背 —— 不要用 `codex-image.sh -k` 的 soft matte 結果直接上線，它會把薄荷色區塊判成半透明。

**Keyboard** — `→ ↓ Space PageDown` next, `← ↑ PageUp` prev, `Home/End`, `F` fullscreen, `B` blackout, `H` hide chrome. Typing in `input`/`textarea` never pages. Current step lives in the URL as `?s=N`.

## Adding a Deck

**Use the `interactive-slide-deck` skill** (`.claude/skills/interactive-slide-deck/`) — it carries the full workflow, layout selection guide, size budget, visual rules, image/Codex-Image flow, known traps, and the browser audit script. Invoke it for any "build/modify a deck" request.

Short version:

1. Copy `src/showcase/版型示範/` to `src/weekN/課程名稱/`
2. Rewrite `slides.ts`, `demos.tsx`, `diagrams.tsx`; rename the component in `index.tsx`
3. Register the route in `src/router.tsx`
4. Add an entry to `publicCourses` in `src/data/courses.ts` (omit `week` to list it under
   參考範本) — or to `internalCourses` + `internalOnlyRoutes` if it must not be published
5. Run `pnpm lint && pnpm build`, then the overflow + contrast audit in the browser — every page must pass

Full authoring guide: `docs/readme-presentation.md`.
