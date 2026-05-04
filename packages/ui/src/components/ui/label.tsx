import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export function Label({ className, htmlFor, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer",
        className,
      )}
      htmlFor={htmlFor}
      {...props}
    />
  );
}
