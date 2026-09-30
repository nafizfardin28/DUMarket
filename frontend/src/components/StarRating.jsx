import { StarIcon } from "./icons";

/** Read-only stars, e.g. an average of 3.7 renders as 3 full + 1 partial-ish
 * (rounded to nearest whole star — good enough without SVG clip-paths). */
export function StarDisplay({ value = 0, size = "h-4 w-4" }) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} filled={i < rounded} className={`${size} ${i < rounded ? "text-amber-400" : "text-zinc-200"}`} />
      ))}
    </span>
  );
}

/** Interactive 1-5 star picker. */
export function StarPicker({ value = 0, onChange, size = "h-7 w-7" }) {
  return (
    <div className="inline-flex gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(starValue)}
            aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
            className="transition-transform hover:scale-110"
          >
            <StarIcon
              filled={starValue <= value}
              className={`${size} transition-colors ${starValue <= value ? "text-amber-400" : "text-zinc-200"}`}
            />
          </button>
        );
      })}
    </div>
  );
}
