"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/ui";
import { authService, extractApiError } from "@/services";
import { routes } from "@/config";

interface FormData {
    usernameOrEmail: string;
    password: string;
    rememberMe: boolean;
}

interface FormErrors {
    usernameOrEmail?: string;
    password?: string;
    general?: string;
}

function validate(data: FormData): FormErrors {
    const errors: FormErrors = {};
    if (!data.usernameOrEmail.trim()) {
        errors.usernameOrEmail = "Vui lòng nhập email hoặc tên đăng nhập.";
    }
    if (!data.password) {
        errors.password = "Vui lòng nhập mật khẩu.";
    }
    return errors;
}

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState<FormData>({
        usernameOrEmail: "",
        password: "",
        rememberMe: false,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const validationErrors = validate(form);
        if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
        setLoading(true);
        setErrors({});
        try {
            await authService.login({ usernameOrEmail: form.usernameOrEmail.trim(), password: form.password });
            router.push(routes.home);
        } catch (err: unknown) {
            setErrors({ general: extractApiError(err, "Đăng nhập thất bại. Vui lòng thử lại.") });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-[1100px]">
            <div className="bg-primary/5 dark:bg-slate-900 rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px]">

                {/* ═══════════════════════════════════════════════
                    LEFT — Decorative promo panel
                ═══════════════════════════════════════════════ */}
                <div className="w-full md:w-1/2 bg-primary/10 p-12 flex flex-col justify-center items-center text-center relative overflow-hidden">

                    {/* Dot grid pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none text-primary">
                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="login-dots" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <circle cx="2" cy="2" r="2" fill="currentColor" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#login-dots)" />
                        </svg>
                    </div>

                    {/* Ice cream illustration */}
                    <div className="relative z-10 w-64 h-64 mx-auto mb-8 bg-contain bg-center bg-no-repeat"
                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCAjQpOH1pBEkX2VTQg9HyVVJ0XLkpGwVikydaDcmKyb3XrcoziTcKhvF3P9VC36eeEwyG_vFFw9dBVU2wQBI6g21vXMQDhEbokxiaB60Zlq-GzrR9ZXz2haGb_JoDd6Mziy4csEtIZflnU-irKaCtZWERgFVlJo9g3ntJjNAvFkG_K70K6vjtwLSA4pgLCFsD1iw1qSdcOJGXYToGjwKjcRKlLwB4Xy5Y8bIZ_Py1PlXDsgH9LReu0Pe5vGdTwxKmK-BVxVZAYQM9G")' }}
                    />

                    {/* Headline + description */}
                    <div className="relative z-10">
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                            Sweet scoops are waiting!
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-sm mx-auto">
                            Log in to access your saved recipes, community scoops, and secret dessert books.
                        </p>
                    </div>

                    {/* Stacked avatars */}
                    <div className="relative z-10 mt-12 flex items-center gap-4">
                        <div className="flex -space-x-3 overflow-hidden">
                            <Image
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNSOw2i4IdT_egfUQNLBp7aV5ZfKxaDhynmsQXnpjpQyQsoWZQZpC3X24bHb-I9fOHxm-mKHVyC4rkyrO_e9Iu1qQ7rcT52xOzIQwdWk-I1Ttm58t47aPoaoldw9Xh9id5Q2kXalPb_QwvS4podDe9n4Og0vmz_rS-3BuJfBpEs-qTvG7dj2LJpL2JTKkFGk6uskyfuEemiQrNuZHt1gDm_zmxkYYxE1eu7Xqjj0bdmdc-vTdJ1aZfVJOC1Vvgo9AyUxbjr-gmqM64"
                                alt="avatar 1" width={40} height={40}
                                className="h-10 w-10 rounded-full ring-4 ring-white dark:ring-slate-900 object-cover"
                            />
                            <Image
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqQvDSYSraCX-9pJdOwUAObMVRLX6O3_WGD866rgqTjHWdfEB0W9rOh7b_WhHfmKTuB7b3nlkwtkvOQMvfLvyj_tl4twJAdemte0Pwtr16iQRowI5kGUwu9yJ5NGQuINj4vBuGisyH2Aj_8dp5jtuWH72M0jdmTqgXBVasDlZlo_NXyJDsnGzLCLAJX0tpH3px6TyRfDDW9UKy5zDh75UiRvZ8pGUDKjSojgD3mu1AUk6kug7D2vQKgvFA4PY9m85FJsSRZRxdgXki"
                                alt="avatar 2" width={40} height={40}
                                className="h-10 w-10 rounded-full ring-4 ring-white dark:ring-slate-900 object-cover"
                            />
                            <Image
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdv-rexvD32l1KWlNBHBbfcYHdvWzrD09TQAEwpZ2YgLOcP6Am17ftmL3YSpijZ2pI3Hpgx-GEKHpLckt2dlry2bzNrho5GP-zzHeMQn2KbJhp4PzIKVo1VW_1nnmVN_zTw99R6EgEW9VsNXq7XDls9A2QzeUOACegSRoM85SruS6d7DqgvfJmWZ_fJtfVjDAt3oth2iHLZfVpxlZB9-z-GXwRPr355V9Gz1hhD6LD8HA4RxrySsYgh8UBopjQQSa8PY4libxix-S7"
                                alt="avatar 3" width={40} height={40}
                                className="h-10 w-10 rounded-full ring-4 ring-white dark:ring-slate-900 object-cover"
                            />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Join 10k+ ice cream lovers
                        </p>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════
                    RIGHT — Login form
                ═══════════════════════════════════════════════ */}
                <div className="w-full md:w-1/2 bg-primary/5 p-8 md:p-16 flex flex-col justify-center">

                    {/* Heading */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Customer Login</h2>
                        <p className="text-slate-500 dark:text-slate-400">Welcome back to the parlor!</p>
                    </div>

                    {/* General error */}
                    {errors.general && (
                        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                            <MaterialIcon name="error" filled className="text-[18px] text-red-500" />
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                        {/* Email / Username */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="usernameOrEmail" className="text-sm font-semibold text-gray-900 dark:text-slate-200">
                                Email or Username
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
                                <input
                                    id="usernameOrEmail"
                                    type="text"
                                    name="usernameOrEmail"
                                    value={form.usernameOrEmail}
                                    onChange={handleChange}
                                    placeholder="Your email or username"
                                    autoComplete="username"
                                    className={`w-full pl-12 pr-4 py-4 rounded-xl border bg-rose-50 dark:bg-slate-800 text-black dark:text-white placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.usernameOrEmail ? "border-red-400" : "border-rose-200 dark:border-slate-700"}`}
                                />
                            </div>
                            {errors.usernameOrEmail && <p className="text-xs text-red-500 pl-1">{errors.usernameOrEmail}</p>}
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-semibold text-gray-900 dark:text-slate-200">
                                    Password
                                </label>
                                <a href="#" className="text-sm font-bold text-primary hover:underline underline-offset-4">
                                    Forgot Password?
                                </a>
                            </div>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className={`w-full pl-12 pr-12 py-4 rounded-xl border bg-rose-50 dark:bg-slate-800 text-black dark:text-white placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.password ? "border-red-400" : "border-rose-200 dark:border-slate-700"}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                    <span className="material-symbols-outlined text-xl">{showPassword ? "visibility_off" : "visibility"}</span>
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500 pl-1">{errors.password}</p>}
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center gap-2">
                            <input
                                id="rememberMe"
                                type="checkbox"
                                name="rememberMe"
                                checked={form.rememberMe}
                                onChange={handleChange}
                                className="h-5 w-5 cursor-pointer rounded border-slate-300 text-primary focus:ring-primary/30"
                            />
                            <label htmlFor="rememberMe" className="cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors select-none">
                                Remember me
                            </label>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary text-white font-bold rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all active:scale-95 text-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Logging in...
                                </span>
                            ) : "Login to Portal"}
                        </button>
                    </form>

                    {/* Sign up link */}
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            Don&apos;t have an account?{" "}
                            <Link href={routes.register} className="font-bold text-primary hover:underline underline-offset-4">
                                Sign up here
                            </Link>
                        </p>
                    </div>

                    {/* OR CONTINUE WITH */}
                    <div className="mt-6 flex items-center gap-4">
                        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-grow" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
                        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-grow" />
                    </div>

                    {/* Social buttons */}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Image
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA17ktAVVtAqLVm83ahSqpkmTE48UbOQnOvNicIX_Fs8O2d9nbnrlYuv5aoEawoz9mOjdVyCRDglpkezQ28KKHvFswMIfXrn539PgOHbZrUwX4EmTCXK97jiqYuB8RjTFcXGG5bs2AmhbE_nOItyLGie5DCCic8UGUmV59GsEgHVjzue0QIkg0BhXkD50Eu-6snB3-rUStDmHVxyFaEKUQ5mm3khS5_7Vo0qlvefk0H0z_VRgFe1OnmqKi8o4JoS6xB_suLYekG-cQ"
                                alt="Google" width={20} height={20} className="size-5"
                            />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Google</span>
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Image
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGraIPWf-NjW0r1v1IQM4OoiS-SnyClTqasXi3vEj_OyIl7HUodN-GJko9HRMQI6Ow1zkLPZXSjj2qN-pv4cMYAcyaHzw4UyD14RWY2kJ3pIjbhaKANjMn7vGAACSn9XdQfdgekeFMaHZ5x9I9xHRcqGCR6jPg54Ras2bPT8ab3-oB0T6xqEfZs3KVAQgA27U6SaRBZcSIVvUlGO3vH8WahXBVR__-ExiqzjgpWbLve_EAj98Zi1oI1nLtYfFjP3-_8a0FTrvwWBk"
                                alt="Apple" width={20} height={20} className="size-5"
                            />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Apple</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
