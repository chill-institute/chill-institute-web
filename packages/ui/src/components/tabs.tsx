import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";

import { cn } from "../lib/cn";

/*
 * Visual tab strip per the design system: inactive tabs are borderless and
 * pull text-stone-600 → stone-950 on hover; the active tab is a bordered
 * stamp surface (1px stone-950, 1px,1px shadow). Pressing an active tab
 * translates 1px,1px and drops the shadow.
 *
 * This is intentionally not a full ARIA tabs primitive — it is a button
 * group whose `value` prop drives the active state. If keyboard arrow-key
 * navigation becomes a hard requirement we should swap to @base-ui/react
 * tabs.
 */
type TabsProps = {
  className?: string;
  children: ReactNode;
};

function Tabs({ className, children }: TabsProps) {
  return (
    <div data-slot="tabs" className={cn("ml-2 flex items-center gap-1", className)} role="tablist">
      {children}
    </div>
  );
}

type TabProps = ComponentPropsWithoutRef<typeof ButtonPrimitive> & {
  active?: boolean;
};

function Tab({ active, className, ...props }: TabProps) {
  return (
    <ButtonPrimitive
      role="tab"
      aria-selected={active || undefined}
      data-active={active || undefined}
      className={cn(
        // Constant font-weight across states avoids the sub-pixel layout
        // shift a 400→500 swap causes when toggling active.
        "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-transparent bg-transparent px-3 text-sm text-stone-600 motion-safe:transition-[color,background-color,box-shadow,transform] motion-safe:duration-150 motion-safe:ease-[var(--ease-out)] hover-hover:hover:bg-stone-200 hover-hover:hover:text-stone-950 dark:text-stone-300 dark:hover-hover:hover:bg-stone-800 dark:hover-hover:hover:text-stone-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        active &&
          "border-stone-950 bg-stone-100 text-stone-950 shadow-[1px_1px_0_var(--color-stone-950)] hover-hover:hover:bg-stone-100 active:translate-x-px active:translate-y-px active:shadow-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:shadow-[1px_1px_0_var(--color-stone-700)] dark:hover-hover:hover:bg-stone-900",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, Tab };
