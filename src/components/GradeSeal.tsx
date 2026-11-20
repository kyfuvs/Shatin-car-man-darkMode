import { StickGrade } from '../types/fortune';

interface GradeSealProps {
  grade: StickGrade;
  size?: 'sm' | 'md';
}

export function GradeSeal({ grade, size = 'md' }: GradeSealProps) {
  const styleMap: Record<StickGrade, string> = {
    上簽: 'border-[#991B1B]/70 dark:border-[#EF4444]/70 text-[#991B1B] dark:text-[#EF4444] bg-[#991B1B]/[0.05] dark:bg-[#EF4444]/15',
    中簽: 'border-[#D97706]/70 dark:border-[#F59E0B]/70 text-[#92400E] dark:text-[#F59E0B] bg-[#D97706]/[0.06] dark:bg-[#F59E0B]/15',
    下簽: 'border-[#6B7280]/60 dark:border-[#9CA3AF]/60 text-[#374151] dark:text-[#D1D5DB] bg-[#1F2937]/[0.04] dark:bg-[#FFFFFF]/[0.06]',
  };

  const sizeClass =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs tracking-[0.15em]'
      : 'px-3 py-1 text-sm tracking-[0.2em]';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-sm border font-serif font-semibold whitespace-nowrap shrink-0 ${sizeClass} ${styleMap[grade]}`}
    >
      {grade}
    </span>
  );
}
