import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, RotateCcw, Send, Sparkles } from 'lucide-react';
import { FortuneStick } from '../types/fortune';
import { GradeSeal } from './GradeSeal';

interface ReadingViewProps {
  stick: FortuneStick;
  initialQuestion?: string;
  initialAiResponse?: string;
  source: 'draw' | 'lookup';
  onBackToDraw: () => void;
  onLookupStick: (stickId: number) => void;
  onSaveInterpretation: (stickId: number, question: string, aiResponse: string) => void;
}

const QUICK_TOPICS = [
  { label: '事業轉工', prompt: '我想問近期工作發展及是否適合轉工？' },
  { label: '感情婚姻', prompt: '我想問目前感情／與伴侶的相處及未來發展如何？' },
  { label: '財運投資', prompt: '我想問今年財運走勢，在理財或投資上有何宜忌？' },
  { label: '家宅健康', prompt: '我想問家人健康與家宅平安方面需要注意什麼？' },
];

export function ReadingView({
  stick,
  initialQuestion = '',
  initialAiResponse = '',
  source,
  onBackToDraw,
  onLookupStick,
  onSaveInterpretation,
}: ReadingViewProps) {
  const [question, setQuestion] = useState(initialQuestion);
  const [aiResponse, setAiResponse] = useState(initialAiResponse);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [quickStickInput, setQuickStickInput] = useState('');

  useEffect(() => {
    setQuestion(initialQuestion);
    setAiResponse(initialAiResponse);
    setError('');
  }, [stick.id, initialQuestion, initialAiResponse]);

  const handleQuickLookup = (e: FormEvent) => {
    e.preventDefault();
    const num = Number(quickStickInput.trim());
    if (Number.isInteger(num) && num >= 1 && num <= 96) {
      setQuickStickInput('');
      onLookupStick(num);
    }
  };

  const handleInterpret = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) {
      setError('請先輸入您想問的事情或目前處境，師傅方可為您對症解簽。');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stickId: stick.id,
          question: trimmed,
        }),
      });

      const data = (await res.json()) as { interpretation?: string; error?: string };

      if (!res.ok || !data.interpretation) {
        throw new Error(data.error || '暫時未能取得 AI 解簽回覆，請稍後再試。');
      }

      setAiResponse(data.interpretation);
      onSaveInterpretation(stick.id, trimmed, data.interpretation);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : '連線失敗，請檢查網絡後重試。';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const poemLines = stick.poem.split('\n').filter(Boolean);
  const meaningParts = stick.basicMeaning.split('斷曰：');
  const jieYue = meaningParts[0]?.replace(/^解曰：/, '').trim();
  const duanYue = meaningParts[1]?.trim();

  // Render AI response with clean typographic sections
  const renderFormattedInterpretation = (text: string) => {
    const blocks = text
      .split(/\n{2,}/)
      .map((b) => b.trim())
      .filter(Boolean);

    return blocks.map((block, idx) => {
      const lines = block.split('\n');
      const firstLine = lines[0]?.trim() ?? '';
      const isSectionHeader = /^【.+】$/.test(firstLine);

      if (isSectionHeader) {
        const title = firstLine.replace(/[【】]/g, '');
        const body = lines.slice(1).join('\n').trim();
        return (
          <div key={idx} className="space-y-2">
            <h3 className="font-serif text-base font-bold text-[#991B1B] dark:text-[#EF4444] tracking-wide">
              {title}
            </h3>
            {body && (
              <p className="text-[15px] leading-[1.8] text-[#1F2937] dark:text-[#E7E2DA] whitespace-pre-line">
                {body}
              </p>
            )}
          </div>
        );
      }

      // Check if header + body are on the same line like "【簽詩意蘊】..."
      const inlineHeaderMatch = block.match(/^【([^】]+)】([\s\S]*)$/);
      if (inlineHeaderMatch) {
        return (
          <div key={idx} className="space-y-2">
            <h3 className="font-serif text-base font-bold text-[#991B1B] dark:text-[#EF4444] tracking-wide">
              {inlineHeaderMatch[1]}
            </h3>
            <p className="text-[15px] leading-[1.8] text-[#1F2937] dark:text-[#E7E2DA] whitespace-pre-line">
              {inlineHeaderMatch[2].trim()}
            </p>
          </div>
        );
      }

      return (
        <p key={idx} className="text-[15px] leading-[1.8] text-[#1F2937] dark:text-[#E7E2DA] whitespace-pre-line">
          {block}
        </p>
      );
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Subtle Top Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-[#E5DFD3] dark:border-[#2C2723] transition-colors">
        <button
          type="button"
          onClick={onBackToDraw}
          className="min-h-[44px] px-2 -ml-2 inline-flex items-center gap-2 text-sm font-medium text-[#4B5563] dark:text-[#A8A29E] hover:text-[#991B1B] dark:hover:text-[#EF4444] transition-colors cursor-pointer whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>返回求簽頁</span>
        </button>

        <form onSubmit={handleQuickLookup} className="flex items-center gap-2">
          <label htmlFor="reading-quick-lookup" className="text-xs text-[#6B7280] dark:text-[#A8A29E] whitespace-nowrap">
            轉查簽號
          </label>
          <input
            id="reading-quick-lookup"
            type="number"
            inputMode="numeric"
            min={1}
            max={96}
            placeholder="1-96"
            value={quickStickInput}
            onChange={(e) => setQuickStickInput(e.target.value)}
            className="w-20 min-h-[40px] px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1E1B18] border border-[#D6CFC2] dark:border-[#443E38] text-sm text-center tabular-nums text-[#1F2937] dark:text-[#F3EFE8] focus:outline-none focus:border-[#991B1B] dark:focus:border-[#EF4444]"
          />
          <button
            type="submit"
            className="min-h-[40px] px-3 py-1.5 rounded-lg border border-[#D6CFC2] dark:border-[#443E38] bg-white dark:bg-[#1E1B18] hover:bg-[#F3EFE8] dark:hover:bg-[#282420] text-xs font-medium text-[#1F2937] dark:text-[#F3EFE8] transition-colors cursor-pointer whitespace-nowrap"
          >
            查閱
          </button>
        </form>
      </div>

      {/* Main 2-Column Editorial Layout on Desktop, Stacked on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Top / Left Section: Classic Stick Info */}
        <section
          aria-labelledby="stick-title"
          className="lg:col-span-5 bg-white dark:bg-[#1C1917] border border-[#D97706]/35 dark:border-[#D97706]/40 rounded-2xl p-6 sm:p-8 shadow-xs transition-colors"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs text-[#6B7280] dark:text-[#A8A29E] tracking-wider">
                沙田車公廟 · {source === 'draw' ? '誠心求得' : '簽號查閱'}
              </p>
              <h1
                id="stick-title"
                className="font-serif text-2xl sm:text-3xl font-bold text-[#1F2937] dark:text-[#F3EFE8] tabular-nums tracking-wide"
              >
                第 {stick.id} 簽
              </h1>
            </div>
            <GradeSeal grade={stick.grade} size="md" />
          </div>

          <div className="h-px bg-[#D97706]/30 dark:bg-[#D97706]/20 my-6" aria-hidden="true" />

          {/* 4-Line Poem */}
          <div className="py-3 text-center">
            <p className="text-xs tracking-[0.2em] text-[#92400E] dark:text-[#F59E0B] mb-4 font-medium">
              簽文
            </p>
            <div className="space-y-2.5 font-serif text-xl sm:text-2xl leading-relaxed tracking-[0.12em] text-[#1F2937] dark:text-[#F3EFE8]">
              {poemLines.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>

          <div className="h-px bg-[#E5DFD3] dark:bg-[#2C2723] my-6" aria-hidden="true" />

          {/* Classical Basic Meaning */}
          <div className="space-y-4 text-sm sm:text-[15px] leading-relaxed">
            {jieYue && (
              <div>
                <h2 className="font-serif text-sm font-bold text-[#991B1B] dark:text-[#EF4444] tracking-wider mb-1">
                  傳統解曰
                </h2>
                <p className="text-[#1F2937] dark:text-[#F3EFE8] font-medium">{jieYue}</p>
              </div>
            )}
            {duanYue && (
              <div>
                <h2 className="font-serif text-sm font-bold text-[#92400E] dark:text-[#F59E0B] tracking-wider mb-1">
                  仙機斷曰
                </h2>
                <p className="text-[#4B5563] dark:text-[#C7BFB5]">{duanYue}</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-[#E5DFD3] dark:border-[#2C2723] flex justify-end">
            <button
              type="button"
              onClick={onBackToDraw}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-[#D6CFC2] dark:border-[#443E38] bg-white dark:bg-[#1E1B18] hover:bg-[#FAF8F5] dark:hover:bg-[#282420] text-sm font-medium text-[#1F2937] dark:text-[#F3EFE8] inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>另問他事 / 重新求簽</span>
            </button>
          </div>
        </section>

        {/* Bottom / Right Section: Interactive Gemini AI Interpreter */}
        <section
          aria-labelledby="ai-interpreter-heading"
          className="lg:col-span-7 bg-white dark:bg-[#1C1917] border border-[#E5DFD3] dark:border-[#2C2723] rounded-2xl p-6 sm:p-8 shadow-xs transition-colors"
        >
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#D97706] dark:text-[#F59E0B]" aria-hidden="true" />
                <h2
                  id="ai-interpreter-heading"
                  className="font-serif text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-[#F3EFE8]"
                >
                  AI 問事解簽
                </h2>
              </div>
              <p className="text-sm text-[#4B5563] dark:text-[#A8A29E]">
                輸入您心裏所想或當前處境，系統將結合第 {stick.id} 簽簽詩與傳統解曰，為您作個人化剖析。
              </p>
            </div>
          </div>

          {/* Quick-topic functional buttons */}
          <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="常見問事範疇">
            {QUICK_TOPICS.map((topic) => (
              <button
                key={topic.label}
                type="button"
                onClick={() => {
                  setQuestion(topic.prompt);
                  setError('');
                }}
                className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-[#FAF8F5] dark:bg-[#231F1C] hover:bg-[#F3EFE8] dark:hover:bg-[#2D2824] border border-[#E5DFD3] dark:border-[#38332E] text-xs sm:text-sm font-medium text-[#4B5563] dark:text-[#D1C7BD] hover:text-[#1F2937] dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                {topic.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleInterpret} className="space-y-4">
            <div>
              <label htmlFor="question-textarea" className="sr-only">
                您的問題或現況
              </label>
              <textarea
                id="question-textarea"
                rows={4}
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  if (error) setError('');
                }}
                placeholder="例如：我想問今年轉工好唔好？或與伴侶最近常吵架，應如何處理？"
                className="w-full rounded-xl bg-[#FAF8F5] dark:bg-[#231F1C] border border-[#D6CFC2] dark:border-[#443E38] px-4 py-3 text-[15px] text-[#1F2937] dark:text-[#F3EFE8] placeholder:text-[#9CA3AF] dark:placeholder:text-[#78716C] leading-relaxed focus:outline-none focus:bg-white dark:focus:bg-[#1E1B18] focus:border-[#991B1B] dark:focus:border-[#EF4444] focus:ring-2 focus:ring-[#991B1B]/15 transition-colors resize-y"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-[#991B1B]/30 dark:border-[#EF4444]/40 bg-[#991B1B]/[0.05] dark:bg-[#EF4444]/15 px-4 py-3 text-sm text-[#991B1B] dark:text-[#FCA5A5]"
              >
                {error}
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-[#6B7280] dark:text-[#A8A29E]">
                解讀結果將自動保存至求簽紀錄
              </span>
              <button
                type="submit"
                disabled={isLoading}
                className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] dark:bg-[#B91C1C] dark:hover:bg-[#991B1B] active:scale-[0.98] disabled:opacity-65 disabled:cursor-not-allowed text-white font-medium text-sm sm:text-base inline-flex items-center justify-center gap-2 transition-all duration-150 shadow-xs cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991B1B]"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>{isLoading ? '解析中⋯' : 'AI 個人化解簽'}</span>
              </button>
            </div>
          </form>

          {/* Loading Skeleton */}
          {isLoading && (
            <div
              aria-live="polite"
              className="mt-8 pt-6 border-t border-[#E5DFD3] dark:border-[#2C2723] space-y-4 animate-pulse"
            >
              <p className="font-serif text-sm font-semibold text-[#991B1B] dark:text-[#EF4444] tracking-wider">
                車公靈簽解析中...
              </p>
              <div className="space-y-2.5">
                <div className="h-4 bg-[#E5DFD3]/70 dark:bg-[#38332E]/70 rounded w-1/3" />
                <div className="h-3.5 bg-[#E5DFD3]/50 dark:bg-[#38332E]/50 rounded w-full" />
                <div className="h-3.5 bg-[#E5DFD3]/50 dark:bg-[#38332E]/50 rounded w-11/12" />
                <div className="h-3.5 bg-[#E5DFD3]/50 dark:bg-[#38332E]/50 rounded w-4/5" />
              </div>
              <div className="space-y-2.5 pt-2">
                <div className="h-4 bg-[#E5DFD3]/70 dark:bg-[#38332E]/70 rounded w-1/4" />
                <div className="h-3.5 bg-[#E5DFD3]/50 dark:bg-[#38332E]/50 rounded w-full" />
                <div className="h-3.5 bg-[#E5DFD3]/50 dark:bg-[#38332E]/50 rounded w-5/6" />
              </div>
            </div>
          )}

          {/* AI Response Display */}
          {!isLoading && aiResponse && (
            <article
              aria-live="polite"
              className="mt-8 pt-6 border-t border-[#D97706]/35 dark:border-[#D97706]/40 space-y-5 max-w-prose"
            >
              {renderFormattedInterpretation(aiResponse)}
            </article>
          )}
        </section>
      </div>
    </div>
  );
}
