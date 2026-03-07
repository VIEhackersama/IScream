"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { MaterialIcon } from "@/components/ui";
import { routes } from "@/config";
import type { ReactNode } from "react";

interface RequireAuthProps {
  children: ReactNode;
  /** Optional label shown in the page, e.g. "recipes", "your orders" */
  featureName?: string;
}

const PERKS = [
  { icon: "menu_book", label: "Browse exclusive ice-cream recipes" },
  { icon: "shopping_bag", label: "Place & track your orders" },
  { icon: "edit_note", label: "Submit your own recipes to the community" },
  { icon: "stars", label: "Unlock premium membership content" },
];

const COVER_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDnZJctqOY43WhOZ5XpuScd8y6iLiOEVEwEWB9CFAvQ1Gcn-E8zUwTT_Ovbf-Xf3xlA9hJ93Hv1n4RoLS0D4hikPDSln8MlJXGvF1ZH74EEVeqmaS2UJIIExBB0JgNLgt9plZSmBK03DNXgtuQIFVvQScSivBp4-Lbcy35b_9rarXuemLikygw0CH2vLGRjmz2fJCSxKxMX83tk-mD7_Z6qz_SrqraioDFcE632y7z_--7ehORWEeIGsgjFhrvI1ALcoGiSsUNerlE";

export function RequireAuth({
  children,
  featureName = "this page",
}: RequireAuthProps) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="relative w-full min-h-[85vh] flex items-center justify-center py-12 px-4 overflow-hidden">
        {/* Background decorative blobs */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-120 w-120 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 rounded-full bg-cream/70 dark:bg-primary/5 blur-3xl" />

        {/* Card */}
        <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl shadow-2xl border border-white/70 dark:border-white/5 grid lg:grid-cols-2">
          {/* ── Left: visual panel ── */}
          <div
            className="relative hidden lg:flex min-h-135 flex-col justify-end bg-cover bg-center p-10"
            style={{ backgroundImage: `url('${COVER_IMAGE}')` }}
          >
            {/* Overlays */}
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-linear-to-r from-primary/25 to-transparent" />

            {/* Floating badge */}
            <div className="absolute top-8 left-8 right-8 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                <MaterialIcon name="icecream" className="text-sm" />
                IScream Community
              </span>
            </div>

            {/* Bottom text */}
            <div className="relative z-10 flex flex-col gap-3">
              <h2 className="font-serif text-4xl font-bold leading-tight text-white">
                The sweetest
                <br />
                <span className="text-accent">recipes</span> await you.
              </h2>
              <p className="text-sm leading-relaxed text-white/65">
                Join thousands of ice-cream lovers sharing flavours from around
                the world.
              </p>

              {/* Social proof dots */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {["#ee2b52", "#ff8fa3", "#ffb347", "#60b4ff"].map((c) => (
                    <div
                      key={c}
                      className="h-7 w-7 rounded-full border-2 border-black/30 ring-1 ring-white/10"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <p className="text-xs text-white/60 font-medium">
                  1 000+ members already inside
                </p>
              </div>
            </div>
          </div>

          {/* ── Right: content panel ── */}
          <div className="flex flex-col justify-center gap-7 bg-white dark:bg-surface-dark p-8 sm:p-12">
            {/* Lock badge */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/20 shadow-sm shadow-primary/10">
              <MaterialIcon name="lock" className="text-2xl text-primary" />
            </div>

            {/* Heading */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                Members only
              </p>
              <h1 className="font-serif text-3xl font-bold leading-snug text-text-main dark:text-white">
                Sign in to access{" "}
                <span className="text-primary">{featureName}</span>
              </h1>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                Create a free account in seconds and unlock everything IScream
                has to offer.
              </p>
            </div>

            {/* Perks */}
            <ul className="flex flex-col gap-3">
              {PERKS.map(({ icon, label }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20">
                    <MaterialIcon
                      name={icon}
                      className="text-sm text-primary"
                    />
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {label}
                  </span>
                </li>
              ))}
            </ul>

            {/* Divider */}
            <div className="h-px bg-gray-100 dark:bg-white/8" />

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              <Link
                href={routes.register}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary-hover transition-colors"
              >
                <MaterialIcon name="person_add" className="text-base" />
                Create free account
              </Link>
              <Link
                href={routes.login}
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-gray-200 dark:border-white/10 px-6 py-3.5 text-sm font-bold text-text-main dark:text-white hover:border-primary/50 hover:text-primary dark:hover:text-primary transition-colors"
              >
                I already have an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
