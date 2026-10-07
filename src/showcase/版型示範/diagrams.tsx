/**
 * 圖解撰寫慣例（Playground 主題）
 *
 * - 不畫背景矩形，讓面板的 bg-panel 直接透出來
 * - 顏色一律用 CSS 變數：fill="var(--color-teal-pop)"，換色票時圖解會跟著換
 * - 節點是「貼紙」：pop 填色 + 3px 墨紫描邊 + 往右下偏 6px 的實心陰影
 * - 節點內的字一律 paper / muted，強調色只用在箭頭與箭頭上的標籤
 * - viewBox 取 16:9 附近的比例，實際大小交給版型縮放
 * - 文字最小 16（舞台座標），對應直播用簡報「不小於 12px」的規範
 */

const NODE_WIDTH = 210;
const NODE_HEIGHT = 132;
const SHADOW = 6;

function Node({
  x,
  y,
  label,
  sub,
  fill,
}: {
  x: number;
  y: number;
  label: string;
  sub: string;
  /** pop 填色，例如 var(--color-blue-pop) */
  fill: string;
}) {
  return (
    <g>
      {/* 硬邊陰影：同尺寸的實心矩形往右下偏移 */}
      <rect
        x={x + SHADOW}
        y={y + SHADOW}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={22}
        fill="var(--color-line)"
      />
      <rect
        x={x}
        y={y}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={22}
        fill={fill}
        stroke="var(--color-line)"
        strokeWidth={3}
      />
      <text
        x={x + NODE_WIDTH / 2}
        y={y + 58}
        textAnchor="middle"
        fill="var(--color-paper)"
        fontSize={28}
        fontWeight={600}
        fontFamily="var(--font-display)"
      >
        {label}
      </text>
      <text
        x={x + NODE_WIDTH / 2}
        y={y + 94}
        textAnchor="middle"
        fill="var(--color-muted)"
        fontSize={19}
      >
        {sub}
      </text>
    </g>
  );
}

function Arrow({
  from,
  to,
  y,
  label,
  color,
  dashed = false,
}: {
  from: number;
  to: number;
  y: number;
  label: string;
  color: string;
  dashed?: boolean;
}) {
  const markerId = `arrow-${color.replace(/[^a-z]/g, '')}-${dashed ? 'd' : 's'}`;

  return (
    <g>
      <defs>
        <marker
          id={markerId}
          markerWidth={6}
          markerHeight={6}
          refX={4.5}
          refY={3}
          orient="auto"
        >
          <path d="M0.5,0.5 L5,3 L0.5,5.5 z" fill={color} strokeLinejoin="round" />
        </marker>
      </defs>
      <line
        x1={from}
        y1={y}
        x2={to}
        y2={y}
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={dashed ? '2 10' : undefined}
        markerEnd={`url(#${markerId})`}
      />
      <text
        x={(from + to) / 2}
        y={y - 16}
        textAnchor="middle"
        fill={color}
        fontSize={19}
        fontWeight={700}
      >
        {label}
      </text>
    </g>
  );
}

/** 前端 → API → 資料庫的請求／回應流程 */
export function RequestFlowDiagram() {
  return (
    <svg width={900} height={480} viewBox="0 0 900 480" role="img">
      <title>前端、API 伺服器與資料庫之間的請求與回應流程</title>

      <Node
        x={20}
        y={100}
        label="前端網頁"
        sub="Browser"
        fill="var(--color-blue-pop)"
      />
      <Node
        x={345}
        y={100}
        label="API 伺服器"
        sub="Server"
        fill="var(--color-acid-pop)"
      />
      <Node
        x={670}
        y={100}
        label="資料庫"
        sub="Database"
        fill="var(--color-teal-pop)"
      />

      <Arrow
        from={242}
        to={337}
        y={140}
        label="request"
        color="var(--color-coral)"
      />
      <Arrow
        from={567}
        to={662}
        y={140}
        label="query"
        color="var(--color-coral)"
      />
      <Arrow
        from={662}
        to={567}
        y={200}
        label="rows"
        color="var(--color-teal)"
        dashed
      />
      <Arrow
        from={337}
        to={242}
        y={200}
        label="response"
        color="var(--color-teal)"
        dashed
      />

      <rect
        x={20}
        y={310}
        width={866}
        height={130}
        rx={22}
        fill="var(--color-ink-soft)"
        stroke="var(--color-line)"
        strokeWidth={3}
        strokeDasharray="10 8"
      />
      <text
        x={50}
        y={352}
        fill="var(--color-paper)"
        fontSize={23}
        fontWeight={600}
        fontFamily="var(--font-display)"
      >
        圖解用色慣例
      </text>
      <text x={50} y={390} fill="var(--color-muted)" fontSize={19}>
        節點是 pop 填色的貼紙，去程用 coral 實線、回程用 teal 圓點虛線。
      </text>
      <text x={50} y={420} fill="var(--color-faint)" fontSize={17}>
        全部寫成 var(--color-*)，之後調整色票時所有圖解會同步更新。
      </text>
    </svg>
  );
}
