import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import type { VariantProps } from "class-variance-authority";
import { createContext, useContext, type ComponentProps } from "react";
import { toggleVariants } from "./toggle";
import { cn } from "../../lib/cn";

const ToggleGroupContext = createContext<VariantProps<typeof toggleVariants>>({
  size: "default",
  variant: "default",
});

function ToggleGroup({
  children,
  className,
  size,
  variant,
  ...props
}: ComponentProps<typeof ToggleGroupPrimitive> & VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive
      className={cn("flex items-center justify-center space-x-0.5", className)}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ size, variant }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

function ToggleGroupItem({
  children,
  className,
  size,
  variant,
  ...props
}: ComponentProps<typeof Toggle> & VariantProps<typeof toggleVariants>) {
  const context = useContext(ToggleGroupContext);

  return (
    <Toggle
      className={cn(
        toggleVariants({
          size: context.size ?? size,
          variant: context.variant ?? variant,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </Toggle>
  );
}

export { ToggleGroup, ToggleGroupItem };
