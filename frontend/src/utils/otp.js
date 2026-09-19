export const OTP_LENGTH = 6;

export function secondsUntil(isoTimestamp) {
  if (!isoTimestamp) return 0;
  return Math.max(0, Math.round((new Date(isoTimestamp).getTime() - Date.now()) / 1000));
}

export function formatCountdown(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
