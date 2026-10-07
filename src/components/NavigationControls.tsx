interface NavigationControlsProps {
  currentStep: number;
  stepTitles: string[];
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
}

const buttonClass =
  'pressable flex items-center gap-3 rounded-full border-2 border-line px-6 py-2.5 font-display text-[20px] font-semibold disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none';

export function NavigationControls({
  currentStep,
  stepTitles,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onGoTo,
}: NavigationControlsProps) {
  return (
    <nav className="relative z-10 flex h-[76px] shrink-0 items-center gap-8 border-t-3 border-line bg-panel px-12">
      <button
        type="button"
        onClick={onPrev}
        disabled={!hasPrev}
        className={`${buttonClass} bg-panel text-paper enabled:hover:bg-panel-lift`}
      >
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        上一步
      </button>

      {/*
        進度條：一排有描邊的膠囊，每一段都可以直接點擊跳頁。
        三種狀態同時用「填色」與「高度」區分，不是只靠顏色：
        目前（桃紅實心、最高、帶陰影）> 看過（檸檬黃）> 還沒看（白底）。
      */}
      <ol className="flex flex-1 items-center gap-2">
        {stepTitles.map((stepTitle, index) => {
          const position = index + 1;
          const isCurrent = position === currentStep;
          const state = isCurrent
            ? 'bounce-in h-5 bg-acid shadow-pop-sm'
            : position < currentStep
              ? 'h-3 bg-amber-pop group-hover:bg-acid-pop'
              : 'h-3 bg-panel group-hover:bg-acid-pop';

          return (
            <li key={`${stepTitle}-${index}`} className="flex-1">
              <button
                type="button"
                onClick={() => onGoTo(index)}
                title={`${position}. ${stepTitle}`}
                aria-label={`跳到第 ${position} 步：${stepTitle}`}
                aria-current={isCurrent}
                className="group flex h-9 w-full items-center"
              >
                <span
                  key={isCurrent ? `current-${position}` : position}
                  className={`w-full rounded-full border-2 border-line transition-colors ${state}`}
                />
              </button>
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext}
        className={`${buttonClass} bg-acid text-on-accent`}
      >
        下一步
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}
