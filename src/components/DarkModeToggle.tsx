"use client";

import { useEffect } from "react";

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
    >
      <path
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 2v2.5M12 19.5V22M4.22 4.22 6 6M18 18l1.78 1.78M2 12h2.5M19.5 12H22M4.22 19.78 6 18M18 6l1.78-1.78"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
    >
      <path
        d="M21 13.2A8.6 8.6 0 0 1 10.8 3a7 7 0 1 0 10.2 10.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DarkModeToggle() {
  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    const resolvedTheme: "light" | "dark" =
      stored === "light" || stored === "dark" ? stored : "dark";
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.style.colorScheme = resolvedTheme;
  }, []);

  function onToggle() {
    const nextTheme =
      document.documentElement.classList.contains("dark") ? "light" : "dark";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.style.colorScheme = nextTheme;
    window.localStorage.setItem("theme", nextTheme);
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Toggle color mode"
      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200/70 bg-white/85 px-3 py-2 text-slate-700 shadow-sm backdrop-blur-md hover:bg-white dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-900"
    >
      <span className="sr-only">Toggle theme</span>
      <span className="dark:hidden">
        <SunIcon />
      </span>
      <span className="hidden dark:inline">
        <MoonIcon />
      </span>
    </button>
  );
}

