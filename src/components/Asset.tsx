import { assetUrl, getAsset, type AssetId } from '../assets/manifest';

interface AssetProps {
  id: AssetId;
  /** 邊長（px）。原檔 512px，舞台上 140–380px 都清楚 */
  size?: number;
  /** 覆寫替代文字，預設用素材名稱 */
  alt?: string;
  className?: string;
}

/** 從素材庫取用一張貼紙。透明底、自帶白邊，直接放在任何表面上即可。 */
export function Asset({ id, size = 220, alt, className = '' }: AssetProps) {
  const meta = getAsset(id);

  return (
    <img
      src={assetUrl(id)}
      alt={alt ?? meta.name}
      width={size}
      height={size}
      className={`shrink-0 object-contain select-none ${className}`}
      draggable={false}
    />
  );
}
