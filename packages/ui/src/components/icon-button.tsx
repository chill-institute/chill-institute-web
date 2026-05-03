import type { ComponentPropsWithoutRef } from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";

import { cn } from "../lib/cn";

/*
 * The 32px square icon button used in the sticky header right strip and
 * everywhere else a Lucide icon stands alone. No border by default; hover
 * fills with bg-hover. Pressing scales to 0.97 (not the stamp transform —
 * scale matches the close button and other tappable circles in the design).
 */
type IconButtonProps = ComponentPropsWithoutRef<typeof ButtonPrimitive>;

function IconButton({ className, ...props }: IconButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="icon-button"
      className={cn(
        "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-transparent bg-transparent text-stone-700 motion-safe:transition-[color,background-color,transform] motion-safe:duration-150 motion-safe:ease-[var(--ease-out)] hover-hover:hover:bg-stone-200 hover-hover:hover:text-stone-950 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 dark:text-stone-300 dark:hover-hover:hover:bg-stone-800 dark:hover-hover:hover:text-stone-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

export { IconButton };
