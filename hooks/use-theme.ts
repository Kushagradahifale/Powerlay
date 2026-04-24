"use client"

import { useEffect, useState } from "react"

type Theme = "dark" | "light"

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark")

  useEffect(() => {
    const saved = localStorage.getItem("powerlay-theme") as Theme | null
    const initial = saved ?? "dark"
    setTheme(initial)
    applyTheme(initial)
  }, [])

  function applyTheme(t: Theme) {
    const html = document.documentElement
    if (t === "dark") {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }
  }

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark"
    setTheme(next)
    applyTheme(next)
    localStorage.setItem("powerlay-theme", next)
  }

  return { theme, toggle }
}
