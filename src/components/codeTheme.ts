import type { PrismTheme } from 'prism-react-renderer';

/**
 * 對映 theme.css 色票的語法主題（Playground）。
 *
 * ⚠ 這裡的值是全站少數不得不寫死 hex 的地方：prism-react-renderer 產出的是
 *   inline style，CSS 變數到不了，所以 `var(--color-*)` 在這裡無效。
 *   改色票時這個檔案要手動跟著改，右邊註解標的是對應的 token。
 *
 * 對比基準有兩個：程式碼井 --color-ink-soft (#fdefcf)，以及高亮列
 * （amber-pop 45% 疊在 ink-soft 上 ≈ #fee8a0）。右邊的數字是「井 / 高亮列」，
 * 最緊的一支是 acid 的 4.70，所以高亮列的透明度不要再往上調。
 */
export const codeTheme: PrismTheme = {
  plain: {
    color: '#231f3a', // --color-paper  13.87 / 12.99
    backgroundColor: 'transparent', // 實際落在 bg-ink-soft 的程式碼井上
  },
  styles: [
    // 註解是教學時最常唸的內容，不要壓太淡
    {
      types: ['comment', 'prolog', 'cdata', 'doctype'],
      style: { color: '#5a5474', fontStyle: 'italic' }, // --color-faint  6.23 / 5.84
    },
    {
      types: ['punctuation', 'operator'],
      style: { color: '#4a4463' }, // --color-muted  8.02 / 7.51
    },
    {
      // 關鍵字用主強調的桃紅：貼紙風本來就熱鬧，關鍵字最該被看見
      types: ['tag', 'keyword', 'deleted', 'important'],
      style: { color: '#c21d68' }, // --color-acid  5.02 / 4.70
    },
    {
      types: ['string', 'attr-value', 'char', 'inserted', 'regex'],
      style: { color: '#26732a' }, // --color-lime  5.16 / 4.84
    },
    {
      types: ['function', 'function-variable'],
      style: { color: '#2f54d9' }, // --color-blue  5.43 / 5.09
    },
    {
      types: ['number', 'boolean', 'constant', 'symbol'],
      style: { color: '#b23d0c' }, // --color-coral  5.17 / 4.84
    },
    {
      types: ['attr-name', 'property', 'variable'],
      style: { color: '#8f5300' }, // --color-amber  5.41 / 5.07
    },
    {
      types: ['class-name', 'maybe-class-name'],
      style: { color: '#7a3fe0' }, // --color-violet  5.10 / 4.78
    },
    {
      types: ['selector', 'builtin', 'atrule'],
      style: { color: '#1567b3' }, // --color-sky  5.09 / 4.77
    },
  ],
};
