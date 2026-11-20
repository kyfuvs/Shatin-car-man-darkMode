import { DivinationRecord } from '../types/fortune';

const HISTORY_KEY = 'che_kung_divination_history_v1';
const MUTE_KEY = 'che_kung_audio_muted_v1';
const THEME_KEY = 'che_kung_theme_mode_v1';

export type ThemeMode = 'light' | 'dark';

export function loadThemePreference(): ThemeMode {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === 'light' || raw === 'dark') {
      return raw;
    }
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
    return 'light';
  } catch {
    return 'light';
  }
}

export function saveThemePreference(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Ignore storage quota issues
  }
}

export function loadHistory(): DivinationRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is DivinationRecord =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.stickId === 'number' &&
        typeof item.timestamp === 'number'
    );
  } catch {
    return [];
  }
}

export function saveHistory(records: DivinationRecord[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(records.slice(0, 100)));
  } catch {
    // Ignore storage quota issues
  }
}

export function loadMutedPreference(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveMutedPreference(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, String(muted));
  } catch {
    // Ignore storage quota issues
  }
}
