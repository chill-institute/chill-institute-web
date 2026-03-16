import { Clipboard, ClipboardCheck, ClipboardX } from "lucide-react";
import { useEffect, useState } from "react";

export function CopyButton({ value, className = "" }: { value: string; className?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    if (state === "idle") {
      return;
    }
    const timeout = window.setTimeout(() => setState("idle"), 2000);
    return () => window.clearTimeout(timeout);
  }, [state]);

  const icon =
    state === "copied" ? <ClipboardCheck /> : state === "error" ? <ClipboardX /> : <Clipboard />;

  return (
    <button
      type="button"
      className={`btn min-w-8 cursor-copy px-2 ${className}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setState("copied");
        } catch {
          setState("error");
        }
      }}
      title={state === "copied" ? "copied" : state === "error" ? "failed to copy" : "copy link"}
    >
      <span key={state} className="flex items-center justify-center animate-feedback-in">
        {icon}
      </span>
    </button>
  );
}
