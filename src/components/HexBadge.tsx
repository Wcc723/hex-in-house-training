import type { ReactNode } from 'react';

interface HexBadgeProps {
  /** 高度（舞台 px），寬度自動是 1.15 倍，接近正六邊形 */
  size: number;
  /** 內層填色的 Tailwind class，例如 `bg-acid`、`bg-amber-pop` */
  fillClass: string;
  /** 文字色 class。實心強調色配 `text-on-accent`，pop 色配 `text-paper` */
  textClass?: string;
  /** 描邊粗細（px） */
  stroke?: number;
  /** 跟著六角形走的硬邊陰影 */
  shadow?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * 六角形徽章 —— 這套主題的招牌形狀（呼應六角學院的 logo）。
 *
 * 兩層 clip-path 疊出描邊：外層整塊 `bg-line`，內層內縮一圈放填色與文字。
 * 不用 SVG 的理由寫在 `index.css` 的 `clip-hex`：文字的祖先要有真的
 * background-color，稽核腳本才量得到正確的對比。
 */
export function HexBadge({
  size,
  fillClass,
  textClass = 'text-on-accent',
  stroke = 3,
  shadow = true,
  className = '',
  children,
}: HexBadgeProps) {
  const width = Math.round(size * 1.15);

  return (
    <span
      className={`inline-grid shrink-0 ${shadow ? 'hex-shadow' : ''} ${className}`}
      style={{ width, height: size }}
    >
      <span className="clip-hex col-start-1 row-start-1 bg-line" />
      <span
        className={`clip-hex col-start-1 row-start-1 grid place-items-center ${fillClass} ${textClass}`}
        /* 斜邊比水平邊薄，左右多內縮一點，描邊看起來才一樣粗 */
        style={{ margin: `${stroke}px ${Math.round(stroke * 1.4)}px` }}
      >
        {children}
      </span>
    </span>
  );
}
