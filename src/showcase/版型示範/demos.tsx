import { useState } from 'react';

/* ────────────────────────────────────────────────────────────
 * 色票總覽：直接從 CSS 變數讀值，theme.css 改了這裡就會跟著改
 * ──────────────────────────────────────────────────────────── */

interface TokenGroup {
  label: string;
  note: string;
  tokens: string[];
}

/** 四欄，每欄由上往下排一到兩組。欄的高度要接近，面板才不會一邊空一邊滿 */
const tokenColumns: TokenGroup[][] = [
  [
    {
      label: '基底',
      note: '紙、面板、描邊',
      tokens: [
        'panel',
        'ink',
        'panel-lift',
        'ink-soft',
        'line',
        'line-soft',
        'letterbox',
      ],
    },
    {
      label: '前景',
      note: '文字三層 + 挖空字',
      tokens: ['paper', 'muted', 'faint', 'on-accent'],
    },
  ],
  [
    {
      label: '強調',
      note: '一頁最多兩個',
      tokens: ['acid', 'coral', 'teal', 'blue'],
    },
    {
      label: '延伸',
      note: '圖解需要更多色時',
      tokens: ['lime', 'sky', 'violet', 'amber', 'danger'],
    },
  ],
  [
    {
      label: 'pop 填色',
      note: '只當底色，上面壓 paper',
      tokens: [
        'acid-pop',
        'coral-pop',
        'teal-pop',
        'blue-pop',
        'lime-pop',
        'sky-pop',
        'violet-pop',
        'amber-pop',
      ],
    },
  ],
  [
    {
      label: '語意',
      note: '強調色的別名',
      tokens: ['ok', 'warn', 'error', 'info'],
    },
    {
      label: '角色',
      note: '前後端圖解共用',
      tokens: ['role-user', 'role-client', 'role-server', 'role-data'],
    },
  ],
];

const allTokens = tokenColumns.flat().flatMap((group) => group.tokens);

/** 從 :root 讀出目前生效的色票值 */
function readTokenValues(): Record<string, string> {
  const computed = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    allTokens.map((token) => [
      token,
      computed.getPropertyValue(`--color-${token}`).trim(),
    ]),
  );
}

export function PaletteDemo() {
  const [values] = useState(readTokenValues);
  const [selected, setSelected] = useState('acid');

  const selectedVar = `var(--color-${selected})`;

  return (
    <div className="flex size-full min-h-0 flex-col gap-5">
      <div className="grid min-h-0 flex-1 grid-cols-4 gap-x-6 overflow-auto">
        {tokenColumns.map((column) => (
          <div key={column[0].label} className="flex flex-col gap-4">
            {column.map((group) => (
              <section key={group.label}>
                <h4 className="font-display text-[20px] font-semibold text-paper">
                  {group.label}
                  <span className="ml-3 text-[15px] font-normal text-faint">
                    {group.note}
                  </span>
                </h4>

                <div className="mt-2 grid gap-1">
                  {group.tokens.map((token) => (
                    <button
                      key={token}
                      type="button"
                      onClick={() => setSelected(token)}
                      className={`flex items-center gap-3 rounded-xl border-2 px-3 py-0.5 text-left transition-colors ${
                        selected === token
                          ? 'border-line bg-amber-pop'
                          : 'border-transparent hover:border-line-soft hover:bg-panel-lift'
                      }`}
                    >
                      <span
                        className="size-5 shrink-0 rounded-full border-2 border-line"
                        style={{ background: `var(--color-${token})` }}
                      />
                      <span className="min-w-0 flex-1 truncate font-mono text-[16px] text-paper">
                        --color-{token}
                      </span>
                      <span className="font-mono text-[15px] text-muted uppercase">
                        {values[token] ?? ''}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ))}
      </div>

      {/* 選取色的兩種用法。文字一律用 paper：強調色壓在自己的淡色上只有 3.4–4.7:1，
          pop 色當文字更只剩 1.3–1.7:1 —— 這正是「顏色只當底、字交給 paper」的例子。 */}
      <div className="flex shrink-0 items-center gap-6 rounded-2xl border-3 border-line bg-ink-soft px-5 py-3">
        <span
          aria-hidden
          className="clip-hex h-12 w-14 shrink-0"
          style={{ background: selectedVar }}
        />
        <p className="min-w-0 flex-1 font-mono text-[17px] text-paper">
          --color-{selected}
          <span className="ml-3 font-sans text-[16px] text-muted">
            點左邊任何一支色票，這裡會換成那支色
          </span>
        </p>
        <div
          className="rounded-xl border-2 border-line px-4 py-1.5 text-[17px] text-paper shadow-pop-sm"
          style={{
            borderLeft: `8px solid ${selectedVar}`,
            background: `color-mix(in srgb, ${selectedVar} 22%, white)`,
          }}
        >
          淡色卡片：22% + 粗框 + 實心左邊
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * 互動範例：示範 demo 版型可以放任何有狀態的 React 元件
 * ──────────────────────────────────────────────────────────── */

const ratios = ['1:1', '3:2', '2:3', '2:1', '1:2'] as const;

export function SplitRatioDemo() {
  const [ratio, setRatio] = useState<(typeof ratios)[number]>('3:2');
  const [left, right] = ratio.split(':');

  return (
    <div className="flex w-full max-w-[900px] flex-col gap-6">
      <div className="flex flex-wrap justify-center gap-3">
        {ratios.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRatio(value)}
            className={`pressable rounded-full border-2 border-line px-5 py-2 font-mono text-[18px] font-semibold ${
              ratio === value
                ? 'bg-acid text-on-accent'
                : 'bg-panel text-paper hover:bg-panel-lift'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <div
        className="grid h-[260px] gap-4"
        style={{ gridTemplateColumns: `${left}fr ${right}fr` }}
      >
        <div className="grid place-items-center rounded-2xl border-3 border-line bg-teal-pop font-display text-[26px] font-semibold text-paper shadow-pop-sm transition-all">
          left
        </div>
        <div className="grid place-items-center rounded-2xl border-3 border-line bg-sky-pop font-display text-[26px] font-semibold text-paper shadow-pop-sm transition-all">
          right
        </div>
      </div>

      <p className="text-center font-mono text-[17px] text-muted">
        {`{ kind: 'split', ratio: '${ratio}', left, right }`}
      </p>
    </div>
  );
}
