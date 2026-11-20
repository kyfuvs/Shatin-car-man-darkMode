import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, ScrollText, Trash2 } from 'lucide-react';
import { DivinationRecord, FortuneStick } from '../types/fortune';
import { GradeSeal } from './GradeSeal';

interface HistoryViewProps {
  records: DivinationRecord[];
  sticksById: Map<number, FortuneStick>;
  onOpenRecord: (record: DivinationRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  onGoToDraw: () => void;
}

function formatDateTime(ts: number): string {
  try {
    return new Intl.DateTimeFormat('zh-HK', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
}

export function HistoryView({
  records,
  sticksById,
  onOpenRecord,
  onDeleteRecord,
  onClearAll,
  onGoToDraw,
}: HistoryViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    records[0]?.id ?? null
  );
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-[#E5DFD3] dark:border-[#2C2723] transition-colors">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F2937] dark:text-[#F3EFE8]">
            求簽紀錄
          </h1>
          <p className="text-sm text-[#4B5563] dark:text-[#A8A29E] mt-1">
            所有紀錄僅保存於您的本機瀏覽器內，共 <span className="tabular-nums font-medium">{records.length}</span> 筆。
          </p>
        </div>

        {records.length > 0 && (
          <div className="flex items-center gap-2">
            {confirmClear ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClearAll();
                    setConfirmClear(false);
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] dark:bg-[#B91C1C] dark:hover:bg-[#991B1B] text-white text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap"
                >
                  確定清空全部
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="min-h-[44px] px-3 py-2 rounded-xl border border-[#D6CFC2] dark:border-[#38332E] bg-white dark:bg-[#1E1B18] text-xs sm:text-sm text-[#4B5563] dark:text-[#D1C7BD] cursor-pointer whitespace-nowrap"
                >
                  取消
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5DFD3] dark:border-[#2C2723] hover:border-[#991B1B]/40 dark:hover:border-[#EF4444]/40 text-xs sm:text-sm text-[#6B7280] dark:text-[#A8A29E] hover:text-[#991B1B] dark:hover:text-[#EF4444] transition-colors cursor-pointer whitespace-nowrap"
              >
                清空紀錄
              </button>
            )}
          </div>
        )}
      </div>

      {records.length === 0 ? (
        <div className="bg-white dark:bg-[#1C1917] border border-[#E5DFD3] dark:border-[#2C2723] rounded-2xl p-10 text-center space-y-4 transition-colors">
          <ScrollText className="w-10 h-10 text-[#D97706]/60 dark:text-[#F59E0B]/60 mx-auto" aria-hidden="true" />
          <div className="space-y-1">
            <h2 className="font-serif text-lg font-semibold text-[#1F2937] dark:text-[#F3EFE8]">
              暫無求簽紀錄
            </h2>
            <p className="text-sm text-[#6B7280] dark:text-[#A8A29E]">
              每次誠心求簽或進行 AI 解簽後，系統會自動在此為您存檔以便日後重溫。
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToDraw}
            className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] dark:bg-[#B91C1C] dark:hover:bg-[#991B1B] text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            前往誠心求簽
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => {
            const stick = sticksById.get(record.stickId);
            const isExpanded = expandedId === record.id;

            return (
              <article
                key={record.id}
                className="bg-white dark:bg-[#1C1917] border border-[#E5DFD3] dark:border-[#2C2723] rounded-2xl overflow-hidden transition-colors"
              >
                {/* Summary Header Row */}
                <div className="flex items-center justify-between gap-3 p-4 sm:p-5">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : record.id)
                    }
                    aria-expanded={isExpanded}
                    className="flex-1 text-left flex items-start sm:items-center justify-between gap-3 min-h-[44px] cursor-pointer"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-serif text-lg font-bold text-[#1F2937] dark:text-[#F3EFE8] tabular-nums">
                          第 {record.stickId} 簽
                        </span>
                        <GradeSeal grade={record.grade} size="sm" />
                        <span className="text-xs text-[#6B7280] dark:text-[#A8A29E] tabular-nums">
                          {formatDateTime(record.timestamp)} ·{' '}
                          {record.source === 'draw' ? '誠心求簽' : '簽號查閱'}
                        </span>
                      </div>
                      <p className="text-sm text-[#4B5563] dark:text-[#D1C7BD] truncate max-w-xl">
                        {record.question
                          ? `問事：${record.question}`
                          : '尚未進行 AI 個人問事解析'}
                      </p>
                    </div>

                    <span className="text-[#6B7280] dark:text-[#A8A29E] shrink-0 p-1">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="w-5 h-5" aria-hidden="true" />
                      )}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteRecord(record.id)}
                    aria-label={`刪除第 ${record.stickId} 簽紀錄`}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#6B7280] dark:text-[#A8A29E] hover:text-[#991B1B] dark:hover:text-[#EF4444] hover:bg-[#991B1B]/[0.06] dark:hover:bg-[#EF4444]/15 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Expanded Detail Panel */}
                {isExpanded && (
                  <div className="px-4 sm:px-6 pb-6 pt-4 border-t border-[#E5DFD3] dark:border-[#2C2723] bg-[#FAF8F5]/60 dark:bg-[#171412]/80 space-y-5">
                    {stick && (
                      <div className="space-y-2">
                        <p className="font-serif text-base sm:text-lg leading-relaxed text-[#1F2937] dark:text-[#F3EFE8] whitespace-pre-line">
                          {stick.poem}
                        </p>
                        <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#A8A29E]">
                          {stick.basicMeaning}
                        </p>
                      </div>
                    )}

                    {record.question && (
                      <div className="pt-3 border-t border-[#E5DFD3] dark:border-[#2C2723] space-y-1.5">
                        <h3 className="text-xs font-semibold text-[#92400E] dark:text-[#F59E0B] tracking-wider">
                          所問之事
                        </h3>
                        <p className="text-sm text-[#1F2937] dark:text-[#F3EFE8] leading-relaxed">
                          {record.question}
                        </p>
                      </div>
                    )}

                    {record.aiResponse && (
                      <div className="pt-3 border-t border-[#E5DFD3] dark:border-[#2C2723] space-y-1.5">
                        <h3 className="text-xs font-semibold text-[#991B1B] dark:text-[#EF4444] tracking-wider">
                          AI 解簽指引
                        </h3>
                        <p className="text-sm text-[#1F2937] dark:text-[#E7E2DA] leading-[1.8] whitespace-pre-line max-w-prose">
                          {record.aiResponse}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onOpenRecord(record)}
                        className="min-h-[44px] px-4 py-2 rounded-xl border border-[#D97706]/40 dark:border-[#D97706]/50 bg-white dark:bg-[#231F1C] hover:bg-[#F3EFE8] dark:hover:bg-[#2C2723] text-sm font-medium text-[#991B1B] dark:text-[#EF4444] inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <span>開啟此簽文與 AI 問事</span>
                        <ExternalLink className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
