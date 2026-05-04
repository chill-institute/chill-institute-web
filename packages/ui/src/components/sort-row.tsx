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
        "border-border-strong text-fg-3 mb-4.5 flex flex-wrap items-center gap-1.5 border-y py-2 text-sm",
        className,
      )}
    >
      {children}
      {count != null ? (
        <span className="text-fg-3 ml-auto font-mono text-[0.6875rem] tabular-nums">{count}</span>
      ) : null}
    </div>
  );
}

function SortRowLabel({ children }: { children: ReactNode }) {
  return <span className="text-fg-3 pl-0.5 font-mono text-[0.6875rem] lowercase">{children}</span>;
}

function SortRowDivider() {
  return <span aria-hidden="true" className="bg-border-strong mx-1.5 h-5 w-px self-stretch" />;
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
        "text-fg-2 hover-hover:hover:bg-hover hover-hover:hover:text-fg-1 motion-safe:ease-[var(--ease-out)] inline-flex cursor-pointer items-center gap-1 rounded-md border border-transparent bg-transparent px-2.5 py-1 text-[0.8125rem] motion-safe:transition-[color,background-color,box-shadow,transform] motion-safe:duration-150 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
        active &&
          "border-border-strong bg-surface text-fg-1 shadow-[1px_1px_0_var(--color-border-strong)] hover-hover:hover:bg-surface active:translate-x-px active:translate-y-px active:shadow-none",
        className,
      )}
      {...props}
    />
  );
}

export { SortRow, SortRowLabel, SortRowDivider, SortPill };
