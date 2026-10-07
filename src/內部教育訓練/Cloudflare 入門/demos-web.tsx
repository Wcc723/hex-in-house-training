import { useEffect, useState, type ReactNode } from 'react';
import { Highlight } from 'prism-react-renderer';
import { codeTheme } from '../../components/codeTheme';
import { HexBadge } from '../../components/HexBadge';
import { ArchMap, RoleIcon, ScaleArchDiagram } from './diagrams-web';
import type {
  ArchArrow,
  ArchFrames,
  ArchNode,
  RoleIconId,
  ScaleId,
  Tone,
} from './diagrams-web';

/* ══════════════════════════════════════════════════════════════
 * 〈Cloudflare 入門〉— 第一、二章的互動範例
 *
 * 移植自〈網站是如何運作的 · How Websites Work〉的第 02–07、09 頁：
 *
 *   LoadDemo        輸入網址之後，畫面是怎麼來的
 *   RolesDemo       前端 / 後端 / 伺服器 / 資料庫各自在做什麼
 *   FrontendDemo    HTML / CSS / JavaScript 怎麼把畫面撐起來
 *   WhyBackendDemo  按一下加入購物車，後端要替你做完一整串檢查
 *   DatabaseDemo    資料庫像一張只有後端能動的試算表
 *   ServerDemo      三個東西都要有地方放（後端標 Worker、資料庫標 D1）
 *   ScaleArchDemo   規模不同，要準備的 Cloudflare 服務就不同
 *                   （原本的「商用應用程式」改成「全公司的內部系統」）
 *
 * ──────────────────────────────────────────────────────────────
 * 貼紙風的狀態語言（全頁共用，元件不要自己再定義一份）
 * ──────────────────────────────────────────────────────────────
 *   還沒輪到  白底、淡框（line-soft）、文字 muted
 *   講過了    pop 填色 ＋ 墨紫框
 *   正在講    pop 填色 ＋ 墨紫框 ＋ 硬邊陰影 ＋ 實心六角號碼
 * pop 底上的字一律 paper / muted，強調色只放在白底的小徽章（TONE_CHIP）與
 * 實心按鈕（TONE_PILL，白字）上 —— 強調色壓在自己的 pop 上會低於 4.5:1。
 *
 * ──────────────────────────────────────────────────────────────
 * 高度預算
 * ──────────────────────────────────────────────────────────────
 * 這幾頁沒有 description 也沒有 caption：面板內可用約 1738 × 762。
 * 根容器一律 `h-[648px] w-full max-w-[1760px]`：主區 flex-1 ＋ 底部控制列 h-11，
 * gap-5 → 主區 584。沒有任何容器可以捲動，未輪到的一般 DOM 一律不掛。
 * ══════════════════════════════════════════════════════════════ */

/* ── 色票對照（Tailwind 只掃得到完整字串）──────────────── */

const TONE_TEXT: Record<Tone, string> = {
  user: 'text-role-user',
  client: 'text-role-client',
  backend: 'text-role-server',
  db: 'text-role-data',
  host: 'text-paper',
  net: 'text-faint',
  danger: 'text-danger',
  html: 'text-lang-html',
  css: 'text-lang-css',
  js: 'text-lang-javascript',
};

/** 貼紙的 pop 填色。上面只壓 paper / muted */
const TONE_POP: Record<Tone, string> = {
  user: 'bg-coral-pop',
  client: 'bg-blue-pop',
  backend: 'bg-acid-pop',
  db: 'bg-teal-pop',
  host: 'bg-panel-lift',
  net: 'bg-ink-soft',
  danger: 'bg-danger-pop',
  html: 'bg-coral-pop',
  css: 'bg-blue-pop',
  js: 'bg-acid-pop',
};

/** 實心色塊（主要按鈕、號碼）。白字對九支強調色都 ≥5.63:1 */
const TONE_SOLID: Record<Tone, string> = {
  user: 'bg-role-user text-on-accent',
  client: 'bg-role-client text-on-accent',
  backend: 'bg-role-server text-on-accent',
  db: 'bg-role-data text-on-accent',
  host: 'bg-muted text-on-accent',
  net: 'bg-faint text-on-accent',
  danger: 'bg-danger text-on-accent',
  html: 'bg-lang-html text-on-accent',
  css: 'bg-lang-css text-on-accent',
  js: 'bg-lang-javascript text-on-accent',
};

/** 白底小徽章：強調色的字放在白底上才站得住 */
const TONE_CHIP: Record<Tone, string> = {
  user: 'border-2 border-line bg-panel text-role-user',
  client: 'border-2 border-line bg-panel text-role-client',
  backend: 'border-2 border-line bg-panel text-role-server',
  db: 'border-2 border-line bg-panel text-role-data',
  host: 'border-2 border-line bg-panel text-paper',
  net: 'border-2 border-line-soft bg-panel text-muted',
  danger: 'border-2 border-line bg-panel text-danger',
  html: 'border-2 border-line bg-panel text-lang-html',
  css: 'border-2 border-line bg-panel text-lang-css',
  js: 'border-2 border-line bg-panel text-lang-javascript',
};

const TONE_DOT: Record<Tone, string> = {
  user: 'bg-role-user',
  client: 'bg-role-client',
  backend: 'bg-role-server',
  db: 'bg-role-data',
  host: 'bg-muted',
  net: 'bg-faint',
  danger: 'bg-danger',
  html: 'bg-lang-html',
  css: 'bg-lang-css',
  js: 'bg-lang-javascript',
};

/** 卡片的三種狀態 */
const CARD_IDLE = 'border-line-soft bg-panel';
const cardSeen = (tone: Tone) => `border-line ${TONE_POP[tone]}`;
const cardActive = (tone: Tone) => `border-line ${TONE_POP[tone]} shadow-pop-sm`;

/** 面板小標籤 */
const LABEL = 'font-display text-[18px] font-semibold tracking-[0.08em]';
const LABEL_FAINT = `${LABEL} text-faint`;

/** 控制列按鈕：膠囊 ＋ 按下去會沉 */
const BTN =
  'pressable h-11 shrink-0 rounded-full border-2 border-line px-5 text-[19px] font-semibold disabled:shadow-none';
const BTN_GHOST = `${BTN} bg-panel text-paper hover:bg-panel-lift`;
const BTN_OFF = `${BTN} cursor-default bg-panel text-faint`;

/** 「這張圖」的容器：奶油點陣紙 */
const MAP_BOX = 'bg-dots flex h-full min-h-0 flex-col rounded-2xl border-2 border-line-soft p-4';

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

/* ── 勾與叉 ─────────────────────────────────────────────── */

function CheckMark() {
  return (
    <svg width={18} height={18} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8.4 6.4 11.8 13 4.6" />
    </svg>
  );
}

function CrossMark() {
  return (
    <svg width={18} height={18} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.4 4.4 11.6 11.6" />
      <path d="M11.6 4.4 4.4 11.6" />
    </svg>
  );
}

/* ── 號碼 ───────────────────────────────────────────────── */

/** 六角形號碼。idle 是白底灰字，其餘是實心強調色 */
function StepHex({
  n,
  tone,
  state,
  size = 36,
}: {
  n: number | string;
  tone: Tone;
  state: 'idle' | 'on';
  size?: number;
}) {
  return (
    <HexBadge
      size={size}
      stroke={2.5}
      shadow={state === 'on'}
      fillClass={state === 'on' ? TONE_SOLID[tone].split(' ')[0] : 'bg-panel'}
      textClass={state === 'on' ? 'text-on-accent' : 'text-faint'}
    >
      <span className="font-display text-[17px] leading-none font-semibold">{n}</span>
    </HexBadge>
  );
}

/* ── StepDots / StepControls ────────────────────────────── */

function StepDots({
  total,
  current,
  tone,
  onPick,
}: {
  total: number;
  current: number;
  tone: Tone;
  onPick: (index: number) => void;
}) {
  return (
    <div className="flex h-6 items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPick(i)}
          aria-label={`第 ${i + 1} 步`}
          aria-current={i === current}
          className={`h-3.5 rounded-full border-2 border-line transition-all duration-300 ease-out ${
            i === current ? `w-10 ${TONE_DOT[tone]}` : 'w-3.5 bg-panel hover:bg-amber-pop'
          }`}
        />
      ))}
    </div>
  );
}

function StepControls({
  current,
  total,
  tone,
  onPrev,
  onNext,
  onReset,
}: {
  current: number;
  total: number;
  tone: Tone;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
}) {
  const atStart = current <= 0;
  const atEnd = current >= total - 1;

  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={onPrev} disabled={atStart} className={atStart ? BTN_OFF : BTN_GHOST}>
        上一步
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={atEnd}
        className={atEnd ? BTN_OFF : `${BTN} ${TONE_SOLID[tone]}`}
      >
        下一步
      </button>
      <span className={`px-1 ${LABEL_FAINT}`}>
        {pad2(current + 1)} / {pad2(total)}
      </span>
      <button type="button" onClick={onReset} className={BTN_GHOST}>
        重來
      </button>
    </div>
  );
}

/** 底部控制列：左邊是這一拍的說明，右邊是圓點與按鈕 */
function BeatBar({
  beat,
  total,
  tone,
  label,
  onPick,
  onReset,
}: {
  beat: number;
  total: number;
  tone: Tone;
  label: string;
  onPick: (index: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex h-11 shrink-0 items-center justify-between gap-6">
      <div className="flex min-w-0 items-center gap-4">
        <StepHex n={beat + 1} tone={tone} state="on" />
        <span className="truncate text-[22px] font-semibold text-paper">{label}</span>
      </div>
      <div className="flex shrink-0 items-center gap-6">
        <StepDots total={total} current={beat} tone={tone} onPick={onPick} />
        <StepControls
          current={beat}
          total={total}
          tone={tone}
          onPrev={() => onPick(Math.max(0, beat - 1))}
          onNext={() => onPick(Math.min(total - 1, beat + 1))}
          onReset={onReset}
        />
      </div>
    </div>
  );
}

/* ── BrowserFrame ───────────────────────────────────────── */

/** 假的瀏覽器視窗。標題列 52 ＋ 網址列 60（沒給 url 時不算）＋ 內容 p-6 */
function BrowserFrame({
  title,
  tone = 'client',
  url,
  onUrlChange,
  onGo,
  goLabel = '前往',
  children,
  className = '',
}: {
  title: string;
  tone?: Tone;
  url?: string;
  onUrlChange?: (value: string) => void;
  onGo?: () => void;
  goLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border-3 border-line bg-ink-soft shadow-pop-sm ${className}`}>
      <div className="flex h-[52px] shrink-0 items-center gap-2.5 border-b-3 border-line bg-panel px-5">
        <span className="size-3.5 rounded-full border-2 border-line bg-acid-pop" />
        <span className="size-3.5 rounded-full border-2 border-line bg-amber-pop" />
        <span className="size-3.5 rounded-full border-2 border-line bg-teal-pop" />
        <span className={`ml-2 text-[19px] font-semibold ${TONE_TEXT[tone]}`}>{title}</span>
      </div>

      {url !== undefined && (
        <div className="flex h-[60px] shrink-0 items-center gap-3 border-b-2 border-line-soft bg-panel px-5">
          <span className={`${LABEL_FAINT} shrink-0`}>網址</span>
          <input
            value={url}
            onChange={(event) => onUrlChange?.(event.target.value)}
            readOnly={onUrlChange === undefined}
            spellCheck={false}
            aria-label="網址列"
            className="min-w-0 flex-1 rounded-full border-2 border-line bg-panel px-4 py-1 font-mono text-[19px] text-paper outline-none focus:bg-amber-pop"
          />
          {onGo && (
            <button
              type="button"
              onClick={onGo}
              className={`pressable h-10 shrink-0 rounded-full border-2 border-line px-5 text-[18px] font-semibold ${TONE_SOLID.client}`}
            >
              {goLabel}
            </button>
          )}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-4 p-6">{children}</div>
    </div>
  );
}

/* ── ShopPage ───────────────────────────────────────────── */

interface Product {
  id: RoleIconId;
  name: string;
  price: string;
}

const PRODUCTS: Product[] = [
  { id: 'suitcase', name: '行李箱 28 吋', price: 'NT$3,280' },
  { id: 'backpack', name: '登機後背包', price: 'NT$1,180' },
  { id: 'pouch', name: '收納袋六件組', price: 'NT$480' },
];

function ProductThumb({ id, size = 96 }: { id: RoleIconId; size?: number }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border-2 border-line bg-blue-pop">
      <RoleIcon id={id} size={size} tone="client" />
    </div>
  );
}

function ShopPage({ host }: { host: string }) {
  return (
    <>
      <div className="flex shrink-0 items-center justify-between">
        <span className="font-display text-[26px] font-semibold text-paper">{host}</span>
        <span className={`rounded-full px-4 py-1 text-[18px] font-semibold ${TONE_CHIP.client}`}>
          購物車 0
        </span>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-4">
        {PRODUCTS.map((product) => (
          <div
            key={product.id}
            className="flex min-h-0 flex-col gap-3 rounded-2xl border-2 border-line bg-panel p-4"
          >
            <ProductThumb id={product.id} />
            <span className="text-[20px] font-semibold text-paper">{product.name}</span>
            <span className={`text-[19px] font-semibold ${TONE_TEXT.client}`}>{product.price}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
 * LoadDemo — 輸入網址之後，發生了什麼事
 *
 * 左邊是瀏覽器、右邊是運作概念圖，五拍走完一次完整的來回。
 * 網址列是真的可以打字的 input，打什麼，載入後的網站標題就是什麼。
 * ══════════════════════════════════════════════════════════════ */

interface LoadBeat {
  label: string;
  browser: 'idle' | 'loading' | 'done';
  /** 載入中那一拍，瀏覽器裡顯示的字 */
  status?: string;
  lit: ArchNode[];
  ring?: ArchNode;
  arrows: ArchArrow[];
}

/*
 * 五拍。第 3 拍是「前端的程式碼也要先從網站空間拿下來」：
 * 前端不是本來就在你的電腦裡，它跟後端一樣放在一台機器上，打開網址才傳過來。
 */
const LOAD_BEATS: LoadBeat[] = [
  { label: '在網址列輸入網址，按「前往」。', browser: 'idle', lit: [], arrows: [] },
  {
    label: '瀏覽器把這個網址送出去。',
    browser: 'loading',
    status: '正在找這個網址…',
    lit: ['user', 'client'],
    ring: 'client',
    arrows: ['userToClient'],
  },
  {
    label: '先從網站空間拿到前端程式碼，在瀏覽器裡跑起來。',
    browser: 'loading',
    status: '畫面的骨架出來了，資料還在路上…',
    lit: ['user', 'client', 'site'],
    ring: 'site',
    arrows: ['userToClient', 'siteToClient'],
  },
  {
    label: '前端再透過網路跟伺服器要資料，後端去資料庫拿。',
    browser: 'loading',
    status: '正在跟伺服器要商品資料…',
    lit: ['user', 'client', 'site', 'host', 'backend', 'db'],
    ring: 'db',
    arrows: ['userToClient', 'siteToClient', 'clientToBackend', 'backendToDb', 'dbToBackend'],
  },
  {
    label: '資料送回前端，網站就出現在你的瀏覽器裡。',
    browser: 'done',
    lit: ['user', 'client', 'site', 'host', 'backend', 'db'],
    ring: 'client',
    arrows: ['userToClient', 'siteToClient', 'clientToBackend', 'backendToDb', 'dbToBackend', 'backendToClient'],
  },
];

export function LoadDemo() {
  const [url, setUrl] = useState('shop.example');
  const [beat, setBeat] = useState(0);
  const current = LOAD_BEATS[beat];
  const host = url.trim() === '' ? 'shop.example' : url.trim();

  return (
    <div className="flex h-[648px] w-full max-w-[1760px] flex-col gap-5">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-6">
        <BrowserFrame
          title="瀏覽器"
          url={url}
          onUrlChange={setUrl}
          onGo={() => setBeat(1)}
          className="h-full"
        >
          {current.browser === 'idle' && (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
              <RoleIcon id="browser" size={76} tone="net" muted />
              <span className="text-[22px] text-muted">還沒有內容 —— 按「前往」開始</span>
            </div>
          )}

          {current.browser === 'loading' && (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
              <span className={`rounded-full px-5 py-2 text-[20px] font-semibold ${TONE_CHIP.client}`}>
                {host}
              </span>
              <span key={current.status} className="slide-enter text-[20px] text-muted">
                {current.status}
              </span>
            </div>
          )}

          {current.browser === 'done' && <ShopPage host={host} />}
        </BrowserFrame>

        <div className={MAP_BOX}>
          <ArchMap lit={current.lit} ring={current.ring} arrows={current.arrows} frames="server" showSite />
        </div>
      </div>

      <BeatBar
        beat={beat}
        total={LOAD_BEATS.length}
        tone="client"
        label={current.label}
        onPick={setBeat}
        onReset={() => setBeat(0)}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * RolesDemo — 前端、後端、伺服器、資料庫
 *
 * 同一張 ArchMap，左邊逐張點亮說明卡。四張卡從第一拍就全部掛著，
 * 台下先看到「總共要講四件事」，再看它們一個一個亮起來。
 * ══════════════════════════════════════════════════════════════ */

interface RoleCard {
  /** 這張卡點亮的節點，第一個是焦點 */
  nodes: ArchNode[];
  arrows?: ArchArrow[];
  tone: Tone;
  name: string;
  lead: string;
  detail: string;
}

const ROLE_CARDS: RoleCard[] = [
  {
    nodes: ['client', 'site'],
    arrows: ['siteToClient'],
    tone: 'client',
    name: '前端',
    lead: '你在螢幕上看到、點得到的那一層。',
    detail: '它的程式碼也要有地方放（網站空間），打開網址才傳到瀏覽器執行。',
  },
  {
    nodes: ['backend'],
    tone: 'backend',
    name: '後端',
    lead: '一整包處理邏輯的程式，決定每個請求該做什麼。',
    detail: '但程式碼放在那裡不會自己動，要有人把它跑起來。',
  },
  {
    nodes: ['host'],
    tone: 'host',
    name: '伺服器',
    lead: '一台一直開著的機器，負責把後端程式跑起來。',
    detail: '放前端的網站空間其實也是這種機器；「雲端」就是別人家的機器。',
  },
  {
    nodes: ['db'],
    tone: 'db',
    name: '資料庫',
    lead: '專門存資料的地方，也放在伺服器上。',
    detail: '程式負責做事，資料要長期留著就交給資料庫。',
  },
];

function ExplainCard({
  index,
  tone,
  name,
  lead,
  detail,
  state,
}: {
  index: number;
  tone: Tone;
  name: string;
  lead: string;
  detail: string;
  state: 'idle' | 'seen' | 'active';
}) {
  const skin = state === 'active' ? cardActive(tone) : state === 'seen' ? cardSeen(tone) : CARD_IDLE;
  const on = state !== 'idle';

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col justify-center gap-1.5 rounded-2xl border-3 px-6 transition-[background-color,border-color,box-shadow] duration-300 ${skin}`}
    >
      <div className="flex items-center gap-3">
        <StepHex n={index} tone={tone} state={on ? 'on' : 'idle'} size={34} />
        <span className={`font-display text-[27px] font-semibold ${on ? 'text-paper' : 'text-muted'}`}>
          {name}
        </span>
      </div>
      <p className={`text-[21px] leading-[1.5] ${on ? 'text-paper' : 'text-muted'}`}>{lead}</p>
      <p className={`text-[19px] leading-[1.5] ${on ? 'text-muted' : 'text-faint'}`}>{detail}</p>
    </div>
  );
}

export function RolesDemo() {
  const [beat, setBeat] = useState(0);
  const currentCard = beat > 0 ? ROLE_CARDS[beat - 1] : undefined;
  const seen = ROLE_CARDS.slice(0, beat);
  const lit = seen.flatMap((card) => card.nodes);
  const arrows = seen.flatMap((card) => card.arrows ?? []);

  return (
    <div className="flex h-[648px] w-full max-w-[1760px] flex-col gap-5">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-6">
        <div className="flex min-h-0 flex-col gap-3 pr-1 pb-1">
          {ROLE_CARDS.map((card, index) => (
            <ExplainCard
              key={card.name}
              index={index + 1}
              tone={card.tone}
              name={card.name}
              lead={card.lead}
              detail={card.detail}
              state={index === beat - 1 ? 'active' : index < beat ? 'seen' : 'idle'}
            />
          ))}
        </div>

        <div className={MAP_BOX}>
          <ArchMap lit={lit} ring={currentCard?.nodes[0]} arrows={arrows} frames="server" showSite />
        </div>
      </div>

      <div className="flex h-11 shrink-0 items-center justify-between gap-6">
        <span className="text-[21px] text-muted">
          {currentCard
            ? `現在講的是「${currentCard.name}」，右圖對應的那一格會亮起來。`
            : '四個角色，一次講一個。'}
        </span>
        <StepControls
          current={beat}
          total={ROLE_CARDS.length + 1}
          tone="backend"
          onPrev={() => setBeat((value) => Math.max(0, value - 1))}
          onNext={() => setBeat((value) => Math.min(ROLE_CARDS.length, value + 1))}
          onReset={() => setBeat(0)}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * FrontendDemo — 前端是用什麼寫的
 *
 * 左邊三段程式碼、右邊網頁預覽，逐段加上去：
 *   只有 HTML → 沒有樣式的純結構
 *   加上 CSS  → 排版與顏色出現
 *   加上 JS   → 按鈕才真的會動
 * 三個檔案框全程都掛著（沒加的顯示虛線），切換時版面不會跳。
 * ══════════════════════════════════════════════════════════════ */

interface CodeFile {
  tone: Tone;
  filename: string;
  language: 'html' | 'css' | 'javascript';
  label: string;
  code: string;
}

const CODE_FILES: CodeFile[] = [
  {
    tone: 'html',
    filename: 'index.html',
    language: 'html',
    label: '結構：畫面上有哪些東西',
    code: `<div class="card">
  <p class="name">行李箱 28 吋</p>
  <button id="add">加入購物車</button>
</div>`,
  },
  {
    tone: 'css',
    filename: 'style.css',
    language: 'css',
    label: '樣式：這些東西長什麼樣子',
    code: `.card { border: 3px solid black; border-radius: 16px; }
.name { font-size: 20px; font-weight: 600; }
button { background: royalblue; color: white; }
button:hover { opacity: 0.85; }`,
  },
  {
    tone: 'js',
    filename: 'main.js',
    language: 'javascript',
    label: '行為：點下去會發生什麼事',
    code: `const btn = document.getElementById('add');
btn.addEventListener('click', () => {
  cart.count = cart.count + 1;
});`,
  },
];

/** 緊湊版程式碼框：檔名列 38 ＋ py-3 24 ＋ 4 行 × 27 = 170，框定 174 */
function MiniCode({ file, on }: { file: CodeFile; on: boolean }) {
  return (
    <div
      className={`flex h-[174px] shrink-0 flex-col overflow-hidden rounded-xl ${
        on ? 'border-3 border-line bg-ink-soft' : 'border-3 border-dashed border-line-soft bg-panel'
      }`}
    >
      <div className={`flex h-[38px] shrink-0 items-center gap-3 px-4 ${on ? 'border-b-2 border-line bg-panel' : 'border-b-2 border-line-soft'}`}>
        <span className={`size-3 rounded-full ${on ? TONE_DOT[file.tone] : 'bg-line-soft'}`} />
        <span className={`font-mono text-[17px] font-semibold ${on ? TONE_TEXT[file.tone] : 'text-faint'}`}>
          {file.filename}
        </span>
        <span className={`ml-auto text-[17px] ${on ? 'text-muted' : 'text-faint'}`}>{on ? file.label : '尚未加入'}</span>
      </div>

      {on ? (
        <Highlight theme={codeTheme} code={file.code} language={file.language}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre className={`${className} min-h-0 flex-1 px-4 py-3 text-[18px] leading-[1.5]`} style={style}>
              {tokens.map((line, index) => (
                <div key={index} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <span className="text-[19px] text-faint">按上面那一排把它加進來</span>
        </div>
      )}
    </div>
  );
}

export function FrontendDemo() {
  const [level, setLevel] = useState(0);
  const [count, setCount] = useState(0);
  const [poked, setPoked] = useState(0);
  const hasJs = level >= 3;

  const handleAddToCart = () => {
    if (hasJs) setCount((value) => value + 1);
    else setPoked((value) => value + 1);
  };

  const pick = (next: number) => {
    setLevel(next);
    setCount(0);
    setPoked(0);
  };

  return (
    <div className="flex h-[648px] w-full max-w-[1760px] flex-col gap-5">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-6">
        <div className="flex min-h-0 flex-col gap-2.5">
          <div className="flex h-11 shrink-0 items-center gap-3">
            {CODE_FILES.map((file, index) => {
              const on = level >= index + 1;
              return (
                <button
                  key={file.filename}
                  type="button"
                  onClick={() => pick(index + 1)}
                  className={`pressable h-11 rounded-full border-2 border-line px-5 font-mono text-[18px] font-semibold ${
                    on ? `${TONE_POP[file.tone]} text-paper` : 'bg-panel text-paper hover:bg-panel-lift'
                  }`}
                >
                  {on ? '✓ ' : '＋ '}
                  {file.filename}
                </button>
              );
            })}
            <button type="button" onClick={() => pick(0)} className={`ml-auto ${BTN_GHOST}`}>
              重來
            </button>
          </div>

          {CODE_FILES.map((file, index) => (
            <MiniCode key={file.filename} file={file} on={level >= index + 1} />
          ))}
        </div>

        <BrowserFrame title="網頁預覽" className="h-full">
          <div className="flex min-h-0 flex-1 flex-col gap-4 rounded-xl border-2 border-line-soft bg-panel p-8">
            {level === 0 && (
              <div className="flex min-h-0 flex-1 items-center justify-center">
                <span className="text-[22px] text-muted">還沒有任何檔案，畫面是空的</span>
              </div>
            )}

            {level >= 1 && (
              <>
                <div className="flex shrink-0 items-center justify-between">
                  <span className="text-[19px] text-muted">
                    {level === 1
                      ? '只有 HTML：有內容，但沒有排版'
                      : level === 2
                        ? '加上 CSS：排版與顏色出現了'
                        : '加上 JavaScript：按鈕開始有反應'}
                  </span>
                  <span className="rounded-full border-2 border-line px-4 py-1 text-[19px] font-semibold text-paper">
                    購物車 {count}
                  </span>
                </div>

                <div className="flex min-h-0 flex-1 items-center justify-center">
                  {level === 1 ? (
                    <div className="w-full font-serif">
                      <p className="text-[24px] text-paper">行李箱 28 吋</p>
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className="mt-2 border border-faint bg-ink-soft px-3 py-1 font-serif text-[20px] text-paper"
                      >
                        加入購物車
                      </button>
                    </div>
                  ) : (
                    <div className="w-full max-w-[420px] rounded-2xl border-3 border-line p-7 shadow-pop-sm">
                      <p className="text-[26px] font-semibold text-paper">行李箱 28 吋</p>
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className={`pressable mt-5 rounded-full border-2 border-line px-6 py-2.5 text-[21px] font-semibold ${TONE_SOLID.client}`}
                      >
                        加入購物車
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex h-10 shrink-0 items-center">
            {level >= 1 && level < 3 && poked > 0 && (
              <span className={`rounded-full px-4 py-1 text-[18px] font-semibold ${TONE_CHIP.danger}`}>
                按了沒有反應 —— 還沒加上 main.js，這顆按鈕還沒有行為
              </span>
            )}
            {hasJs && (
              <span className={`rounded-full px-4 py-1 text-[18px] font-semibold ${TONE_CHIP.js}`}>
                數字是 JavaScript 加的，重新整理就會歸零 —— 資料沒有存在任何地方
              </span>
            )}
          </div>
        </BrowserFrame>
      </div>

      <div className="flex h-11 shrink-0 items-center">
        <span className="text-[21px] text-muted">
          這三個檔案都在你的瀏覽器裡執行，所以前端不負責保存資料 —— 重新整理，購物車的數字就沒了。
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * WhyBackendDemo — 為什麼需要後端
 *
 * 三欄：前端 / 後端 / 資料庫。兩顆按鈕走同一條流程，差別只在第二關：
 *   加入購物車     四關全過，資料庫真的多一筆
 *   別人想幫你加   第二關「確認你是誰」就被擋下來
 * ══════════════════════════════════════════════════════════════ */

const BACKEND_STEPS = [
  { text: '先看資料庫有沒有這個商品、還有沒有庫存', note: '查資料' },
  { text: '確認你是誰、有沒有登入', note: '安全性' },
  { text: '把這個品項寫進你的購物車', note: '寫資料' },
  { text: '回一句「加好了」給前端', note: '回應' },
];

const IMPOSTOR_STOP_AT = 2;

type CartMode = 'self' | 'other';

export function WhyBackendDemo() {
  const [run, setRun] = useState<{ mode: CartMode; id: number } | null>(null);
  const [tick, setTick] = useState(0);
  const limit = run?.mode === 'other' ? IMPOSTOR_STOP_AT : BACKEND_STEPS.length;

  useEffect(() => {
    if (!run) return;
    const timer = setInterval(() => {
      setTick((value) => (value >= limit ? value : value + 1));
    }, 850);
    return () => clearInterval(timer);
  }, [run, limit]);

  const start = (mode: CartMode) => {
    setTick(0);
    setRun((previous) => ({ mode, id: (previous?.id ?? 0) + 1 }));
  };

  const blocked = run?.mode === 'other' && tick >= IMPOSTOR_STOP_AT;
  const done = run?.mode === 'self' && tick >= BACKEND_STEPS.length;

  return (
    <div className="flex h-[648px] w-full max-w-[1760px] flex-col gap-5">
      <div className="grid min-h-0 flex-1 grid-cols-[380px_1fr_380px] gap-6">
        {/* 前端 */}
        <div className={`flex min-h-0 flex-col gap-4 rounded-2xl border-3 p-6 ${cardSeen('client')}`}>
          <span className={`${LABEL} text-paper`}>前端</span>
          <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-xl border-2 border-line bg-panel p-4">
            <ProductThumb id="suitcase" size={128} />
            <span className="text-[22px] font-semibold text-paper">行李箱 28 吋</span>
            <span className={`text-[20px] font-semibold ${TONE_TEXT.client}`}>NT$3,280</span>
          </div>
          <button
            type="button"
            onClick={() => start('self')}
            className={`pressable h-12 shrink-0 rounded-full border-2 border-line text-[21px] font-semibold ${TONE_SOLID.client}`}
          >
            加入購物車
          </button>
          <button
            type="button"
            onClick={() => start('other')}
            className={`pressable h-12 shrink-0 rounded-full text-[20px] font-semibold ${TONE_CHIP.danger}`}
          >
            別人想幫你加一件
          </button>
        </div>

        {/* 後端：外框中性，裡面四列走完會轉成粉紅貼紙 */}
        <div className="flex min-h-0 flex-col gap-3 rounded-2xl border-3 border-line bg-panel p-6">
          <div className="flex shrink-0 items-center justify-between">
            <span className={`${LABEL} ${TONE_TEXT.backend}`}>後端</span>
            <span className="text-[19px] text-muted">
              {run ? '收到前端送來的請求，開始逐項檢查' : '等待前端送來請求'}
            </span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 pr-1 pb-1">
            {BACKEND_STEPS.map((step, index) => {
              const reached = run !== null && tick > index;
              const isBlocker = run?.mode === 'other' && index === IMPOSTOR_STOP_AT - 1;
              const failed = isBlocker && reached;
              const tone: Tone = failed ? 'danger' : 'backend';

              return (
                <div
                  key={step.text}
                  className={`flex min-h-0 flex-1 items-center gap-4 rounded-xl border-3 px-5 transition-[background-color,border-color,box-shadow] duration-300 ${
                    failed ? cardActive('danger') : reached ? cardSeen('backend') : CARD_IDLE
                  }`}
                >
                  <StepHex n={index + 1} tone={tone} state={reached ? 'on' : 'idle'} size={34} />
                  <span className={`shrink-0 ${failed ? 'text-paper' : reached ? 'text-paper' : 'text-transparent'}`}>
                    {failed ? <CrossMark /> : <CheckMark />}
                  </span>
                  <span className={`min-w-0 flex-1 text-[22px] ${reached ? 'text-paper' : 'text-muted'}`}>
                    {failed ? '確認你是誰 —— 這不是你本人，拒絕' : step.text}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-[17px] font-semibold ${
                      failed ? TONE_CHIP.danger : reached ? TONE_CHIP.backend : 'border-2 border-line-soft text-faint'
                    }`}
                  >
                    {failed ? '擋下來' : step.note}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex h-12 shrink-0 items-center">
            {done && (
              <span className={`rounded-full px-5 py-2 text-[20px] font-semibold ${TONE_CHIP.backend}`}>
                🎉 四關都過了，資料庫多了一筆，前端才收到「加好了」
              </span>
            )}
            {blocked && (
              <span className={`rounded-full px-5 py-2 text-[20px] font-semibold ${TONE_CHIP.danger}`}>
                🙅 第二關就被擋下來，後面兩件事根本沒有發生
              </span>
            )}
            {!done && !blocked && (
              <span className="text-[20px] text-muted">前端只按了一下，這一整串都是後端在做。</span>
            )}
          </div>
        </div>

        {/* 資料庫 */}
        <div className={`flex min-h-0 flex-col gap-4 rounded-2xl border-3 p-6 ${cardSeen('db')}`}>
          <span className={`${LABEL} text-paper`}>資料庫</span>
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <span className="text-[20px] text-muted">你的購物車</span>
            {done ? (
              <div className="slide-enter flex items-center justify-between rounded-xl border-3 border-line bg-panel px-5 py-4 shadow-pop-sm">
                <span className="text-[21px] font-semibold text-paper">行李箱 28 吋</span>
                <span className={`text-[21px] font-semibold ${TONE_TEXT.db}`}>× 1</span>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-xl border-3 border-dashed border-line bg-panel px-5 py-4">
                <span className="text-[20px] text-muted">目前是空的</span>
              </div>
            )}
            {blocked && (
              <div className="flex items-center gap-3 rounded-xl border-3 border-line bg-danger-pop px-5 py-4">
                <span className="text-paper">
                  <CrossMark />
                </span>
                <span className="text-[20px] font-semibold text-paper">沒有被寫進來</span>
              </div>
            )}
          </div>
          <span className="shrink-0 text-[19px] text-muted">資料庫只接受後端送來的、而且已經檢查過的寫入。</span>
        </div>
      </div>

      <div className="flex h-11 shrink-0 items-center justify-between gap-6">
        <span className="text-[21px] text-muted">兩顆按鈕走的是同一條流程，差別只在第二關過不過得了。</span>
        <button
          type="button"
          onClick={() => {
            setTick(0);
            setRun(null);
          }}
          className={BTN_GHOST}
        >
          重來
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * DatabaseDemo — 什麼是資料庫
 *
 * 「資料庫像一張只有後端能動的試算表」：
 *   左上（後端）  按了真的多一列
 *   左下（前端）  按了被擋下來 —— 任何人都能改的話，交易紀錄就可以被竄改
 * ══════════════════════════════════════════════════════════════ */

interface SheetRow {
  id: string;
  member: string;
  item: string;
  amount: string;
  at: string;
}

const SHEET_COLUMNS = ['訂單編號', '會員', '商品', '金額', '建立時間'];

const SHEET_SEED: SheetRow[] = [
  { id: 'A-1041', member: '王小美', item: '收納袋六件組', amount: 'NT$480', at: '10:12' },
  { id: 'A-1042', member: '陳大文', item: '登機後背包', amount: 'NT$1,180', at: '10:25' },
  { id: 'A-1043', member: '林佳穎', item: '行李箱 28 吋', amount: 'NT$3,280', at: '10:41' },
];

const SHEET_MORE: SheetRow[] = [
  { id: 'A-1044', member: '你', item: '行李箱 28 吋', amount: 'NT$3,280', at: '10:58' },
  { id: 'A-1045', member: '黃郁婷', item: '收納袋六件組', amount: 'NT$480', at: '11:03' },
  { id: 'A-1046', member: '張力仁', item: '登機後背包', amount: 'NT$1,180', at: '11:17' },
];

const SHEET_GRID = 'grid-cols-[150px_130px_1fr_150px_140px]';

export function DatabaseDemo() {
  const [added, setAdded] = useState(0);
  const [rejected, setRejected] = useState(0);
  const rows = [...SHEET_SEED, ...SHEET_MORE.slice(0, added)];
  const full = added >= SHEET_MORE.length;

  return (
    <div className="flex h-[648px] w-full max-w-[1760px] flex-col gap-5">
      <div className="grid min-h-0 flex-1 grid-cols-[560px_1fr] gap-6">
        <div className="flex min-h-0 flex-col gap-5">
          <div className={`flex min-h-0 flex-1 flex-col justify-center gap-4 rounded-2xl border-3 px-7 ${cardSeen('backend')}`}>
            <span className={`${LABEL} text-paper`}>後端</span>
            <p className="text-[22px] leading-[1.55] text-paper">後端可以照著寫好的規則，新增或修改這張表裡的資料。</p>
            <button
              type="button"
              onClick={() => setAdded((value) => Math.min(SHEET_MORE.length, value + 1))}
              disabled={full}
              className={`h-12 w-full ${full ? BTN_OFF : `${BTN} ${TONE_SOLID.backend}`} text-[21px]`}
            >
              {full ? '已經加到這一頁放得下的上限' : '後端新增一筆訂單'}
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col justify-center gap-4 rounded-2xl border-3 border-line bg-danger-pop px-7">
            <span className={`${LABEL} text-paper`}>前端</span>
            <p className="text-[22px] leading-[1.55] text-paper">如果任何人都能直接改這張表，交易紀錄就可以被竄改。</p>
            <button
              type="button"
              onClick={() => setRejected((value) => value + 1)}
              className={`pressable h-12 w-full rounded-full text-[21px] font-semibold ${TONE_CHIP.danger}`}
            >
              從前端直接把金額改成 NT$1
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-4 rounded-2xl border-3 border-line bg-panel p-6">
          <div className="flex shrink-0 items-center justify-between">
            <div className="flex items-center gap-3">
              <RoleIcon id="sheet" size={32} tone="db" />
              <span className="font-display text-[25px] font-semibold text-paper">訂單資料表</span>
            </div>
            <span className={`rounded-full px-4 py-1 text-[18px] font-semibold ${TONE_CHIP.db}`}>{rows.length} 筆</span>
          </div>

          {/* 欄名列 52 ＋ 6 列 × 56 ＋ 分隔線，外框可用約 415 */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border-3 border-line">
            <div className={`grid h-[52px] shrink-0 ${SHEET_GRID} items-center border-b-3 border-line bg-amber-pop`}>
              {SHEET_COLUMNS.map((column) => (
                <span key={column} className="px-5 text-[18px] font-semibold text-paper">
                  {column}
                </span>
              ))}
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              {rows.map((row, index) => {
                const newest = index === rows.length - 1 && added > 0;
                return (
                  <div
                    key={row.id}
                    className={`grid h-[56px] shrink-0 ${SHEET_GRID} items-center border-b-2 border-l-[6px] border-line-soft last:border-b-0 transition-colors duration-300 ${
                      newest ? 'slide-enter border-l-role-data bg-teal-pop' : 'border-l-transparent'
                    }`}
                  >
                    <span className="px-5 font-mono text-[19px] text-muted">{row.id}</span>
                    <span className="px-5 text-[20px] text-paper">{row.member}</span>
                    <span className="px-5 text-[20px] text-paper">{row.item}</span>
                    <span className={`px-5 font-mono text-[19px] font-semibold ${newest ? 'text-paper' : TONE_TEXT.db}`}>
                      {row.amount}
                    </span>
                    <span className="px-5 font-mono text-[19px] text-muted">{row.at}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex h-12 shrink-0 items-center">
            {rejected > 0 ? (
              <span key={rejected} className={`slide-enter rounded-full px-5 py-2 text-[20px] font-semibold ${TONE_CHIP.danger}`}>
                🙅 拒絕：資料庫不對外開放，只有後端連得上 —— 這張表一個字都沒變
              </span>
            ) : (
              <span className="text-[20px] text-muted">欄位、每一列，跟你熟悉的試算表是同一回事。</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-11 shrink-0 items-center justify-between gap-6">
        <span className="text-[21px] text-muted">兩顆按鈕都對著同一張表，只有上面那顆真的改得動。</span>
        <button
          type="button"
          onClick={() => {
            setAdded(0);
            setRejected(0);
          }}
          className={BTN_GHOST}
        >
          重來
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * ServerDemo — 伺服器是什麼
 *
 * 同一張 ArchMap 開 deployMode：使用者與網路整組收掉。節點一格都沒動，
 * 只有灰框在變 —— 沒有框 → 一個框 → 三個框。後端與資料庫標上
 * Cloudflare Worker、Cloudflare D1：這一頁就是在回答「Cloudflare 幫你準備了什麼」。
 * ══════════════════════════════════════════════════════════════ */

interface ServerBeat {
  card: { name: string; lead: string; detail: string };
  lit: ArchNode[];
  frames: ArchFrames;
  ring?: ArchNode;
}

const SERVER_BEATS: ServerBeat[] = [
  {
    card: {
      name: '它們自己不會動',
      lead: '前端是程式、後端是程式，資料庫是一份要存起來的資料。',
      detail: '這三個都只是檔案，沒有人把它們跑起來就什麼都不會發生。',
    },
    lit: ['client', 'backend', 'db'],
    frames: 'none',
  },
  {
    card: {
      name: '最單純：放同一台',
      lead: '一台伺服器就可以同時放前端、後端與資料庫。',
      detail: '但這台機器要有人顧：開機、更新、壞了要修。',
    },
    lit: ['client', 'backend', 'db', 'host'],
    frames: 'one',
    ring: 'host',
  },
  {
    card: {
      name: 'Cloudflare 幫你拆好了',
      lead: '前端放 Pages、後端（Cloudflare Worker）、資料庫（Cloudflare D1）。',
      detail: '機器是 Cloudflare 在顧，你只要把東西放上去。',
    },
    lit: ['client', 'backend', 'db', 'host'],
    frames: 'three',
    ring: 'host',
  },
];

export function ServerDemo() {
  const [beat, setBeat] = useState(0);
  const current = beat > 0 ? SERVER_BEATS[beat - 1] : undefined;

  return (
    <div className="flex h-[648px] w-full max-w-[1760px] flex-col gap-5">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-6">
        <div className="flex min-h-0 flex-col gap-4 pr-1 pb-1">
          {SERVER_BEATS.map((item, index) => (
            <ExplainCard
              key={item.card.name}
              index={index + 1}
              tone="host"
              name={item.card.name}
              lead={item.card.lead}
              detail={item.card.detail}
              state={index === beat - 1 ? 'active' : index < beat ? 'seen' : 'idle'}
            />
          ))}
        </div>

        <div className={MAP_BOX}>
          <ArchMap
            lit={current?.lit ?? []}
            ring={current?.ring}
            frames={current?.frames ?? 'none'}
            deployMode
            cloudflare
          />
        </div>
      </div>

      <div className="flex h-11 shrink-0 items-center justify-between gap-6">
        <span className="text-[21px] text-muted">三張卡片的位置從頭到尾沒有動過，變的只有外面那個框。</span>
        <StepControls
          current={beat}
          total={SERVER_BEATS.length + 1}
          tone="host"
          onPrev={() => setBeat((value) => Math.max(0, value - 1))}
          onNext={() => setBeat((value) => Math.min(SERVER_BEATS.length, value + 1))}
          onReset={() => setBeat(0)}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * ScaleArchDemo — 這些觀念如何幫助 AI Coding · 架構
 *
 * 原本的三種規模是「個人記事本 / 團隊排程 / 商用應用程式」，這裡換成
 * 辦公室裡真的會做的三種內部工具，框的名字直接寫 Cloudflare 的服務。
 * 規模卡走中性色：顏色在這份簡報裡代表角色，不代表大小，大小用方塊數表示。
 * ══════════════════════════════════════════════════════════════ */

interface Scale {
  id: ScaleId;
  name: string;
  example: string;
  blurb: string;
  weight: number;
  place: string;
}

const SCALES: Scale[] = [
  {
    id: 'mine',
    name: '我自己的小工具',
    example: '午餐吃什麼轉盤',
    blurb: '只有自己用，不用登入',
    weight: 1,
    place: 'Pages 就夠了',
  },
  {
    id: 'team',
    name: '部門一起用的工具',
    example: '會議室預約表',
    blurb: '五到十個人一起用，資料要留著',
    weight: 2,
    place: 'Pages ＋ Worker ＋ D1',
  },
  {
    id: 'company',
    name: '全公司的內部系統',
    example: '請假與報帳系統',
    blurb: '全公司都在用，有個資、有附件',
    weight: 3,
    place: 'Pages ＋ Worker ＋ D1 ＋ R2',
  },
];

function ScalePicker({ picked, onPick }: { picked: number; onPick: (index: number) => void }) {
  return (
    <div className="flex min-h-0 flex-col gap-4 pr-1 pb-1">
      <span className={`${LABEL_FAINT} shrink-0`}>選一種內部工具</span>
      {SCALES.map((scale, index) => {
        const active = index === picked;
        return (
          <button
            key={scale.id}
            type="button"
            onClick={() => onPick(index)}
            aria-pressed={active}
            className={`flex min-h-0 flex-1 flex-col justify-center gap-2 rounded-2xl border-3 px-7 text-left transition-[background-color,border-color,box-shadow] duration-200 ${
              active ? 'border-line bg-amber-pop shadow-pop-sm' : 'border-line-soft bg-panel hover:border-line'
            }`}
          >
            <div className="flex items-center gap-2">
              {Array.from({ length: 3 }, (_, i) => (
                <span
                  key={i}
                  className={`size-4 rounded-sm border-2 ${
                    i < scale.weight ? 'border-line bg-paper' : 'border-line-soft bg-panel'
                  }`}
                />
              ))}
              <span className={`ml-2 text-[18px] ${active ? 'text-muted' : 'text-faint'}`}>例如：{scale.example}</span>
            </div>
            <span className={`font-display text-[28px] font-semibold ${active ? 'text-paper' : 'text-muted'}`}>
              {scale.name}
            </span>
            <span className={`text-[20px] ${active ? 'text-paper' : 'text-muted'}`}>{scale.blurb}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ScaleArchDemo() {
  const [picked, setPicked] = useState(0);
  const scale = SCALES[picked];

  return (
    <div className="flex h-[648px] w-full max-w-[1760px] flex-col gap-5">
      <div className="grid min-h-0 flex-1 grid-cols-[520px_1fr] gap-6">
        <ScalePicker picked={picked} onPick={setPicked} />

        <div className="bg-dots flex min-h-0 flex-col gap-4 rounded-2xl border-2 border-line-soft p-6">
          <div className="flex shrink-0 items-center justify-between">
            <span className={LABEL_FAINT}>這種工具長什麼樣子</span>
            <span className="rounded-full border-2 border-line bg-amber-pop px-4 py-1 text-[19px] font-semibold text-paper">
              {scale.place}
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <ScaleArchDiagram scaleId={scale.id} />
          </div>
        </div>
      </div>

      <div className="flex h-11 shrink-0 items-center">
        <span className="text-[21px] text-muted">
          同樣叫「做一個網站」，三種要準備的東西差很多 —— 先講清楚是哪一種，AI 才知道要用 Cloudflare 的哪幾樣。
        </span>
      </div>
    </div>
  );
}
