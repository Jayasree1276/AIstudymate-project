import { SubjectColor } from '../types';

export function getSubjectColorClasses(color: SubjectColor): {
  bg: string;
  text: string;
  border: string;
  badge: string;
  gradient: string;
  lightBg: string;
} {
  switch (color) {
    case 'emerald':
      return {
        bg: 'bg-emerald-500',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800/60',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        gradient: 'from-emerald-500 to-teal-600',
        lightBg: 'bg-emerald-500/10 text-emerald-700',
      };
    case 'indigo':
      return {
        bg: 'bg-indigo-500',
        text: 'text-indigo-700 dark:text-indigo-300',
        border: 'border-indigo-200 dark:border-indigo-800/60',
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        gradient: 'from-indigo-500 to-blue-600',
        lightBg: 'bg-indigo-500/10 text-indigo-700',
      };
    case 'amber':
      return {
        bg: 'bg-amber-500',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800/60',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        gradient: 'from-amber-500 to-orange-600',
        lightBg: 'bg-amber-500/10 text-amber-700',
      };
    case 'rose':
      return {
        bg: 'bg-rose-500',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-800/60',
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        gradient: 'from-rose-500 to-pink-600',
        lightBg: 'bg-rose-500/10 text-rose-700',
      };
    case 'violet':
      return {
        bg: 'bg-violet-500',
        text: 'text-violet-700 dark:text-violet-300',
        border: 'border-violet-200 dark:border-violet-800/60',
        badge: 'bg-violet-50 text-violet-700 border-violet-200',
        gradient: 'from-violet-500 to-purple-600',
        lightBg: 'bg-violet-500/10 text-violet-700',
      };
    case 'cyan':
      return {
        bg: 'bg-cyan-500',
        text: 'text-cyan-700 dark:text-cyan-300',
        border: 'border-cyan-200 dark:border-cyan-800/60',
        badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        gradient: 'from-cyan-500 to-blue-500',
        lightBg: 'bg-cyan-500/10 text-cyan-700',
      };
    case 'blue':
      return {
        bg: 'bg-blue-500',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800/60',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        gradient: 'from-blue-500 to-indigo-600',
        lightBg: 'bg-blue-500/10 text-blue-700',
      };
    case 'fuchsia':
      return {
        bg: 'bg-fuchsia-500',
        text: 'text-fuchsia-700 dark:text-fuchsia-300',
        border: 'border-fuchsia-200 dark:border-fuchsia-800/60',
        badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
        gradient: 'from-fuchsia-500 to-pink-600',
        lightBg: 'bg-fuchsia-500/10 text-fuchsia-700',
      };
    default:
      return {
        bg: 'bg-slate-500',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-800/60',
        badge: 'bg-slate-50 text-slate-700 border-slate-200',
        gradient: 'from-slate-500 to-gray-600',
        lightBg: 'bg-slate-500/10 text-slate-700',
      };
  }
}

export function formatDaysRemaining(dateStr?: string): { days: number; text: string; urgent: boolean } {
  if (!dateStr) return { days: 999, text: 'No date set', urgent: false };
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { days: diffDays, text: `${Math.abs(diffDays)}d ago`, urgent: false };
  if (diffDays === 0) return { days: 0, text: 'Today!', urgent: true };
  if (diffDays === 1) return { days: 1, text: 'Tomorrow', urgent: true };
  if (diffDays <= 7) return { days: diffDays, text: `${diffDays} days left`, urgent: true };
  return { days: diffDays, text: `${diffDays} days left`, urgent: false };
}
