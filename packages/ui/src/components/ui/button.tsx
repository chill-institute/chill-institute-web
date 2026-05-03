import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/cn";

/*
 * The signature "stamp" button. 1px stone-950 border, 1px,1px stamp shadow,
 * pressing translates 1px,1px and drops the shadow so the button slides into
 * its stamp. Press transition is 120ms / --ease-out.
 *
 * Default variant = bordered surface (.btn). Primary = filled stone-950.
 * Ghost = no border/shadow, hover bg only. Success/off are transparent with
 * a soft border, used for "sent" / "down" terminal states.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded border border-transparent bg-clip-padding text-sm leading-none whitespace-nowrap select-none disabled:cursor-not-allowed disabled:opacity-70 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-stone-950 bg-stone-100 text-stone-950 shadow-[1px_1px_0_var(--color-stone-950)] hover-hover:hover:bg-stone-200 active:translate-x-px active:translate-y-px active:shadow-none active:duration-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:shadow-[1px_1px_0_var(--color-stone-700)] dark:hover-hover:hover:bg-stone-800",
        primary:
          "border-stone-950 bg-stone-950 text-stone-50 shadow-[1px_1px_0_var(--color-stone-950)] hover-hover:hover:bg-stone-800 active:translate-x-px active:translate-y-px active:shadow-none active:duration-100 dark:border-stone-100 dark:bg-stone-100 dark:text-stone-950 dark:shadow-[1px_1px_0_var(--color-stone-700)] dark:hover-hover:hover:bg-stone-200",
        ghost:
          "text-stone-700 hover-hover:hover:bg-stone-200 hover-hover:hover:text-stone-950 dark:text-stone-300 dark:hover-hover:hover:bg-stone-800 dark:hover-hover:hover:text-stone-100 active:scale-[0.97] active:duration-100",
        outline:
          "border-stone-950 bg-transparent text-stone-950 hover-hover:hover:bg-stone-200 dark:border-stone-700 dark:text-stone-100 dark:hover-hover:hover:bg-stone-800",
        success:
          "border-stone-950/15 bg-transparent text-green-600 dark:border-stone-700/70 dark:text-green-400 cursor-default",
        off: "border-stone-950/15 bg-transparent text-stone-600 dark:border-stone-700/70 dark:text-stone-400 cursor-not-allowed",
        link: "text-stone-950 underline-offset-4 hover-hover:hover:underline dark:text-stone-100",
      },
      size: {
        default: "h-7.25 px-2.5",
        sm: "h-5.5 px-2 text-xs",
        lg: "h-9 px-3.5 text-[0.9375rem]",
        icon: "size-8 px-0",
        "icon-sm": "size-7 px-0 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const PRESS_TRANSITION =
  "motion-safe:transition-[transform,background-color,border-color,color,box-shadow] motion-safe:duration-150 motion-safe:ease-[var(--ease-out)]";

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), PRESS_TRANSITION, className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
