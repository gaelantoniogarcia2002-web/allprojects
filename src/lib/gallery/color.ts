const DEFAULT_TINT_ALPHA = 15;

/**
 * Transparent tint of a hex color, used as a card's background so the
 * progress fill (toSolid) reads clearly against it. Uses CSS color-mix()
 * because categoria.color is free-text hex, unknown at build time.
 */
export function toTint(hex: string, alphaPercent: number = DEFAULT_TINT_ALPHA): string {
  return `color-mix(in srgb, ${hex} ${alphaPercent}%, transparent)`;
}

/**
 * Full-opacity version of a hex color, used for the progress fill.
 */
export function toSolid(hex: string): string {
  return hex;
}
