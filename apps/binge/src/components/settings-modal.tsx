import { useEffect, useState } from "react";
import { Settings, X } from "lucide-react";

import { SettingsPanel } from "@/components/settings-panel";
import { Button } from "@chill-institute/ui/components/ui/button";
import { IconButton } from "@chill-institute/ui/components/icon-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@chill-institute/ui/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@chill-institute/ui/components/ui/drawer";

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

function SettingsModalBody({ isDesktop, onClose }: { isDesktop: boolean; onClose: () => void }) {
  return (
    <section
      data-page="settings"
      className={
        isDesktop
          ? "relative overflow-hidden rounded-xl border border-solid border-stone-950 bg-stone-100 text-stone-950 shadow-[0_24px_48px_rgba(0,0,0,0.3)] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
          : "relative overflow-hidden bg-stone-100 text-stone-950 dark:bg-stone-900 dark:text-stone-100"
      }
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
          <IconButton
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-full border-stone-950 shadow-[1px_1px_0_var(--color-stone-950)] dark:border-stone-700 dark:shadow-[1px_1px_0_var(--color-stone-700)]"
          >
            <X />
          </IconButton>
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
          <SettingsModalBody isDesktop onClose={() => onOpenChange(false)} />
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
      <DrawerContent className="overflow-hidden rounded-t-3xl border-x-0 border-b-0 border-t-0 bg-stone-100 p-0 shadow-[0_-24px_48px_rgba(0,0,0,0.24)] dark:bg-stone-900">
        <div className="px-0 pb-0">
          <SettingsModalBody isDesktop={false} onClose={() => onOpenChange(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/*
 * Compact form lives in the sticky header right strip — uses IconButton
 * so it inherits the same hover/press vocabulary as the search/theme/etc
 * buttons it sits next to. Non-compact form is the labelled stamp button
 * used wherever settings need a verbal anchor.
 */
export function SettingsModalTrigger({
  onClick,
  compact = false,
}: {
  onClick: () => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <IconButton onClick={onClick} aria-label="Open settings">
        <Settings />
      </IconButton>
    );
  }

  return (
    <Button onClick={onClick} aria-label="Open settings">
      <Settings />
      <span>settings</span>
    </Button>
  );
}
