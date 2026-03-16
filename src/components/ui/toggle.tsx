import { cva } from "class-variance-authority";

export const toggleVariants = cva(
  "inline-flex cursor-pointer items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-[transform,background-color,color] duration-[140ms] ease-[var(--ease-out)] hover:bg-stone-100 hover:text-stone-500 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[pressed]:bg-stone-100 data-[pressed]:text-stone-900 dark:ring-offset-stone-950 dark:hover:bg-stone-800 dark:hover:text-stone-400 dark:data-[pressed]:bg-stone-900 dark:data-[pressed]:text-stone-50",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "px-1.5 py-1",
      },
      variant: {
        default: "bg-transparent",
      },
    },
  },
);
