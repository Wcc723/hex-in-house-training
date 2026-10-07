import type { ReactElement } from 'react';

/* ══════════════════════════════════════════════════════════════
 * 〈Cloudflare 入門〉— Cloudflare 服務的圖解
 *
 *   CloudflareMap  第 15–18 頁：Pages、Worker、D1、R2 四個頁籤共用的一張圖
 *   DomainFlow     第 14 頁：輸入網址之後，網域怎麼找到你的網站
 *
 * CloudflareMap 的骨架照〈從 0 到 1 的網站開發〉的 StorageMap：
 * 左邊使用者與前端、右邊一個大框，四個頁籤看的是**同一張圖**，
 * 只換「哪一格是主角、哪幾支箭頭在跑」。不同的是這裡的大框是 Cloudflare，
 * 框裡多了 Pages 與 Worker 兩格。
 *
 * ──────────────────────────────────────────────────────────────
 * 用色：每個服務一支色，一個頁籤只有主角那一支會亮
 * ──────────────────────────────────────────────────────────────
 *   pages   blue   （跟前端同色：Pages 放的就是前端檔案）
 *   worker  acid   （跟後端同色：Worker 就是後端）
 *   d1      teal   （跟資料庫同色）
 *   r2      violet （檔案，不是角色色）
 * 主角是 pop 填色的貼紙；有參與但不是主角的是白底粗框；沒用到的是淡框。
 *
 * ──────────────────────────────────────────────────────────────
 * 座標（viewBox 660 × 520，放進 660 寬的欄位是 1:1）
 * ──────────────────────────────────────────────────────────────
 *   使用者      ( 12,  12) 200 × 44
 *   前端        ( 12,  96) 200 × 250
 *   Cloudflare  (286,  12) 362 × 500
 *   Pages       (308,  58) 318 × 100     網路 y 106 去、y 140 回
 *   Worker      (308, 188) 318 × 104     網路 y 218 去、y 260 回
 *   D1          (308, 338) 152 × 160
 *   R2          (474, 338) 152 × 160
 * ══════════════════════════════════════════════════════════════ */

export type ServiceId = 'pages' | 'worker' | 'd1' | 'r2';
type NodeId = 'user' | 'client' | ServiceId;

/** off：這一頁沒用到；soft：有參與但不是主角；on：主角 */
export type NodeState = 'off' | 'soft' | 'on';

export type CfArrow =
  | 'userToClient'
  | 'clientToPages'
  | 'pagesToClient'
  | 'clientToWorker'
  | 'workerToClient'
  | 'workerToD1'
  | 'd1ToWorker'
  | 'workerToR2'
  | 'r2ToWorker';

export interface CloudflareMapProps {
  states: Partial<Record<NodeId, NodeState>>;
  arrows?: CfArrow[];
  ring?: NodeId;
  notes?: Partial<Record<NodeId, string>>;
}

const C = {
  paper: 'var(--color-paper)',
  muted: 'var(--color-muted)',
  faint: 'var(--color-faint)',
  line: 'var(--color-line)',
  lineSoft: 'var(--color-line-soft)',
  panel: 'var(--color-panel)',
  amberPop: 'var(--color-amber-pop)',
} as const;

/** 每一格的強調色（線、外環、箭頭）與 pop 填色 */
const NODE_ACCENT: Record<NodeId, string> = {
  user: 'var(--color-role-user)',
  client: 'var(--color-role-client)',
  pages: 'var(--color-blue)',
  worker: 'var(--color-acid)',
  d1: 'var(--color-teal)',
  r2: 'var(--color-violet)',
};

const NODE_POP: Record<NodeId, string> = {
  user: 'var(--color-coral-pop)',
  client: 'var(--color-blue-pop)',
  pages: 'var(--color-blue-pop)',
  worker: 'var(--color-acid-pop)',
  d1: 'var(--color-teal-pop)',
  r2: 'var(--color-violet-pop)',
};

const BOX: Record<NodeId, { x: number; y: number; w: number; h: number }> = {
  user: { x: 12, y: 12, w: 200, h: 44 },
  client: { x: 12, y: 96, w: 200, h: 250 },
  pages: { x: 308, y: 58, w: 318, h: 100 },
  worker: { x: 308, y: 188, w: 318, h: 104 },
  d1: { x: 308, y: 338, w: 152, h: 160 },
  r2: { x: 474, y: 338, w: 152, h: 160 },
};

const FRAME = { x: 286, y: 12, w: 362, h: 500 } as const;

const ARROW_D: Record<CfArrow, string> = {
  userToClient: 'M 112 62 L 112 88',
  clientToPages: 'M 220 106 L 298 106',
  pagesToClient: 'M 298 140 L 220 140',
  clientToWorker: 'M 220 218 L 298 218',
  workerToClient: 'M 298 260 L 220 260',
  workerToD1: 'M 370 300 L 370 330',
  d1ToWorker: 'M 398 330 L 398 300',
  workerToR2: 'M 536 300 L 536 330',
  r2ToWorker: 'M 564 330 L 564 300',
};

const ARROW_NODE: Record<CfArrow, NodeId> = {
  userToClient: 'user',
  clientToPages: 'client',
  pagesToClient: 'pages',
  clientToWorker: 'client',
  workerToClient: 'worker',
  workerToD1: 'worker',
  d1ToWorker: 'd1',
  workerToR2: 'worker',
  r2ToWorker: 'r2',
};

const ARROW_ID = 'cf-map-arrow';
const SVG_TR =
  'transition-[fill,stroke,opacity,fill-opacity,stroke-dashoffset,stroke-width] duration-500 ease-out';
const RING_PAD = 7;
const SHADOW = 5;

/* ── 小圖示 ─────────────────────────────────────────────── */

type GlyphId = 'person' | 'browser' | 'files' | 'gear' | 'database' | 'image' | 'cloud';

function Glyph({ id, x, y, size, color }: { id: GlyphId; x: number; y: number; size: number; color: string }) {
  const s = {
    fill: 'none',
    stroke: color,
    strokeWidth: 2.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: SVG_TR,
  };
  const band = { fill: color, fillOpacity: 0.2, stroke: 'none', className: SVG_TR };

  let shape: ReactElement;
  switch (id) {
    case 'person':
      shape = (
        <g>
          <circle cx={22} cy={15} r={7} {...band} />
          <circle cx={22} cy={15} r={7} {...s} />
          <path d="M9 37 C9 29.5 14.8 25 22 25 C29.2 25 35 29.5 35 37" {...s} />
        </g>
      );
      break;
    case 'browser':
      shape = (
        <g>
          <rect x={5} y={9} width={34} height={27} rx={4} {...band} />
          <rect x={5} y={9} width={34} height={27} rx={4} {...s} />
          <path d="M5 17 H39" {...s} />
          <path d="M11 24 H33" {...s} />
          <path d="M11 30 H26" {...s} />
        </g>
      );
      break;
    case 'files':
      shape = (
        <g>
          <path d="M12 6 H26 L33 13 V34 H12 Z" {...band} />
          <path d="M16 10 H30 L37 17 V38 H16" {...s} />
          <path d="M12 6 H26 L33 13 V34 H12 Z" {...s} />
          <path d="M17 19 H28 M17 25 H28" {...s} />
        </g>
      );
      break;
    case 'gear':
      shape = (
        <g>
          <circle cx={22} cy={22} r={11} {...band} />
          <path
            d="M22 6 V11 M22 33 V38 M6 22 H11 M33 22 H38 M10.7 10.7 L14.2 14.2 M29.8 29.8 L33.3 33.3 M10.7 33.3 L14.2 29.8 M29.8 14.2 L33.3 10.7"
            {...s}
          />
          <circle cx={22} cy={22} r={9} {...s} />
          <circle cx={22} cy={22} r={3.5} {...s} />
        </g>
      );
      break;
    case 'database':
      shape = (
        <g>
          <path d="M8 12 V32 C8 35 14 37 22 37 C30 37 36 35 36 32 V12 Z" {...band} />
          <ellipse cx={22} cy={12} rx={14} ry={5} {...s} />
          <path d="M8 12 V32 C8 35 14 37 22 37 C30 37 36 35 36 32 V12" {...s} />
          <path d="M8 22 C8 25 14 27 22 27 C30 27 36 25 36 22" {...s} />
        </g>
      );
      break;
    case 'image':
      shape = (
        <g>
          <rect x={6} y={9} width={32} height={26} rx={3} {...band} />
          <rect x={6} y={9} width={32} height={26} rx={3} {...s} />
          <circle cx={15} cy={17} r={3} {...s} />
          <path d="M6 31 L16 22 L23 28 L28 24 L38 32" {...s} />
        </g>
      );
      break;
    case 'cloud':
      shape = (
        <g>
          <path d="M13 33 C8 33 5 29.5 5 25.5 C5 21.5 8 18.5 12 18.3 C13 13 17.2 9.5 22.4 9.5 C27.6 9.5 31.6 13 32.6 17.8 C36.5 18.2 39.5 21.4 39.5 25.4 C39.5 29.6 36.2 33 32 33 Z" {...band} />
          <path d="M13 33 C8 33 5 29.5 5 25.5 C5 21.5 8 18.5 12 18.3 C13 13 17.2 9.5 22.4 9.5 C27.6 9.5 31.6 13 32.6 17.8 C36.5 18.2 39.5 21.4 39.5 25.4 C39.5 29.6 36.2 33 32 33 Z" {...s} />
        </g>
      );
      break;
  }

  return (
    <g transform={`translate(${x} ${y}) scale(${size / 44})`} aria-hidden="true">
      {shape}
    </g>
  );
}

/* ── 箭頭 ───────────────────────────────────────────────── */

function ArrowDefs({ prefix }: { prefix: string }) {
  return (
    <defs>
      {(Object.keys(NODE_ACCENT) as NodeId[]).map((node) => (
        <marker
          key={node}
          id={`${prefix}-${node}`}
          markerWidth={8}
          markerHeight={8}
          refX={6.5}
          refY={3}
          orient="auto"
        >
          <path d="M0.5,0.5 L7,3 L0.5,5.5 z" fill={NODE_ACCENT[node]} />
        </marker>
      ))}
      <marker id={`${prefix}-faint`} markerWidth={8} markerHeight={8} refX={6.5} refY={3} orient="auto">
        <path d="M0.5,0.5 L7,3 L0.5,5.5 z" fill={C.faint} />
      </marker>
    </defs>
  );
}

function Arrow({ d, node, shown }: { d: string; node: NodeId; shown: boolean }) {
  return (
    <g opacity={shown ? 1 : 0} className={SVG_TR}>
      <path
        d={d}
        fill="none"
        stroke={NODE_ACCENT[node]}
        strokeWidth={3.5}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={shown ? 0 : 1}
        markerEnd={`url(#${ARROW_ID}-${node})`}
        className={SVG_TR}
      />
    </g>
  );
}

/* ── 節點 ───────────────────────────────────────────────── */

function NodeBox({
  id,
  state,
  ring,
  children,
}: {
  id: NodeId;
  state: NodeState;
  ring: boolean;
  children: ReactElement;
}) {
  const { x, y, w, h } = BOX[id];
  const on = state === 'on';

  return (
    <g>
      <rect
        x={x - RING_PAD}
        y={y - RING_PAD}
        width={w + RING_PAD * 2 + SHADOW}
        height={h + RING_PAD * 2 + SHADOW}
        rx={22}
        fill="none"
        stroke={NODE_ACCENT[id]}
        strokeWidth={3}
        strokeDasharray="8 7"
        opacity={ring ? 1 : 0}
        className={SVG_TR}
      />
      <rect
        x={x + SHADOW}
        y={y + SHADOW}
        width={w}
        height={h}
        rx={16}
        fill={C.line}
        opacity={on ? 1 : 0}
        className={SVG_TR}
      />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={16}
        fill={on ? NODE_POP[id] : C.panel}
        stroke={state === 'off' ? C.lineSoft : C.line}
        strokeWidth={state === 'off' ? 2.5 : 3}
        className={SVG_TR}
      />
      {children}
    </g>
  );
}

/** 標題與說明文字的顏色：off 退成 muted / faint */
function ink(state: NodeState) {
  return state === 'off'
    ? { title: C.muted, note: C.faint, icon: C.faint }
    : { title: C.paper, note: C.muted, icon: C.paper };
}

/* ══════════════════════════════════════════════════════════════ */

export function CloudflareMap({ states, arrows = [], ring, notes = {} }: CloudflareMapProps): ReactElement {
  const st = (id: NodeId): NodeState => states[id] ?? 'off';

  const user = ink(st('user'));
  const client = ink(st('client'));
  const pages = ink(st('pages'));
  const worker = ink(st('worker'));
  const d1 = ink(st('d1'));
  const r2 = ink(st('r2'));

  return (
    <svg
      viewBox="0 0 660 520"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Cloudflare 服務圖：使用者、前端，以及 Cloudflare 上的 Pages、Worker、D1、R2"
    >
      <ArrowDefs prefix={ARROW_ID} />

      {/* Cloudflare 大框 */}
      <rect
        x={FRAME.x}
        y={FRAME.y}
        width={FRAME.w}
        height={FRAME.h}
        rx={26}
        fill={C.panel}
        fillOpacity={0.7}
        stroke={C.line}
        strokeWidth={2.5}
        strokeDasharray="12 8"
      />
      <Glyph id="cloud" x={FRAME.x + 16} y={FRAME.y + 6} size={34} color={C.paper} />
      <text x={FRAME.x + 56} y={FRAME.y + 32} fill={C.paper} fontSize={21} fontWeight={700}>
        Cloudflare
      </text>

      {/* 網路：兩組虛線軌道永遠都在 */}
      {[106, 140, 218, 260].map((y) => (
        <path
          key={y}
          d={`M 216 ${y} L 302 ${y}`}
          fill="none"
          stroke={C.lineSoft}
          strokeWidth={3}
          strokeDasharray="2 10"
          strokeLinecap="round"
        />
      ))}
      <text x={259} y={186} textAnchor="middle" fill={C.faint} fontSize={17}>
        網路
      </text>

      {/* 使用者 */}
      <NodeBox id="user" state={st('user')} ring={ring === 'user'}>
        <g>
          <Glyph id="person" x={50} y={16} size={34} color={user.icon} />
          <text x={92} y={42} fill={user.title} fontSize={22} fontWeight={700} className={SVG_TR}>
            同事
          </text>
        </g>
      </NodeBox>

      {/* 前端（瀏覽器） */}
      <NodeBox id="client" state={st('client')} ring={ring === 'client'}>
        <g>
          <Glyph id="browser" x={88} y={130} size={48} color={client.icon} />
          <text x={112} y={222} textAnchor="middle" fill={client.title} fontSize={27} fontWeight={700} fontFamily="var(--font-display)" className={SVG_TR}>
            前端
          </text>
          <text x={112} y={254} textAnchor="middle" fill={client.note} fontSize={18} className={SVG_TR}>
            瀏覽器裡的畫面
          </text>
          {notes.client && (
            <text x={112} y={300} textAnchor="middle" fill={client.title} fontSize={18} fontWeight={700} className={SVG_TR}>
              {notes.client}
            </text>
          )}
        </g>
      </NodeBox>

      {/* Pages */}
      <NodeBox id="pages" state={st('pages')} ring={ring === 'pages'}>
        <g>
          <Glyph id="files" x={326} y={78} size={56} color={pages.icon} />
          <text x={398} y={102} fill={pages.title} fontSize={30} fontWeight={700} fontFamily="var(--font-display)" className={SVG_TR}>
            Pages
          </text>
          <text x={398} y={134} fill={pages.note} fontSize={18} className={SVG_TR}>
            {notes.pages ?? '放網站檔案'}
          </text>
        </g>
      </NodeBox>

      {/* Worker */}
      <NodeBox id="worker" state={st('worker')} ring={ring === 'worker'}>
        <g>
          <Glyph id="gear" x={326} y={210} size={58} color={worker.icon} />
          <text x={398} y={234} fill={worker.title} fontSize={30} fontWeight={700} fontFamily="var(--font-display)" className={SVG_TR}>
            Worker
          </text>
          <text x={398} y={266} fill={worker.note} fontSize={18} className={SVG_TR}>
            {notes.worker ?? '幫你做事的程式'}
          </text>
        </g>
      </NodeBox>

      {/* D1 */}
      <NodeBox id="d1" state={st('d1')} ring={ring === 'd1'}>
        <g>
          <Glyph id="database" x={362} y={354} size={44} color={d1.icon} />
          <text x={384} y={432} textAnchor="middle" fill={d1.title} fontSize={32} fontWeight={700} fontFamily="var(--font-display)" className={SVG_TR}>
            D1
          </text>
          <text x={384} y={460} textAnchor="middle" fill={d1.note} fontSize={18} className={SVG_TR}>
            資料庫
          </text>
          {notes.d1 && (
            <text x={384} y={486} textAnchor="middle" fill={d1.title} fontSize={16} fontWeight={700} className={SVG_TR}>
              {notes.d1}
            </text>
          )}
        </g>
      </NodeBox>

      {/* R2 */}
      <NodeBox id="r2" state={st('r2')} ring={ring === 'r2'}>
        <g>
          <Glyph id="image" x={528} y={354} size={44} color={r2.icon} />
          <text x={550} y={432} textAnchor="middle" fill={r2.title} fontSize={32} fontWeight={700} fontFamily="var(--font-display)" className={SVG_TR}>
            R2
          </text>
          <text x={550} y={460} textAnchor="middle" fill={r2.note} fontSize={18} className={SVG_TR}>
            圖片與檔案
          </text>
          {notes.r2 && (
            <text x={550} y={486} textAnchor="middle" fill={r2.title} fontSize={16} fontWeight={700} className={SVG_TR}>
              {notes.r2}
            </text>
          )}
        </g>
      </NodeBox>

      {/* 箭頭畫在最上層 */}
      {(Object.keys(ARROW_D) as CfArrow[]).map((arrow) => (
        <Arrow key={arrow} d={ARROW_D[arrow]} node={ARROW_NODE[arrow]} shown={arrows.includes(arrow)} />
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
 * DomainFlow — 網域怎麼找到你的網站（第 14 頁）
 *
 * 參考 Notion〈Cloudflare 實戰運用〉那張 Name Server 圖的結構，重畫成貼紙風：
 *   你輸入網址 → 查這個網址 → Cloudflare（Registrar 指定由它回答）
 *   → 回傳網站在哪裡 → 連上網站
 * `step` 0–4 決定亮到哪一格；一律從左往右亮，沒亮的格子是白底淡框。
 *
 * viewBox 1100 × 420。五格寬 180、間距 50。
 * ══════════════════════════════════════════════════════════════ */

const DOMAIN_NODES: { glyph: GlyphId; title: string; note: string; accent: string; pop: string }[] = [
  { glyph: 'person', title: '你', note: '輸入網址', accent: 'var(--color-coral)', pop: 'var(--color-coral-pop)' },
  { glyph: 'browser', title: '查網址', note: '這是誰家的？', accent: 'var(--color-blue)', pop: 'var(--color-blue-pop)' },
  { glyph: 'cloud', title: 'Cloudflare', note: '幫你回答', accent: 'var(--color-amber)', pop: 'var(--color-amber-pop)' },
  { glyph: 'files', title: '網站在這裡', note: '回傳位置', accent: 'var(--color-teal)', pop: 'var(--color-teal-pop)' },
  { glyph: 'browser', title: '連上網站', note: '畫面出現了', accent: 'var(--color-acid)', pop: 'var(--color-acid-pop)' },
];

const DOMAIN_X = (index: number) => 20 + index * 230;
const DOMAIN_Y = 170;
const DOMAIN_W = 180;
const DOMAIN_H = 190;

export function DomainFlow({ step, domain }: { step: number; domain: string }): ReactElement {
  return (
    <svg
      viewBox="0 0 1180 420"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="網域查詢流程：輸入網址、查詢網域、Cloudflare 回答、回傳網站位置、連上網站"
    >
      <defs>
        <marker id="cf-domain-arrow" markerWidth={8} markerHeight={8} refX={6.5} refY={3} orient="auto">
          <path d="M0.5,0.5 L7,3 L0.5,5.5 z" fill={C.paper} />
        </marker>
      </defs>

      {/* Registrar：指定由誰回答。輪到之前是白底淡框（不用 opacity 壓：字的對比會一起掉） */}
      <g>
        <rect x={DOMAIN_X(2) - 70 + 4} y={24} width={320} height={76} rx={20} fill={C.line} opacity={step >= 2 ? 1 : 0} className={SVG_TR} />
        <rect
          x={DOMAIN_X(2) - 70}
          y={20}
          width={320}
          height={76}
          rx={20}
          fill={step >= 2 ? C.amberPop : C.panel}
          stroke={step >= 2 ? C.line : C.lineSoft}
          strokeWidth={3}
          className={SVG_TR}
        />
        <text x={DOMAIN_X(2) + 90} y={53} textAnchor="middle" fill={step >= 2 ? C.paper : C.muted} fontSize={22} fontWeight={700} className={SVG_TR}>
          網址的登記處（Registrar）
        </text>
        <text x={DOMAIN_X(2) + 90} y={81} textAnchor="middle" fill={step >= 2 ? C.paper : C.faint} fontSize={18} className={SVG_TR}>
          指定：這個網址由 Cloudflare 回答
        </text>
        <path
          d={`M ${DOMAIN_X(2) + 90} 104 L ${DOMAIN_X(2) + 90} 152`}
          stroke={step >= 2 ? C.paper : C.lineSoft}
          strokeWidth={3.5}
          strokeLinecap="round"
          markerEnd={step >= 2 ? 'url(#cf-domain-arrow)' : undefined}
          className={SVG_TR}
        />
      </g>

      {DOMAIN_NODES.map((node, index) => {
        const x = DOMAIN_X(index);
        const on = step >= index;
        const current = step === index;
        return (
          <g key={node.title}>
            {index > 0 && (
              <path
                d={`M ${x - 46} ${DOMAIN_Y + DOMAIN_H / 2} L ${x - 10} ${DOMAIN_Y + DOMAIN_H / 2}`}
                stroke={on ? C.paper : C.lineSoft}
                strokeWidth={3.5}
                strokeLinecap="round"
                markerEnd={on ? 'url(#cf-domain-arrow)' : undefined}
                className={SVG_TR}
              />
            )}
            <rect
              x={x - 8}
              y={DOMAIN_Y - 8}
              width={DOMAIN_W + 16 + SHADOW}
              height={DOMAIN_H + 16 + SHADOW}
              rx={26}
              fill="none"
              stroke={node.accent}
              strokeWidth={3}
              strokeDasharray="8 7"
              opacity={current ? 1 : 0}
              className={SVG_TR}
            />
            <rect x={x + SHADOW} y={DOMAIN_Y + SHADOW} width={DOMAIN_W} height={DOMAIN_H} rx={20} fill={C.line} opacity={on ? 1 : 0} className={SVG_TR} />
            <rect
              x={x}
              y={DOMAIN_Y}
              width={DOMAIN_W}
              height={DOMAIN_H}
              rx={20}
              fill={on ? node.pop : C.panel}
              stroke={on ? C.line : C.lineSoft}
              strokeWidth={3}
              className={SVG_TR}
            />
            <Glyph id={node.glyph} x={x + DOMAIN_W / 2 - 30} y={DOMAIN_Y + 18} size={60} color={on ? C.paper : C.faint} />
            <text
              x={x + DOMAIN_W / 2}
              y={DOMAIN_Y + 122}
              textAnchor="middle"
              fill={on ? C.paper : C.muted}
              fontSize={node.title.length > 6 ? 23 : 26}
              fontWeight={700}
              fontFamily="var(--font-display)"
              className={SVG_TR}
            >
              {node.title}
            </text>
            <text x={x + DOMAIN_W / 2} y={DOMAIN_Y + 156} textAnchor="middle" fill={on ? C.muted : C.faint} fontSize={19} className={SVG_TR}>
              {node.note}
            </text>
          </g>
        );
      })}

      {/* 第一格上方：正在查的網址 */}
      <g transform={`rotate(-3 ${DOMAIN_X(0) + 90} 128)`}>
        <rect x={DOMAIN_X(0) - 4 + 3} y={109} width={250} height={42} rx={21} fill={C.line} />
        <rect x={DOMAIN_X(0) - 4} y={106} width={250} height={42} rx={21} fill={C.amberPop} stroke={C.line} strokeWidth={2.5} />
        <text x={DOMAIN_X(0) + 121} y={134} textAnchor="middle" fill={C.paper} fontSize={18} fontWeight={700} fontFamily="var(--font-mono)">
          {domain.length > 22 ? `${domain.slice(0, 21)}…` : domain}
        </text>
      </g>
    </svg>
  );
}
