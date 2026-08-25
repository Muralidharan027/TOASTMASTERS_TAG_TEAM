import type { TimingStatus, TimingSignal } from '../types';

export function formatTime(totalSeconds: number, includeFraction = false): string {
  const isNegative = totalSeconds < 0;
  const absSeconds = Math.abs(totalSeconds);
  const minutes = Math.floor(absSeconds / 60);
  const seconds = Math.floor(absSeconds % 60);
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  let result = `${isNegative ? '-' : ''}${formattedMinutes}:${formattedSeconds}`;
  if (includeFraction) {
    const fraction = Math.floor((absSeconds % 1) * 10);
    result += `.${fraction}`;
  }
  return result;
}

export function formatTimeShort(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (seconds === 0) {
    return `${minutes}m`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatDurationRange(minSeconds: number, maxSeconds: number): string {
  const minMin = Math.floor(minSeconds / 60);
  const minSec = minSeconds % 60;
  const maxMin = Math.floor(maxSeconds / 60);
  const maxSec = maxSeconds % 60;

  const minStr = minSec === 0 ? `${minMin}` : `${minMin}:${minSec.toString().padStart(2, '0')}`;
  const maxStr = maxSec === 0 ? `${maxMin}` : `${maxMin}:${maxSec.toString().padStart(2, '0')}`;

  return `${minStr}–${maxStr} mins`;
}

export function calculateTimingStatus(
  durationSeconds: number,
  allocatedMin: number,
  allocatedMax: number,
  disqualificationGrace = 30 // standard Toastmasters 30-second grace period
): TimingStatus {
  if (durationSeconds === 0) return 'not_completed';
  if (durationSeconds < allocatedMin - disqualificationGrace) {
    return 'under_time';
  }
  if (durationSeconds > allocatedMax + disqualificationGrace) {
    return 'over_time';
  }
  return 'on_time';
}

export function getTimingSignal(
  elapsedSeconds: number,
  allocatedMin: number,
  allocatedMax: number,
  warningTime?: number
): TimingSignal {
  const yellowTime = warningTime ?? Math.floor((allocatedMin + allocatedMax) / 2);

  if (elapsedSeconds >= allocatedMax + 30) {
    return 'over';
  }
  if (elapsedSeconds >= allocatedMax) {
    return 'red';
  }
  if (elapsedSeconds >= yellowTime) {
    return 'yellow';
  }
  if (elapsedSeconds >= allocatedMin) {
    return 'green';
  }
  return 'none';
}

export function getStatusBadge(status: TimingStatus): {
  label: string;
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case 'on_time':
      return { label: 'ON TIME', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' };
    case 'under_time':
      return { label: 'UNDER TIME', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' };
    case 'over_time':
      return { label: 'OVER TIME', bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' };
    default:
      return { label: 'NOT COMPLETED', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' };
  }
}

export function formatDateString(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}
