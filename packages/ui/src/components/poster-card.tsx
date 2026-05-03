import type { CSSProperties, ReactNode } from "react";
import { Star } from "lucide-react";

import { cn } from "../lib/cn";

/*
 * The poster card from the binge browse grid. The "classic" silhouette:
 *   1px stone-950 border, rounded-sm (4px), overflow-hidden,
 *   2:3 aspect-ratio poster panel + a 10/12 padded meta block below.
 *
 * `image` lets callers pass a TMDb-style poster URL; without one we fall
 * back to a flat stone surface — never a generated gradient — so missing
 * imagery doesn't pretend to be art.
 *
 * Hover lifts the card by 2px and stamps the 1px,1px shadow. The lift is
 * visual only; tapping the card fires the `onClick` handler and the card
 * is `role="button"` for keyboard activation.
 */
type PosterCardProps = {
  title: string;
  image?: string | null;
  /** Pre-formatted rating, e.g. "8.5" — caller decides precision. */
  rating?: string | null;
  /** Pre-formatted year, e.g. "2024". */
  year?: string | null;
  /** Optional secondary line below the rating (genre chip row, etc.). */
  footer?: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
};

function PosterCard({
  title,
  image,
  rating,
  year,
  footer,
  className,
  style,
  onClick,
}: PosterCardProps) {
  const interactive = Boolean(onClick);
  return (
    <article
      data-slot="poster-card"
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={cn(
        "group flex flex-col overflow-hidden rounded border border-stone-950 bg-stone-100 motion-safe:transition-[transform,box-shadow] motion-safe:duration-[180ms] motion-safe:ease-[var(--ease-out)] dark:border-stone-700 dark:bg-stone-900",
        interactive &&
          "cursor-pointer motion-safe:hover-hover:hover:-translate-y-0.5 motion-safe:hover-hover:hover:shadow-[1px_1px_0_var(--color-stone-950)] active:translate-y-0 active:shadow-none active:duration-100 motion-safe:dark:hover-hover:hover:shadow-[1px_1px_0_var(--color-stone-700)]",
        className,
      )}
      style={style}
    >
      <div className="relative aspect-[2/3] border-b border-stone-950 bg-stone-300 dark:border-stone-700 dark:bg-stone-800">
        {image ? (
          <img
            src={image}
            alt={title}
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-end p-2.5 font-serif text-sm leading-tight tracking-tight text-stone-700 dark:text-stone-300">
            {title}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 px-3 pt-2.5 pb-3 text-[0.8125rem] text-stone-600 dark:text-stone-300">
        <h5 className="m-0 break-words font-serif text-base leading-tight tracking-tight text-stone-950 dark:text-stone-100">
          {title}
        </h5>
        {(rating != null || year != null) && (
          <div className="flex items-center gap-1.5 tabular-nums">
            {rating != null && (
              <>
                <Star
                  className="size-3 fill-amber-400 text-amber-400"
                  strokeWidth={0}
                  aria-hidden="true"
                />
                <span className="text-stone-950 dark:text-stone-100">{rating}</span>
              </>
            )}
            {rating != null && year != null && (
              <span className="text-stone-400 dark:text-stone-500">·</span>
            )}
            {year != null && <span>{year}</span>}
          </div>
        )}
        {footer}
      </div>
    </article>
  );
}

export { PosterCard };
