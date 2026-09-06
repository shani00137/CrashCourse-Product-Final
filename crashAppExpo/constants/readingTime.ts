export const READING_TARGET_SECONDS = 10 * 60;

export function formatReadingTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  if (s <= 0) return "0s";
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m === 0) return `${rem}s`;
  return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
}

export function readingPct(seconds: number): number {
  return Math.min(100, (Math.max(0, seconds) / READING_TARGET_SECONDS) * 100);
}