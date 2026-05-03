import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";

import { cn } from "../lib/cn";

/*
 * SortRow is the toolbar that sits between the page title and the content
 * grid. It hosts a row of `SortPill` toggles separated by `<SortRow.Divider />`,
 * with an optional trailing count.
 */
type SortRowProps = {
  className?: string;
  children: ReactNode;
  count?: ReactNode;
};

function SortRow({ className, children, count }: SortRowProps) {
  return (
    <div
      data-slot="sort-row"
      className={cn(
        "mb-4.5 flex flex-wrap items-center gap-1.5 border-y border-stone-950 py-2 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-300",
        className,
      )}
    >
      {children}
      {count != null ? (
        <span className="ml-auto font-mono text-[0.6875rem] text-stone-600 dark:text-stone-300">
          {count}
        </span>
      ) : null}
    </div>
  );
}

function SortRowLabel({ children }: { children: ReactNode }) {
  return (
    <span className="pl-0.5 font-mono text-[0.6875rem] lowercase text-stone-600 dark:text-stone-300">
      {children}
    </span>
  );
}

function SortRowDivider() {
  return (
    <span
      aria-hidden="true"
      className="mx-1.5 h-5 w-px self-stretch bg-stone-950 dark:bg-stone-700"
    />
  );
}

type SortPillProps = ComponentPropsWithoutRef<typeof ButtonPrimitive> & {
  active?: boolean;
};

function SortPill({ active, className, ...props }: SortPillProps) {
  return (
    <ButtonPrimitive
      data-slot="sort-pill"
      data-active={active || undefined}
      aria-pressed={active}
      className={cn(
        // Constant font-weight across states avoids the sub-pixel layout
        // shift a 400→500 swap causes when toggling active.
        "inline-flex cursor-pointer items-center gap-1 rounded-md border border-transparent bg-transparent px-2.5 py-1 text-[0.8125rem] text-stone-700 motion-safe:transition-[color,background-color,box-shadow,transform] motion-safe:duration-150 motion-safe:ease-[var(--ease-out)] hover-hover:hover:bg-stone-200 hover-hover:hover:text-stone-950 dark:text-stone-200 dark:hover-hover:hover:bg-stone-800 dark:hover-hover:hover:text-stone-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
        active &&
          "border-stone-950 bg-stone-100 text-stone-950 shadow-[1px_1px_0_var(--color-stone-950)] hover-hover:hover:bg-stone-100 active:translate-x-px active:translate-y-px active:shadow-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:shadow-[1px_1px_0_var(--color-stone-700)] dark:hover-hover:hover:bg-stone-900",
        className,
      )}
      {...props}
    />
  );
}

export { SortRow, SortRowLabel, SortRowDivider, SortPill };
