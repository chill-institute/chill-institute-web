import { useEffect, useState } from "react";
import { Settings, X } from "lucide-react";

import { SettingsPanel } from "@/components/settings-panel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 640px)").matches : false,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 640px)");
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isDesktop;
}

function SettingsModalBody({ onClose }: { onClose: () => void }) {
  return (
    <section
      data-page="settings"
      className="relative overflow-hidden rounded-[28px] border border-stone-950/90 bg-stone-100 text-stone-950 shadow-[0_28px_80px_rgba(0,0,0,0.28)] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
    >
      <div className="border-b border-stone-950/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0))] px-5 py-4 dark:border-stone-100/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0))] sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-serif text-2xl leading-tight sm:text-[2rem]">
              Tune your binge setup
            </h2>
            <p className="mt-1 max-w-xl text-sm text-stone-600 dark:text-stone-400">
              Adjust your theme, download folder, and account preferences.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-stone-950/10 bg-stone-950/5 text-stone-700 transition-[background-color,transform] duration-150 ease-out hover:bg-stone-950/10 active:scale-[0.97] dark:border-stone-100/10 dark:bg-stone-100/5 dark:text-stone-200 dark:hover:bg-stone-100/10"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="max-h-[min(72vh,760px)] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
        <SettingsPanel />
      </div>
    </section>
  );
}

export function SettingsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogDescription className="sr-only">
          Adjust your binge preferences, download folder, and home page visibility.
        </DialogDescription>
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogContent
          showCloseButton={false}
          className="top-1/2 left-1/2 w-[min(92vw,720px)] -translate-x-1/2 -translate-y-1/2 p-0"
        >
          <SettingsModalBody onClose={() => onOpenChange(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer
      open={open}
      direction="bottom"
      onOpenChange={onOpenChange}
      modal
      shouldScaleBackground={false}
    >
      <DrawerTitle className="sr-only">Settings</DrawerTitle>
      <DrawerDescription className="sr-only">
        Adjust your binge preferences, download folder, and home page visibility.
      </DrawerDescription>
      <DrawerContent className="border-x-0 border-b-0 border-t-0 bg-transparent p-0 shadow-none">
        <div className="px-0 pb-0">
          <SettingsModalBody onClose={() => onOpenChange(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function SettingsModalTrigger({
  onClick,
  compact = false,
}: {
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size={compact ? "icon-sm" : "sm"}
      className={
        compact
          ? "rounded-full border border-stone-950/10 bg-stone-950/[0.04] text-stone-700 shadow-[0_1px_0_rgba(0,0,0,0.05)] transition-[background-color,transform] duration-150 ease-out hover:bg-stone-950/[0.08] active:scale-[0.97] dark:border-stone-100/10 dark:bg-stone-100/[0.04] dark:text-stone-200 dark:hover:bg-stone-100/[0.09]"
          : "rounded-full border border-stone-950/10 bg-stone-950/[0.04] px-3 text-stone-700 shadow-[0_1px_0_rgba(0,0,0,0.05)] transition-[background-color,transform] duration-150 ease-out hover:bg-stone-950/[0.08] active:scale-[0.97] dark:border-stone-100/10 dark:bg-stone-100/[0.04] dark:text-stone-200 dark:hover:bg-stone-100/[0.09]"
      }
      onClick={onClick}
      aria-label="Open settings"
    >
      <Settings className="h-4 w-4" />
      {compact ? null : <span>settings</span>}
    </Button>
  );
}
