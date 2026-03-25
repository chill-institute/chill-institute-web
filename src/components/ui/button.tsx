import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-oklch(0.923 0.003 48.717) border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-oklch(0.709 0.01 56.259) focus-visible:ring-3 focus-visible:ring-oklch(0.709 0.01 56.259)/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-oklch(0.577 0.245 27.325) aria-invalid:ring-3 aria-invalid:ring-oklch(0.577 0.245 27.325)/20 dark:aria-invalid:border-oklch(0.577 0.245 27.325)/50 dark:aria-invalid:ring-oklch(0.577 0.245 27.325)/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 dark:border-oklch(1 0 0 / 10%) dark:focus-visible:border-oklch(0.553 0.013 58.071) dark:focus-visible:ring-oklch(0.553 0.013 58.071)/50 dark:aria-invalid:border-oklch(0.704 0.191 22.216) dark:aria-invalid:ring-oklch(0.704 0.191 22.216)/20 dark:dark:aria-invalid:border-oklch(0.704 0.191 22.216)/50 dark:dark:aria-invalid:ring-oklch(0.704 0.191 22.216)/40",
  {
    variants: {
      variant: {
        default:
          "bg-oklch(0.216 0.006 56.043) text-oklch(0.985 0.001 106.423) [a]:hover:bg-oklch(0.216 0.006 56.043)/80 dark:bg-oklch(0.923 0.003 48.717) dark:text-oklch(0.216 0.006 56.043) dark:[a]:hover:bg-oklch(0.923 0.003 48.717)/80",
        outline:
          "border-oklch(0.923 0.003 48.717) bg-oklch(1 0 0) hover:bg-oklch(0.97 0.001 106.424) hover:text-oklch(0.147 0.004 49.25) aria-expanded:bg-oklch(0.97 0.001 106.424) aria-expanded:text-oklch(0.147 0.004 49.25) dark:border-oklch(0.923 0.003 48.717) dark:bg-oklch(0.923 0.003 48.717)/30 dark:hover:bg-oklch(0.923 0.003 48.717)/50 dark:border-oklch(1 0 0 / 10%) dark:bg-oklch(0.147 0.004 49.25) dark:hover:bg-oklch(0.268 0.007 34.298) dark:hover:text-oklch(0.985 0.001 106.423) dark:aria-expanded:bg-oklch(0.268 0.007 34.298) dark:aria-expanded:text-oklch(0.985 0.001 106.423) dark:dark:border-oklch(1 0 0 / 15%) dark:dark:bg-oklch(1 0 0 / 15%)/30 dark:dark:hover:bg-oklch(1 0 0 / 15%)/50",
        secondary:
          "bg-oklch(0.97 0.001 106.424) text-oklch(0.216 0.006 56.043) hover:bg-oklch(0.97 0.001 106.424)/80 aria-expanded:bg-oklch(0.97 0.001 106.424) aria-expanded:text-oklch(0.216 0.006 56.043) dark:bg-oklch(0.268 0.007 34.298) dark:text-oklch(0.985 0.001 106.423) dark:hover:bg-oklch(0.268 0.007 34.298)/80 dark:aria-expanded:bg-oklch(0.268 0.007 34.298) dark:aria-expanded:text-oklch(0.985 0.001 106.423)",
        ghost:
          "hover:bg-oklch(0.97 0.001 106.424) hover:text-oklch(0.147 0.004 49.25) aria-expanded:bg-oklch(0.97 0.001 106.424) aria-expanded:text-oklch(0.147 0.004 49.25) dark:hover:bg-oklch(0.97 0.001 106.424)/50 dark:hover:bg-oklch(0.268 0.007 34.298) dark:hover:text-oklch(0.985 0.001 106.423) dark:aria-expanded:bg-oklch(0.268 0.007 34.298) dark:aria-expanded:text-oklch(0.985 0.001 106.423) dark:dark:hover:bg-oklch(0.268 0.007 34.298)/50",
        destructive:
          "bg-oklch(0.577 0.245 27.325)/10 text-oklch(0.577 0.245 27.325) hover:bg-oklch(0.577 0.245 27.325)/20 focus-visible:border-oklch(0.577 0.245 27.325)/40 focus-visible:ring-oklch(0.577 0.245 27.325)/20 dark:bg-oklch(0.577 0.245 27.325)/20 dark:hover:bg-oklch(0.577 0.245 27.325)/30 dark:focus-visible:ring-oklch(0.577 0.245 27.325)/40 dark:bg-oklch(0.704 0.191 22.216)/10 dark:text-oklch(0.704 0.191 22.216) dark:hover:bg-oklch(0.704 0.191 22.216)/20 dark:focus-visible:border-oklch(0.704 0.191 22.216)/40 dark:focus-visible:ring-oklch(0.704 0.191 22.216)/20 dark:dark:bg-oklch(0.704 0.191 22.216)/20 dark:dark:hover:bg-oklch(0.704 0.191 22.216)/30 dark:dark:focus-visible:ring-oklch(0.704 0.191 22.216)/40",
        link: "text-oklch(0.216 0.006 56.043) underline-offset-4 hover:underline dark:text-oklch(0.923 0.003 48.717)",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button };
