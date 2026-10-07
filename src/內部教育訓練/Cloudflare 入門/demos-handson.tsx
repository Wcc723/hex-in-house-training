import { useEffect, useRef, useState } from 'react';
import { Asset } from '../../components';
import { HexBadge } from '../../components/HexBadge';
import deploy1 from './images/deploy-1.webp';
import deploy2 from './images/deploy-2.webp';
import deploy3 from './images/deploy-3.webp';
import deploy4 from './images/deploy-4.webp';
import deploy5 from './images/deploy-5.webp';
import deploy6 from './images/deploy-6.webp';

/* ══════════════════════════════════════════════════════════════
 * 〈Cloudflare 入門〉— 第三章：動手做
 *
 *   NodeInstallDemo      安裝 Node.js（Mac，用 nvm —— 官網給 macOS 的方法）
 *   PromptGeneratorDemo  請 AI 建構一個網站：最基本版的提示詞產生器
 *   DeployCarouselDemo   丟上 Cloudflare：Notion 附的六張步驟圖輪播
 *
 * ──────────────────────────────────────────────────────────────
 * 內容來源（2026-10 的狀態）
 * ──────────────────────────────────────────────────────────────
 * - Node.js：照 nodejs.org/en/download 給 macOS 的 nvm 指令（nvm v0.40.8），
 *   LTS 版本查 nodejs.org/dist/index.json —— 目前是 v24.21.0（Krypton），附的 npm 是 11.19.0。
 *   終端機的輸出是**示意**，挑了真實輸出裡最有意義的幾行。
 * - 提示詞產生器：照〈從 0 到 1 的網站開發〉的「提示詞產生器：開始用 Skill 之前」，
 *   照 Notion 要求砍成最基本版 —— 只問一題「想做什麼」，其他需求全部寫死：
 *   不用 R2、D1；一定要 Vite；用 Vue；手動到 Cloudflare 部署。
 * - 部署步驟圖：Notion〈Cloudflare 實戰運用〉的「使用 worker 及靜態網站」六張截圖。
 *   第 6 張原本是「編輯代碼 → /api/edge」，這份的網站是純前端，改講旁邊的「造訪」。
 *
 * 根容器一律 `h-[800px] w-full max-w-[1820px]`，三頁都是 bare 的 demo。
 * ══════════════════════════════════════════════════════════════ */

const LABEL = 'font-display text-[18px] font-semibold tracking-[0.08em] text-faint';
const BTN =
  'pressable h-11 shrink-0 rounded-full border-2 border-line px-5 text-[19px] font-semibold disabled:shadow-none';
const BTN_MAIN = `${BTN} bg-acid text-on-accent`;
const BTN_GHOST = `${BTN} bg-panel text-paper hover:bg-panel-lift`;
const BTN_OFF = `${BTN} cursor-default bg-panel text-faint`;

/** 輪播左右的圓形按鈕（不能跟 BTN 混用：BTN 的 h-11 會跟 size-14 打架） */
const ROUND = 'pressable grid size-14 shrink-0 place-items-center rounded-full border-2 border-line text-[24px] font-semibold disabled:shadow-none';

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border-2 border-line bg-panel px-3 font-sans text-[20px] font-semibold text-paper shadow-pop-sm">
      {children}
    </kbd>
  );
}

/** 「點這裡」的手指貼紙。純裝飾 */
function PointHere({ label = '點這個' }: { label?: string }) {
  return (
    <span className="float pointer-events-none inline-flex -rotate-3 items-center gap-1 rounded-full border-2 border-line bg-amber-pop px-3 py-1 text-[17px] font-semibold text-paper shadow-pop-sm">
      👆 {label}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
 * NodeInstallDemo — 安裝 Node.js（Mac，用 nvm）
 *
 * 指令一字不差照 nodejs.org/en/download 給 macOS 的那一段（nvm 分頁）：
 *   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
 *   \. "$HOME/.nvm/nvm.sh"        ← 官網註解寫 in lieu of restarting the shell
 *   nvm install 24
 *   node -v   # Should print "v24.21.0".
 *   npm -v    # Should print "11.19.0".
 * nvm 換版時這裡的 NVM_VERSION 要跟著改（2026-10-06 是 v0.40.8，官網與 GitHub release 一致）。
 *
 * 左邊五個步驟，右邊是那一步的示意畫面：第 1 步是 Spotlight，第 2–5 步是
 * 同一個終端機 —— 前面做過的步驟縮成一行留在畫面上，這一步的指令按「執行」才打出來。
 * 每一行指令旁邊都有「複製」，學員拿到簡報連結可以直接複製貼上。
 * ══════════════════════════════════════════════════════════════ */

const NVM_VERSION = 'v0.40.8';

const NODE_STEPS = [
  { title: '打開「終端機」', sub: '⌘ ＋ 空白鍵，搜尋「終端機」' },
  { title: '安裝 nvm', sub: '貼上官網的第一行指令' },
  { title: '讓 nvm 生效', sub: '貼一行，或關掉終端機重開' },
  { title: '用 nvm 裝 Node.js', sub: 'nvm install 24' },
  { title: '確認裝好了', sub: 'node -v、npm -v 看到版本號' },
];

interface NvmCmd {
  step: number;
  note: string;
  cmd: string;
  out: string[];
  /** 做完之後縮成一行時，留下哪一行輸出 */
  keep?: string;
}

const NVM_CMDS: NvmCmd[] = [
  {
    step: 1,
    note: '下載並安裝 nvm',
    cmd: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh | bash`,
    out: [
      "=> Downloading nvm from git to '/Users/you/.nvm'",
      '=> Appending nvm source string to /Users/you/.zshrc',
      '=> Close and reopen your terminal to start using nvm',
    ],
  },
  { step: 2, note: '不重開終端機也可以：貼這行讓 nvm 馬上生效', cmd: '\\. "$HOME/.nvm/nvm.sh"', out: [] },
  {
    step: 3,
    note: '下載並安裝 Node.js 24',
    cmd: 'nvm install 24',
    out: [
      'Downloading and installing node v24.21.0...',
      'Now using node v24.21.0 (npm v11.19.0)',
      'Creating default alias: default -> 24 (-> v24.21.0)',
    ],
    keep: 'Now using node v24.21.0 (npm v11.19.0)',
  },
  { step: 4, note: '看 Node.js 的版本', cmd: 'node -v', out: ['v24.21.0'] },
  { step: 4, note: '看 npm 的版本', cmd: 'npm -v', out: ['11.19.0'] },
];

const STEP_TIPS = [
  '也可以在「應用程式 → 工具程式」裡找到它。',
  '跑完如果出現 command not found：先輸入 touch ~/.zshrc，再貼一次這行。',
  '開頭的 \\. 也要一起貼。不想貼的話，關掉終端機再打開也一樣。',
  '24 是目前的 LTS（長期支援版），下載要等一下下。',
  '數字不一樣沒關係，有出現版本號就代表成功 🎉',
];

export function NodeInstallDemo() {
  const [step, setStep] = useState(0);
  const last = NODE_STEPS.length - 1;

  return (
    <div className="grid h-[800px] w-full max-w-[1820px] grid-cols-[560px_minmax(0,1fr)] gap-8">
      {/* 左：Node.js 與 nvm 是什麼 ＋ 五個步驟 */}
      <div className="flex min-h-0 flex-col gap-3 pr-1.5 pb-1.5">
        <div className="flex shrink-0 items-center gap-5 rounded-3xl border-3 border-line bg-amber-pop px-6 py-4 shadow-pop-sm">
          <Asset id="node-install" size={104} />
          <div className="flex min-w-0 flex-col gap-1.5 text-[18px] leading-snug text-paper">
            <p>
              <b className="font-display text-[22px]">Node.js</b>：讓電腦跑得動 Vite、Wrangler 這些工具的「引擎」。
            </p>
            <p>
              <b className="font-display text-[22px]">nvm</b>：幫你安裝、切換 Node.js 的小管家。官網給 Mac 的就是這個方法。
            </p>
          </div>
        </div>

        {NODE_STEPS.map((item, index) => {
          const on = index === step;
          const done = index < step;
          return (
            <button
              key={item.title}
              type="button"
              aria-pressed={on}
              onClick={() => setStep(index)}
              className={`flex min-h-0 flex-1 items-center gap-4 rounded-2xl border-3 px-5 text-left transition-[background-color,border-color,box-shadow] duration-200 ${
                on
                  ? 'border-line bg-acid-pop shadow-pop-sm'
                  : done
                    ? 'border-line bg-panel'
                    : 'border-line-soft bg-panel hover:border-line'
              }`}
            >
              <HexBadge
                size={42}
                stroke={2.5}
                shadow={on}
                fillClass={on || done ? 'bg-acid' : 'bg-panel'}
                textClass={on || done ? 'text-on-accent' : 'text-faint'}
              >
                <span className="font-display text-[19px] font-semibold">{done ? '✓' : index + 1}</span>
              </HexBadge>
              <span className="flex min-w-0 flex-col">
                <span className={`font-display text-[25px] font-semibold ${on || done ? 'text-paper' : 'text-muted'}`}>
                  {item.title}
                </span>
                <span className={`font-mono text-[17px] ${on ? 'text-paper' : 'text-muted'}`}>{item.sub}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* 右：這一步的示意畫面 */}
      <div className="flex min-h-0 flex-col gap-4">
        <div className="bg-dots flex min-h-0 flex-1 items-center justify-center rounded-3xl border-3 border-line px-10 py-7 shadow-pop-sm">
          <div key={step} className="slide-enter flex w-full max-w-[1080px] flex-col items-center gap-5">
            {step === 0 ? <SpotlightMock /> : <NvmTerminal step={step} />}
            <p className="w-full max-w-[1060px] rounded-2xl border-2 border-line bg-amber-pop px-5 py-2.5 text-[19px] font-semibold text-paper">
              💡 {STEP_TIPS[step]}
            </p>
          </div>
        </div>
        <div className="flex h-11 shrink-0 items-center justify-between">
          <span className="text-[19px] text-muted">指令照 nodejs.org 官網給 macOS 的版本；終端機畫面是示意</span>
          <div className="flex gap-3">
            <button type="button" disabled={step === 0} onClick={() => setStep((v) => v - 1)} className={step === 0 ? BTN_OFF : BTN_GHOST}>
              上一步
            </button>
            <button type="button" disabled={step === last} onClick={() => setStep((v) => v + 1)} className={step === last ? BTN_OFF : BTN_MAIN}>
              下一步
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 一行要貼的指令 ＋ 複製按鈕 */
function CommandRow({ item }: { item: NvmCmd }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [copied]);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[17px] font-semibold text-muted">{item.note}</span>
      <div className="flex items-center gap-3">
        <code className="min-w-0 flex-1 rounded-xl border-2 border-line bg-panel px-4 py-2 font-mono text-[18px] leading-snug break-all text-paper [font-variant-ligatures:none]">
          {item.cmd}
        </code>
        <button
          type="button"
          onClick={() => {
            void copyText(item.cmd).then((ok) => setCopied(ok));
          }}
          className={`${BTN} ${copied ? 'bg-teal text-on-accent' : 'bg-panel text-paper hover:bg-panel-lift'}`}
        >
          {copied ? '✓ 已複製' : '📋 複製'}
        </button>
      </div>
    </div>
  );
}

function NvmTerminal({ step }: { step: number }) {
  const current = NVM_CMDS.filter((item) => item.step === step);
  const history = NVM_CMDS.filter((item) => item.step < step);
  const [ran, setRan] = useState(0);
  const [typing, setTyping] = useState('');
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearInterval(timer.current);
    },
    [],
  );

  const done = ran >= current.length;

  const run = () => {
    if (done || timer.current) return;
    const target = current[ran].cmd;
    const chunk = Math.max(1, Math.ceil(target.length / 18));
    let index = 0;
    timer.current = window.setInterval(() => {
      index = Math.min(target.length, index + chunk);
      setTyping(target.slice(0, index));
      if (index >= target.length) {
        if (timer.current) window.clearInterval(timer.current);
        timer.current = null;
        window.setTimeout(() => {
          setTyping('');
          setRan((value) => value + 1);
        }, 300);
      }
    }, 45);
  };

  return (
    <>
      <div className="flex w-full max-w-[1060px] flex-col gap-2.5">
        {current.map((item) => (
          <CommandRow key={item.cmd} item={item} />
        ))}
      </div>

      <div className="w-full max-w-[1060px] overflow-hidden rounded-2xl border-3 border-line shadow-pop">
        <div className="flex h-11 items-center gap-2.5 border-b-3 border-line bg-ink-soft px-5">
          <span className="size-3.5 rounded-full border-2 border-line bg-acid-pop" />
          <span className="size-3.5 rounded-full border-2 border-line bg-amber-pop" />
          <span className="size-3.5 rounded-full border-2 border-line bg-teal-pop" />
          <span className="ml-3 font-mono text-[17px] text-muted">終端機 — zsh</span>
          <span className="ml-auto flex items-center gap-3">
            {!done && (
              <button type="button" onClick={run} className={`${BTN} h-8 bg-acid px-4 text-[16px] text-on-accent`}>
                ▶ 執行 {current[ran].cmd.length > 16 ? '這一行' : current[ran].cmd}
              </button>
            )}
            {ran > 0 && (
              <button
                type="button"
                onClick={() => {
                  setRan(0);
                  setTyping('');
                }}
                className={`${BTN} h-8 bg-panel px-4 text-[16px] text-paper`}
              >
                重來
              </button>
            )}
          </span>
        </div>
        {/* 墨紫底：白字 15.8:1、pop 色字 ≥10:1 */}
        <div className="flex min-h-[220px] flex-col gap-1 bg-line px-6 py-5 font-mono text-[18px] leading-[1.5] break-all text-on-accent [font-variant-ligatures:none]">
          {history.map((item) => (
            <div key={item.cmd} className="opacity-100">
              <p>
                <span className="text-teal-pop">~ %</span> {item.cmd}
              </p>
              {(item.keep ?? item.out.at(-1)) && <p className="text-amber-pop">{item.keep ?? item.out.at(-1)}</p>}
            </div>
          ))}
          {current.slice(0, ran).map((item) => (
            <div key={item.cmd}>
              <p>
                <span className="text-teal-pop">~ %</span> {item.cmd}
              </p>
              {item.out.map((line) => (
                <p key={line} className="text-amber-pop">
                  {line}
                </p>
              ))}
            </div>
          ))}
          {!done && (
            <p>
              <span className="text-teal-pop">~ %</span> {typing}
              <span className="ml-0.5 inline-block h-5 w-2.5 translate-y-1 animate-pulse bg-on-accent" />
            </p>
          )}
        </div>
      </div>
    </>
  );
}

function SpotlightMock() {
  return (
    <>
      <div className="flex items-center gap-3 text-[22px] text-paper">
        <span>同時按</span>
        <Kbd>⌘ command</Kbd>
        <span>＋</span>
        <Kbd>空白鍵</Kbd>
        <span>，打「終端機」或 terminal</span>
      </div>
      <div className="w-full max-w-[820px] overflow-hidden rounded-[28px] border-3 border-line bg-panel shadow-pop">
        <div className="flex h-[76px] items-center gap-4 border-b-2 border-line-soft px-7">
          <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <span className="text-[30px] text-paper">終端機</span>
          <span className="h-8 w-0.5 animate-pulse bg-paper" />
        </div>
        <div className="flex items-center gap-4 bg-acid-pop px-7 py-4">
          <span className="grid size-12 place-items-center rounded-xl border-2 border-line bg-line font-mono text-[20px] font-bold text-on-accent">
            &gt;_
          </span>
          <span className="text-[24px] font-semibold text-paper">終端機.app</span>
          <span className="ml-auto text-[18px] text-paper">按 Enter 打開</span>
        </div>
      </div>
      <p className="text-[19px] text-muted">也可以在「應用程式 → 工具程式」裡找到它</p>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
 * PromptGeneratorDemo — 請 AI 建構一個網站
 *
 * 只問一題「想做什麼」，其他六條需求寫死在提示詞裡（左邊列成上鎖的貼紙）。
 * 畫面上看到的字 ＝ 複製出去的字。改到開頭那一行時會亮一下。
 * ══════════════════════════════════════════════════════════════ */

const WHAT_EXAMPLES = ['🍜 午餐吃什麼轉盤', '📋 新人報到清單', '🎉 尾牙倒數計時', '☕ 飲料點單小幫手'];
const WHAT_MAX = 24;

const FIXED: { tag: string; line: string }[] = [
  { tag: 'Vue 3 ＋ Vite', line: '使用 Vite 建立 Vue 3 專案。' },
  {
    tag: '純前端，不用 D1、R2',
    line: '只做前端：不使用 Cloudflare D1、R2，也不要寫後端；需要記住的資料先存在瀏覽器（localStorage）。',
  },
  {
    tag: '加上 Wrangler 設定',
    line: '加上 Wrangler 設定檔（wrangler.jsonc），讓 npm run build 產生的 dist 資料夾可以部署成 Cloudflare 的靜態網站。',
  },
  { tag: '先在我的電腦預覽', line: '做好後，先教我用 npm run dev 在自己的電腦上預覽。' },
  {
    tag: '我自己手動部署',
    line: '不要幫我部署。我會自己到 Cloudflare 後台手動部署，最後告訴我「組建命令」和「部署命令」要填什麼。',
  },
  { tag: '推到我的 GitHub', line: '完成後，幫我把專案推到我的 GitHub（建立一個新的 repository）。' },
];

function cleanWhat(value: string) {
  return value
    .replace(/^[\p{Extended_Pictographic}️\s]+/u, '')
    .trim()
    .replace(/[。．.！!？?，,、；;：:\s]+$/u, '');
}

function buildPrompt(what: string) {
  const topic = cleanWhat(what);
  const first = topic
    ? `我想做一個給公司同事用的小網站：${topic}。`
    : '我想做一個給公司同事用的小網站，但還沒想好要做什麼，請先給我三個點子讓我選。';
  return { first, rules: FIXED.map((item) => item.line), last: '開始之前，有不清楚的地方先問我，一次只問一題。' };
}

function toPlainText(prompt: ReturnType<typeof buildPrompt>) {
  return [prompt.first, '', '技術要求：', ...prompt.rules.map((rule, i) => `${i + 1}. ${rule}`), '', prompt.last].join('\n');
}

type CopyStatus = 'idle' | 'copied' | 'failed';

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* 往下走退路 */
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export function PromptGeneratorDemo() {
  const [what, setWhat] = useState('');
  const [flash, setFlash] = useState(0);
  const [status, setStatus] = useState<CopyStatus>('idle');
  const prompt = buildPrompt(what);

  useEffect(() => {
    if (status === 'idle') return;
    const id = window.setTimeout(() => setStatus('idle'), 2400);
    return () => window.clearTimeout(id);
  }, [status]);

  useEffect(() => {
    if (flash === 0) return;
    const id = window.setTimeout(() => setFlash(0), 900);
    return () => window.clearTimeout(id);
  }, [flash]);

  const change = (value: string) => {
    setWhat(value.slice(0, WHAT_MAX));
    setFlash((v) => v + 1);
  };

  return (
    <div className="grid h-[800px] w-full max-w-[1820px] grid-cols-[760px_minmax(0,1fr)] gap-8">
      {/* 左：只問一題 */}
      <section className="flex min-h-0 flex-col gap-6 rounded-3xl border-3 border-line bg-panel px-8 py-7 shadow-pop-sm">
        <div className="flex items-center gap-4">
          <Asset id="codex-mode" size={92} />
          <div>
            <p className="font-display text-[30px] font-semibold text-paper">你只要回答一題</p>
            <p className="text-[19px] text-muted">其他的技術需求，已經幫你寫進提示詞了</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-3 text-[24px] font-semibold text-paper">
            <HexBadge size={36} stroke={2.5} fillClass={cleanWhat(what) ? 'bg-acid' : 'bg-panel'} textClass={cleanWhat(what) ? 'text-on-accent' : 'text-faint'}>
              <span className="font-display text-[17px] font-semibold">1</span>
            </HexBadge>
            想做什麼？用一句話說
          </p>
          <input
            type="text"
            value={what}
            maxLength={WHAT_MAX + 4}
            onChange={(event) => change(event.target.value)}
            placeholder="例如：午餐吃什麼轉盤"
            aria-label="想做什麼網站"
            className="h-14 rounded-2xl border-3 border-line bg-panel px-5 text-[24px] text-paper placeholder:text-muted focus:bg-amber-pop focus:outline-none"
          />
          <div className="flex flex-wrap gap-2.5">
            {WHAT_EXAMPLES.map((example) => {
              const on = what === example;
              return (
                <button
                  key={example}
                  type="button"
                  aria-pressed={on}
                  onClick={() => change(on ? '' : example)}
                  className={`pressable h-11 rounded-full border-2 border-line px-4 text-[19px] font-semibold ${
                    on ? 'bg-acid-pop text-paper' : 'bg-panel text-paper hover:bg-panel-lift'
                  }`}
                >
                  {example}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-2xl border-2 border-dashed border-line bg-ink-soft px-5 py-4">
          <span className={LABEL}>🔒 已經幫你寫好的需求</span>
          <div className="grid grid-cols-2 gap-2.5">
            {FIXED.map((item) => (
              <span key={item.tag} className="flex h-12 items-center gap-2 rounded-xl border-2 border-line bg-panel px-3 text-[18px] font-semibold text-paper">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-teal text-[14px] text-on-accent">✓</span>
                {item.tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 右：產生的提示詞 */}
      <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl border-3 border-line shadow-pop-sm">
        <div className="flex h-[60px] shrink-0 items-center justify-between border-b-3 border-line bg-amber-pop px-7">
          <span className="font-display text-[20px] font-semibold text-paper">產生的提示詞</span>
          <span className="text-[18px] text-paper">貼給 ChatGPT 桌面版的 Codex</span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-1.5 bg-panel px-7 py-6 text-[21px] leading-[1.55] text-paper">
          <p
            className={`rounded-lg border-l-[6px] px-3 font-semibold transition-colors ${
              flash ? 'border-l-acid bg-acid-pop duration-0' : 'border-l-transparent duration-700'
            }`}
          >
            {prompt.first}
          </p>
          <p className="mt-3 px-3 text-muted">技術要求：</p>
          <ol className="flex flex-col gap-1.5">
            {prompt.rules.map((rule, index) => (
              <li key={rule} className="flex gap-2 px-3">
                <span className="w-7 shrink-0 font-mono text-faint">{index + 1}.</span>
                <span>{rule}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 px-3">{prompt.last}</p>
        </div>

        <div className="flex h-[80px] shrink-0 items-center justify-between gap-5 border-t-3 border-line bg-ink-soft pr-5 pl-7">
          <p className="text-[19px] text-muted">
            {status === 'failed' ? '瀏覽器擋下了複製，請手動選取上面的文字' : 'AI 會先問你幾個問題，照實回答就好'}
          </p>
          <button
            type="button"
            onClick={() => {
              void copyText(toPlainText(prompt)).then((ok) => setStatus(ok ? 'copied' : 'failed'));
            }}
            className={`pressable flex h-[52px] min-w-[210px] items-center justify-center gap-2 rounded-full border-2 border-line px-6 text-[21px] font-semibold text-on-accent ${
              status === 'copied' ? 'bg-teal' : 'bg-acid'
            }`}
          >
            {status === 'copied' ? '✓ 已複製' : '📋 複製提示詞'}
          </button>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * DeployCarouselDemo — 丟上 Cloudflare
 *
 * Notion 附的六張步驟圖。左邊是大圖（虛線框標出要點哪裡），下面一排縮圖；
 * 右邊是這一步要做什麼。方向鍵留給翻投影片，所以輪播只用按鈕與縮圖。
 * 標記框的座標是以圖片本身為 100% 的百分比，量自原始截圖。
 * ══════════════════════════════════════════════════════════════ */

interface Shot {
  src: string;
  title: string;
  text: string;
  tip?: string;
  /** 標記框：left / top / width / height，單位 % */
  mark?: [number, number, number, number];
  markLabel?: string;
  /** 小截圖不要放大超過這個寬度，不然會糊 */
  maxW?: number;
}

const SHOTS: Shot[] = [
  {
    src: deploy1,
    title: '建立應用程式',
    text: '登入 Cloudflare，左邊選單點「Workers 和 Pages」，再按右上角的「建立應用程式」。',
    tip: 'Pages 和 Worker 是同一個入口',
    mark: [88.6, 2.2, 10.4, 9.8],
    markLabel: '點這裡',
  },
  {
    src: deploy2,
    title: '授權 GitHub',
    text: '選「Continue with GitHub」。第一次會請你允許 Cloudflare 讀取你的 GitHub。',
    tip: '剛剛 AI 已經幫你把專案推上 GitHub 了',
    mark: [20.8, 28.2, 26.4, 13.2],
    markLabel: '選這個',
  },
  {
    src: deploy3,
    title: '選擇儲存庫及組建方式',
    text: '選你的專案，「組建命令」填 npm run build，部署命令維持 npx wrangler deploy，按「部署」。',
    tip: '組建命令：npm run build',
    mark: [21.2, 46.4, 55.6, 7.4],
    markLabel: '填 npm run build',
  },
  {
    src: deploy4,
    title: '開始自動化部署',
    text: '它會自己跑：初始化 → 複製 → 安裝 → 部署。全部打勾就完成了，大約一兩分鐘。',
    tip: '這段時間可以去倒杯水 ☕',
    mark: [0.4, 66.8, 99.2, 8.4],
    markLabel: '等它全部打勾',
  },
  {
    src: deploy5,
    title: '切換到「網域」',
    text: '上方切到「網域」，「生產」那一列就是你的網址：xxx.workers.dev。',
    tip: '這個網址可以直接分享給同事',
    mark: [3.6, 49.5, 92.8, 22.5],
    markLabel: '這就是你的網址',
  },
  {
    src: deploy6,
    title: '按「造訪」，打開你的網站',
    text: '右上角的「造訪」會直接打開網站。旁邊的「編輯代碼」可以在線上看程式，今天先不用碰。',
    tip: '🎉 恭喜，你的網站上線了！',
    mark: [53.5, 15.5, 41.8, 60],
    markLabel: '造訪',
    maxW: 920,
  },
];

export function DeployCarouselDemo() {
  const [index, setIndex] = useState(0);
  const shot = SHOTS[index];
  const atStart = index === 0;
  const atEnd = index === SHOTS.length - 1;

  return (
    <div className="grid h-[800px] w-full max-w-[1820px] grid-cols-[minmax(0,1fr)_460px] gap-8">
      {/* 左：大圖 ＋ 縮圖 */}
      <div className="flex min-h-0 flex-col gap-4">
        <div className="relative flex min-h-0 flex-1 items-center justify-center rounded-3xl border-3 border-line bg-ink-soft px-6 pt-4 pb-6 shadow-pop-sm">
          <div key={index} className="slide-enter relative inline-flex max-h-full max-w-full">
            <img
              src={shot.src}
              alt={`第 ${index + 1} 步：${shot.title}`}
              className="block max-h-[580px] w-auto max-w-full rounded-xl border-2 border-line bg-panel object-contain"
              style={shot.maxW ? { width: shot.maxW } : undefined}
              draggable={false}
            />
            {shot.mark && (
              <span
                className="pointer-events-none absolute rounded-xl border-[4px] border-dashed border-acid"
                style={{
                  left: `${shot.mark[0]}%`,
                  top: `${shot.mark[1]}%`,
                  width: `${shot.mark[2]}%`,
                  height: `${shot.mark[3]}%`,
                }}
              >
                <span className="absolute top-full right-0 mt-2 whitespace-nowrap">
                  <PointHere label={shot.markLabel} />
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="flex h-[96px] shrink-0 items-center gap-3">
          <button
            type="button"
            disabled={atStart}
            onClick={() => setIndex((v) => v - 1)}
            aria-label="上一張"
            className={`${ROUND} ${atStart ? 'cursor-default bg-panel text-faint' : 'bg-panel text-paper hover:bg-panel-lift'}`}
          >
            ←
          </button>
          <div className="grid min-w-0 flex-1 grid-cols-6 gap-3">
            {SHOTS.map((item, i) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`第 ${i + 1} 步：${item.title}`}
                aria-current={i === index}
                className={`relative h-[84px] overflow-hidden rounded-xl border-3 bg-panel transition-[border-color,box-shadow,transform] duration-200 ${
                  i === index ? '-translate-y-1 border-line shadow-pop-sm' : 'border-line-soft hover:border-line'
                }`}
              >
                <img src={item.src} alt="" className="size-full object-cover object-top" draggable={false} />
                <span
                  className={`absolute top-1.5 left-1.5 grid size-7 place-items-center rounded-full border-2 border-line font-display text-[15px] font-semibold ${
                    i === index ? 'bg-acid text-on-accent' : 'bg-panel text-paper'
                  }`}
                >
                  {i + 1}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={atEnd}
            onClick={() => setIndex((v) => v + 1)}
            aria-label="下一張"
            className={`${ROUND} ${atEnd ? 'cursor-default bg-panel text-faint' : 'bg-acid text-on-accent'}`}
          >
            →
          </button>
        </div>
      </div>

      {/* 右：這一步要做什麼 */}
      <div className="flex min-h-0 flex-col gap-5 pr-1.5 pb-1.5">
        <div key={index} className="slide-enter flex flex-col gap-5 rounded-3xl border-3 border-line bg-panel px-7 py-7 shadow-pop">
          <div className="flex items-center gap-4">
            <HexBadge size={64} fillClass="bg-acid">
              <span className="font-display text-[28px] font-semibold">{index + 1}</span>
            </HexBadge>
            <span className={LABEL}>
              第 {index + 1} 步 / 共 {SHOTS.length} 步
            </span>
          </div>
          <p className="font-display text-[34px] leading-tight font-semibold text-paper">{shot.title}</p>
          <p className="text-[22px] leading-relaxed text-paper">{shot.text}</p>
          {shot.tip && (
            <p className="rounded-2xl border-2 border-line bg-amber-pop px-5 py-3 text-[20px] font-semibold text-paper">
              💡 {shot.tip}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center gap-4 rounded-3xl border-3 border-dashed border-line bg-ink-soft px-6 py-5">
          <Asset id="rocket-launch" size={96} />
          <p className="text-[19px] leading-relaxed text-paper">
            之後改了程式再推上 GitHub，Cloudflare 會<b>自動重新部署</b>，不用再按一次。
          </p>
        </div>
      </div>
    </div>
  );
}
