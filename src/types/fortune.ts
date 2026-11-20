export type StickGrade = '上簽' | '中簽' | '下簽';

export interface FortuneStick {
  id: number;
  grade: StickGrade;
  poem: string;
  basicMeaning: string;
}

export interface DivinationRecord {
  id: string;
  timestamp: number;
  stickId: number;
  grade: StickGrade;
  question: string;
  aiResponse: string;
  source: 'draw' | 'lookup';
}
