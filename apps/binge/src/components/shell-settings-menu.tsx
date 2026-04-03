import { useState } from "react";

import { SettingsModal, SettingsModalTrigger } from "@/components/settings-modal";

export function ShellSettingsMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SettingsModalTrigger compact onClick={() => setOpen(true)} />
      <SettingsModal open={open} onOpenChange={setOpen} />
    </>
  );
}
