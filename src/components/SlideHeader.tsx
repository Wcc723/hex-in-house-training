import { HexBadge } from './HexBadge';
import { MenuButton } from './MenuButton';

interface SlideHeaderProps {
  title: string;
  stepTitle: string;
  currentStep: number;
  totalSteps: number;
}

export function SlideHeader({
  title,
  stepTitle,
  currentStep,
  totalSteps,
}: SlideHeaderProps) {
  return (
    <header className="relative z-10 flex h-[84px] shrink-0 items-center gap-6 border-b-3 border-line bg-panel px-12">
      <MenuButton />

      <div className="flex min-w-0 flex-1 items-center gap-5">
        {/* 簡報名稱做成一張歪歪貼上去的標籤 */}
        <p className="max-w-[520px] shrink-0 -rotate-2 truncate rounded-full border-2 border-line bg-amber-pop px-4 py-1 font-display text-[17px] font-semibold tracking-wide text-paper">
          {title}
        </p>
        <h1 className="min-w-0 truncate font-display text-[30px] leading-tight font-semibold text-paper">
          {stepTitle}
        </h1>
      </div>

      {/* 頁碼：六角形徽章，換頁時彈一下 */}
      <div className="flex shrink-0 items-center gap-3 font-display tabular-nums">
        <HexBadge
          key={currentStep}
          size={54}
          fillClass="bg-acid"
          className="bounce-in"
        >
          <span className="text-[24px] leading-none font-semibold">
            {String(currentStep).padStart(2, '0')}
          </span>
        </HexBadge>
        <span className="text-[20px] font-semibold text-faint">
          / {String(totalSteps).padStart(2, '0')}
        </span>
      </div>
    </header>
  );
}
