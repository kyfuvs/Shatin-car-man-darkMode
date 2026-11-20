import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Compass, History, Moon, ScrollText, Sun, Volume2, VolumeX } from 'lucide-react';
import rawSticks from './data/cheKungSticks.json';
import { DivinationRecord, FortuneStick } from './types/fortune';
import { playFortuneDrawSound } from './utils/sound';
import {
  ThemeMode,
  loadHistory,
  loadMutedPreference,
  loadThemePreference,
  saveHistory,
  saveMutedPreference,
  saveThemePreference,
} from './utils/storage';
import { DrawAndLookupView } from './components/DrawAndLookupView';
import { ReadingView } from './components/ReadingView';
import { HistoryView } from './components/HistoryView';
import { DirectoryView } from './components/DirectoryView';

type AppTab = 'draw' | 'reading' | 'directory' | 'history';

const STICKS = rawSticks as FortuneStick[];

export default function App() {
  const sticksById = useMemo(
    () => new Map<number, FortuneStick>(STICKS.map((s) => [s.id, s])),
    []
  );

  const [activeTab, setActiveTab] = useState<AppTab>('draw');
  const [theme, setTheme] = useState<ThemeMode>(() => loadThemePreference());
  const [isMuted, setIsMuted] = useState<boolean>(() => loadMutedPreference());
  const [history, setHistory] = useState<DivinationRecord[]>(() => loadHistory());

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveThemePreference(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Drawing animation states (Mode A)
  const [isShaking, setIsShaking] = useState(false);
  const [revealedStickId, setRevealedStickId] = useState<number | null>(null);
  const drawTimerRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<number | null>(null);

  // Active reading session state (Mode C)
  const [activeStickId, setActiveStickId] = useState<number>(1);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string>('');
  const [activeAiResponse, setActiveAiResponse] = useState<string>('');
  const [activeSource, setActiveSource] = useState<'draw' | 'lookup'>('draw');
  const [hasReading, setHasReading] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      if (drawTimerRef.current) window.clearTimeout(drawTimerRef.current);
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    };
  }, []);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      saveMutedPreference(next);
      return next;
    });
  };

  const addHistoryRecord = useCallback((record: DivinationRecord) => {
    setHistory((prev) => {
      const updated = [record, ...prev];
      saveHistory(updated);
      return updated;
    });
  }, []);

  const updateHistoryRecord = useCallback(
    (recordId: string, question: string, aiResponse: string) => {
      setHistory((prev) => {
        const exists = prev.some((r) => r.id === recordId);
        const updated = exists
          ? prev.map((r) =>
              r.id === recordId
                ? { ...r, question, aiResponse, timestamp: Date.now() }
                : r
            )
          : prev;
        saveHistory(updated);
        return updated;
      });
    },
    []
  );

  // Mode A: 1.5s shake + procedural Web Audio + reveal + transition to Reading View
  const handleDrawStick = () => {
    if (isShaking || revealedStickId !== null) return;

    if (!isMuted) {
      playFortuneDrawSound();
    }

    const drawnId = Math.floor(Math.random() * 96) + 1;
    const stick = sticksById.get(drawnId);
    if (!stick) return;

    setIsShaking(true);
    setRevealedStickId(null);

    drawTimerRef.current = window.setTimeout(() => {
      setIsShaking(false);
      setRevealedStickId(drawnId);

      const newRecordId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newRecord: DivinationRecord = {
        id: newRecordId,
        timestamp: Date.now(),
        stickId: drawnId,
        grade: stick.grade,
        question: '',
        aiResponse: '',
        source: 'draw',
      };
      addHistoryRecord(newRecord);

      transitionTimerRef.current = window.setTimeout(() => {
        setActiveStickId(drawnId);
        setActiveRecordId(newRecordId);
        setActiveQuestion('');
        setActiveAiResponse('');
        setActiveSource('draw');
        setHasReading(true);
        setRevealedStickId(null);
        setActiveTab('reading');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 450);
    }, 1500);
  };

  // Mode B & Directory: Direct Stick Lookup
  const handleLookupStick = (stickId: number) => {
    const stick = sticksById.get(stickId);
    if (!stick) return;

    setActiveStickId(stickId);
    setActiveRecordId(null);
    setActiveQuestion('');
    setActiveAiResponse('');
    setActiveSource('lookup');
    setHasReading(true);
    setActiveTab('reading');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save AI Interpretation to History (updating drawn session or creating new lookup session)
  const handleSaveInterpretation = (
    stickId: number,
    question: string,
    aiResponse: string
  ) => {
    const stick = sticksById.get(stickId);
    if (!stick) return;

    setActiveQuestion(question);
    setActiveAiResponse(aiResponse);

    if (activeRecordId) {
      updateHistoryRecord(activeRecordId, question, aiResponse);
    } else {
      const newRecordId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newRecord: DivinationRecord = {
        id: newRecordId,
        timestamp: Date.now(),
        stickId,
        grade: stick.grade,
        question,
        aiResponse,
        source: activeSource,
      };
      setActiveRecordId(newRecordId);
      addHistoryRecord(newRecord);
    }
  };

  const handleOpenRecord = (record: DivinationRecord) => {
    setActiveStickId(record.stickId);
    setActiveRecordId(record.id);
    setActiveQuestion(record.question);
    setActiveAiResponse(record.aiResponse);
    setActiveSource(record.source);
    setHasReading(true);
    setActiveTab('reading');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteRecord = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveHistory(updated);
      return updated;
    });
    if (activeRecordId === id) {
      setActiveRecordId(null);
    }
  };

  const handleClearAll = () => {
    setHistory([]);
    saveHistory([]);
    setActiveRecordId(null);
  };

  const currentStick = sticksById.get(activeStickId) ?? STICKS[0];

  return (
    <div className="min-h-dvh flex flex-col bg-[#FAF8F5] dark:bg-[#12100E] text-[#1F2937] dark:text-[#F3EFE8] transition-colors duration-200">
      {/* Top Bar Contract: 3-zone single row (Brand wordmark — Nav links — Controls) */}
      <header className="sticky top-0 z-30 h-[52px] sm:h-16 bg-[#FAF8F5]/95 dark:bg-[#12100E]/95 backdrop-blur-md border-b border-[#E5DFD3] dark:border-[#2C2723] transition-colors">
        <div className="mx-auto max-w-6xl h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('draw')}
            className="font-serif text-lg sm:text-xl font-bold tracking-wider text-[#991B1B] dark:text-[#EF4444] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991B1B] dark:focus-visible:outline-[#EF4444]"
          >
            沙田車公廟靈簽
          </button>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="主導覽列"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4B5563] dark:text-[#A8A29E]"
          >
            <button
              type="button"
              onClick={() => setActiveTab('draw')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'draw'
                  ? 'border-[#991B1B] dark:border-[#EF4444] text-[#1F2937] dark:text-[#F3EFE8]'
                  : 'border-transparent hover:text-[#1F2937] dark:hover:text-[#F3EFE8]'
              }`}
            >
              誠心求簽
            </button>
            {hasReading && (
              <button
                type="button"
                onClick={() => setActiveTab('reading')}
                className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'reading'
                    ? 'border-[#991B1B] dark:border-[#EF4444] text-[#1F2937] dark:text-[#F3EFE8]'
                    : 'border-transparent hover:text-[#1F2937] dark:hover:text-[#F3EFE8]'
                }`}
              >
                簽文詳解
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'directory'
                  ? 'border-[#991B1B] dark:border-[#EF4444] text-[#1F2937] dark:text-[#F3EFE8]'
                  : 'border-transparent hover:text-[#1F2937] dark:hover:text-[#F3EFE8]'
              }`}
            >
              九十六簽一覽
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                activeTab === 'history'
                  ? 'border-[#991B1B] dark:border-[#EF4444] text-[#1F2937] dark:text-[#F3EFE8]'
                  : 'border-transparent hover:text-[#1F2937] dark:hover:text-[#F3EFE8]'
              }`}
            >
              求簽紀錄{history.length > 0 ? ` (${history.length})` : ''}
            </button>
          </nav>

          {/* Zone 3: Controls (Theme Toggle + Audio Mute Toggle) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-pressed={theme === 'dark'}
              aria-label={theme === 'dark' ? '切換為日間模式' : '切換為夜間模式'}
              title={theme === 'dark' ? '切換為日間模式' : '切換為夜間模式'}
              className="min-h-[44px] px-3 py-1.5 rounded-xl border border-[#E5DFD3] dark:border-[#38332E] bg-white dark:bg-[#1E1B18] hover:bg-[#F3EFE8] dark:hover:bg-[#282420] text-xs sm:text-sm font-medium text-[#4B5563] dark:text-[#D1C7BD] hover:text-[#1F2937] dark:hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-[#991B1B]" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">{theme === 'dark' ? '夜間模式' : '日間模式'}</span>
            </button>

            {/* Audio Toggle Button */}
            <button
              type="button"
              onClick={toggleMute}
              aria-pressed={isMuted}
              aria-label={isMuted ? '開啟求簽音效' : '靜音'}
              title={isMuted ? '開啟求簽音效' : '靜音'}
              className="min-h-[44px] px-3 py-1.5 rounded-xl border border-[#E5DFD3] dark:border-[#38332E] bg-white dark:bg-[#1E1B18] hover:bg-[#F3EFE8] dark:hover:bg-[#282420] text-xs sm:text-sm font-medium text-[#4B5563] dark:text-[#D1C7BD] hover:text-[#1F2937] dark:hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" aria-hidden="true" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#991B1B] dark:text-[#EF4444]" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">{isMuted ? '已靜音' : '音效開'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-12">
        {activeTab === 'draw' && (
          <DrawAndLookupView
            isShaking={isShaking}
            revealedStickId={revealedStickId}
            onDrawStick={handleDrawStick}
            onLookupStick={handleLookupStick}
            totalHistoryCount={history.length}
            onOpenHistory={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'reading' && (
          <ReadingView
            stick={currentStick}
            initialQuestion={activeQuestion}
            initialAiResponse={activeAiResponse}
            source={activeSource}
            onBackToDraw={() => setActiveTab('draw')}
            onLookupStick={handleLookupStick}
            onSaveInterpretation={handleSaveInterpretation}
          />
        )}

        {activeTab === 'directory' && (
          <DirectoryView
            sticks={STICKS}
            onSelectStick={handleLookupStick}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            records={history}
            sticksById={sticksById}
            onOpenRecord={handleOpenRecord}
            onDeleteRecord={handleDeleteRecord}
            onClearAll={handleClearAll}
            onGoToDraw={() => setActiveTab('draw')}
          />
        )}
      </main>

      {/* Quiet Desktop Footer */}
      <footer className="hidden md:block border-t border-[#E5DFD3] dark:border-[#2C2723] py-6 transition-colors">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-[#6B7280] dark:text-[#A8A29E]">
          <span>沙田車公廟九十六靈簽 · 傳統簽文及 AI 問事輔助</span>
          <span>心誠則靈 · 僅供傳統文化參考與心境沉澱</span>
        </div>
      </footer>

      {/* Mobile Bottom Tab Bar (Thumb Zone, total fixed header + bottom bar <= 15% height) */}
      <nav
        aria-label="流動版導覽列"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-[#FAF8F5]/95 dark:bg-[#12100E]/95 backdrop-blur-md border-t border-[#E5DFD3] dark:border-[#2C2723] transition-colors"
      >
        <div
          className={`grid h-full items-center ${
            hasReading ? 'grid-cols-4' : 'grid-cols-3'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('draw')}
            className={`h-full flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              activeTab === 'draw' ? 'text-[#991B1B] dark:text-[#EF4444]' : 'text-[#6B7280] dark:text-[#A8A29E]'
            }`}
          >
            <Compass className="w-5 h-5" aria-hidden="true" />
            <span className="text-[11px] font-medium whitespace-nowrap">誠心求簽</span>
          </button>

          {hasReading && (
            <button
              type="button"
              onClick={() => setActiveTab('reading')}
              className={`h-full flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                activeTab === 'reading' ? 'text-[#991B1B] dark:text-[#EF4444]' : 'text-[#6B7280] dark:text-[#A8A29E]'
              }`}
            >
              <ScrollText className="w-5 h-5" aria-hidden="true" />
              <span className="text-[11px] font-medium whitespace-nowrap">簽文詳解</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`h-full flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              activeTab === 'directory' ? 'text-[#991B1B] dark:text-[#EF4444]' : 'text-[#6B7280] dark:text-[#A8A29E]'
            }`}
          >
            <BookOpen className="w-5 h-5" aria-hidden="true" />
            <span className="text-[11px] font-medium whitespace-nowrap">九十六簽</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`h-full flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              activeTab === 'history' ? 'text-[#991B1B] dark:text-[#EF4444]' : 'text-[#6B7280] dark:text-[#A8A29E]'
            }`}
          >
            <History className="w-5 h-5" aria-hidden="true" />
            <span className="text-[11px] font-medium whitespace-nowrap tabular-nums">
              紀錄{history.length > 0 ? `(${history.length})` : ''}
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
