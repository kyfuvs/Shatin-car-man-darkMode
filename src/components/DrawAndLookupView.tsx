import { FormEvent, useState } from 'react';
import { ArrowRight, BookOpen, Compass, Search } from 'lucide-react';
import { FortuneCylinder } from './FortuneCylinder';

interface DrawAndLookupViewProps {
  isShaking: boolean;
  revealedStickId: number | null;
  onDrawStick: () => void;
  onLookupStick: (stickId: number) => void;
  totalHistoryCount: number;
  onOpenHistory: () => void;
}

export function DrawAndLookupView({
  isShaking,
  revealedStickId,
  onDrawStick,
  onLookupStick,
  totalHistoryCount,
  onOpenHistory,
}: DrawAndLookupViewProps) {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const handleLookupSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    const num = Number(trimmed);
    if (!trimmed || !Number.isInteger(num) || num < 1 || num > 96) {
      setInputError('請輸入 1 至 96 之間的簽號');
      return;
    }
    setInputError('');
    onLookupStick(num);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Mode A: Digital Fortune Drawing (Primary Focal Anchor) */}
        <section
          aria-labelledby="draw-heading"
          className="lg:col-span-7 bg-white dark:bg-[#1C1917] border border-[#D97706]/30 dark:border-[#D97706]/40 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xs transition-colors"
        >
          <div className="flex flex-col items-center text-center">
            <p className="text-xs tracking-[0.2em] text-[#92400E] dark:text-[#F59E0B] font-medium mb-2">
              沙田車公廟 · 九十六靈簽
            </p>
            <h1
              id="draw-heading"
              className="font-serif text-2xl sm:text-3xl font-bold text-[#1F2937] dark:text-[#F3EFE8] tracking-wide"
              style={{ textWrap: 'balance' }}
            >
              誠心求簽問事
            </h1>

            <div className="w-16 h-px bg-[#D97706]/40 dark:bg-[#D97706]/30 my-5" aria-hidden="true" />

            {/* Calm instruction prompt for temple scenario */}
            <div className="max-w-lg space-y-2 text-sm sm:text-[15px] leading-relaxed text-[#4B5563] dark:text-[#C7BFB5]">
              <p>
                若廟內香火鼎盛不便取簽筒，請雙手安穩握持手機，面向車公聖像靜心定神。
              </p>
              <p className="text-[#1F2937] dark:text-[#F3EFE8] font-medium">
                心中默念您的姓名、出生年月日及現居地址，誠心稟告所問一事，然後輕按下方求簽。
              </p>
            </div>

            {/* Interactive SVG Bamboo Cylinder */}
            <div className="my-4 sm:my-6 w-full flex justify-center">
              <FortuneCylinder isShaking={isShaking} revealedStickId={revealedStickId} />
            </div>

            {/* Primary Tactile CTA */}
            <button
              type="button"
              onClick={onDrawStick}
              disabled={isShaking || revealedStickId !== null}
              className="w-full sm:w-auto min-w-[240px] min-h-[52px] px-8 py-3.5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] dark:bg-[#B91C1C] dark:hover:bg-[#991B1B] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-white font-serif text-lg font-semibold tracking-[0.18em] transition-all duration-150 shadow-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991B1B] dark:focus-visible:outline-[#EF4444] whitespace-nowrap"
            >
              {isShaking ? '誠心搖簽中⋯' : '誠心求簽'}
            </button>

            <p className="mt-4 text-xs text-[#6B7280] dark:text-[#A8A29E]">
              一件事求一支簽 · 求得靈簽後可即時以 AI 結合現況解讀
            </p>
          </div>
        </section>

        {/* Mode B: Direct Stick Lookup + Etiquette & Quick Access */}
        <aside className="lg:col-span-5 space-y-6">
          {/* Direct Stick Lookup Card */}
          <section
            aria-labelledby="lookup-heading"
            className="bg-[#F3EFE8]/70 dark:bg-[#1E1B18] border border-[#D97706]/30 dark:border-[#D97706]/40 rounded-2xl p-6 sm:p-8 transition-colors"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <Search className="w-4 h-4 text-[#991B1B] dark:text-[#EF4444]" aria-hidden="true" />
              <h2
                id="lookup-heading"
                className="font-serif text-xl font-bold text-[#1F2937] dark:text-[#F3EFE8] tracking-wide"
              >
                輸入簽號查簽
              </h2>
            </div>
            <p className="text-sm text-[#4B5563] dark:text-[#D1C7BD] leading-relaxed mb-5">
              如已在廟內求得實體竹簽，請輸入簽枝上的編號（1 至 96）查閱完整簽文及進行 AI 個人化解簽。
            </p>

            <form onSubmit={handleLookupSubmit} noValidate className="space-y-3">
              <div>
                <label htmlFor="stick-number-input" className="sr-only">
                  靈簽編號（1 至 96）
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    id="stick-number-input"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={96}
                    placeholder="輸入簽號 (1 - 96)"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      if (inputError) setInputError('');
                    }}
                    className="flex-1 min-h-[48px] px-4 py-2.5 rounded-xl bg-white dark:bg-[#282420] border border-[#D6CFC2] dark:border-[#443E38] text-[#1F2937] dark:text-[#F3EFE8] placeholder:text-[#9CA3AF] dark:placeholder:text-[#78716C] text-base tabular-nums focus:outline-none focus:border-[#991B1B] dark:focus:border-[#EF4444] focus:ring-2 focus:ring-[#991B1B]/15 transition-colors"
                  />
                  <button
                    type="submit"
                    className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#1F2937] hover:bg-[#111827] dark:bg-[#B91C1C] dark:hover:bg-[#991B1B] active:scale-[0.98] text-white font-medium text-sm inline-flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F2937]"
                  >
                    <span>查閱簽文</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                {inputError && (
                  <p role="alert" className="mt-2 text-xs text-[#991B1B] dark:text-[#F87171] font-medium">
                    {inputError}
                  </p>
                )}
              </div>
            </form>
          </section>

          {/* Cultural Etiquette & History Shortcut */}
          <section className="border-t border-[#E5DFD3] dark:border-[#2C2723] pt-6 px-1 space-y-5 transition-colors">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm font-serif font-semibold text-[#1F2937] dark:text-[#F3EFE8]">
                <Compass className="w-4 h-4 text-[#D97706] dark:text-[#F59E0B]" aria-hidden="true" />
                <span>車公廟求簽須知</span>
              </div>
              <ul className="space-y-1.5 text-sm text-[#4B5563] dark:text-[#A8A29E] leading-relaxed">
                <li>1. 秉持「一事一簽」原則，同一問題不宜重複求簽。</li>
                <li>2. 上簽宜乘勢而行、戒驕戒躁；下簽重在提醒避險，守正行善自可轉危為安。</li>
                <li>3. 解簽貴乎結合當下處境，務實檢視進退時機。</li>
              </ul>
            </div>

            {totalHistoryCount > 0 && (
              <div className="pt-4 border-t border-[#E5DFD3] dark:border-[#2C2723] flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-[#4B5563] dark:text-[#A8A29E]">
                  <BookOpen className="w-4 h-4 text-[#991B1B] dark:text-[#EF4444]" aria-hidden="true" />
                  <span>
                    已保存 <span className="font-semibold text-[#1F2937] dark:text-[#F3EFE8] tabular-nums">{totalHistoryCount}</span> 筆求簽紀錄
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onOpenHistory}
                  className="min-h-[44px] px-3 text-sm font-medium text-[#991B1B] dark:text-[#EF4444] hover:underline cursor-pointer whitespace-nowrap shrink-0"
                >
                  查看紀錄
                </button>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
