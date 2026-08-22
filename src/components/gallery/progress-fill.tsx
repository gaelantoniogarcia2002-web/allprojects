type ProgressFillProps = {
  tintColor: string;
  solidColor: string;
  percent: number;
};

/**
 * Renders a card's progress visual: a transparent tint of `categoria.color`
 * as the full-size track, with a solid overlay whose width is `percent`
 * (already clamped to 0..100 by `computeProgress`).
 */
export function ProgressFill({ tintColor, solidColor, percent }: ProgressFillProps) {
  return (
    <div className="absolute inset-0" style={{ backgroundColor: tintColor }} data-testid="progress-tint">
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="absolute inset-y-0 left-0"
        style={{ backgroundColor: solidColor, width: `${percent}%` }}
      />
    </div>
  );
}
