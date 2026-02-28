"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/ui";
import { authService } from "@/services";
import { routes } from "@/config";

interface FormData {
    fullName: string;
    username: string;
    email: string;
    password: string;
    membership: "monthly" | "yearly";
}

interface FormErrors {
    fullName?: string;
    username?: string;
    email?: string;
    password?: string;
    general?: string;
}

function validate(data: FormData): FormErrors {
    const errors: FormErrors = {};

    if (!data.fullName.trim()) errors.fullName = "Please enter your full name.";

    if (!data.username.trim()) {
        errors.username = "Please enter a username.";
    } else if (data.username.trim().length < 3) {
        errors.username = "Username must be at least 3 characters.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(data.username.trim())) {
        errors.username = "Only letters, numbers and underscores allowed.";
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = "Please enter a valid email address.";
    }

    if (!data.password) {
        errors.password = "Please create a password.";
    } else if (data.password.length < 6) {
        errors.password = "Password must be at least 6 characters.";
    }

    return errors;
}

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState<FormData>({
        fullName: "",
        username: "",
        email: "",
        password: "",
        membership: "yearly",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

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
            await authService.register({
                username: form.username.trim(),
                password: form.password,
                email: form.email.trim() || undefined,
                fullName: form.fullName.trim() || undefined,
            });

            setSuccess(true);
            setTimeout(() => router.push(routes.login), 2000);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Something went wrong.";
            const match = msg.match(/\d{3}\): (.+)$/);
            setErrors({
                general: match ? match[1] : "Registration failed. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        // Outer: center the card on the page
        <div className="flex w-full max-w-[860px] items-center justify-center py-8">
            {/* Card container */}
            <div className="flex w-full overflow-hidden rounded-[2rem] border border-gray-100 shadow-2xl shadow-primary/10">
                {/* Inner: split left/right */}
                <div className="relative flex min-h-[560px] w-full flex-col lg:flex-row">

                    {/* ---- Left: Form ---- */}
                    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-white px-4 py-8 lg:p-10">
                        <div className="flex w-full max-w-[520px] flex-col gap-6">

                            {/* Heading */}
                            <div className="flex flex-col gap-2 text-center lg:text-left">
                                <h1 className="font-serif-display text-4xl font-black leading-tight tracking-tight text-text-main dark:text-white lg:text-5xl">
                                    Ready for a sugar rush?
                                </h1>
                                <p className="text-lg text-text-muted dark:text-gray-400">
                                    Join the Mr. A community for exclusive recipes and books.
                                </p>
                            </div>

                            {/* Tabs */}
                            <div className="mt-2 w-full border-b border-gray-200 dark:border-white/10">
                                <div className="flex gap-8">
                                    <Link
                                        href={routes.login}
                                        className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent px-2 pb-3 pt-2 text-text-muted transition-colors hover:text-primary dark:text-gray-500"
                                    >
                                        <p className="text-sm font-bold tracking-wide">Log In</p>
                                    </Link>
                                    <div className="flex flex-col items-center justify-center border-b-[3px] border-b-text-main px-2 pb-3 pt-2 dark:border-b-white">
                                        <p className="text-sm font-bold tracking-wide text-text-main dark:text-white">
                                            Sign Up
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Success state */}
                            {success ? (
                                <div className="flex flex-col items-center gap-4 rounded-2xl bg-green-50 p-8 text-center">
                                    <div className="flex size-16 items-center justify-center rounded-full bg-green-100">
                                        <MaterialIcon name="check_circle" filled className="text-[40px] text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-text-main">Account created! 🎉</p>
                                        <p className="mt-1 text-sm text-text-muted">Redirecting you to the login page...</p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-5" noValidate>

                                    {/* General error */}
                                    {errors.general && (
                                        <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                            <MaterialIcon name="error" filled className="text-[18px] text-red-500" />
                                            {errors.general}
                                        </div>
                                    )}

                                    {/* Full Name */}
                                    <div className="flex flex-col gap-2">
                                        <label className="pl-1 text-sm font-bold text-text-main dark:text-gray-200">Full Name</label>
                                        <div className="relative">
                                            <MaterialIcon name="person" className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-500" />
                                            <input
                                                type="text" name="fullName" value={form.fullName} onChange={handleChange}
                                                placeholder="e.g. Cherry Garcia" autoComplete="name"
                                                className={`h-14 w-full rounded-full border bg-white pl-12 pr-4 text-base text-text-main outline-none transition-all placeholder:text-text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-600 ${errors.fullName ? "border-red-400" : "border-gray-200 dark:border-white/10"}`}
                                            />
                                        </div>
                                        {errors.fullName && <p className="pl-2 text-xs text-red-500">{errors.fullName}</p>}
                                    </div>

                                    {/* Username */}
                                    <div className="flex flex-col gap-2">
                                        <label className="pl-1 text-sm font-bold text-text-main dark:text-gray-200">Username</label>
                                        <div className="relative">
                                            <MaterialIcon name="alternate_email" className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-500" />
                                            <input
                                                type="text" name="username" value={form.username} onChange={handleChange}
                                                placeholder="icecream_fan" autoComplete="username"
                                                className={`h-14 w-full rounded-full border bg-white pl-12 pr-4 text-base text-text-main outline-none transition-all placeholder:text-text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-600 ${errors.username ? "border-red-400" : "border-gray-200 dark:border-white/10"}`}
                                            />
                                        </div>
                                        {errors.username && <p className="pl-2 text-xs text-red-500">{errors.username}</p>}
                                    </div>

                                    {/* Email */}
                                    <div className="flex flex-col gap-2">
                                        <label className="pl-1 text-sm font-bold text-text-main dark:text-gray-200">Email Address</label>
                                        <div className="relative">
                                            <MaterialIcon name="mail" className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-500" />
                                            <input
                                                type="email" name="email" value={form.email} onChange={handleChange}
                                                placeholder="your_email@example.com" autoComplete="email"
                                                className={`h-14 w-full rounded-full border bg-white pl-12 pr-4 text-base text-text-main outline-none transition-all placeholder:text-text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-600 ${errors.email ? "border-red-400" : "border-gray-200 dark:border-white/10"}`}
                                            />
                                        </div>
                                        {errors.email && <p className="pl-2 text-xs text-red-500">{errors.email}</p>}
                                    </div>

                                    {/* Password */}
                                    <div className="flex flex-col gap-2">
                                        <label className="pl-1 text-sm font-bold text-text-main dark:text-gray-200">Password</label>
                                        <div className="relative">
                                            <MaterialIcon name="lock" className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-500" />
                                            <input
                                                type="password" name="password" value={form.password} onChange={handleChange}
                                                placeholder="Create a sweet password" autoComplete="new-password"
                                                className={`h-14 w-full rounded-full border bg-white pl-12 pr-4 text-base text-text-main outline-none transition-all placeholder:text-text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-600 ${errors.password ? "border-red-400" : "border-gray-200 dark:border-white/10"}`}
                                            />
                                        </div>
                                        {errors.password && <p className="pl-2 text-xs text-red-500">{errors.password}</p>}
                                    </div>

                                    {/* Membership */}
                                    <div className="mt-2 flex flex-col gap-3">
                                        <label className="pl-1 text-sm font-bold text-text-main dark:text-gray-200">Choose your flavor</label>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            {/* Monthly */}
                                            <label className="group relative cursor-pointer">
                                                <input
                                                    type="radio" name="membership" value="monthly"
                                                    checked={form.membership === "monthly"}
                                                    onChange={() => setForm((p) => ({ ...p, membership: "monthly" }))}
                                                    className="peer sr-only"
                                                />
                                                <div className="flex h-full flex-col rounded-[2rem] border border-gray-200 bg-white p-5 transition-all hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-1 peer-checked:ring-primary dark:border-white/10 dark:bg-white/5">
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-sm font-bold text-text-muted transition-colors group-hover:text-primary dark:text-gray-400">Scoop of the Month</span>
                                                    </div>
                                                    <div className="mt-auto">
                                                        <p className="text-2xl font-black text-text-main dark:text-white">
                                                            $15<span className="text-sm font-medium text-text-muted dark:text-gray-400">/mo</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </label>

                                            {/* Yearly */}
                                            <label className="group relative cursor-pointer">
                                                <input
                                                    type="radio" name="membership" value="yearly"
                                                    checked={form.membership === "yearly"}
                                                    onChange={() => setForm((p) => ({ ...p, membership: "yearly" }))}
                                                    className="peer sr-only"
                                                />
                                                <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-gray-200 bg-white p-5 transition-all hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-1 peer-checked:ring-primary dark:border-white/10 dark:bg-white/5">
                                                    <div className={`absolute -right-px -top-px rounded-bl-xl bg-primary px-3 py-1 text-[10px] font-bold text-white transition-opacity ${form.membership === "yearly" ? "opacity-100" : "opacity-60"}`}>
                                                        BEST VALUE
                                                    </div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-sm font-bold text-text-muted transition-colors group-hover:text-primary dark:text-gray-400">The Whole Sundae</span>
                                                    </div>
                                                    <div className="mt-auto">
                                                        <p className="text-2xl font-black text-text-main dark:text-white">
                                                            $150<span className="text-sm font-medium text-text-muted dark:text-gray-400">/yr</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                        <p className="pl-2 text-xs text-text-muted dark:text-gray-500">
                                            * Includes secret recipes &amp; monthly book delivery.
                                        </p>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit" disabled={loading}
                                        className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-bold text-white shadow-lg transition-all hover:bg-primary-hover hover:shadow-primary/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Creating account...
                                            </>
                                        ) : (
                                            <>
                                                <span>Join the Club</span>
                                                <MaterialIcon name="arrow_forward" className="text-sm" />
                                            </>
                                        )}
                                    </button>

                                    {/* Divider */}
                                    <div className="relative flex items-center py-2">
                                        <div className="flex-grow border-t border-gray-200 dark:border-white/10" />
                                        <span className="mx-4 flex-shrink-0 text-sm text-text-muted dark:text-gray-500">Or sweeten the deal with</span>
                                        <div className="flex-grow border-t border-gray-200 dark:border-white/10" />
                                    </div>

                                    {/* Social */}
                                    <div className="flex justify-center gap-4">
                                        <button type="button" className="flex size-12 items-center justify-center rounded-full border border-gray-200 transition-colors hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5">
                                            <Image
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA17ktAVVtAqLVm83ahSqpkmTE48UbOQnOvNicIX_Fs8O2d9nbnrlYuv5aoEawoz9mOjdVyCRDglpkezQ28KKHvFswMIfXrn539PgOHbZrUwX4EmTCXK97jiqYuB8RjTFcXGG5bs2AmhbE_nOItyLGie5DCCic8UGUmV59GsEgHVjzue0QIkg0BhXkD50Eu-6snB3-rUStDmHVxyFaEKUQ5mm3khS5_7Vo0qlvefk0H0z_VRgFe1OnmqKi8o4JoS6xB_suLYekG-cQ"
                                                alt="Google" width={20} height={20} className="size-5"
                                            />
                                        </button>
                                        <button type="button" className="flex size-12 items-center justify-center rounded-full border border-gray-200 transition-colors hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5">
                                            <Image
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGraIPWf-NjW0r1v1IQM4OoiS-SnyClTqasXi3vEj_OyIl7HUodN-GJko9HRMQI6Ow1zkLPZXSjj2qN-pv4cMYAcyaHzw4UyD14RWY2kJ3pIjbhaKANjMn7vGAACSn9XdQfdgekeFMaHZ5x9I9xHRcqGCR6jPg54Ras2bPT8ab3-oB0T6xqEfZs3KVAQgA27U6SaRBZcSIVvUlGO3vH8WahXBVR__-ExiqzjgpWbLve_EAj98Zi1oI1nLtYfFjP3-_8a0FTrvwWBk"
                                                alt="Apple" width={20} height={20} className="size-5 dark:invert"
                                            />
                                        </button>
                                    </div>

                                    {/* Terms */}
                                    <p className="mt-4 text-center text-xs text-text-muted dark:text-gray-500">
                                        By joining, you agree to our{" "}
                                        <Link href={routes.privacyPolicy} className="underline hover:text-primary">Terms</Link>{" "}
                                        and{" "}
                                        <Link href={routes.privacyPolicy} className="underline hover:text-primary">Privacy Policy</Link>.
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* ---- Right: Image panel ---- */}
                    <div className="relative hidden bg-primary/10 lg:block lg:w-1/2">
                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/40 to-transparent" />
                        <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2aKLr7t03shI4-Y6ZNgAcYxdJBIH0tTNo5MbU1wM-TU2rU_AVpKZBRP1NCkHzuwRwgoFzGwweomO3RNMkVnaWClifMeKukdzx9zTy_TmsxugTTLsrix4jKA5ksZS2e6OCVlGJkXvF6a48EZLiCTYMGI61Fh3hgyvsjcA1Q7CUnRQ2VboX3ysybtYRBzh0mdAeUuDHw7yExaY1HIE0Dt1T_RHxVoTZh59lMwGeiR-KvVF4YprN2i98XM8RF6XO1o9ADds22yC8FZ0"
                            alt="Vibrant pink strawberry ice cream scoops piled high in a waffle cone"
                            fill sizes="50vw" className="object-cover" priority
                        />
                        {/* Quote card */}
                        <div className="absolute bottom-12 left-12 right-12 z-20">
                            <div className="rounded-[2rem] border border-white/20 bg-white/90 p-6 shadow-2xl backdrop-blur-md dark:bg-black/80">
                                <div className="flex items-start gap-4">
                                    <MaterialIcon name="format_quote" filled className="text-[40px] text-primary" />
                                    <div className="flex flex-col gap-2">
                                        <p className="text-lg font-medium leading-snug text-text-main dark:text-white">
                                            &quot;The secret ingredient is always love... and maybe a little extra sprinkles.&quot;
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <div className="flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">A</div>
                                            <span className="text-sm font-bold text-text-muted dark:text-gray-400">Mr. A</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
