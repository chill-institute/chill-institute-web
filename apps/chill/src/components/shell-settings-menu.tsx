import { useState } from "react";
import { Minus, Settings } from "lucide-react";

import { SettingsPanel } from "@/components/settings-panel";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@chill-institute/ui/components/ui/collapsible";

export function ShellSettingsMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-2">
      <CollapsibleTrigger
        render={
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-1.5 px-0 py-[3px] text-xs whitespace-nowrap text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100"
          >
            {open ? (
              <Minus className="size-3" aria-hidden="true" />
            ) : (
              <Settings className="size-3" aria-hidden="true" />
            )}
            <span>{open ? "hide settings" : "show settings"}</span>
          </button>
        }
      />
      <CollapsibleContent className="overflow-visible">
        <div className="mt-3 border-t border-dashed border-stone-950/10 pt-5 dark:border-stone-100/10">
          <SettingsPanel />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
