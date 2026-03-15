import { useEffect, useState } from "react";

type ThemePreference = "dark" | "light" | "system";

const THEME_STORAGE_KEY = "chill.theme";
const LIGHT_THEME_COLOR = "#d6d3d1";
const DARK_THEME_COLOR = "#292524";

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

function readStoredTheme(): ThemePreference {
  const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
  return raw === "light" || raw === "dark" || raw === "system" ? raw : "system";
}

function applyTheme(theme: ThemePreference, systemDark: boolean) {
  const isDark = theme === "dark" || (theme === "system" && systemDark);
  const color = isDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR;
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  document.documentElement.style.backgroundColor = color;
  document.body.style.backgroundColor = color;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const systemDark = useSystemTheme();

  useEffect(() => {
    setThemeState(readStoredTheme());
  }, []);

  useEffect(() => {
    applyTheme(theme, systemDark);
  }, [theme, systemDark]);

  const setTheme = (next: ThemePreference) => {
    setThemeState(next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next, systemDark);
  };

  return { theme, setTheme, systemDark };
}
