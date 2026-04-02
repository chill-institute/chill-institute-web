import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Check } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Props = {
  id: string;
  label: string;
  variant?: "default" | "small";
} & ComponentProps<typeof CheckboxPrimitive.Root>;

export function Checkbox({ id, label, variant = "default", ...props }: Props) {
  return (
    <div
      className={cn("flex items-end space-x-1.5", variant === "small" ? "text-sm space-x-1" : "")}
    >
      <CheckboxPrimitive.Root
        className={cn(
          "flex h-4 w-4 cursor-pointer appearance-none items-center justify-center rounded-sm outline-none",
          "select-none",
          "border border-solid border-stone-950 dark:border-stone-700",
          "bg-stone-100 dark:bg-stone-900",
          "hover:bg-stone-200 hover:dark:bg-stone-800 hover:transition-colors",
          variant === "small" ? "h-3 w-3" : "",
        )}
        id={id}
        {...props}
      >
        <CheckboxPrimitive.Indicator>
          <Check />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      <label className="leading-none select-none cursor-pointer" htmlFor={id}>
        {label}
      </label>
    </div>
  );
}
