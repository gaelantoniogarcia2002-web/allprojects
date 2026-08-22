/**
 * Shared numeric helpers reused across the gallery pure-function layer
 * (tile-geometry, progress) to avoid duplicating clamp/round logic.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
