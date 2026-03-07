"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MaterialIcon, Button } from "@/components/ui";
import { siteConfig, routes } from "@/config";
import { useAuth } from "@/context/AuthContext";
import type { NavLink } from "@/types";

const navLinks: NavLink[] = [
  { label: "Home", href: routes.home },
  { label: "Recipes", href: routes.recipes, icon: "menu_book" },
  { label: "Shop", href: routes.orderBooks, icon: "shopping_bag" },
  { label: "Membership", href: routes.membership, icon: "card_membership" },
  {
    label: "Community",
    href: "#",
    icon: "groups",
    children: [
      { label: "Submit a Recipe", href: routes.addRecipe, icon: "edit_note" },
      { label: "Feedback", href: routes.feedback, icon: "rate_review" },
    ],
  },
  {
    label: "About",
    href: "#",
    icon: "info",
    children: [
      { label: "Our Story", href: routes.about, icon: "auto_stories" },
      { label: "FAQ", href: routes.faq, icon: "help" },
      { label: "Contact Us", href: routes.contact, icon: "mail" },
      { label: "Careers", href: routes.careers, icon: "work" },
    ],
  },
];

/* ─── Desktop dropdown item ─── */
function DesktopNavItem({ link }: { link: NavLink }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasChildren = link.children && link.children.length > 0;

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!hasChildren) {
    return (
      <Link
        href={link.href}
        className="relative text-sm font-semibold text-text-muted transition-colors hover:text-primary dark:text-gray-300 dark:hover:text-white"
      >
        {link.label}
      </Link>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className="flex items-center gap-1 text-sm font-semibold text-text-muted transition-colors hover:text-primary dark:text-gray-300 dark:hover:text-white"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {link.label}
        <MaterialIcon
          name="expand_more"
          className={`text-[18px] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 rounded-2xl border border-gray-100 bg-white/95 py-2 shadow-xl shadow-black/8 backdrop-blur-xl dark:border-white/10 dark:bg-surface-dark/95 min-w-[200px]">
          {link.children!.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-primary/5 hover:text-primary dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
              onClick={() => setOpen(false)}
            >
              {child.icon && (
                <MaterialIcon
                  name={child.icon}
                  className="text-[18px] text-primary/60"
                />
              )}
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Mobile accordion group ─── */
function MobileNavItem({
  link,
  onNavigate,
}: {
  link: NavLink;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = link.children && link.children.length > 0;

  if (!hasChildren) {
    return (
      <Link
        href={link.href}
        className="flex items-center gap-3 text-lg font-semibold text-text-main transition-colors hover:text-primary dark:text-white"
        onClick={onNavigate}
      >
        {link.icon && (
          <MaterialIcon
            name={link.icon}
            className="text-[22px] text-primary/60"
          />
        )}
        {link.label}
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <button
        className="flex items-center gap-3 text-lg font-semibold text-text-main transition-colors hover:text-primary dark:text-white"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {link.icon && (
          <MaterialIcon
            name={link.icon}
            className="text-[22px] text-primary/60"
          />
        )}
        {link.label}
        <MaterialIcon
          name="expand_more"
          className={`text-[20px] transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="mt-2 flex flex-col items-center gap-2">
          {link.children!.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-base font-medium text-text-muted transition-colors hover:bg-primary/5 hover:text-primary dark:text-gray-300"
              onClick={onNavigate}
            >
              {child.icon && (
                <MaterialIcon
                  name={child.icon}
                  className="text-[18px] text-primary/50"
                />
              )}
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Navbar ─── */
export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoggedIn, logout } = useAuth();

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <div className="sticky top-0 z-50 flex w-full justify-center p-4">
      <header className="flex w-full max-w-[1100px] items-center justify-between whitespace-nowrap rounded-full border border-primary/10 bg-white/85 px-6 py-3 shadow-lg shadow-primary/8 backdrop-blur-xl dark:border-white/5 dark:bg-surface-dark/85">
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
        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <DesktopNavItem key={link.label} link={link} />
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            className="text-text-main dark:text-white lg:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <MaterialIcon name={mobileMenuOpen ? "close" : "menu"} />
          </button>

          {/* Auth buttons (desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            {isLoggedIn ? (
              <>
                {user?.role === "ADMIN" && (
                  <Link href={routes.adminDashboard}>
                    <Button className="h-10 px-4 text-sm bg-black hover:bg-gray-800 text-white shadow-md transition-shadow mr-2">
                      <MaterialIcon
                        name="admin_panel_settings"
                        className="mr-2 text-[18px]"
                      />
                      Admin Portal
                    </Button>
                  </Link>
                )}
                <Link href={routes.profile}>
                  <Button
                    variant="outline"
                    className="h-10 px-4 text-sm border-gray-200 hover:border-primary hover:bg-primary/5 hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <MaterialIcon name="person" className="text-[18px]" />
                    <span className="truncate max-w-[120px] font-bold">
                      {user?.fullName ?? user?.username}
                    </span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="h-10 w-10 p-0 text-sm border-gray-200 hover:border-red-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors"
                  onClick={logout}
                  title="Logout"
                >
                  <MaterialIcon name="logout" className="text-[18px]" />
                </Button>
              </>
            ) : (
              <>
                <Link href={routes.register}>
                  <Button
                    variant="outline"
                    className="h-10 px-5 text-sm border-primary/30 hover:border-primary hover:bg-primary/5"
                  >
                    Register
                  </Button>
                </Link>
                <Link href={routes.login}>
                  <Button className="h-10 px-6 text-sm shadow-md shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[72px] z-40 overflow-y-auto bg-white/95 backdrop-blur-md dark:bg-surface-dark/95 lg:hidden">
          <nav className="flex flex-col items-center gap-5 px-6 pt-10 pb-20">
            {navLinks.map((link) => (
              <MobileNavItem
                key={link.label}
                link={link}
                onNavigate={closeMobile}
              />
            ))}

            {/* Divider */}
            <div className="my-2 h-px w-40 bg-gray-200 dark:bg-white/10" />

            {/* Auth actions */}
            <div className="flex gap-3 flex-wrap justify-center">
              {isLoggedIn ? (
                <>
                  {user?.role === "ADMIN" && (
                    <Link href={routes.adminDashboard} onClick={closeMobile}>
                      <Button className="h-12 px-6 text-base bg-black hover:bg-gray-800 text-white w-full">
                        <MaterialIcon
                          name="admin_panel_settings"
                          className="mr-2 text-[20px]"
                        />
                        Admin Portal
                      </Button>
                    </Link>
                  )}
                  <Link href={routes.profile} onClick={closeMobile}>
                    <Button
                      variant="outline"
                      className="h-12 px-6 text-base border-gray-200 flex items-center gap-2"
                    >
                      <MaterialIcon name="person" className="text-[20px]" />
                      My Account ({user?.fullName ?? user?.username})
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="h-12 px-6 text-base border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-2"
                    onClick={() => {
                      logout();
                      closeMobile();
                    }}
                  >
                    <MaterialIcon name="logout" className="text-[20px]" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href={routes.register} onClick={closeMobile}>
                    <Button
                      variant="outline"
                      className="h-12 px-6 text-base border-primary/30"
                    >
                      Register
                    </Button>
                  </Link>
                  <Link href={routes.login} onClick={closeMobile}>
                    <Button className="h-12 px-6 text-base">Login</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
