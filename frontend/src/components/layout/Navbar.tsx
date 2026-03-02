"use client";

import { useState } from "react";
import Link from "next/link";
import { MaterialIcon, Button } from "@/components/ui";
import { siteConfig, routes } from "@/config";
import type { NavLink } from "@/types";

const navLinks: NavLink[] = [
  { label: "Home", href: routes.home },
  { label: "Free Recipes", href: routes.recipes },
  { label: "Order Books", href: routes.orderBooks },
  { label: "Add Recipe", href: routes.addRecipe },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50 flex w-full justify-center p-4">
      <header className="flex w-full max-w-[1024px] items-center justify-between whitespace-nowrap rounded-full border border-primary/10 bg-white/85 px-6 py-3 shadow-lg shadow-primary/8 backdrop-blur-xl dark:border-white/5 dark:bg-surface-dark/85">
        {/* Logo */}
        <Link href={routes.home} className="flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-full text-white"
            style={{ background: "linear-gradient(135deg, #ee2b52, #ff8fa3)" }}
          >
            <MaterialIcon name="icecream" filled className="text-[22px]" />
          </div>
          <h2 className="font-serif-display text-lg font-bold tracking-tight text-text-main dark:text-white">
            {siteConfig.name}
          </h2>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-semibold text-text-muted transition-colors hover:text-primary dark:text-gray-300 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            className="text-text-main dark:text-white md:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <MaterialIcon name={mobileMenuOpen ? "close" : "menu"} />
          </button>

          {/* Auth buttons (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <Link href={routes.register}>
              <Button variant="outline" className="h-10 px-5 text-sm border-primary/30 hover:border-primary hover:bg-primary/5">
                Register
              </Button>
            </Link>
            <Link href={routes.login}>
              <Button className="h-10 px-6 text-sm shadow-md shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[72px] z-40 bg-white/95 backdrop-blur-md dark:bg-surface-dark/95 md:hidden">
          <nav className="flex flex-col items-center gap-6 pt-12">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg font-semibold text-text-main transition-colors hover:text-primary dark:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-3 mt-4">
              <Link href={routes.register} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="h-12 px-6 text-base border-primary/30">Register</Button>
              </Link>
              <Link href={routes.login} onClick={() => setMobileMenuOpen(false)}>
                <Button className="h-12 px-6 text-base">Login</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
