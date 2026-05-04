import { Clipboard, ClipboardCheck, ClipboardX } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "../lib/cn";

/*
 * Stamp-style copy button used wherever the design needs the "1px,1px"
 * primary action treatment around a clipboard icon. Switches icon and
 * accessible label across idle / copied / error states and resets after
 * 2s.
 */
type CopyButtonProps = {
  value: string;
  className?: string;
};

function CopyButton({ value, className }: CopyButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timeout = window.setTimeout(() => setState("idle"), 2000);
    return () => window.clearTimeout(timeout);
  }, [state]);

  const icon =
    state === "copied" ? <ClipboardCheck /> : state === "error" ? <ClipboardX /> : <Clipboard />;

  return (
    <button
      type="button"
      data-slot="copy-button"
      className={cn("btn min-w-8 cursor-copy px-2", className)}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setState("copied");
        } catch {
          setState("error");
        }
      }}
      aria-label={
        state === "copied" ? "Copied link" : state === "error" ? "Failed to copy link" : "Copy link"
      }
      title={state === "copied" ? "copied" : state === "error" ? "failed to copy" : "copy link"}
    >
      <span key={state} className="animate-feedback-in flex items-center justify-center">
        {icon}
      </span>
    </button>
  );
}

export { CopyButton };
