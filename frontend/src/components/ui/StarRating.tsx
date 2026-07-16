import * as React from "react";

export interface StarRatingProps {
  mode: "read" | "input";
  rating: number;
  onChange?: (rating: number) => void;
  maxStars?: number;
}

export function StarRating({ mode, rating, onChange, maxStars = 5 }: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const displayedRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div 
      className="flex items-center gap-1"
      onMouseLeave={() => mode === "input" && setHoverRating(null)}
    >
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayedRating;

        if (mode === "read") {
          return (
            <span
              key={index}
              className={`text-2xl cursor-default transition-colors ${
                isFilled ? "text-accent" : "text-text-secondary/30"
              }`}
            >
              ★
            </span>
          );
        }

        return (
          <button
            key={index}
            type="button"
            onClick={() => onChange?.(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            className={`text-2xl transition-all scale-100 hover:scale-110 outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm ${
              isFilled ? "text-accent" : "text-text-secondary/30"
            }`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
