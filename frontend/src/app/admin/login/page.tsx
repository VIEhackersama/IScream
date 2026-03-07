"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/ui";
import { authService, extractApiError, tokenStorage } from "@/services";
import { routes } from "@/config";

interface FormData {
  usernameOrEmail: string;
  password: string;
}

interface FormErrors {
  usernameOrEmail?: string;
  password?: string;
  general?: string;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.usernameOrEmail.trim())
    errors.usernameOrEmail = "Please enter your username or email.";
  if (!data.password) errors.password = "Please enter your password.";
  return errors;
}

const inputBase = (hasError: boolean) =>
  `h-[52px] w-full rounded-xl border bg-gray-50 pl-11 pr-4 text-sm text-black outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15 ${hasError ? "border-red-400" : "border-gray-200"}`;

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    usernameOrEmail: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in as admin, redirect to dashboard
  useEffect(() => {
    const token = tokenStorage.getToken();
    const user = tokenStorage.getUser();
    if (token && user?.role === "ADMIN") {
      router.replace(routes.adminDashboard);
    }
  }, [router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      await authService.adminLogin({
        usernameOrEmail: form.usernameOrEmail.trim(),
        password: form.password,
      });
      router.push(routes.adminDashboard);
    } catch (err: unknown) {
      setErrors({
        general: extractApiError(
          err,
          "Login failed. Please check your credentials.",
        ),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-pink-100 p-4">
      <div className="flex w-full max-w-[920px] overflow-hidden rounded-[2rem] shadow-2xl shadow-black/15">
        {/* ── LEFT: Branding / Photo panel ── */}
        <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden md:flex">
          {/* Background image */}
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2aKLr7t03shI4-Y6ZNgAcYxdJBIH0tTNo5MbU1wM-TU2rU_AVpKZBRP1NCkHzuwRwgoFzGwweomO3RNMkVnaWClifMeKukdzx9zTy_TmsxugTTLsrix4jKA5ksZS2e6OCVlGJkXvF6a48EZLiCTYMGI61Fh3hgyvsjcA1Q7CUnRQ2VboX3ysybtYRBzh0mdAeUuDHw7yExaY1HIE0Dt1T_RHxVoTZh59lMwGeiR-KvVF4YprN2i98XM8RF6XO1o9ADds22yC8FZ0"
            alt="Ice cream swirl background"
            fill
            sizes="45vw"
            className="object-cover"
            priority
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />

          {/* Top: Logo + Brand */}
          <div className="relative z-10 flex flex-col items-center gap-3 pt-12">
            <div className="flex size-[64px] items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm ring-1 ring-white/30">
              <MaterialIcon
                name="icecream"
                filled
                className="text-[36px] text-white"
              />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <h2 className="text-2xl font-black tracking-tight text-white drop-shadow">
                IScream
              </h2>
              <p className="max-w-[180px] text-xs leading-relaxed text-white/80">
                Crafting sweet moments, one scoop at a time.
              </p>
            </div>
          </div>

          {/* Bottom: Latest update card */}
          <div className="relative z-10 m-6">
            <div className="rounded-2xl bg-black/50 p-4 backdrop-blur-md ring-1 ring-white/10">
              <div className="mb-2 flex items-center gap-2">
                <MaterialIcon
                  name="campaign"
                  filled
                  className="text-[16px] text-primary"
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Latest Update
                </span>
              </div>
              <p className="text-xs leading-relaxed text-white/90">
                &ldquo;The Vanilla Chronicles&rdquo; recipe book is now live for
                subscribers.
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Form panel ── */}
        <div className="flex flex-1 flex-col justify-between bg-white px-8 py-10 md:px-10">
          {/* Header */}
          <div className="flex flex-col gap-6">
            {/* Badge */}
            <div className="flex items-center gap-2">
              <MaterialIcon
                name="admin_panel_settings"
                filled
                className="text-[18px] text-primary"
              />
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Admin Portal
              </span>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <h1 className="text-[2rem] font-black leading-tight tracking-tight text-text-main">
                Welcome Back
              </h1>
              <p className="text-sm text-text-muted">
                Please enter your details to access the dashboard.
              </p>
            </div>

            {/* General error */}
            {errors.general && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                <MaterialIcon
                  name="error"
                  filled
                  className="mt-px shrink-0 text-[18px] text-red-500"
                />
                {errors.general}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
              noValidate
            >
              {/* Username or Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="admin-username"
                  className="text-sm font-semibold text-text-main"
                >
                  Username or Email
                </label>
                <div className="relative">
                  <MaterialIcon
                    name="person"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-gray-400"
                  />
                  <input
                    id="admin-username"
                    type="text"
                    name="usernameOrEmail"
                    value={form.usernameOrEmail}
                    onChange={handleChange}
                    placeholder="Enter admin username"
                    autoComplete="username"
                    className={inputBase(!!errors.usernameOrEmail)}
                  />
                </div>
                {errors.usernameOrEmail && (
                  <p className="pl-3 text-xs text-red-500">
                    {errors.usernameOrEmail}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="admin-password"
                    className="text-sm font-semibold text-text-main"
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs font-semibold text-primary hover:underline underline-offset-4"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <MaterialIcon
                    name="key"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-gray-400"
                  />
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className={inputBase(!!errors.password) + " pr-12"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-primary"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <MaterialIcon
                      name={showPassword ? "visibility_off" : "visibility"}
                    />
                  </button>
                </div>
                {errors.password && (
                  <p className="pl-3 text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover hover:shadow-primary/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 flex flex-col gap-4 border-t border-gray-100 pt-6">
            {/* Return to store */}
            <p className="text-center text-sm text-text-muted">
              Not an admin?{" "}
              <Link
                href={routes.home}
                className="font-bold text-text-main hover:text-primary transition-colors"
              >
                Return to store →
              </Link>
            </p>
            {/* Copyright */}
            <p className="text-center text-[11px] text-gray-400">
              © 2025 IScream Ice Cream Parlor. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
