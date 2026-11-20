import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { FortuneStick, StickGrade } from '../types/fortune';
import { GradeSeal } from './GradeSeal';

interface DirectoryViewProps {
  sticks: FortuneStick[];
  onSelectStick: (stickId: number) => void;
}

type GradeFilter = '全部' | StickGrade;

const FILTERS: GradeFilter[] = ['全部', '上簽', '中簽', '下簽'];

export function DirectoryView({ sticks, onSelectStick }: DirectoryViewProps) {
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('全部');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSticks = useMemo(() => {
    const q = searchQuery.trim();
    return sticks.filter((stick) => {
      if (gradeFilter !== '全部' && stick.grade !== gradeFilter) return false;
      if (!q) return true;
      return (
        String(stick.id) === q ||
        `第${stick.id}簽`.includes(q) ||
        stick.poem.includes(q) ||
        stick.basicMeaning.includes(q)
      );
    });
  }, [sticks, gradeFilter, searchQuery]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-6 border-b border-[#E5DFD3] dark:border-[#2C2723] transition-colors">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F2937] dark:text-[#F3EFE8]">
            車公靈簽九十六簽一覽
          </h1>
          <p className="text-sm text-[#4B5563] dark:text-[#A8A29E] mt-1">
            共收錄沙田車公廟傳統第 1 至第 96 簽，點選任意簽支即可查閱詳解及進行 AI 問事。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Interactive grade filter buttons */}
          <div
            className="inline-flex items-center gap-1 p-1 bg-[#F3EFE8] dark:bg-[#1E1B18] rounded-xl border border-[#E5DFD3] dark:border-[#2C2723]"
            role="group"
            aria-label="按簽等篩選"
          >
            {FILTERS.map((filter) => {
              const active = gradeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setGradeFilter(filter)}
                  className={`min-h-[36px] px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white dark:bg-[#2B2622] text-[#991B1B] dark:text-[#EF4444] shadow-2xs'
                      : 'text-[#4B5563] dark:text-[#A8A29E] hover:text-[#1F2937] dark:hover:text-[#F3EFE8]'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          {/* Search input */}
          <div className="relative">
            <Search
              className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋簽號或詩句關鍵字"
              aria-label="搜尋簽號或詩句關鍵字"
              className="w-full sm:w-52 min-h-[44px] pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#1E1B18] border border-[#D6CFC2] dark:border-[#38332E] text-sm text-[#1F2937] dark:text-[#F3EFE8] placeholder:text-[#9CA3AF] dark:placeholder:text-[#78716C] focus:outline-none focus:border-[#991B1B] dark:focus:border-[#EF4444]"
            />
          </div>
        </div>
      </div>

      {filteredSticks.length === 0 ? (
        <div className="bg-white dark:bg-[#1C1917] border border-[#E5DFD3] dark:border-[#2C2723] rounded-2xl p-8 text-center text-sm text-[#6B7280] dark:text-[#A8A29E]">
          找不到符合條件的靈簽，請嘗試更改篩選條件或關鍵字。
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSticks.map((stick) => {
            const firstCouple = stick.poem.split('\n').slice(0, 2).join('');
            return (
              <button
                key={stick.id}
                type="button"
                onClick={() => onSelectStick(stick.id)}
                className="text-left bg-white dark:bg-[#1C1917] hover:bg-[#FAF8F5] dark:hover:bg-[#25201C] border border-[#E5DFD3] dark:border-[#2C2723] hover:border-[#D97706]/50 dark:hover:border-[#D97706]/60 rounded-2xl p-5 transition-colors cursor-pointer flex flex-col justify-between gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991B1B]"
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <span className="font-serif text-lg font-bold text-[#1F2937] dark:text-[#F3EFE8] tabular-nums">
                    第 {stick.id} 簽
                  </span>
                  <GradeSeal grade={stick.grade} size="sm" />
                </div>
                <p className="font-serif text-[15px] text-[#4B5563] dark:text-[#D1C7BD] leading-relaxed line-clamp-2">
                  {firstCouple}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
