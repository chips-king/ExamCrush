"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const storageKey = "examcrush:theme";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    const initial = saved === "light" || saved === "dark" ? saved : getSystemTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    window.localStorage.setItem(storageKey, next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
      title={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
      className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-white text-ink/75 transition hover:border-mint hover:text-mint"
    >
      {theme === "dark" ? (
        <Sun aria-hidden="true" size={18} strokeWidth={2.4} />
      ) : (
        <Moon aria-hidden="true" size={18} strokeWidth={2.4} />
      )}
    </button>
  );
}
