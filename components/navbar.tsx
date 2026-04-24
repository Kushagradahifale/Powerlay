"use client"

import Link from "next/link"
import { Search, ShoppingCart, User, Package, Sun, Moon, Layers } from "lucide-react"
import { useCartStore } from "@/lib/store"
import { useTheme } from "@/hooks/use-theme"

export function Navbar() {
  const cartCount = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0))
  const { theme, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full bg-navbar text-navbar-foreground border-b border-navbar-border">
      {/* Top strip */}
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-4 px-4 lg:px-6">

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 mr-4">
          <Layers className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight text-navbar-foreground">
            POWERLAY
          </span>
        </Link>

        {/* Search bar */}
        <div className="flex flex-1 items-stretch max-w-2xl">
          <div className="flex flex-1 items-center rounded-l-md bg-muted/20 border border-border/60 px-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search materials, services..."
              className="flex-1 bg-transparent px-2 py-2 text-sm text-navbar-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
          <button className="rounded-r-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            Search
          </button>
        </div>

        {/* Right actions */}
        <nav className="flex items-center gap-1 ml-4">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 hover:bg-white/10 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="text-[10px] text-muted-foreground hidden sm:block">Theme</span>
          </button>

          {/* Account */}
          <Link
            href="#"
            className="flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 hover:bg-white/10 transition-colors"
          >
            <User className="h-5 w-5" />
            <span className="text-[10px] text-muted-foreground hidden sm:block">Account</span>
          </Link>

          {/* Orders */}
          <Link
            href="#"
            className="flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 hover:bg-white/10 transition-colors"
          >
            <Package className="h-5 w-5" />
            <span className="text-[10px] text-muted-foreground hidden sm:block">Orders</span>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 hover:bg-white/10 transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground hidden sm:block">Cart</span>
          </Link>
        </nav>
      </div>

      {/* Sub-nav */}
      <div className="border-t border-navbar-border bg-navbar/80">
        <div className="mx-auto flex h-9 max-w-screen-2xl items-center gap-6 px-4 lg:px-6 overflow-x-auto">
          {["All Materials", "PLA", "ABS", "PETG", "Nylon", "Resin", "How It Works", "Pricing"].map((item) => (
            <Link
              key={item}
              href="#"
              className="shrink-0 text-xs text-muted-foreground hover:text-navbar-foreground transition-colors whitespace-nowrap"
            >
              {item}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
