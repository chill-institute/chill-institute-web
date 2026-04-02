import { useState } from "react";
import { Minus, Settings } from "lucide-react";

import { SettingsPanel } from "@/components/settings-panel";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function ShellSettingsMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-1">
      <CollapsibleTrigger
        render={
          <button
            type="button"
            className="block cursor-pointer text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100"
          >
            <div className="flex flex-row items-center space-x-1">
              {open ? <Minus className="text-xs" /> : <Settings className="text-xs" />}
              <span className="text-sm">{open ? "Hide settings" : "Show settings"}</span>
            </div>
          </button>
        }
      />
      <CollapsibleContent className="overflow-visible">
        <div className="py-4">
          <SettingsPanel />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
