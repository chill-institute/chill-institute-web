import type { ReactNode } from "react";

import { cn } from "../lib/cn";

/*
 * Sticky header for the binge browse shell. Pinned to the top of the
 * viewport with a translucent stone-100/88 backdrop blur — one of only two
 * places in the design system that uses transparency. Bottom border is the
 * canonical 1px stone-950 / stone-700 hard line.
 *
 * The header is a flex row: brand on the left, optional `tabs` slot,
 * and a `right` slot pinned with `ml-auto`. Layout details (spacing
 * between brand/tabs/right) intentionally match the prototype HTML.
 */
type StickyHeaderProps = {
  children?: ReactNode;
  brand: ReactNode;
  tabs?: ReactNode;
  right?: ReactNode;
  className?: string;
};

function StickyHeader({ brand, tabs, right, children, className }: StickyHeaderProps) {
  return (
    <header
      data-slot="sticky-header"
      className={cn(
        "sticky top-0 z-40 flex items-center gap-3 border-b border-stone-950 bg-stone-100/88 px-4 py-2.5 backdrop-blur-md backdrop-saturate-150 dark:border-stone-700 dark:bg-stone-900/88",
        className,
      )}
    >
      {brand}
      {tabs}
      {children}
      {right ? <div className="ml-auto flex items-center gap-1">{right}</div> : null}
    </header>
  );
}

export { StickyHeader };
