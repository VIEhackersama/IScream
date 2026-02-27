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
      <header className="flex w-full max-w-[1024px] items-center justify-between whitespace-nowrap rounded-full bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md shadow-lg shadow-primary/5 px-6 py-3 border border-primary/10">
        {/* Logo */}
        <Link href={routes.home} className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <MaterialIcon name="icecream" filled className="text-[24px]" />
          </div>
          <h2 className="text-text-main dark:text-white text-lg font-extrabold tracking-tight">
            {siteConfig.name}
          </h2>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-text-main dark:text-white text-sm font-semibold hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            className="md:hidden text-text-main dark:text-white"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <MaterialIcon name={mobileMenuOpen ? "close" : "menu"} />
          </button>

          {/* Login button (desktop) */}
          <Link href={routes.login}>
            <Button className="hidden md:flex h-10 px-6 text-sm shadow-md shadow-primary/20">
              Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[72px] z-40 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md md:hidden">
          <nav className="flex flex-col items-center gap-6 pt-12">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-text-main dark:text-white text-lg font-semibold hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href={routes.login} onClick={() => setMobileMenuOpen(false)}>
              <Button className="h-12 px-8 text-base mt-4">Login</Button>
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
