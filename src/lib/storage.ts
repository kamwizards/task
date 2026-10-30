import { Task } from '@/types/task';
import { getInitialTasks } from './initialData';

const STORAGE_KEY = 'auratask_tasks_v1';
const THEME_KEY = 'auratask_theme_v1';
const SOUND_KEY = 'auratask_sound_v1';

export function loadStoredTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialTasks();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getInitialTasks();
  } catch (e) {
    console.error('Failed to load tasks from localStorage', e);
    return getInitialTasks();
  }
}

export function saveStoredTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage', e);
  }
}

export function getStoredTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  try {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === 'light' || theme === 'dark') return theme;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveStoredTheme(theme: 'dark' | 'light'): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Failed to save theme', e);
  }
}

export function getStoredSound(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const sound = localStorage.getItem(SOUND_KEY);
    return sound !== 'false';
  } catch {
    return true;
  }
}

export function saveStoredSound(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SOUND_KEY, enabled ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to save sound preference', e);
  }
}

export function resetToDemoTasks(): Task[] {
  const initial = getInitialTasks();
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    } catch (e) {
      console.error('Failed to reset tasks', e);
    }
  }
  return initial;
}
