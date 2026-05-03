import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

const Popover = PopoverPrimitive.Root;

const PopoverClose = PopoverPrimitive.Close;

const PopoverTrigger = PopoverPrimitive.Trigger;

function PopoverArrow(props: ComponentProps<typeof PopoverPrimitive.Arrow>) {
  return <PopoverPrimitive.Arrow {...props} className="fill-stone-950 dark:fill-stone-700" />;
}

function PopoverContent({
  align = "center",
  className,
  sideOffset = 0,
  children,
  ...props
}: { align?: "start" | "center" | "end"; sideOffset?: number } & ComponentProps<
  typeof PopoverPrimitive.Popup
>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        side="bottom"
        align={align}
        sideOffset={sideOffset}
        className="z-[70]"
      >
        <PopoverPrimitive.Popup
          className={cn(
            "ui-popup z-[70] w-72 rounded-md border border-stone-950 bg-stone-100 p-4 text-stone-950 shadow-md outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50",
            className,
          )}
          {...props}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverArrow, PopoverClose, PopoverContent, PopoverTrigger };
