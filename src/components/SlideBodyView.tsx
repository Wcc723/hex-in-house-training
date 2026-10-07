import { useMemo, type ReactNode } from 'react';
import type {
  Accent,
  SlideBody,
  SplitRatio,
  TableCell,
  TableRow,
} from '../types/slide';
import { getAsset } from '../assets/manifest';
import { Asset } from './Asset';
import { HexBadge } from './HexBadge';
import { CodeTabs } from './CodeTabs';

/* ── 色票對照（Tailwind 需要完整字串，不能動態拼接）────────── */

const accentText: Record<Accent, string> = {
  acid: 'text-acid',
  coral: 'text-coral',
  teal: 'text-teal',
  blue: 'text-blue',
  lime: 'text-lime',
  sky: 'text-sky',
  violet: 'text-violet',
  amber: 'text-amber',
};

/** 實心強調色：六角號碼徽章的填色，上面壓 on-accent 白字（≥5.63:1） */
const accentSolid: Record<Accent, string> = {
  acid: 'bg-acid',
  coral: 'bg-coral',
  teal: 'bg-teal',
  blue: 'bg-blue',
  lime: 'bg-lime',
  sky: 'bg-sky',
  violet: 'bg-violet',
  amber: 'bg-amber',
};

/*
 * pop 填色：卡片底。不透明的糖果色，上面只壓 paper（≥9.47:1）與 muted（≥5.47:1）。
 * ⚠ 不要在 pop 底上用 faint 或強調色當文字色 —— faint 最低只剩 4.26:1、
 *   強調色壓在自己的 pop 上只有 3.44–4.73:1，稽核會擋。
 */
const accentPop: Record<Accent, string> = {
  acid: 'bg-acid-pop',
  coral: 'bg-coral-pop',
  teal: 'bg-teal-pop',
  blue: 'bg-blue-pop',
  lime: 'bg-lime-pop',
  sky: 'bg-sky-pop',
  violet: 'bg-violet-pop',
  amber: 'bg-amber-pop',
};

/** 連結底線的顏色。文字本身維持 paper，顏色只放在底線上 */
const accentDecoration: Record<Accent, string> = {
  acid: 'decoration-acid',
  coral: 'decoration-coral',
  teal: 'decoration-teal',
  blue: 'decoration-blue',
  lime: 'decoration-lime',
  sky: 'decoration-sky',
  violet: 'decoration-violet',
  amber: 'decoration-amber',
};

/** 素材牆與封面輪流使用的糖果色底 */
const popCycle = [
  'bg-amber-pop',
  'bg-acid-pop',
  'bg-sky-pop',
  'bg-teal-pop',
  'bg-violet-pop',
  'bg-coral-pop',
] as const;

const ratioColumns: Record<SplitRatio, string> = {
  '1:1': '1fr 1fr',
  '3:2': '3fr 2fr',
  '2:3': '2fr 3fr',
  '2:1': '2fr 1fr',
  '1:2': '1fr 2fr',
};

/* ── 共用外框 ───────────────────────────────────────────── */

/** 面板下方的說明，做成一顆膠囊標籤 */
function Caption({ children }: { children: ReactNode }) {
  return (
    <figcaption className="flex shrink-0 items-center gap-2.5 self-center rounded-full border-2 border-line bg-panel px-5 py-1 text-[18px] text-muted">
      <span className="size-2.5 rounded-full bg-acid" aria-hidden />
      {children}
    </figcaption>
  );
}

function Panel({
  children,
  caption,
  padded = true,
}: {
  children: ReactNode;
  caption?: string;
  padded?: boolean;
}) {
  return (
    <figure className="flex h-full min-h-0 w-full flex-col gap-5">
      <div
        className={`flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-[28px] border-3 border-line bg-panel shadow-pop ${
          padded ? 'p-10' : ''
        }`}
      >
        {children}
      </div>
      {caption && <Caption>{caption}</Caption>}
    </figure>
  );
}

/** 四角星星，封面的裝飾 */
function Sparkle({
  className,
  fillClass,
  size,
}: {
  className: string;
  fillClass: string;
  size: number;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      aria-hidden
      className={`pointer-events-none absolute ${className}`}
    >
      <path
        d="M20 2 C22 14 26 18 38 20 C26 22 22 26 20 38 C18 26 14 22 2 20 C14 18 18 14 20 2 Z"
        className={fillClass}
        stroke="var(--color-line)"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── 各版型 ─────────────────────────────────────────────── */

const visualClass =
  'float-slow relative h-auto max-h-[420px] w-auto max-w-[530px] object-contain';

function TitleBody({
  kicker,
  heading,
  lead,
  assetId,
  image,
}: Extract<SlideBody, { kind: 'title' }>) {
  const paragraphs = typeof lead === 'string' ? [lead] : (lead ?? []);

  return (
    <div className="flex h-full items-center gap-12">
      <div className="min-w-0 flex-1">
        {kicker && (
          <p className="inline-block -rotate-2 rounded-full border-3 border-line bg-amber-pop px-6 py-2 font-display text-[24px] font-semibold tracking-[0.08em] text-paper uppercase shadow-pop-sm">
            {kicker}
          </p>
        )}
        <h2 className="mt-8 font-display text-[92px] leading-[1.15] font-semibold tracking-tight text-paper">
          {/* 螢光筆畫在標題下半部，換行時每一行各自一段 */}
          <span className="marker">{heading}</span>
        </h2>
        {paragraphs.map((paragraph, index) => (
          <p
            key={paragraph}
            className={`max-w-[960px] text-[26px] leading-[1.75] text-muted ${
              index === 0 ? 'mt-8' : 'mt-5'
            }`}
          >
            {paragraph}
          </p>
        ))}
      </div>

      {/*
        主視覺：一塊歪掉的大六角形墊底，貼紙圖浮在上面慢慢飄，旁邊撒幾顆星星。
        素材與封面圖都是「貼紙」——自帶白邊與墨紫描邊，直接放在紙面上就站得住，
        不需要上一版那塊深色底板。
      */}
      {(assetId || image) && (
        <div className="relative grid size-[600px] shrink-0 place-items-center">
          <span
            aria-hidden
            className="absolute grid rotate-[8deg] [filter:drop-shadow(10px_10px_0_var(--color-line))]"
            style={{ width: 560, height: 486 }}
          >
            <span className="clip-hex col-start-1 row-start-1 bg-line" />
            <span
              className="clip-hex col-start-1 row-start-1 bg-sky-pop"
              style={{ margin: '5px 7px' }}
            />
          </span>

          {/* w/h-auto + max 讓圖照自己的比例縮：方形貼紙 420×420，
              橫長的吉祥物（約 1.4:1）會用滿 530 的寬度。
              兩者都比後面的六角形小一圈，六角形的輪廓才看得出來 */}
          {image ? (
            <img
              src={image.src}
              alt={image.alt}
              className={visualClass}
              draggable={false}
            />
          ) : (
            assetId && <Asset id={assetId} size={420} className={visualClass} />
          )}

          <Sparkle
            className="float top-[18px] right-[40px]"
            fillClass="fill-amber-pop"
            size={64}
          />
          <Sparkle
            className="float-slow bottom-[40px] left-[6px] [animation-delay:-2s]"
            fillClass="fill-acid-pop"
            size={48}
          />
          <Sparkle
            className="float top-[96px] left-[24px] [animation-delay:-1s]"
            fillClass="fill-teal-pop"
            size={34}
          />
        </div>
      )}
    </div>
  );
}

function DemoBody({
  render: Render,
  caption,
  bare,
}: Extract<SlideBody, { kind: 'demo' }>) {
  if (bare) {
    return (
      <figure className="flex h-full min-h-0 w-full flex-col gap-5">
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto">
          <Render />
        </div>
        {caption && <Caption>{caption}</Caption>}
      </figure>
    );
  }

  return (
    <Panel caption={caption}>
      <Render />
    </Panel>
  );
}

function HtmlBody({ html, css, caption }: Extract<SlideBody, { kind: 'html' }>) {
  const srcDoc = useMemo(
    () => `<!doctype html>
<html lang="zh-TW">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400..700&family=Huninn&family=Nunito:wght@400..800&display=swap">
<style>
  /*
   * iframe 是 sandbox，外層的 CSS 變數進不來，所以色票要在這裡重寫一份。
   * ⚠ 這些值必須跟 theme.css 同步，改色票時容易漏掉這裡——
   *   漏掉的症狀是 html 版型裡的範例顏色跟簡報其他地方對不上。
   * color-scheme 也一定要跟著改，否則 sandbox 內的表單控制項與捲軸
   * 會維持另一種主題的 UA 樣式。
   */
  :root {
    color-scheme: light;
    --ink: #fff6e3;
    --ink-soft: #fdefcf;
    --panel: #ffffff;
    --panel-lift: #fff3d6;
    --line: #231f3a;
    --line-soft: #e6d6b4;
    --paper: #231f3a;
    --muted: #4a4463;
    --acid: #c21d68;
    --coral: #b23d0c;
    --teal: #0a7166;
    --blue: #2f54d9;
    --acid-pop: #ffb3d1;
    --amber-pop: #ffe066;
    --teal-pop: #96f2d7;
    --sky-pop: #a5d8ff;
    --shadow-pop: 6px 6px 0 0 #231f3a;
    --shadow-pop-sm: 3px 3px 0 0 #231f3a;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    background: var(--ink-soft);
    color: var(--paper);
    font-family: "Nunito", "Huninn", "PingFang TC", "Noto Sans TC", system-ui, sans-serif;
    font-size: 20px;
    line-height: 1.7;
  }
  ${css ?? ''}
</style>
</head>
<body>
${html}
<script>
  // 焦點在 iframe 裡時，父層收不到 keydown。把翻頁按鍵轉發回簡報，
  // 這樣操作過範例之後還是能直接用鍵盤翻頁。
  (function () {
    var NAV = ['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' ','f','F','b','B','h','H'];
    addEventListener('keydown', function (event) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      var target = event.target;
      if (target && (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].indexOf(target.tagName) !== -1)) return;
      if (NAV.indexOf(event.key) === -1) return;
      event.preventDefault();
      parent.postMessage({ type: 'slide-key', key: event.key }, '*');
    });
  })();
</script>
</body>
</html>`,
    [html, css],
  );

  return (
    <figure className="flex h-full min-h-0 w-full flex-col gap-5">
      <div className="min-h-0 flex-1 overflow-hidden rounded-[28px] border-3 border-line bg-ink-soft shadow-pop">
        <iframe
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          className="size-full border-0"
          title="HTML 範例"
        />
      </div>
      {caption && <Caption>{caption}</Caption>}
    </figure>
  );
}

function DiagramBody({
  render: Render,
  caption,
}: Extract<SlideBody, { kind: 'diagram' }>) {
  return (
    <Panel caption={caption}>
      {/* 圖解等比放大填滿面板寬度，高度不足時由 viewBox 自動 letterbox */}
      <div className="flex size-full items-center justify-center [&>svg]:h-auto [&>svg]:max-h-full [&>svg]:w-full">
        <Render />
      </div>
    </Panel>
  );
}

function PointsBody({
  heading,
  items,
}: Extract<SlideBody, { kind: 'points' }>) {
  // 項目多的時候自動收緊，避免超出舞台高度
  const dense = items.length > 4;

  return (
    <div className={`flex h-full min-h-0 flex-col ${dense ? 'gap-6' : 'gap-8'}`}>
      {heading && <SectionHeading>{heading}</SectionHeading>}
      {/* pr／pb 留給卡片的硬邊陰影，不然捲動容器會把陰影裁掉 */}
      <ul
        className={`grid min-h-0 flex-1 content-start overflow-auto pr-1.5 pb-1.5 ${
          dense ? 'gap-3.5' : 'gap-5'
        }`}
      >
        {items.map((item, index) => {
          const accent = item.accent ?? 'acid';

          return (
            <li
              key={item.text}
              /*
               * 糖果色卡片 + 粗描邊 + 硬邊陰影。
               * 語意靠的是左邊那顆實心的六角號碼徽章，不是卡片的淡色底 ——
               * 投影機會把 pop 色洗得更淡，但洗不掉實心的強調色。
               */
              className={`flex items-center gap-6 rounded-2xl border-3 border-line px-7 shadow-pop-sm ${
                dense ? 'py-3.5' : 'py-5'
              } ${accentPop[accent]}`}
            >
              <HexBadge
                size={dense ? 48 : 56}
                fillClass={accentSolid[accent]}
              >
                <span
                  className={`font-display leading-none font-semibold tabular-nums ${
                    dense ? 'text-[21px]' : 'text-[24px]'
                  }`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
              </HexBadge>
              <div className="min-w-0">
                {/* font-bold 而不是 semibold：中文圓體只有一個字重，粗體是合成的，
                    拉丁字要到 Nunito 700 才跟它一樣粗 */}
                <p
                  className={`leading-snug font-bold text-paper ${
                    dense ? 'text-[26px]' : 'text-[28px]'
                  }`}
                >
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center gap-2 underline decoration-[3px] underline-offset-[6px] transition-colors hover:decoration-wavy ${accentDecoration[accent]}`}
                    >
                      {item.text}
                      <ExternalLinkArrow />
                    </a>
                  ) : (
                    item.text
                  )}
                </p>
                {item.note && (
                  <p
                    className={`mt-1 leading-relaxed text-muted ${
                      dense ? 'text-[19px]' : 'text-[21px]'
                    }`}
                  >
                    {item.note}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** points / assets / table 共用的區塊標題：前面一顆小六角形 */
function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="flex shrink-0 items-center gap-4 font-display text-[40px] font-semibold tracking-tight text-paper">
      <HexBadge size={30} fillClass="bg-amber-pop" stroke={3} />
      {children}
    </h3>
  );
}

function AssetsBody({
  heading,
  items,
}: Extract<SlideBody, { kind: 'assets' }>) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-8">
      {heading && <SectionHeading>{heading}</SectionHeading>}
      <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5 overflow-auto pr-1.5 pb-1.5">
        {items.map((item, index) => {
          const meta = getAsset(item.id);

          return (
            <div
              key={item.id}
              className="group flex flex-col items-center gap-4 rounded-2xl border-3 border-line bg-panel px-5 py-6 shadow-pop-sm"
            >
              {/* 貼紙素材自帶白邊與描邊，墊一塊輪替的糖果色圓底就好；
                  hover 時貼紙抖一下（只動圖，不動卡片，捲動容器才不會跳出捲軸） */}
              <div
                className={`grid size-[168px] place-items-center rounded-full border-2 border-line ${
                  popCycle[index % popCycle.length]
                }`}
              >
                <Asset
                  id={item.id}
                  size={150}
                  className="motion-safe:group-hover:animate-[wiggle_360ms_ease-in-out]"
                />
              </div>
              <div className="text-center">
                <p className="font-display text-[22px] font-semibold text-paper">
                  {item.label ?? meta.name}
                </p>
                <p className="mt-1.5 text-[17px] leading-snug text-faint">
                  {item.note ?? meta.purpose}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 外部連結儲存格尾端的小箭頭，用 currentColor 跟著文字色與 hover 走 */
function ExternalLinkArrow() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M9.5 2.5h4v4" />
      <path d="M13.5 2.5 7.5 8.5" />
      <path d="M11.5 9v4.5h-9v-9H7" />
    </svg>
  );
}

function TableCellView({ cell }: { cell: string | TableCell }) {
  const data: TableCell = typeof cell === 'string' ? { text: cell } : cell;
  const face = data.mono ? 'font-mono text-[20px]' : '';

  const body = data.href ? (
    <a
      href={data.href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-1.5 underline decoration-2 underline-offset-4 transition-colors hover:text-acid ${
        data.accent ? accentText[data.accent] : 'text-blue'
      } ${face}`}
    >
      {data.text}
      <ExternalLinkArrow />
    </a>
  ) : (
    <span
      className={`${data.accent ? accentText[data.accent] : 'text-paper'} ${face}`}
    >
      {data.text}
    </span>
  );

  if (!data.note) return body;

  // 小標接在主文上方，用 faint 的字級與間距，不跟主文搶視線
  return (
    <span className="block">
      <span className="mb-1.5 block font-display text-[16px] tracking-[0.14em] text-faint uppercase">
        {data.note}
      </span>
      {body}
    </span>
  );
}

/** 同一份表格內文字可能重複，把整列的文字併起來當 key */
function rowKey(row: TableRow, index: number) {
  const label = row
    .map((cell) => (typeof cell === 'string' ? cell : cell.text))
    .join('|');

  return `${index}-${label}`;
}

function TableBody({
  heading,
  columns,
  rows,
  note,
}: Extract<SlideBody, { kind: 'table' }>) {
  // 列數多時自動收緊列高。簡報不該出現捲軸，超過約 10 列就該拆頁。
  const rowPadding =
    rows.length > 8 ? 'py-3' : rows.length > 6 ? 'py-4' : 'py-5';

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      {heading && <SectionHeading>{heading}</SectionHeading>}

      <div className="min-h-0 flex-1 overflow-hidden rounded-3xl border-3 border-line bg-panel shadow-pop">
        <table className="h-full w-full border-collapse text-left">
          <thead>
            {/* h-0 讓表頭不去吸收 h-full 分配下來的多餘高度 */}
            <tr className="h-0 bg-amber-pop">
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="border-b-3 border-line px-7 py-4 font-display text-[19px] font-semibold tracking-[0.08em] text-paper uppercase"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowKey(row, rowIndex)}
                className="border-b-2 border-line-soft last:border-b-0 even:bg-panel-lift"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${rowIndex}-${cellIndex}`}
                    className={`px-7 align-middle text-[22px] leading-snug ${rowPadding}`}
                  >
                    <TableCellView cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {note && (
        <p className="shrink-0 text-[19px] leading-relaxed text-faint">{note}</p>
      )}
    </div>
  );
}

function SplitBody({
  left,
  right,
  ratio = '1:1',
}: Extract<SlideBody, { kind: 'split' }>) {
  return (
    <div
      className="grid h-full min-h-0 gap-10"
      style={{ gridTemplateColumns: ratioColumns[ratio] }}
    >
      <div className="min-h-0 min-w-0">
        <SlideBodyView body={left} />
      </div>
      <div className="min-h-0 min-w-0">
        <SlideBodyView body={right} />
      </div>
    </div>
  );
}

/* ── 分派 ───────────────────────────────────────────────── */

export function SlideBodyView({ body }: { body: SlideBody }) {
  switch (body.kind) {
    case 'title':
      return <TitleBody {...body} />;
    case 'demo':
      return <DemoBody {...body} />;
    case 'html':
      return <HtmlBody {...body} />;
    case 'diagram':
      return <DiagramBody {...body} />;
    case 'code':
      return <CodeTabs codeBlocks={body.blocks} />;
    case 'points':
      return <PointsBody {...body} />;
    case 'assets':
      return <AssetsBody {...body} />;
    case 'table':
      return <TableBody {...body} />;
    case 'split':
      return <SplitBody {...body} />;
  }
}
