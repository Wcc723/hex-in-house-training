import type { Step } from '../../types/slide';
import coverImage from './images/cover.webp';
import { DeployDiagram } from './diagrams-web';
import {
  DatabaseDemo,
  FrontendDemo,
  LoadDemo,
  RolesDemo,
  ScaleArchDemo,
  ServerDemo,
  WhyBackendDemo,
} from './demos-web';
import {
  AgendaDemo,
  D1Tab,
  DomainDemo,
  OverviewDemo,
  PagesTab,
  R2Tab,
  TodayDemo,
  WorkerTab,
} from './demos-cloudflare';
import {
  DeployCarouselDemo,
  NodeInstallDemo,
  PromptGeneratorDemo,
} from './demos-handson';

export const slideTitle = 'Cloudflare 入門';
export const slideSubtitle = '六角內部教育訓練';

/*
 * 來源：Notion〈內部教育訓練 - Cloudflare〉（課綱），2026-10-06。
 *
 * 三站的節奏（Notion 的三個大段）：
 *   1–2    封面、今天的三件事
 *   3–8    第一站：先認識什麼是前後端
 *          （〈網站是如何運作的 · How Websites Work〉第 02–06 頁）
 *   9–18   第二站：Cloudflare 是什麼、可以做什麼
 *          10–12 是同一篇的第 07–09 頁，後端寫上 Worker、資料庫寫上 D1，
 *          第 09 頁的「商用應用程式」改成「全公司的內部系統」；
 *          13 服務總覽 → 14 網域 → 15–18 Pages／Worker／D1／R2
 *          （四頁是同一個頁籤元件，介面照〈從 0 到 1 的網站開發〉的「D1 與 R2」，
 *          拿掉「沒有備份、沒有保證」那兩段）
 *   19–23  第三站：今天要做的事 → 安裝 Node.js → 請 AI 建網站 → 丟上 Cloudflare
 *   24     重點回顧
 *
 * 學員對開發沒有興趣：用詞白話、每個名詞都配一句「它是幹嘛的」，
 * 畫面上多放貼紙（Codex Image 產的素材庫圖）。
 *
 * 移植頁沿用原本的規格：沒有 description、沒有 caption —— 操作說明都在 demo
 * 自己的控制列裡，三層都寫等於讓台下讀三遍。
 */
export const steps: Step[] = [
  /* ── 開場 ─────────────────────────────────────────────── */

  {
    id: 'cover',
    title: '封面',
    body: {
      kind: 'title',
      kicker: 'Cloudflare 101',
      heading: 'Cloudflare 入門',
      lead: [
        '今天不用會寫程式。我們先搞懂一個網站是怎麼跑起來的，再看看 Cloudflare 幫我們做了哪幾件事。',
        '最後請 AI 幫你做一個小網站，親手把它放上網路 🚀',
      ],
      image: {
        src: coverImage,
        alt: '六角形吉祥物和一朵雲朵小幫手擊掌，中間飄著一個網頁視窗',
      },
    },
  },

  {
    id: 'agenda',
    title: '今天的三件事',
    body: { kind: 'demo', render: AgendaDemo, bare: true },
  },

  /* ── 第一站：前後端 ───────────────────────────────────── */

  {
    id: 'ch-web',
    title: '第一站',
    body: {
      kind: 'title',
      kicker: '第一站',
      heading: '網站是怎麼運作的',
      lead: '先別急著碰 Cloudflare。把「一個網站由哪幾個部分組成」搞清楚，後面才知道每樣東西要放哪裡。',
      assetId: 'frontend-web',
    },
  },
  {
    id: 'load',
    title: '輸入網址之後，發生了什麼事',
    body: { kind: 'demo', render: LoadDemo },
  },
  {
    id: 'roles',
    title: '前端、後端、伺服器、資料庫',
    body: { kind: 'demo', render: RolesDemo },
  },
  {
    id: 'frontend',
    title: '前端是用什麼寫的',
    body: { kind: 'demo', render: FrontendDemo },
  },
  {
    id: 'why-backend',
    title: '為什麼需要後端',
    body: { kind: 'demo', render: WhyBackendDemo },
  },
  {
    id: 'database',
    title: '什麼是資料庫',
    body: { kind: 'demo', render: DatabaseDemo },
  },

  /* ── 第二站：Cloudflare ───────────────────────────────── */

  {
    id: 'ch-cloudflare',
    title: '第二站',
    body: {
      kind: 'title',
      kicker: '第二站',
      heading: 'Cloudflare 是什麼',
      lead: '網站要有地方放才跑得起來。Cloudflare 就是幫你準備這些「地方」的服務 —— 而且大部分都有免費額度。',
      assetId: 'cf-cloud',
    },
  },
  {
    id: 'server',
    title: '伺服器是什麼',
    body: { kind: 'demo', render: ServerDemo },
  },
  {
    id: 'deploy-map',
    title: '部署時，每個部分要放在哪裡',
    body: { kind: 'diagram', render: DeployDiagram },
  },
  {
    id: 'ai-architecture',
    title: '這些觀念如何幫助 AI Coding · 架構',
    body: { kind: 'demo', render: ScaleArchDemo },
  },
  {
    id: 'services',
    title: 'Cloudflare 的服務介紹',
    body: { kind: 'demo', render: OverviewDemo, bare: true },
  },
  {
    id: 'domain',
    title: '網域：買網址的地方',
    body: { kind: 'demo', render: DomainDemo, bare: true },
  },
  {
    id: 'pages',
    title: 'Pages：把靜態網站丟上去',
    body: { kind: 'demo', render: PagesTab, bare: true },
  },
  {
    id: 'worker',
    title: 'Worker：幫你做事',
    body: { kind: 'demo', render: WorkerTab, bare: true },
  },
  {
    id: 'd1',
    title: 'D1：當作資料庫',
    body: { kind: 'demo', render: D1Tab, bare: true },
  },
  {
    id: 'r2',
    title: 'R2：讓你丟圖',
    body: { kind: 'demo', render: R2Tab, bare: true },
  },

  /* ── 第三站：動手做 ───────────────────────────────────── */

  {
    id: 'ch-hands-on',
    title: '第三站',
    body: {
      kind: 'title',
      kicker: '第三站',
      heading: '動手做！',
      lead: [
        '接下來輪到你：裝工具、請 AI 做網站、放上 Cloudflare。',
        '卡住了就舉手，旁邊的同事也可以幫你 🙋',
      ],
      assetId: 'rocket-launch',
    },
  },
  {
    id: 'today',
    title: '今天要做的事',
    body: { kind: 'demo', render: TodayDemo, bare: true },
  },
  {
    id: 'node',
    title: '安裝 Node.js（Mac · nvm）',
    body: { kind: 'demo', render: NodeInstallDemo, bare: true },
  },
  {
    id: 'prompt',
    title: '請 AI 建構一個網站',
    body: { kind: 'demo', render: PromptGeneratorDemo, bare: true },
  },
  {
    id: 'deploy',
    title: '丟上 Cloudflare',
    body: { kind: 'demo', render: DeployCarouselDemo, bare: true },
  },

  /* ── 收尾 ─────────────────────────────────────────────── */

  {
    id: 'recap',
    title: '重點回顧',
    body: {
      kind: 'points',
      heading: '今天帶回家的五件事',
      items: [
        {
          text: '一個網站有四個角色：前端、後端、伺服器、資料庫',
          note: '前端給大家看、後端幫你做事、資料庫把資料留著、伺服器讓它們跑起來',
          accent: 'blue',
        },
        {
          text: '程式碼放著不會自己動，一定要有地方把它跑起來',
          note: '這個「地方」，就是今天 Cloudflare 幫我們準備的',
          accent: 'acid',
        },
        {
          text: 'Pages 放網站、Worker 做事、D1 存資料、R2 放檔案',
          note: '大部分都有免費額度；R2 開通要綁信用卡',
          accent: 'teal',
        },
        {
          text: '網域是門牌，要買；今天先用免費的 workers.dev 網址',
          accent: 'amber',
        },
        {
          text: '跟 AI 講清楚「做多大、放哪裡」，它才知道要用哪幾樣',
          note: '提示詞產生器已經幫你把 Vite、Vue、Wrangler 寫進去了',
          accent: 'violet',
        },
      ],
    },
  },
];
