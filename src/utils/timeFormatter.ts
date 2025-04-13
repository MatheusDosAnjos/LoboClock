/**
 * Formats milliseconds into a MM:SS or HH:MM:SS format
 * @param timeMs Time in milliseconds
 * @returns Formatted time string
 */
export function formatTime(timeMs: number): string {
  // Ensure time is not negative
  const time = Math.max(0, timeMs);

  // Calculate hours, minutes, seconds using Math.ceil for total seconds
  // This prevents the immediate visual drop of the first second.
  const totalSeconds = Math.ceil(time / 1000); // Changed from Math.floor
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format based on whether hours are present
  if (hours > 0) {
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
  } else {
    return `${padZero(minutes)}:${padZero(seconds)}`;
  }
}

/**
 * Adds leading zero to single-digit numbers
 * @param num Number to pad
 * @returns Padded string
 */
function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}