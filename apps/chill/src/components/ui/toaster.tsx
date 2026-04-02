import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

function getTheme(): ToasterProps["theme"] {
  try {
    const stored = window.localStorage.getItem("chill.theme");
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    // localStorage unavailable
  }
  return "system";
}

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      theme={getTheme()}
      toastOptions={{
        classNames: {
          actionButton:
            "group-[.toast]:bg-stone-900 group-[.toast]:text-stone-50 dark:group-[.toast]:bg-stone-100 dark:group-[.toast]:text-stone-950 lowercase",
          cancelButton:
            "group-[.toast]:bg-stone-100 group-[.toast]:text-stone-500 dark:group-[.toast]:bg-stone-800 dark:group-[.toast]:text-stone-400",
          description: "group-[.toast]:text-stone-600 dark:group-[.toast]:text-stone-400",
          toast:
            "group toast group-[.toaster]:bg-stone-100 group-[.toaster]:text-stone-950 group-[.toaster]:border-stone-950 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-stone-900 dark:group-[.toaster]:text-stone-50 dark:group-[.toaster]:border-stone-700",
        },
      }}
      {...props}
    />
  );
}
