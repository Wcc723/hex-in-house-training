import { Highlight } from 'prism-react-renderer';
import type { CodeBlock as CodeBlockType } from '../types/slide';
import { codeTheme } from './codeTheme';

interface CodeBlockProps {
  codeBlock: CodeBlockType;
  /** 隱藏檔名（多分頁時分頁標籤已經顯示檔名），視窗列的三顆圓點仍然保留 */
  hideFilename?: boolean;
}

/** 行數多的時候自動縮字，讓整段程式碼不用捲動就看得完 */
function density(lineCount: number) {
  if (lineCount > 22) return 'text-[17px] leading-[1.6]';
  if (lineCount > 16) return 'text-[18px] leading-[1.65]';
  return 'text-[20px] leading-[1.75]';
}

/** 視窗列的三顆圓點，純裝飾 */
const windowDots = ['bg-acid-pop', 'bg-amber-pop', 'bg-teal-pop'];

export function CodeBlock({ codeBlock, hideFilename = false }: CodeBlockProps) {
  const { language, code, filename, highlightLines = [] } = codeBlock;
  const sizeClass = density(code.trim().split('\n').length);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border-3 border-line bg-ink-soft shadow-pop">
      <div className="flex shrink-0 items-center gap-3 border-b-3 border-line bg-panel px-6 py-3">
        <span className="flex gap-2" aria-hidden>
          {windowDots.map((dot) => (
            <span key={dot} className={`size-4 rounded-full border-2 border-line ${dot}`} />
          ))}
        </span>
        {filename && !hideFilename && (
          <span className="ml-2 font-mono text-[18px] font-semibold text-muted">
            {filename}
          </span>
        )}
      </div>

      <Highlight theme={codeTheme} code={code.trim()} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} min-h-0 flex-1 overflow-auto py-5 ${sizeClass}`}
            style={style}
          >
            {tokens.map((line, i) => {
              const lineNumber = i + 1;
              const isHighlighted = highlightLines.includes(lineNumber);
              const lineProps = getLineProps({ line });

              return (
                <div
                  key={i}
                  {...lineProps}
                  /*
                   * 高亮列：檸檬黃螢光筆 + 6px 桃紅實心左框。
                   * 填色停在 /45：再高的話 acid 關鍵字會掉到 4.5:1 以下（數字見 codeTheme.ts）。
                   * 投影機會吃掉淡色帶，但吃不掉一條實線，所以左框是必要的第二訊號。
                   */
                  className={`${lineProps.className ?? ''} border-l-[6px] px-6 ${
                    isHighlighted
                      ? 'border-acid bg-amber-pop/45'
                      : 'border-transparent'
                  }`}
                >
                  <span className="mr-5 inline-block w-8 shrink-0 select-none text-right text-[16px] text-faint">
                    {lineNumber}
                  </span>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
