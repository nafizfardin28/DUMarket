/** Read-only stars, e.g. an average of 3.7 renders as 3 full + 1 partial-ish
 * (rounded to nearest whole star — good enough without SVG clip-paths). */
export function StarDisplay({ value = 0, size = "text-base" }) {
  const rounded = Math.round(value);
  return (
    <span className={`${size} leading-none`} aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rounded ? "text-amber-400" : "text-stone-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

/** Interactive 1-5 star picker. */
export function StarPicker({ value = 0, onChange, size = "text-2xl" }) {
  return (
    <div className={`${size} leading-none`}>
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(starValue)}
            aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
            className={`transition-colors ${starValue <= value ? "text-amber-400" : "text-stone-300 hover:text-amber-300"}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
