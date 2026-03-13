import { useEffect, useState } from "react";

function useSystemTheme() {
  const [systemDark, setSystemDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return systemDark;
}

function applyTheme(theme: "dark" | "light" | "system", systemDark: boolean) {
  const isDark = theme === "dark" || (theme === "system" && systemDark);
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<"dark" | "light" | "system">("system");
  const systemDark = useSystemTheme();

  useEffect(() => {
    const raw = window.localStorage.getItem("chill.theme");
    setThemeState(raw === "light" || raw === "dark" || raw === "system" ? raw : "system");
  }, []);

  useEffect(() => {
    applyTheme(theme, systemDark);
  }, [theme, systemDark]);

  const setTheme = (next: "dark" | "light" | "system") => {
    setThemeState(next);
    window.localStorage.setItem("chill.theme", next);
    applyTheme(next, systemDark);
  };

  return { theme, setTheme, systemDark };
}
