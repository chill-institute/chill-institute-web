import type { ReactNode } from "react";

import { cn } from "../lib/cn";

/*
 * The Institute footer strip. Lives inside the page main, separated from
 * content by a 1px stone-950 top border. Left side carries identity, right
 * side carries links and the small "not affiliated with put.io" disclaimer
 * (per the design system's hard rule about independence).
 */
type InstituteFooterProps = {
  left: ReactNode;
  right?: ReactNode;
  className?: string;
};

function InstituteFooter({ left, right, className }: InstituteFooterProps) {
  return (
    <footer
      data-slot="institute-footer"
      className={cn(
        "mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-stone-950 py-6 text-[0.8125rem] text-stone-700 dark:border-stone-700 dark:text-stone-200",
        className,
      )}
    >
      <div>{left}</div>
      {right ? <div className="flex flex-wrap items-center gap-1">{right}</div> : null}
    </footer>
  );
}

export { InstituteFooter };
