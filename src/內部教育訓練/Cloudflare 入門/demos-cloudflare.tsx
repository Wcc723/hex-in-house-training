import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Asset } from '../../components';
import { HexBadge } from '../../components/HexBadge';
import type { AssetId } from '../../assets/manifest';
import {
  CloudflareMap,
  DomainFlow,
  type CloudflareMapProps,
  type ServiceId,
} from './diagrams-cloudflare';

/* ══════════════════════════════════════════════════════════════
 * 〈Cloudflare 入門〉— 第二章後半與第三章開頭的互動範例
 *
 *   AgendaDemo        今天的三件事（第 2 頁）
 *   OverviewDemo      Cloudflare 是什麼、有哪些服務（第 13 頁）
 *   DomainDemo        網域：買網址的地方（第 14 頁）
 *   ServicesDemo      Pages／Worker／D1／R2 四個頁籤（第 15–18 頁）
 *   TodayDemo         今天要做的三件事（第 20 頁）
 *
 * ServicesDemo 的殼照〈從 0 到 1 的網站開發〉的「D1 與 R2」那一頁：
 * 左邊直式頁籤、右邊「標題 ＋ 導言 ＋ 圖 ＋ 互動」。那一頁的「沒有備份、
 * 沒有保證」兩個頁籤不搬（Notion 指定拿掉），換成 Pages 與 Worker。
 * 四頁投影片共用同一個元件，只是預設停在不同的頁籤 —— 往下翻一頁，
 * 左邊的頁籤就往下走一格，台下看得到「現在講到第幾個」。
 *
 * 用詞照 Notion 的說明：今天的學員對開發沒有興趣，所以一律白話、
 * 不丟術語；真的要出現的名字（Pages、Worker…）都配一句「它是幹嘛的」。
 * ══════════════════════════════════════════════════════════════ */

/* ── 共用零件 ───────────────────────────────────────────── */

const LABEL = 'font-display text-[18px] font-semibold tracking-[0.08em] text-faint';

const BTN =
  'pressable h-11 shrink-0 rounded-full border-2 border-line px-5 text-[19px] font-semibold disabled:shadow-none';
const BTN_MAIN = `${BTN} bg-acid text-on-accent`;
const BTN_GHOST = `${BTN} bg-panel text-paper hover:bg-panel-lift`;

/** 依序播放幾拍，每拍間隔 gap 毫秒。phase = -1 代表還沒開始 */
function usePlayer(gap = 700) {
  const [phase, setPhase] = useState(-1);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => {
      list.splice(0).forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const stop = () => {
    timers.current.splice(0).forEach((id) => window.clearTimeout(id));
  };

  const play = (count: number) => {
    stop();
    setPhase(0);
    for (let index = 1; index < count; index += 1) {
      timers.current.push(window.setTimeout(() => setPhase(index), gap * index));
    }
  };

  const reset = () => {
    stop();
    setPhase(-1);
  };

  return { phase, play, reset };
}

/** 一個有圓底的貼紙 */
function StickerDisc({
  id,
  size,
  disc,
  className = '',
}: {
  id: AssetId;
  size: number;
  disc: string;
  className?: string;
}) {
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-full border-3 border-line ${disc} ${className}`}
      style={{ width: size, height: size }}
    >
      <Asset id={id} size={Math.round(size * 0.86)} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * AgendaDemo — 今天的三件事
 * ══════════════════════════════════════════════════════════════ */

const AGENDA: { asset: AssetId; disc: string; hex: string; title: string; sub: string; tilt: string }[] = [
  {
    asset: 'frontend-web',
    disc: 'bg-blue-pop',
    hex: 'bg-blue',
    title: '先認識什麼是前後端',
    sub: '一個網站，其實有四個角色在輪流工作',
    tilt: '-rotate-1',
  },
  {
    asset: 'cf-cloud',
    disc: 'bg-coral-pop',
    hex: 'bg-coral',
    title: 'Cloudflare 是什麼',
    sub: '幫你把網站放上網路的雲端服務，看看它能做什麼',
    tilt: 'rotate-1',
  },
  {
    asset: 'rocket-launch',
    disc: 'bg-violet-pop',
    hex: 'bg-violet',
    title: '今天要做什麼',
    sub: '裝好工具、請 AI 做一個網站，親手把它放上網路',
    tilt: '-rotate-1',
  },
];

export function AgendaDemo() {
  return (
    <div className="flex w-full max-w-[1700px] flex-col gap-10">
      <div className="grid grid-cols-3 gap-10">
        {AGENDA.map((item, index) => (
          <div
            key={item.title}
            className={`group flex flex-col items-center gap-6 rounded-[32px] border-3 border-line bg-panel px-8 pt-10 pb-9 text-center shadow-pop transition-transform duration-300 hover:rotate-0 ${item.tilt}`}
          >
            <StickerDisc id={item.asset} size={260} disc={item.disc} className="motion-safe:group-hover:animate-[wiggle_360ms_ease-in-out]" />
            <HexBadge size={52} fillClass={item.hex}>
              <span className="font-display text-[24px] font-semibold">{String(index + 1).padStart(2, '0')}</span>
            </HexBadge>
            <p className="font-display text-[36px] leading-tight font-semibold text-paper">{item.title}</p>
            <p className="text-[22px] leading-relaxed text-muted">{item.sub}</p>
          </div>
        ))}
      </div>
      <p className="text-center text-[22px] text-muted">
        今天<span className="marker mx-1 font-semibold text-paper">不用會寫程式</span>，聽得懂、按得下去就好。
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * OverviewDemo — Cloudflare 的服務介紹
 *
 * 上面一句話講 Cloudflare 是什麼（Notion〈Cloudflare 實戰運用〉的四個動詞），
 * 下面五張服務貼紙，一張一句話。點一張會翻出「什麼時候會用到它」。
 * ══════════════════════════════════════════════════════════════ */

const VERBS = [
  { verb: '找得到', text: '網址指到對的地方' },
  { verb: '跑得快', text: '從離你最近的機房送出' },
  { verb: '擋得住', text: '幫你擋掉惡意流量' },
  { verb: '放得上', text: '網站、程式、資料都能放' },
];

const SERVICES: { asset: AssetId; disc: string; name: string; one: string; when: string }[] = [
  { asset: 'domain-sign', disc: 'bg-amber-pop', name: '網域', one: '買網址的地方', when: '想要 lunch.hexschool.com 這種好記的網址' },
  { asset: 'pages-upload', disc: 'bg-blue-pop', name: 'Pages', one: '放網站的地方', when: '做好的網頁要給大家打開' },
  { asset: 'worker-bot', disc: 'bg-acid-pop', name: 'Worker', one: '幫你做事的地方', when: '要算東西、檢查身分、存取資料' },
  { asset: 'database', disc: 'bg-teal-pop', name: 'D1', one: '當資料庫的地方', when: '預約、名單這種要一直留著的資料' },
  { asset: 'r2-bucket', disc: 'bg-violet-pop', name: 'R2', one: '讓你丟圖的地方', when: '照片、PDF、附件這種整個檔案' },
];

export function OverviewDemo() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="flex w-full max-w-[1760px] flex-col gap-10">
      {/* Cloudflare 是什麼 */}
      <div className="flex items-center gap-8 rounded-3xl border-3 border-line bg-ink-soft px-8 py-7 shadow-pop-sm">
        <Asset id="cf-cloud" size={170} className="float-slow" />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <p className="text-[28px] leading-snug text-paper">
            <span className="marker font-display font-semibold">Cloudflare</span>
            ：站在「大家」和「你的網站」中間，幫你的網站
          </p>
          <div className="grid grid-cols-4 gap-4">
            {VERBS.map((item) => (
              <div key={item.verb} className="rounded-2xl border-2 border-line bg-panel px-5 py-3">
                <p className="font-display text-[26px] font-semibold text-paper">{item.verb}</p>
                <p className="text-[18px] text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 五個服務 */}
      <div className="grid grid-cols-5 gap-6">
        {SERVICES.map((service) => {
          const on = open === service.name;
          return (
            <button
              key={service.name}
              type="button"
              aria-pressed={on}
              onClick={() => setOpen(on ? null : service.name)}
              className={`group flex flex-col items-center gap-3 rounded-3xl border-3 border-line px-5 pt-7 pb-6 text-center transition-[background-color,box-shadow,transform] duration-200 ${
                on ? `${service.disc} shadow-pop -translate-y-1` : 'bg-panel shadow-pop-sm hover:-translate-y-1'
              }`}
            >
              <StickerDisc
                id={service.asset}
                size={210}
                disc={on ? 'bg-panel' : service.disc}
                className="motion-safe:group-hover:animate-[wiggle_360ms_ease-in-out]"
              />
              <p className="mt-1 font-display text-[38px] leading-none font-semibold text-paper">{service.name}</p>
              <p className="text-[23px] font-semibold text-paper">{service.one}</p>
              <p className={`min-h-[56px] text-[18px] leading-snug ${on ? 'text-paper' : 'text-muted'}`}>
                {on ? `什麼時候用：${service.when}` : '點我看什麼時候用'}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * DomainDemo — 網域服務：簡單來說，就是買網址的地方
 *
 * 上面是 DomainFlow（輸入網址之後，網域怎麼找到網站），按「查詢」
 * 會一格一格亮起來；網址列可以自己打字。下面三張卡是今天要記的三件事，
 * 最後一張特別點出「今天不用買」。
 * ══════════════════════════════════════════════════════════════ */

const DOMAIN_STEPS = [
  '你在瀏覽器輸入網址',
  '瀏覽器問：這個網址是誰家的？',
  '登記處說：問 Cloudflare 就對了',
  'Cloudflare 回答：網站在這裡',
  '瀏覽器連上網站，畫面出現 🎉',
];

const DOMAIN_FACTS: { title: string; body: ReactNode; disc: string }[] = [
  {
    title: '網域＝網站的門牌',
    body: (
      <>
        像 <code className="font-mono">hexschool.com</code> 這種好記的名字。要花錢買，而且每年續約。
      </>
    ),
    disc: 'bg-amber-pop',
  },
  {
    title: '在 Cloudflare 就能買',
    body: '照成本價賣，不另外加價；買了之後，「網站在哪」直接由 Cloudflare 幫你回答。',
    disc: 'bg-coral-pop',
  },
  {
    title: '今天先不用買',
    body: (
      <>
        Cloudflare 會送你一個免費網址 <code className="font-mono">xxx.workers.dev</code>，先用它就好。
      </>
    ),
    disc: 'bg-teal-pop',
  },
];

export function DomainDemo() {
  const [domain, setDomain] = useState('lunch.hexschool.com');
  const { phase, play, reset } = usePlayer(900);
  const step = Math.max(phase, 0);

  return (
    <div className="flex h-[800px] w-full max-w-[1820px] flex-col gap-6">
      <div className="bg-dots flex min-h-0 flex-1 flex-col gap-4 rounded-3xl border-3 border-line bg-ink px-6 pt-5 pb-4 shadow-pop-sm">
        <div className="flex h-12 shrink-0 items-center gap-4">
          <Asset id="domain-sign" size={56} />
          <span className="text-[20px] font-semibold text-paper">試試看，打一個網址：</span>
          <input
            value={domain}
            onChange={(event) => {
              setDomain(event.target.value);
              reset();
            }}
            spellCheck={false}
            aria-label="要查詢的網址"
            className="h-11 w-[380px] rounded-full border-2 border-line bg-panel px-5 font-mono text-[20px] text-paper outline-none focus:bg-amber-pop"
          />
          <button type="button" onClick={() => play(DOMAIN_STEPS.length)} className={BTN_MAIN}>
            {phase < 0 ? '查詢 →' : '再查一次'}
          </button>
          <span className="ml-auto flex items-center gap-3">
            {phase >= 0 && (
              <>
                <HexBadge size={38} stroke={2.5} fillClass="bg-acid">
                  <span className="font-display text-[18px] font-semibold">{step + 1}</span>
                </HexBadge>
                <span key={step} className="slide-enter text-[21px] font-semibold text-paper">
                  {DOMAIN_STEPS[step]}
                </span>
              </>
            )}
          </span>
        </div>
        <div className="min-h-0 flex-1">
          <DomainFlow step={phase < 0 ? -1 : step} domain={domain.trim() || 'lunch.hexschool.com'} />
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-3 gap-6 pr-1.5 pb-1.5">
        {DOMAIN_FACTS.map((fact, index) => (
          <div key={fact.title} className={`flex flex-col gap-2 rounded-2xl border-3 border-line px-6 py-5 shadow-pop-sm ${fact.disc}`}>
            <div className="flex items-center gap-3">
              <HexBadge size={34} stroke={2.5} fillClass="bg-panel" textClass="text-paper" shadow={false}>
                <span className="font-display text-[16px] font-semibold">{index + 1}</span>
              </HexBadge>
              <p className="font-display text-[26px] font-semibold text-paper">{fact.title}</p>
            </div>
            <p className="text-[20px] leading-relaxed text-paper">{fact.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * ServicesDemo — Pages／Worker／D1／R2
 * ══════════════════════════════════════════════════════════════ */

interface Tab {
  id: ServiceId;
  asset: AssetId;
  disc: string;
  hex: string;
  title: string;
  sub: string;
  headline: string;
  lead: string;
}

const TABS: readonly Tab[] = [
  {
    id: 'pages',
    asset: 'pages-upload',
    disc: 'bg-blue-pop',
    hex: 'bg-blue',
    title: 'Pages',
    sub: '把網站丟上去的地方',
    headline: 'Pages：把你的靜態網站丟上去的地方',
    lead: '做好的網頁檔案整包放上來，Cloudflare 就幫你送給每一個打開網址的人。「靜態」是指每個人看到的都一樣。',
  },
  {
    id: 'worker',
    asset: 'worker-bot',
    disc: 'bg-acid-pop',
    hex: 'bg-acid',
    title: 'Worker',
    sub: '幫你做事的地方',
    headline: 'Worker：幫你做事的地方',
    lead: '需要「動腦」的事交給它：抽籤、算錢、檢查你是誰、去資料庫拿資料。有人來請它做事，它才開工。',
  },
  {
    id: 'd1',
    asset: 'database',
    disc: 'bg-teal-pop',
    hex: 'bg-teal',
    title: 'D1',
    sub: '當作資料庫的地方',
    headline: 'D1：當作資料庫的地方',
    lead: '要一直留著的資料放這裡：預約、名單、紀錄。一列一筆，長得像試算表，但只有 Worker 能動它。',
  },
  {
    id: 'r2',
    asset: 'r2-bucket',
    disc: 'bg-violet-pop',
    hex: 'bg-violet',
    title: 'R2',
    sub: '讓你丟圖的地方',
    headline: 'R2：讓你丟圖的地方',
    lead: '照片、PDF、附件這種「一整個檔案」放這裡。D1 只記下檔名，檔案本體在 R2。',
  },
];

export function ServicesDemo({ initial = 'pages' }: { initial?: ServiceId }) {
  const [activeId, setActiveId] = useState<ServiceId>(initial);
  const active = TABS.find((tab) => tab.id === activeId) ?? TABS[0];

  return (
    <div className="flex h-[800px] w-full max-w-[1820px]">
      {/* 左：直式頁籤 */}
      <nav aria-label="Cloudflare 的四個服務" className="relative z-10 flex w-[400px] shrink-0 flex-col gap-4 py-6 pr-0">
        {TABS.map((tab) => {
          const on = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={on}
              onClick={() => setActiveId(tab.id)}
              /* 選中的頁籤往右多伸 3px、右框透明，跟右邊的面板接成一張 */
              className={`flex flex-1 items-center gap-4 rounded-l-3xl border-3 px-5 text-left transition-colors duration-200 ${
                on
                  ? `-mr-[3px] border-line border-r-transparent ${tab.disc}`
                  : 'mr-4 border-line-soft bg-panel hover:border-line'
              }`}
            >
              <StickerDisc id={tab.asset} size={92} disc={on ? 'bg-panel' : tab.disc} />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="font-display text-[32px] leading-none font-semibold text-paper">{tab.title}</span>
                <span className={`text-[20px] ${on ? 'text-paper' : 'text-muted'}`}>{tab.sub}</span>
              </span>
            </button>
          );
        })}
      </nav>

      {/* 右：標題 ＋ 導言 ＋ 圖 ＋ 互動 */}
      <section className={`flex min-w-0 flex-1 flex-col rounded-3xl border-3 border-line px-8 py-6 ${active.disc}`}>
        <div className="flex min-h-0 flex-1 flex-col rounded-2xl border-3 border-line bg-panel px-8 py-6 shadow-pop-sm">
          <header className="flex shrink-0 flex-col gap-2">
            <h3 className="font-display text-[32px] leading-[40px] font-semibold text-paper">{active.headline}</h3>
            <p className="text-[20px] leading-[30px] text-muted">{active.lead}</p>
          </header>

          {/* key 讓切換頁籤時，互動狀態從頭開始 */}
          <div key={active.id} className="slide-enter mt-5 flex min-h-0 flex-1 flex-col">
            {active.id === 'pages' && <PagesFigure />}
            {active.id === 'worker' && <WorkerFigure />}
            {active.id === 'd1' && <D1Figure />}
            {active.id === 'r2' && <R2Figure />}
          </div>

          <p className="mt-3 shrink-0 text-[16px] text-faint">
            免費額度出處：Cloudflare 官方文件（Workers、D1、R2 定價頁），以官網當下公告為準 · 2026-10
          </p>
        </div>
      </section>
    </div>
  );
}

/** 左邊放圖、右邊放說明的那一列 */
function FigureRow({ map, children }: { map: CloudflareMapProps; children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 gap-7">
      {/* 680 寬時 CloudflareMap（viewBox 660）約 1:1，圖裡最小的字才保得住 16px 以上 */}
      <div className="bg-dots h-full w-[680px] shrink-0 rounded-2xl border-2 border-line-soft p-2">
        <CloudflareMap {...map} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">{children}</div>
    </div>
  );
}

/** 流程的一拍：到了是實心，還沒到是白底 */
function Beat({ n, reached, label, hex }: { n: number; reached: boolean; label: string; hex: string }) {
  return (
    <div className="flex h-9 items-center gap-3">
      <HexBadge size={32} stroke={2.5} shadow={reached} fillClass={reached ? hex : 'bg-panel'} textClass={reached ? 'text-on-accent' : 'text-faint'}>
        <span className="font-display text-[15px] font-semibold">{n}</span>
      </HexBadge>
      <span className={`text-[19px] ${reached ? 'font-semibold text-paper' : 'text-muted'}`}>{label}</span>
    </div>
  );
}

/** 底部三張「數字卡」 */
function Facts({ items, disc }: { items: readonly { big: string; small: string }[]; disc: string }) {
  return (
    <div className="mt-auto grid shrink-0 grid-cols-3 gap-3">
      {items.map((fact) => (
        <div key={fact.big} className={`flex flex-col gap-0.5 rounded-xl border-2 border-line px-4 py-2.5 ${disc}`}>
          <span className="font-display text-[26px] leading-[34px] font-semibold text-paper">{fact.big}</span>
          <span className="text-[17px] leading-[24px] text-muted">{fact.small}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Pages：把網站資料夾丟上去 ──────────────────────────── */

const SITE_FILES = ['index.html', 'style.css', 'main.js', 'images/logo.png'];
const PAGES_STEPS = ['把網站資料夾丟上 Pages', 'Pages 給你一個網址', '同事打開網址，看到網站'];

function PagesFigure() {
  const { phase, play, reset } = usePlayer(900);
  const running = phase >= 0;

  const map: CloudflareMapProps = {
    states: {
      pages: 'on',
      client: phase >= 2 ? 'soft' : 'off',
      user: phase >= 2 ? 'soft' : 'off',
    },
    arrows: phase >= 2 ? ['userToClient', 'clientToPages', 'pagesToClient'] : !running ? ['pagesToClient'] : [],
    ring: phase === 0 || phase === 1 ? 'pages' : phase >= 2 ? 'client' : undefined,
    notes: {
      pages: phase >= 1 ? 'lunch-wheel.pages.dev' : phase === 0 ? '收到 4 個檔案' : undefined,
      client: phase >= 2 ? '看到網站了！' : undefined,
    },
  };

  return (
    <FigureRow map={map}>
      <div className="flex h-11 shrink-0 items-center gap-3">
        <span className={LABEL}>你的網站資料夾</span>
        <span className="ml-auto" />
        <button type="button" onClick={() => (running ? reset() : play(PAGES_STEPS.length))} className={running ? BTN_GHOST : BTN_MAIN}>
          {running ? '重來' : '🚀 丟上 Pages'}
        </button>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-2">
        {SITE_FILES.map((file) => (
          <div
            key={file}
            className={`flex h-12 items-center gap-3 rounded-xl border-2 px-4 transition-colors duration-300 ${
              phase >= 0 ? 'border-line bg-blue-pop' : 'border-line-soft bg-panel'
            }`}
          >
            <span className="size-3 rounded-full border-2 border-line bg-panel" />
            <span className="font-mono text-[18px] text-paper">{file}</span>
          </div>
        ))}
      </div>

      <div className="flex h-12 shrink-0 items-center">
        {phase >= 1 ? (
          <span className="slide-enter rounded-full border-2 border-line bg-amber-pop px-5 py-1.5 font-mono text-[20px] font-semibold text-paper">
            https://lunch-wheel.pages.dev
          </span>
        ) : (
          <span className="text-[19px] text-muted">網址會出現在這裡</span>
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-1">
        {PAGES_STEPS.map((step, index) => (
          <Beat key={step} n={index + 1} reached={phase >= index} label={step} hex="bg-blue" />
        ))}
      </div>

      <Facts
        disc="bg-blue-pop"
        items={[
          { big: '靜態網站', small: '每個人看到的都一樣' },
          { big: '流量免費', small: '靜態檔案不限次數' },
          { big: '送你網址', small: 'xxx.pages.dev' },
        ]}
      />
    </FigureRow>
  );
}

/* ── Worker：請它做事 ───────────────────────────────────── */

const LUNCH = ['巷口牛肉麵', '公司樓下便當', '轉角咖哩飯', '那家越南河粉', '韓式拌飯'];

interface Job {
  id: string;
  ask: string;
  answer: () => string;
}

const JOBS: Job[] = [
  {
    id: 'lunch',
    ask: '🍜 幫我抽一家午餐',
    answer: () => `今天吃：${LUNCH[Math.floor(Math.random() * LUNCH.length)]}`,
  },
  {
    id: 'time',
    ask: '⏰ 現在幾點？',
    answer: () =>
      `現在是 ${new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`,
  },
  {
    id: 'salary',
    ask: '🔐 我可以看薪資表嗎？',
    answer: () => '不行喔，你不是人資 🙅',
  },
];

function WorkerFigure() {
  const { phase, play, reset } = usePlayer(700);
  const [job, setJob] = useState<{ ask: string; answer: string; id: string } | null>(null);
  const [log, setLog] = useState<{ ask: string; answer: string; n: number }[]>([]);

  const ask = (item: Job) => {
    const answer = item.answer();
    setJob({ ask: item.ask, answer, id: item.id });
    play(3);
    setLog((prev) => [{ ask: item.ask, answer, n: (prev[0]?.n ?? 0) + 1 }, ...prev].slice(0, 3));
  };

  const map: CloudflareMapProps = {
    states: { worker: 'on', client: job ? 'soft' : 'off', user: job ? 'soft' : 'off' },
    arrows:
      phase < 0
        ? []
        : phase === 0
          ? ['userToClient', 'clientToWorker']
          : phase === 1
            ? ['userToClient', 'clientToWorker']
            : ['userToClient', 'clientToWorker', 'workerToClient'],
    ring: phase === 1 ? 'worker' : phase >= 2 ? 'client' : undefined,
    notes: {
      worker: phase === 1 ? '開工中…' : phase >= 2 ? '做完了，回覆！' : undefined,
      client: phase >= 2 ? '收到回覆' : undefined,
    },
  };

  return (
    <FigureRow map={map}>
      <div className="flex h-11 shrink-0 items-center gap-3">
        <span className={LABEL}>點一件事，請 Worker 幫你做</span>
        <span className="ml-auto" />
        {log.length > 0 && (
          <button
            type="button"
            onClick={() => {
              reset();
              setJob(null);
              setLog([]);
            }}
            className={BTN_GHOST}
          >
            重來
          </button>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap gap-3">
        {JOBS.map((item) => (
          <button key={item.id} type="button" onClick={() => ask(item)} className={`${BTN} bg-acid-pop text-paper`}>
            {item.ask}
          </button>
        ))}
      </div>

      {/* Worker 的回覆 */}
      <div className="flex h-[150px] shrink-0 flex-col gap-2 rounded-xl border-2 border-line bg-ink-soft p-3">
        {log.length === 0 ? (
          <span className="m-auto text-[19px] text-muted">回覆會出現在這裡</span>
        ) : (
          log.map((entry, index) => (
            <div
              key={entry.n}
              className={`flex h-10 items-center gap-3 rounded-lg border-2 px-3 text-[18px] ${
                index === 0 ? 'slide-enter border-line bg-panel' : 'border-line-soft bg-panel'
              }`}
            >
              <span className="shrink-0 text-muted">{entry.ask.slice(0, 2)}</span>
              <span className={index === 0 && phase < 2 ? 'text-faint' : 'font-semibold text-paper'}>
                {index === 0 && phase < 2 ? 'Worker 處理中…' : entry.answer}
              </span>
            </div>
          ))
        )}
      </div>

      <Facts
        disc="bg-acid-pop"
        items={[
          { big: '每天 10 萬次', small: '免費方案的請求數' },
          { big: '不用顧主機', small: '有人來請它，它才開工' },
          { big: 'AI 幫你寫', small: '它就是一段 JavaScript' },
        ]}
      />
    </FigureRow>
  );
}

/* ── D1：新增一筆預約 ───────────────────────────────────── */

interface Booking {
  id: number;
  room: string;
  time: string;
  who: string;
}

const BOOKINGS: readonly Booking[] = [
  { id: 1, room: '大會議室', time: '10:00–11:00', who: '小美' },
  { id: 2, room: '小會議室', time: '13:30–14:00', who: '阿文' },
  { id: 3, room: '大會議室', time: '15:00–16:00', who: '佳穎' },
];

const NEW_BOOKING: Booking = { id: 4, room: '小會議室', time: '16:00–17:00', who: '你' };

const D1_STEPS = ['送出一筆預約', 'Worker 把它寫進 D1', '畫面多了一列'];
const BOOK_GRID = 'grid-cols-[56px_150px_minmax(0,1fr)_96px]';

function D1Figure() {
  const { phase, play, reset } = usePlayer(800);
  const running = phase >= 0;
  const added = phase >= 1;

  const map: CloudflareMapProps = {
    states: { d1: 'on', worker: 'soft', client: running ? 'soft' : 'off', user: running ? 'soft' : 'off' },
    arrows: !running
      ? ['workerToD1', 'd1ToWorker']
      : phase === 0
        ? ['userToClient', 'clientToWorker']
        : phase === 1
          ? ['userToClient', 'clientToWorker', 'workerToD1']
          : ['userToClient', 'clientToWorker', 'workerToD1', 'workerToClient'],
    ring: phase === 0 ? 'worker' : phase === 1 ? 'd1' : phase >= 2 ? 'client' : undefined,
    notes: { d1: added ? '4 筆預約' : '3 筆預約', client: phase >= 2 ? '多了一筆！' : undefined },
  };

  return (
    <FigureRow map={map}>
      <div className="flex h-11 shrink-0 items-center gap-3">
        <span className={LABEL}>會議室預約表（D1 裡的一張表）</span>
        <span className="ml-auto" />
        <button type="button" onClick={() => (running ? reset() : play(D1_STEPS.length))} className={running ? BTN_GHOST : BTN_MAIN}>
          {running ? '重來' : '＋ 新增一筆預約'}
        </button>
      </div>

      <div className="flex shrink-0 flex-col overflow-hidden rounded-xl border-3 border-line bg-panel">
        <div className={`grid h-11 ${BOOK_GRID} items-center border-b-3 border-line bg-amber-pop text-[17px] font-semibold text-paper`}>
          <span className="pl-4">#</span>
          <span>會議室</span>
          <span>時段</span>
          <span>預約人</span>
        </div>
        {[...BOOKINGS, ...(added ? [NEW_BOOKING] : [])].map((row) => {
          const fresh = row.id === NEW_BOOKING.id;
          return (
            <div
              key={row.id}
              className={`grid h-11 ${BOOK_GRID} items-center border-b-2 border-l-[6px] border-line-soft text-[19px] last:border-b-0 ${
                fresh ? 'slide-enter border-l-teal bg-teal-pop' : 'border-l-transparent'
              }`}
            >
              <span className="pl-2 font-mono text-muted">{row.id}</span>
              <span className="text-paper">{row.room}</span>
              <span className="font-mono text-paper">{row.time}</span>
              <span className="text-paper">{row.who}</span>
            </div>
          );
        })}
        {!added && (
          <div className="flex h-11 items-center pl-5 text-[18px] text-muted">下一筆會寫在這一列</div>
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-0.5">
        {D1_STEPS.map((step, index) => (
          <Beat key={step} n={index + 1} reached={phase >= index} label={step} hex="bg-teal" />
        ))}
      </div>

      <Facts
        disc="bg-teal-pop"
        items={[
          { big: '一列一筆', small: '像雲端上的試算表' },
          { big: '5 GB', small: '免費方案的總容量' },
          { big: '前端碰不到', small: '只有 Worker 能動它' },
        ]}
      />
    </FigureRow>
  );
}

/* ── R2：附上一張收據照片 ───────────────────────────────── */

const R2_STEPS = ['瀏覽器送出一張收據照片', '照片本體放進 R2', 'D1 那一列只記下檔名'];
const PHOTO_KEY = 'receipts/lunch.jpg';

function R2Figure() {
  const { phase, play, reset } = usePlayer(850);
  const running = phase >= 0;

  const map: CloudflareMapProps = {
    states: {
      r2: 'on',
      worker: 'soft',
      d1: phase >= 2 ? 'soft' : 'off',
      client: running ? 'soft' : 'off',
      user: running ? 'soft' : 'off',
    },
    arrows: !running
      ? ['workerToR2', 'r2ToWorker']
      : phase === 0
        ? ['userToClient', 'clientToWorker']
        : phase === 1
          ? ['userToClient', 'clientToWorker', 'workerToR2']
          : ['userToClient', 'clientToWorker', 'workerToR2', 'workerToD1'],
    ring: phase === 0 ? 'worker' : phase === 1 ? 'r2' : phase >= 2 ? 'd1' : undefined,
    notes: {
      r2: phase >= 1 ? '1 張照片' : '還沒有檔案',
      d1: phase >= 2 ? '記下檔名' : undefined,
      client: phase === 0 ? '選了一張照片' : undefined,
    },
  };

  return (
    <FigureRow map={map}>
      <div className="flex h-11 shrink-0 items-center gap-3">
        <span className={LABEL}>報帳時附上一張收據</span>
        <span className="ml-auto" />
        <button type="button" onClick={() => (running ? reset() : play(R2_STEPS.length))} className={running ? BTN_GHOST : BTN_MAIN}>
          {running ? '重來' : '📎 附上收據照片'}
        </button>
      </div>

      {/* R2：照片本體 */}
      <div
        className={`flex h-[84px] shrink-0 items-center gap-4 rounded-xl border-3 border-l-[8px] px-4 transition-colors duration-300 ${
          phase >= 1 ? 'border-line border-l-violet bg-violet-pop' : 'border-line-soft border-l-line-soft bg-panel'
        }`}
      >
        <span className="w-[48px] shrink-0 font-display text-[28px] font-bold text-paper">R2</span>
        {phase >= 1 ? (
          <div className="slide-enter flex min-w-0 flex-1 items-center gap-3">
            <Asset id="r2-bucket" size={56} />
            <span className="min-w-0 flex-1 truncate font-mono text-[18px] text-paper">{PHOTO_KEY}</span>
            <span className="shrink-0 rounded-full border-2 border-line bg-panel px-3 py-0.5 text-[16px] font-semibold text-paper">2.4 MB</span>
          </div>
        ) : (
          <span className="flex h-[52px] min-w-0 flex-1 items-center justify-center rounded-lg border-2 border-dashed border-line-soft text-[19px] text-muted">
            還沒有檔案
          </span>
        )}
      </div>

      {/* D1：只記檔名 */}
      <div
        className={`flex h-[84px] shrink-0 items-center gap-4 rounded-xl border-3 border-l-[8px] px-4 transition-colors duration-300 ${
          phase >= 2 ? 'border-line border-l-teal bg-teal-pop' : 'border-line-soft border-l-line-soft bg-panel'
        }`}
      >
        <span className="w-[48px] shrink-0 font-display text-[28px] font-bold text-paper">D1</span>
        <div className="grid min-w-0 flex-1 grid-cols-[92px_74px_minmax(0,1fr)] gap-x-3">
          <span className="text-[16px] text-muted">項目</span>
          <span className="text-[16px] text-muted">金額</span>
          <span className="text-[16px] text-muted">收據檔名</span>
          <span className="text-[19px] text-paper">部門午餐</span>
          <span className="font-mono text-[19px] text-paper">$1,280</span>
          <span className={`truncate font-mono text-[17px] leading-[28px] ${phase >= 2 ? 'font-semibold text-paper' : 'text-muted'}`}>
            {phase >= 2 ? PHOTO_KEY : '—'}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-0.5">
        {R2_STEPS.map((step, index) => (
          <Beat key={step} n={index + 1} reached={phase >= index} label={step} hex="bg-violet" />
        ))}
      </div>

      <Facts
        disc="bg-violet-pop"
        items={[
          { big: '10 GB', small: '每月免費的儲存量' },
          { big: '下載不收費', small: '流量免費' },
          { big: '要綁信用卡', small: '開通 R2 需要付款方式' },
        ]}
      />
    </FigureRow>
  );
}

/* ══════════════════════════════════════════════════════════════
 * TodayDemo — 今天要做的事
 * ══════════════════════════════════════════════════════════════ */

const TODAY: { asset: AssetId; disc: string; hex: string; title: string; sub: string; chip: string }[] = [
  {
    asset: 'node-install',
    disc: 'bg-amber-pop',
    hex: 'bg-amber',
    title: '安裝 Node.js',
    sub: '用 nvm 安裝，讓電腦跑得動 Vite、Wrangler',
    chip: '約 5 分鐘',
  },
  {
    asset: 'codex-mode',
    disc: 'bg-acid-pop',
    hex: 'bg-acid',
    title: '請 AI 建構一個網站',
    sub: '用提示詞產生器，一定要用 Vite ＋ Wrangler',
    chip: '約 15 分鐘',
  },
  {
    asset: 'rocket-launch',
    disc: 'bg-teal-pop',
    hex: 'bg-teal',
    title: '丟上 Cloudflare',
    sub: '在後台按幾下，拿到一個真的網址',
    chip: '約 10 分鐘',
  },
];

export function TodayDemo() {
  return (
    <div className="flex w-full max-w-[1700px] flex-col gap-10">
      <div className="flex items-stretch gap-4">
        {TODAY.map((item, index) => (
          <div key={item.title} className="flex flex-1 items-center gap-4">
            <div className="group flex h-full flex-1 flex-col items-center gap-5 rounded-[32px] border-3 border-line bg-panel px-7 pt-9 pb-8 text-center shadow-pop">
              <StickerDisc id={item.asset} size={220} disc={item.disc} className="motion-safe:group-hover:animate-[wiggle_360ms_ease-in-out]" />
              <div className="flex items-center gap-3">
                <HexBadge size={48} fillClass={item.hex}>
                  <span className="font-display text-[22px] font-semibold">{index + 1}</span>
                </HexBadge>
                <p className="font-display text-[34px] leading-tight font-semibold text-paper">{item.title}</p>
              </div>
              <p className="text-[22px] leading-relaxed text-muted">{item.sub}</p>
              <span className="mt-auto rounded-full border-2 border-line bg-amber-pop px-4 py-1 text-[18px] font-semibold text-paper">
                ⏱ {item.chip}
              </span>
            </div>
            {index < TODAY.length - 1 && (
              <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke="var(--color-line)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-[24px] text-paper">
        下課時你會有：<span className="marker font-semibold">一個同事打得開的網址</span> 🎉
      </p>
    </div>
  );
}

/* ── 第 15–18 頁：同一個頁籤元件，預設停在不同的頁籤 ─── */

export function PagesTab() {
  return <ServicesDemo initial="pages" />;
}

export function WorkerTab() {
  return <ServicesDemo initial="worker" />;
}

export function D1Tab() {
  return <ServicesDemo initial="d1" />;
}

export function R2Tab() {
  return <ServicesDemo initial="r2" />;
}
