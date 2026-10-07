import type { ReactElement } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈Cloudflare 入門〉— 網站怎麼運作（圖解）
 *
 * 移植自〈網站是如何運作的〉（2026-interactive-presentive/ithome2026），
 * 這份只留第一、二章用得到的四樣東西：
 *
 *   ArchMap           第 4、5、10 頁共用的「運作概念圖」
 *   RoleIcon          角色與商品的小圖示
 *   DeployDiagram     第 11 頁：每個部分放到 Cloudflare 的哪裡
 *   ScaleArchDiagram  第 12 頁：三種內部工具的架構
 *
 * ──────────────────────────────────────────────────────────────
 * 為什麼 ArchMap 要三頁共用
 * ──────────────────────────────────────────────────────────────
 * 節點座標**完全不動**，換的只有：哪些節點亮起、畫哪幾支箭頭、灰框怎麼包。
 * 台下三次看到的是同一張圖被逐步標註，不是三張長得像的圖。
 * 第 10 頁（伺服器）多開 `cloudflare`，把後端與資料庫標上 Worker、D1。
 *
 * ──────────────────────────────────────────────────────────────
 * 色彩契約（全篇共用，元件裡不會出現任何 hex）
 * ──────────────────────────────────────────────────────────────
 *   user    role-user   使用者
 *   client  role-client 前端、瀏覽器
 *   backend role-server 後端程式
 *   db      role-data   資料庫
 *   host    muted / line **伺服器：刻意沒有強調色**
 *   net     faint        網路：它是路徑不是角色
 *   danger  danger       被擋下來的操作
 *   html / css / js      第 6 頁專用，直接吃 lang-* 三色
 *
 * ──────────────────────────────────────────────────────────────
 * 貼紙風（Playground）怎麼套到 SVG 上
 * ──────────────────────────────────────────────────────────────
 * 節點「點名」之後是一張貼紙：不透明的 pop 填色 ＋ 3px 墨紫框 ＋ 往右下偏 5
 * 的實心陰影；沒點名是白底、細框、文字 muted。點名的訊號是**不透明**的
 * 填色與粗框，不是淡色 —— 投影機吃不掉。pop 底上的字一律 paper / muted，
 * 強調色只用在箭頭、焦點外環與白底上的小字。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用型別與常數 ─────────────────────────────────────── */

export type Tone =
  | 'user'
  | 'client'
  | 'backend'
  | 'db'
  | 'host'
  | 'net'
  | 'danger'
  | 'html'
  | 'css'
  | 'js';

/** tone → 線條／文字用的強調色 */
const TONE_VAR: Record<Tone, string> = {
  user: 'var(--color-role-user)',
  client: 'var(--color-role-client)',
  backend: 'var(--color-role-server)',
  db: 'var(--color-role-data)',
  host: 'var(--color-muted)',
  net: 'var(--color-faint)',
  danger: 'var(--color-danger)',
  html: 'var(--color-lang-html)',
  css: 'var(--color-lang-css)',
  js: 'var(--color-lang-javascript)',
};

/** tone → 貼紙的 pop 填色（不透明，上面壓 paper） */
const TONE_POP_VAR: Record<Tone, string> = {
  user: 'var(--color-coral-pop)',
  client: 'var(--color-blue-pop)',
  backend: 'var(--color-acid-pop)',
  db: 'var(--color-teal-pop)',
  host: 'var(--color-panel-lift)',
  net: 'var(--color-ink-soft)',
  danger: 'var(--color-danger-pop)',
  html: 'var(--color-coral-pop)',
  css: 'var(--color-blue-pop)',
  js: 'var(--color-acid-pop)',
};

const C = {
  paper: 'var(--color-paper)',
  muted: 'var(--color-muted)',
  faint: 'var(--color-faint)',
  line: 'var(--color-line)',
  lineSoft: 'var(--color-line-soft)',
  panel: 'var(--color-panel)',
  inkSoft: 'var(--color-ink-soft)',
  amberPop: 'var(--color-amber-pop)',
} as const;

const ALL_TONES = Object.keys(TONE_VAR) as Tone[];

/** marker id 的前綴，跟其他圖解分開 */
const ARROW_ID = 'cf-web-arrow';

/** SVG 的過渡。`d` 不能 transition，fill-opacity 與 dashoffset 要單獨列 */
const SVG_TR =
  'transition-[fill,stroke,opacity,fill-opacity,stroke-dashoffset,stroke-width] duration-500 ease-out';
const ICON_TR = 'transition-[fill,stroke,opacity] duration-300 ease-out';

/** 焦點外環比方塊外擴的量。箭頭的起訖點要避開它 */
const RING_PAD = 7;

/** 貼紙陰影的位移 */
const SHADOW = 5;

/* ── 箭頭 ───────────────────────────────────────────────── */

/** markerUnits 用預設的 strokeWidth：線寬 3.5 → 箭頭實長約 26 */
function ArrowDefs(): ReactElement {
  return (
    <defs>
      {ALL_TONES.map((tone) => (
        <marker
          key={tone}
          id={`${ARROW_ID}-${tone}`}
          markerWidth={8}
          markerHeight={8}
          refX={6.5}
          refY={3}
          orient="auto"
        >
          <path d="M0.5,0.5 L7,3 L0.5,5.5 z" fill={TONE_VAR[tone]} />
        </marker>
      ))}
    </defs>
  );
}

/** pathLength=1 ＋ dashoffset 讓線「長出來」；整組一起吃 opacity */
function FlowArrow({
  d,
  tone,
  shown,
}: {
  d: string;
  tone: Tone;
  shown: boolean;
}): ReactElement {
  return (
    <g opacity={shown ? 1 : 0} className={SVG_TR}>
      <path
        d={d}
        fill="none"
        stroke={TONE_VAR[tone]}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={shown ? 0 : 1}
        markerEnd={`url(#${ARROW_ID}-${tone})`}
        className={SVG_TR}
      />
    </g>
  );
}

/* ── 貼紙方塊 ───────────────────────────────────────────── */

interface StickerBoxProps {
  x: number;
  y: number;
  w: number;
  h: number;
  tone: Tone;
  on: boolean;
  title: string;
  note?: string;
  ring?: boolean;
  titleSize?: number;
  noteSize?: number;
}

/**
 * 一個角色方塊。`on` 是「這一格現在有沒有被點名」。
 * 方塊全程留在 DOM 裡，狀態只靠 fill / stroke / opacity 切換。
 */
function StickerBox({
  x,
  y,
  w,
  h,
  tone,
  on,
  title,
  note,
  ring = false,
  titleSize = 27,
  noteSize = 19,
}: StickerBoxProps): ReactElement {
  const cx = x + w / 2;

  return (
    <g>
      {/* 焦點外環：虛線、角色色 */}
      <rect
        x={x - RING_PAD}
        y={y - RING_PAD}
        width={w + RING_PAD * 2 + SHADOW}
        height={h + RING_PAD * 2 + SHADOW}
        rx={24}
        fill="none"
        stroke={TONE_VAR[tone]}
        strokeWidth={3}
        strokeDasharray="8 7"
        opacity={ring ? 1 : 0}
        className={SVG_TR}
      />
      {/* 貼紙陰影 */}
      <rect
        x={x + SHADOW}
        y={y + SHADOW}
        width={w}
        height={h}
        rx={18}
        fill={C.line}
        opacity={on ? 1 : 0}
        className={SVG_TR}
      />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={18}
        fill={on ? TONE_POP_VAR[tone] : C.panel}
        stroke={on ? C.line : C.lineSoft}
        strokeWidth={on ? 3 : 2.5}
        className={SVG_TR}
      />
      <text
        x={cx}
        y={note === undefined ? y + h / 2 + titleSize / 3 : y + h / 2 - 8}
        textAnchor="middle"
        fill={on ? C.paper : C.muted}
        fontSize={titleSize}
        fontWeight={700}
        fontFamily="var(--font-display)"
        className={SVG_TR}
      >
        {title}
      </text>
      {note !== undefined && (
        <text
          x={cx}
          y={y + h / 2 + 26}
          textAnchor="middle"
          fill={on ? C.muted : C.faint}
          fontSize={noteSize}
          className={SVG_TR}
        >
          {note}
        </text>
      )}
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════
 * RoleIcon — 角色與商品圖示（手繪 SVG，吃 tone）
 * ══════════════════════════════════════════════════════════════ */

export type RoleIconId =
  | 'browser'
  | 'server'
  | 'database'
  | 'sheet'
  | 'code'
  | 'suitcase'
  | 'backpack'
  | 'pouch'
  | 'image'
  | 'cloud';

const ROLE_ICON_LABEL: Record<RoleIconId, string> = {
  browser: '瀏覽器',
  server: '伺服器',
  database: '資料庫',
  sheet: '試算表',
  code: '程式碼',
  suitcase: '行李箱',
  backpack: '後背包',
  pouch: '收納袋',
  image: '圖片檔',
  cloud: '雲端',
};

function roleGlyph(id: RoleIconId, color: string, wash: number): ReactElement {
  const outline = {
    fill: 'none',
    stroke: color,
    strokeWidth: 2.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: ICON_TR,
  };
  const band = {
    fill: color,
    fillOpacity: wash,
    stroke: 'none',
    className: ICON_TR,
  };
  const dot = { fill: color, stroke: 'none', className: ICON_TR };

  switch (id) {
    case 'browser':
      return (
        <g>
          <rect x={5} y={9} width={34} height={27} rx={4} {...band} />
          <rect x={5} y={9} width={34} height={27} rx={4} {...outline} />
          <path d="M5 17 H39" {...outline} />
          <circle cx={10} cy={13} r={1.6} {...dot} />
          <circle cx={15} cy={13} r={1.6} {...dot} />
          <circle cx={20} cy={13} r={1.6} {...dot} />
          <path d="M11 24 H33" {...outline} />
          <path d="M11 30 H26" {...outline} />
        </g>
      );
    case 'server':
      return (
        <g>
          <rect x={6} y={8} width={32} height={13} rx={3} {...band} />
          <rect x={6} y={8} width={32} height={13} rx={3} {...outline} />
          <rect x={6} y={25} width={32} height={13} rx={3} {...band} />
          <rect x={6} y={25} width={32} height={13} rx={3} {...outline} />
          <circle cx={12} cy={14.5} r={1.8} {...dot} />
          <circle cx={12} cy={31.5} r={1.8} {...dot} />
          <path d="M19 14.5 H32" {...outline} />
          <path d="M19 31.5 H32" {...outline} />
        </g>
      );
    case 'database':
      return (
        <g>
          <path d="M8 12 V32 C8 35 14 37 22 37 C30 37 36 35 36 32 V12 Z" {...band} />
          <ellipse cx={22} cy={12} rx={14} ry={5} {...band} />
          <ellipse cx={22} cy={12} rx={14} ry={5} {...outline} />
          <path d="M8 12 V32 C8 35 14 37 22 37 C30 37 36 35 36 32 V12" {...outline} />
          <path d="M8 22 C8 25 14 27 22 27 C30 27 36 25 36 22" {...outline} />
        </g>
      );
    case 'sheet':
      return (
        <g>
          <rect x={7} y={6} width={30} height={32} rx={3} {...band} />
          <rect x={7} y={6} width={30} height={32} rx={3} {...outline} />
          <path d="M7 16 H37" {...outline} />
          <path d="M7 27 H37" {...outline} />
          <path d="M18 16 V38" {...outline} />
          <path d="M28 16 V38" {...outline} />
        </g>
      );
    case 'code':
      return (
        <g>
          <rect x={5} y={8} width={34} height={28} rx={4} {...band} />
          <rect x={5} y={8} width={34} height={28} rx={4} {...outline} />
          <path d="M16 17 L11 22 L16 27" {...outline} />
          <path d="M28 17 L33 22 L28 27" {...outline} />
          <path d="M24 15 L20 29" {...outline} />
        </g>
      );
    case 'suitcase':
      return (
        <g>
          <path d="M18 10 V8 C18 6.6 19 6 20.2 6 H23.8 C25 6 26 6.6 26 8 V10" {...outline} />
          <rect x={8} y={10} width={28} height={25} rx={3} {...band} />
          <rect x={8} y={10} width={28} height={25} rx={3} {...outline} />
          <path d="M8 20 H36" {...outline} />
          <path d="M22 10 V35" {...outline} />
          <path d="M13 35 V38" {...outline} />
          <path d="M31 35 V38" {...outline} />
        </g>
      );
    case 'backpack':
      return (
        <g>
          <path d="M12 18 C12 13 16 10 22 10 C28 10 32 13 32 18 V34 C32 35.5 31 36 30 36 H14 C13 36 12 35.5 12 34 Z" {...band} />
          <path d="M12 18 C12 13 16 10 22 10 C28 10 32 13 32 18 V34 C32 35.5 31 36 30 36 H14 C13 36 12 35.5 12 34 Z" {...outline} />
          <path d="M12 23 H32" {...outline} />
          <rect x={17} y={26} width={10} height={7} rx={2} {...outline} />
          <path d="M18 11 V8 C18 6.6 19.6 6 22 6 C24.4 6 26 6.6 26 8 V11" {...outline} />
        </g>
      );
    case 'pouch':
      return (
        <g>
          <rect x={9} y={11} width={21} height={10} rx={3} {...band} />
          <rect x={9} y={11} width={21} height={10} rx={3} {...outline} />
          <rect x={14} y={22} width={21} height={10} rx={3} {...band} />
          <rect x={14} y={22} width={21} height={10} rx={3} {...outline} />
          <rect x={10} y={33} width={17} height={7} rx={3} {...outline} />
          <path d="M9 16 H30" {...outline} />
          <path d="M14 27 H35" {...outline} />
        </g>
      );
    case 'image':
      return (
        <g>
          <rect x={6} y={9} width={32} height={26} rx={3} {...band} />
          <rect x={6} y={9} width={32} height={26} rx={3} {...outline} />
          <circle cx={15} cy={17} r={3} {...outline} />
          <path d="M6 31 L16 22 L23 28 L28 24 L38 32" {...outline} />
        </g>
      );
    case 'cloud':
      return (
        <g>
          <path d="M13 33 C8 33 5 29.5 5 25.5 C5 21.5 8 18.5 12 18.3 C13 13 17.2 9.5 22.4 9.5 C27.6 9.5 31.6 13 32.6 17.8 C36.5 18.2 39.5 21.4 39.5 25.4 C39.5 29.6 36.2 33 32 33 Z" {...band} />
          <path d="M13 33 C8 33 5 29.5 5 25.5 C5 21.5 8 18.5 12 18.3 C13 13 17.2 9.5 22.4 9.5 C27.6 9.5 31.6 13 32.6 17.8 C36.5 18.2 39.5 21.4 39.5 25.4 C39.5 29.6 36.2 33 32 33 Z" {...outline} />
        </g>
      );
  }
}

/** 角色圖示，透明底、線條 ＋ 少量填色，size 預設 44 */
export function RoleIcon({
  id,
  size = 44,
  tone = 'client',
  muted = false,
}: {
  id: RoleIconId;
  size?: number;
  tone?: Tone;
  muted?: boolean;
}): ReactElement {
  const color = muted ? 'var(--color-faint)' : TONE_VAR[tone];
  const wash = muted ? 0.14 : 0.22;

  return (
    <svg width={size} height={size} viewBox="0 0 44 44" role="img">
      <title>{ROLE_ICON_LABEL[id]}</title>
      {roleGlyph(id, color, wash)}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
 * ArchMap — 運作概念圖（viewBox 820 × 600）
 *
 *   使用者      ( 40,  50) 270 × 56
 *   前端        ( 40, 160) 270 × 160     cx 175
 *   後端        (500, 130) 270 × 150     cx 635
 *   資料庫      (500, 360) 270 × 150     cx 635
 *   伺服器框    (480,  74) 310 × 482     ← frames='server'
 *   網路去程    y 195   x 318 → 492
 *   網路回程    y 255   x 492 → 318
 *   網站空間框  ( 18, 372) 314 × 196     ← showSite
 *   前端程式碼  ( 40, 418) 270 × 124     往上一支箭頭「傳到瀏覽器執行」
 *
 * showSite：前端的程式碼也要有地方放 —— 平常放在「網站空間」這台機器上，
 * 有人打開網址才整包傳到瀏覽器裡執行。前端那一格是「在瀏覽器裡跑起來的畫面」，
 * 下面這一格是「放著等人來拿的程式碼」，兩格同一支藍色，講的是同一份東西的兩個位置。
 * （第 4、5 頁打開；第 10 頁的 deployMode 本來就把前端畫成一整格「前端程式」，不開。）
 *
 * deployMode：講「放在哪」而不是「請求怎麼跑」，使用者與網路整組收掉，
 * 前端改標成「前端程式」。同一張圖從流程圖切成部署圖，節點不搬家。
 * ══════════════════════════════════════════════════════════════ */

/** `site` 是放前端程式碼的網站空間（showSite 才畫） */
export type ArchNode = 'user' | 'client' | 'backend' | 'db' | 'host' | 'site';

export type ArchArrow =
  | 'userToClient'
  | 'clientToBackend'
  | 'backendToDb'
  | 'dbToBackend'
  | 'backendToClient'
  | 'siteToClient';

/**
 * 灰框怎麼包：
 *   none    不包 —— 「它們自己不會動」
 *   server  一個框包住後端與資料庫
 *   one     一個框包住三個 —— 「最單純：全部放同一台」
 *   three   三個框各包一個 —— 「需求變大就拆開」
 */
export type ArchFrames = 'none' | 'server' | 'one' | 'three';

interface ArchMapProps {
  lit: ArchNode[];
  ring?: ArchNode;
  arrows?: ArchArrow[];
  frames: ArchFrames;
  deployMode?: boolean;
  /** 後端、資料庫與拆開的三個框標上 Cloudflare 的服務名稱 */
  cloudflare?: boolean;
  /** 前端底下多畫一個「網站空間」，放前端的程式碼 */
  showSite?: boolean;
}

const NODE = {
  user: { x: 40, y: 50, w: 270, h: 56 },
  client: { x: 40, y: 160, w: 270, h: 160 },
  backend: { x: 500, y: 130, w: 270, h: 150 },
  db: { x: 500, y: 360, w: 270, h: 150 },
  site: { x: 40, y: 418, w: 270, h: 124 },
} as const;

const SITE_FRAME = { x: 18, y: 372, w: 314, h: 196 } as const;

const LANE_OUT = 195;
const LANE_BACK = 255;

const ARROW_D: Record<ArchArrow, string> = {
  userToClient: 'M 175 114 L 175 150',
  clientToBackend: `M 322 ${LANE_OUT} L 490 ${LANE_OUT}`,
  backendToDb: 'M 655 292 L 655 350',
  dbToBackend: 'M 615 350 L 615 292',
  backendToClient: `M 490 ${LANE_BACK} L 322 ${LANE_BACK}`,
  siteToClient: 'M 175 406 L 175 336',
};

const ARROW_TONE: Record<ArchArrow, Tone> = {
  userToClient: 'user',
  clientToBackend: 'client',
  backendToDb: 'backend',
  dbToBackend: 'db',
  backendToClient: 'backend',
  siteToClient: 'client',
};

/** 三個獨立的框。上緣比卡片高 46 以上，標籤才不會壓到卡片 */
const SPLIT_FRAMES = [
  { x: 18, y: 112, w: 314, h: 240, label: '前端伺服器', cf: '放在 Pages' },
  { x: 478, y: 82, w: 314, h: 220, label: '後端伺服器', cf: '放在 Worker' },
  { x: 478, y: 312, w: 314, h: 234, label: '資料庫伺服器', cf: '放在 D1' },
];

/**
 * 伺服器外框。沒有強調色是刻意的。
 * 還沒點名是虛線（「這裡有一個範圍」），點名之後變實線、變粗、標籤轉深。
 */
function HostFrame({
  x,
  y,
  w,
  h,
  label,
  shown,
  on,
  ring = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  shown: boolean;
  on: boolean;
  ring?: boolean;
}): ReactElement {
  return (
    <g opacity={shown ? 1 : 0} className={SVG_TR}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={26}
        fill={C.panel}
        fillOpacity={on ? 1 : 0.7}
        stroke={on ? C.line : C.faint}
        strokeWidth={ring ? 4 : on ? 3 : 2.5}
        strokeDasharray={on ? undefined : '12 8'}
        className={SVG_TR}
      />
      <text
        x={x + 22}
        y={y + 31}
        fill={on ? C.paper : C.muted}
        fontSize={20}
        fontWeight={700}
        className={SVG_TR}
      >
        {label}
      </text>
    </g>
  );
}

export function ArchMap({
  lit,
  ring,
  arrows = [],
  frames,
  deployMode = false,
  cloudflare = false,
  showSite = false,
}: ArchMapProps): ReactElement {
  const on = (node: ArchNode) => lit.includes(node);
  const hasArrow = (arrow: ArchArrow) => arrows.includes(arrow);
  const site = showSite && !deployMode;

  return (
    <svg
      viewBox="0 0 820 600"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="網站運作概念圖：使用者、前端，以及伺服器上的後端與資料庫"
    >
      <ArrowDefs />

      <HostFrame
        x={480}
        y={74}
        w={310}
        h={482}
        label="伺服器"
        shown={frames === 'server'}
        on={on('host')}
        ring={ring === 'host'}
      />
      <HostFrame
        x={18}
        y={100}
        w={774}
        h={460}
        label="一台伺服器"
        shown={frames === 'one'}
        on={on('host')}
        ring={ring === 'host'}
      />
      {SPLIT_FRAMES.map((frame) => (
        <HostFrame
          key={frame.label}
          x={frame.x}
          y={frame.y}
          w={frame.w}
          h={frame.h}
          label={cloudflare ? `${frame.label} · ${frame.cf}` : frame.label}
          shown={frames === 'three'}
          on={on('host')}
          ring={ring === 'host'}
        />
      ))}

      {/* 網路：兩條虛線軌道永遠都在，彩色箭頭長在軌道上面 */}
      <g opacity={deployMode ? 0 : 1} className={SVG_TR}>
        <path
          d={`M 318 ${LANE_OUT} L 494 ${LANE_OUT}`}
          fill="none"
          stroke={C.lineSoft}
          strokeWidth={3}
          strokeDasharray="2 10"
          strokeLinecap="round"
        />
        <path
          d={`M 318 ${LANE_BACK} L 494 ${LANE_BACK}`}
          fill="none"
          stroke={C.lineSoft}
          strokeWidth={3}
          strokeDasharray="2 10"
          strokeLinecap="round"
        />
        <text x={405} y={233} textAnchor="middle" fill={C.faint} fontSize={20}>
          網路
        </text>
      </g>

      <g opacity={deployMode ? 0 : 1} className={SVG_TR}>
        <StickerBox
          {...NODE.user}
          tone="user"
          on={on('user')}
          ring={ring === 'user'}
          title="使用者"
          titleSize={23}
        />
      </g>
      {/* 網站空間：放前端程式碼的機器。框跟伺服器框同一套（沒有強調色），卡片是前端的藍 */}
      {site && (
        <g>
          <HostFrame
            {...SITE_FRAME}
            label="網站空間"
            shown
            on={on('site')}
            ring={false}
          />
          <StickerBox
            {...NODE.site}
            tone="client"
            on={on('site')}
            ring={ring === 'site'}
            title="前端程式碼"
            note="HTML / CSS / JavaScript"
            titleSize={25}
            noteSize={18}
          />
          <text
            x={190}
            y={358}
            fill={C.muted}
            fontSize={17}
            fontWeight={700}
            opacity={hasArrow('siteToClient') ? 1 : 0}
            className={SVG_TR}
          >
            傳到瀏覽器執行
          </text>
        </g>
      )}

      <StickerBox
        {...NODE.client}
        tone="client"
        on={on('client')}
        ring={ring === 'client'}
        title={deployMode ? '前端程式' : '前端'}
        note={deployMode ? 'HTML / CSS / JavaScript' : site ? '在瀏覽器裡跑的畫面' : '你看到的畫面'}
      />
      <StickerBox
        {...NODE.backend}
        tone="backend"
        on={on('backend')}
        ring={ring === 'backend'}
        title="後端"
        note={cloudflare ? '（Cloudflare Worker）' : '處理邏輯的程式'}
      />
      <StickerBox
        {...NODE.db}
        tone="db"
        on={on('db')}
        ring={ring === 'db'}
        title="資料庫"
        note={cloudflare ? '（Cloudflare D1）' : '長期保存資料'}
      />

      {(Object.keys(ARROW_D) as ArchArrow[]).map((arrow) => (
        <FlowArrow
          key={arrow}
          d={ARROW_D[arrow]}
          tone={ARROW_TONE[arrow]}
          shown={hasArrow(arrow) && (arrow !== 'siteToClient' || site)}
        />
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
 * DeployDiagram — 每個部分放到 Cloudflare 的哪裡（第 11 頁）
 *
 * 三組並排的「東西 → 放的地方」，目的地卡下面掛一張 Cloudflare 的服務貼紙。
 * viewBox 1560 × 600，三欄 x 起點 40 / 560 / 1080，寬 440，間距 80。
 * ══════════════════════════════════════════════════════════════ */

interface DeployGroup {
  x: number;
  tone: Tone;
  kicker: string;
  from: { title: string; note: string; icon: RoleIconId };
  to: { title: string; note: string; icon: RoleIconId };
  service: string;
  plain: string;
}

const DEPLOY_COL_W = 440;

const DEPLOY_GROUPS: DeployGroup[] = [
  {
    x: 40,
    tone: 'client',
    kicker: '看得到的那一層',
    from: { title: '前端程式', note: 'HTML / CSS / JavaScript', icon: 'code' },
    to: { title: '網站空間', note: '把檔案送給瀏覽器', icon: 'browser' },
    service: 'Cloudflare Pages',
    plain: '網頁檔案放這裡，大家就打得開',
  },
  {
    x: 560,
    tone: 'backend',
    kicker: '幫你做事的那一層',
    from: { title: '後端程式', note: '處理邏輯的程式', icon: 'code' },
    to: { title: '伺服器', note: '把程式跑起來', icon: 'server' },
    service: 'Cloudflare Worker',
    plain: '不用自己顧主機，有人來它才開工',
  },
  {
    x: 1080,
    tone: 'db',
    kicker: '要長期留著的那一層',
    from: { title: '資料', note: '預約、名單、紀錄', icon: 'sheet' },
    to: { title: '資料庫服務', note: '長期保存、只有後端能動', icon: 'database' },
    service: 'Cloudflare D1',
    plain: '像一張只有後端能改的試算表',
  },
];

/** 一張貼紙卡 */
function DeployCard({
  x,
  y,
  tone,
  title,
  note,
  icon,
  filled,
}: {
  x: number;
  y: number;
  tone: Tone;
  title: string;
  note: string;
  icon: RoleIconId;
  filled: boolean;
}): ReactElement {
  const color = TONE_VAR[tone];

  return (
    <g>
      <rect
        x={x + SHADOW}
        y={y + SHADOW}
        width={DEPLOY_COL_W}
        height={140}
        rx={22}
        fill={C.line}
      />
      <rect
        x={x}
        y={y}
        width={DEPLOY_COL_W}
        height={140}
        rx={22}
        fill={filled ? TONE_POP_VAR[tone] : C.panel}
        stroke={C.line}
        strokeWidth={3}
      />
      <g transform={`translate(${x + 30}, ${y + 34}) scale(1.6)`}>
        {roleGlyph(icon, filled ? C.paper : color, filled ? 0.12 : 0.18)}
      </g>
      <text
        x={x + 122}
        y={y + 64}
        fill={C.paper}
        fontSize={32}
        fontWeight={700}
        fontFamily="var(--font-display)"
      >
        {title}
      </text>
      <text x={x + 122} y={y + 102} fill={C.muted} fontSize={21}>
        {note}
      </text>
    </g>
  );
}

export function DeployDiagram(): ReactElement {
  return (
    <svg
      viewBox="0 0 1560 600"
      className="h-full w-full"
      role="img"
      aria-label="部署對照：前端程式放到 Cloudflare Pages、後端程式放到 Cloudflare Worker、資料放到 Cloudflare D1"
    >
      <ArrowDefs />

      {DEPLOY_GROUPS.map((group) => {
        const color = TONE_VAR[group.tone];
        const cx = group.x + DEPLOY_COL_W / 2;

        return (
          <g key={group.kicker}>
            <text
              x={group.x + 4}
              y={52}
              fill={color}
              fontSize={22}
              fontWeight={700}
            >
              {group.kicker}
            </text>

            <DeployCard
              x={group.x}
              y={76}
              tone={group.tone}
              title={group.from.title}
              note={group.from.note}
              icon={group.from.icon}
              filled={false}
            />

            <FlowArrow d={`M ${cx} 236 L ${cx} 292`} tone={group.tone} shown />
            <text x={cx + 22} y={272} fill={C.faint} fontSize={20}>
              放到
            </text>

            <DeployCard
              x={group.x}
              y={308}
              tone={group.tone}
              title={group.to.title}
              note={group.to.note}
              icon={group.to.icon}
              filled
            />

            {/* Cloudflare 服務名稱：一張歪貼的檸檬黃標籤 */}
            <g transform={`rotate(-2 ${group.x + 150} 500)`}>
              <rect
                x={group.x + 3}
                y={477}
                width={300}
                height={48}
                rx={24}
                fill={C.line}
              />
              <rect
                x={group.x}
                y={474}
                width={300}
                height={48}
                rx={24}
                fill={C.amberPop}
                stroke={C.line}
                strokeWidth={2.5}
              />
              <text
                x={group.x + 150}
                y={506}
                textAnchor="middle"
                fill={C.paper}
                fontSize={23}
                fontWeight={700}
                fontFamily="var(--font-display)"
              >
                {group.service}
              </text>
            </g>
            <text x={group.x + 4} y={570} fill={C.muted} fontSize={21}>
              {group.plain}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
 * ScaleArchDiagram — 三種內部工具的架構（第 12 頁）
 *
 * viewBox 1240 × 440。三種規模的瀏覽器卡座標完全一樣，
 * 切換時只有右邊在長出來 / 收回去。框的標籤直接寫 Cloudflare 的服務名稱。
 * ══════════════════════════════════════════════════════════════ */

export type ScaleId = 'mine' | 'team' | 'company';

interface ArchCard {
  x: number;
  y: number;
  w: number;
  h: number;
  tone: Tone;
  title: string;
  note?: string;
}

interface ArchFrame {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  cards: ArchCard[];
}

interface ScaleArch {
  frames: ArchFrame[];
  arrows: string[];
  absent?: { x: number; y: number; w: number; h: number; lines: string[] };
}

const ARCH_BROWSER: ArchCard = {
  x: 30,
  y: 165,
  w: 220,
  h: 110,
  tone: 'user',
  title: '同事的瀏覽器',
};

const SCALE_ARCH: Record<ScaleId, ScaleArch> = {
  mine: {
    frames: [
      {
        x: 370,
        y: 90,
        w: 400,
        h: 260,
        label: 'Cloudflare Pages',
        cards: [
          {
            x: 400,
            y: 175,
            w: 340,
            h: 130,
            tone: 'client',
            title: '前端',
            note: '畫面就是全部',
          },
        ],
      },
    ],
    arrows: ['M 260 220 L 360 220'],
    absent: {
      x: 820,
      y: 90,
      w: 380,
      h: 260,
      lines: ['不需要 Worker', '不需要 D1', '資料存在你的瀏覽器裡'],
    },
  },
  team: {
    frames: [
      {
        x: 370,
        y: 30,
        w: 400,
        h: 150,
        label: 'Cloudflare Pages',
        cards: [{ x: 400, y: 80, w: 340, h: 76, tone: 'client', title: '前端' }],
      },
      {
        x: 370,
        y: 210,
        w: 400,
        h: 200,
        label: 'Cloudflare Worker',
        cards: [
          {
            x: 400,
            y: 262,
            w: 340,
            h: 120,
            tone: 'backend',
            title: '後端',
            note: '判斷誰可以預約、誰可以取消',
          },
        ],
      },
      {
        x: 820,
        y: 210,
        w: 380,
        h: 200,
        label: 'Cloudflare D1',
        cards: [
          {
            x: 850,
            y: 262,
            w: 320,
            h: 120,
            tone: 'db',
            title: '資料庫',
            note: '每一筆預約都留著',
          },
        ],
      },
    ],
    arrows: ['M 260 200 L 360 120', 'M 260 240 L 360 300', 'M 748 316 L 810 316'],
  },
  company: {
    frames: [
      {
        x: 370,
        y: 20,
        w: 400,
        h: 130,
        label: 'Cloudflare Pages',
        cards: [{ x: 400, y: 70, w: 340, h: 62, tone: 'client', title: '前端' }],
      },
      {
        x: 370,
        y: 180,
        w: 400,
        h: 240,
        label: 'Cloudflare Worker',
        cards: [
          { x: 400, y: 230, w: 340, h: 80, tone: 'backend', title: '登入與權限' },
          { x: 400, y: 322, w: 340, h: 80, tone: 'backend', title: '簽核流程' },
        ],
      },
      {
        x: 820,
        y: 20,
        w: 380,
        h: 190,
        label: 'Cloudflare D1',
        cards: [
          {
            x: 850,
            y: 72,
            w: 320,
            h: 116,
            tone: 'db',
            title: '資料庫',
            note: '請假、報帳紀錄',
          },
        ],
      },
      {
        x: 820,
        y: 230,
        w: 380,
        h: 190,
        label: 'Cloudflare R2',
        cards: [
          {
            x: 850,
            y: 282,
            w: 320,
            h: 116,
            tone: 'db',
            title: '檔案空間',
            note: '收據照片、附件',
          },
        ],
      },
    ],
    arrows: [
      'M 260 200 L 360 100',
      'M 260 240 L 360 290',
      'M 748 268 L 810 150',
      'M 748 340 L 810 340',
    ],
  },
};

/** 架構卡：跟 StickerBox 同一套視覺，但永遠是亮的 */
function ArchCardView({ card }: { card: ArchCard }): ReactElement {
  const cx = card.x + card.w / 2;

  return (
    <g>
      <rect
        x={card.x + 4}
        y={card.y + 4}
        width={card.w}
        height={card.h}
        rx={16}
        fill={C.line}
      />
      <rect
        x={card.x}
        y={card.y}
        width={card.w}
        height={card.h}
        rx={16}
        fill={TONE_POP_VAR[card.tone]}
        stroke={C.line}
        strokeWidth={2.5}
      />
      <text
        x={cx}
        y={
          card.note === undefined
            ? card.y + card.h / 2 + 9
            : card.y + card.h / 2 - 6
        }
        textAnchor="middle"
        fill={C.paper}
        fontSize={26}
        fontWeight={700}
        fontFamily="var(--font-display)"
      >
        {card.title}
      </text>
      {card.note !== undefined && (
        <text
          x={cx}
          y={card.y + card.h / 2 + 26}
          textAnchor="middle"
          fill={C.muted}
          fontSize={19}
        >
          {card.note}
        </text>
      )}
    </g>
  );
}

export function ScaleArchDiagram({ scaleId }: { scaleId: ScaleId }): ReactElement {
  const arch = SCALE_ARCH[scaleId];
  const absent = arch.absent;

  return (
    <svg
      viewBox="0 0 1240 440"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="這個規模需要的架構：用到 Cloudflare 的哪幾項服務"
    >
      <ArrowDefs />

      {arch.frames.map((frame) => (
        <g key={frame.label}>
          <rect
            x={frame.x}
            y={frame.y}
            width={frame.w}
            height={frame.h}
            rx={22}
            fill={C.panel}
            stroke={C.line}
            strokeWidth={2.5}
          />
          <text
            x={frame.x + 22}
            y={frame.y + 32}
            fill={C.paper}
            fontSize={20}
            fontWeight={700}
          >
            {frame.label}
          </text>
        </g>
      ))}

      {absent && (
        <g>
          <rect
            x={absent.x}
            y={absent.y}
            width={absent.w}
            height={absent.h}
            rx={22}
            fill="none"
            stroke={C.faint}
            strokeWidth={2.5}
            strokeDasharray="10 8"
          />
          {absent.lines.map((line, index) => (
            <text
              key={line}
              x={absent.x + absent.w / 2}
              y={absent.y + absent.h / 2 - 42 + index * 42}
              textAnchor="middle"
              fill={C.muted}
              fontSize={21}
            >
              {line}
            </text>
          ))}
        </g>
      )}

      <ArchCardView card={ARCH_BROWSER} />
      {arch.frames.flatMap((frame) =>
        frame.cards.map((card) => (
          <ArchCardView key={`${frame.label}-${card.title}`} card={card} />
        )),
      )}

      {arch.arrows.map((d) => (
        <FlowArrow key={d} d={d} tone="net" shown />
      ))}
    </svg>
  );
}
