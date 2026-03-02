"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/ui";
import { authService, extractApiError } from "@/services";
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

    if (!data.username.trim()) {
        errors.username = "Vui lòng nhập tên đăng nhập.";
    } else if (data.username.trim().length < 3) {
        errors.username = "Username phải có ít nhất 3 ký tự.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(data.username.trim())) {
        errors.username = "Chỉ được dùng chữ cái, số và dấu gạch dưới.";
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = "Email không hợp lệ.";
    }

    if (!data.password) {
        errors.password = "Vui lòng tạo mật khẩu.";
    } else if (data.password.length < 6) {
        errors.password = "Password phải có ít nhất 6 ký tự.";
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
        if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
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
            setErrors({ general: extractApiError(err, "Đăng ký thất bại. Vui lòng thử lại.") });
        } finally {
            setLoading(false);
        }
    }

    // shared input class
    const inputBase = (hasError: boolean) =>
        `h-[52px] w-full rounded-full border bg-white pl-11 pr-4 text-sm text-black outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/15 ${hasError ? "border-red-400" : "border-gray-200"
        }`;

    return (
        <div className="flex w-full max-w-[1000px] items-start justify-center py-8">
            <div className="flex w-full overflow-hidden rounded-[2rem] border border-gray-100 shadow-2xl shadow-primary/10">
                <div className="relative flex min-h-[700px] w-full flex-col lg:flex-row">

                    {/* ── LEFT: Form panel ── */}
                    <div className="flex w-full flex-col justify-center overflow-y-auto bg-white px-8 py-10 lg:w-1/2 lg:px-12">
                        <div className="flex w-full max-w-[440px] flex-col gap-5 mx-auto">

                            {/* Heading */}
                            <div className="flex flex-col gap-1">
                                <h1 className="text-[2rem] font-black leading-tight tracking-tight text-text-main">
                                    Ready for a sugar rush?
                                </h1>
                                <p className="text-sm text-text-muted">
                                    Join the Mr. A community for exclusive recipes and books.
                                </p>
                            </div>

                            {/* Tabs */}
                            <div className="w-full border-b border-gray-200">
                                <div className="flex gap-8">
                                    <Link
                                        href={routes.login}
                                        className="border-b-[2px] border-transparent pb-3 pt-1 text-sm font-semibold text-text-muted transition-colors hover:text-primary"
                                    >
                                        Log In
                                    </Link>
                                    <div className="border-b-[2px] border-text-main pb-3 pt-1 text-sm font-bold text-text-main">
                                        Sign Up
                                    </div>
                                </div>
                            </div>

                            {/* Success */}
                            {success ? (
                                <div className="flex flex-col items-center gap-4 rounded-2xl bg-green-50 p-8 text-center">
                                    <div className="flex size-14 items-center justify-center rounded-full bg-green-100">
                                        <MaterialIcon name="check_circle" filled className="text-[36px] text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-base font-bold text-text-main">Account created! 🎉</p>
                                        <p className="mt-1 text-sm text-text-muted">Redirecting you to login...</p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

                                    {/* General error */}
                                    {errors.general && (
                                        <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                            <MaterialIcon name="error" filled className="text-[18px] text-red-500" />
                                            {errors.general}
                                        </div>
                                    )}

                                    {/* Full Name */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-semibold text-text-main">Full Name</label>
                                        <div className="relative">
                                            <MaterialIcon name="person" className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-gray-400" />
                                            <input
                                                type="text" name="fullName" value={form.fullName} onChange={handleChange}
                                                placeholder="e.g. Cherry Garcia" autoComplete="name"
                                                className={inputBase(!!errors.fullName)}
                                            />
                                        </div>
                                        {errors.fullName && <p className="pl-3 text-xs text-red-500">{errors.fullName}</p>}
                                    </div>

                                    {/* Username */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-semibold text-text-main">Username</label>
                                        <div className="relative">
                                            <MaterialIcon name="alternate_email" className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-gray-400" />
                                            <input
                                                type="text" name="username" value={form.username} onChange={handleChange}
                                                placeholder="icecream_fan" autoComplete="username"
                                                className={inputBase(!!errors.username)}
                                            />
                                        </div>
                                        {errors.username && <p className="pl-3 text-xs text-red-500">{errors.username}</p>}
                                    </div>

                                    {/* Email */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-semibold text-text-main">Email Address</label>
                                        <div className="relative">
                                            <MaterialIcon name="mail" className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-gray-400" />
                                            <input
                                                type="email" name="email" value={form.email} onChange={handleChange}
                                                placeholder="your_email@example.com" autoComplete="email"
                                                className={inputBase(!!errors.email)}
                                            />
                                        </div>
                                        {errors.email && <p className="pl-3 text-xs text-red-500">{errors.email}</p>}
                                    </div>

                                    {/* Password */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-semibold text-text-main">Password</label>
                                        <div className="relative">
                                            <MaterialIcon name="lock" className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-gray-400" />
                                            <input
                                                type="password" name="password" value={form.password} onChange={handleChange}
                                                placeholder="Create a sweet password" autoComplete="new-password"
                                                className={inputBase(!!errors.password)}
                                            />
                                        </div>
                                        {errors.password && <p className="pl-3 text-xs text-red-500">{errors.password}</p>}
                                    </div>

                                    {/* Membership */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-text-main">Choose your flavor</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Monthly */}
                                            <label className="cursor-pointer">
                                                <input
                                                    type="radio" name="membership" value="monthly"
                                                    checked={form.membership === "monthly"}
                                                    onChange={() => setForm((p) => ({ ...p, membership: "monthly" }))}
                                                    className="peer sr-only"
                                                />
                                                <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-1 peer-checked:ring-primary">
                                                    <span className="text-xs font-semibold text-text-muted">Scoop of the Month</span>
                                                    <p className="mt-2 text-xl font-black text-text-main">
                                                        $15<span className="text-xs font-medium text-text-muted">/mo</span>
                                                    </p>
                                                </div>
                                            </label>
                                            {/* Yearly */}
                                            <label className="cursor-pointer">
                                                <input
                                                    type="radio" name="membership" value="yearly"
                                                    checked={form.membership === "yearly"}
                                                    onChange={() => setForm((p) => ({ ...p, membership: "yearly" }))}
                                                    className="peer sr-only"
                                                />
                                                <div className="relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-1 peer-checked:ring-primary">
                                                    <div className={`absolute -right-px -top-px rounded-bl-xl bg-primary px-2.5 py-0.5 text-[10px] font-bold text-white transition-opacity ${form.membership === "yearly" ? "opacity-100" : "opacity-50"}`}>
                                                        BEST VALUE
                                                    </div>
                                                    <span className="text-xs font-semibold text-text-muted">The Whole Sundae</span>
                                                    <p className="mt-2 text-xl font-black text-text-main">
                                                        $150<span className="text-xs font-medium text-text-muted">/yr</span>
                                                    </p>
                                                </div>
                                            </label>
                                        </div>
                                        <p className="pl-1 text-xs text-text-muted">
                                            * Includes secret recipes &amp; monthly book delivery.
                                        </p>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit" disabled={loading}
                                        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Creating account...
                                            </>
                                        ) : (
                                            <>Join the Club <MaterialIcon name="arrow_forward" className="text-sm" /></>
                                        )}
                                    </button>

                                    {/* Divider */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex-grow border-t border-gray-200" />
                                        <span className="text-xs text-text-muted">Or sweeten the deal with</span>
                                        <div className="flex-grow border-t border-gray-200" />
                                    </div>

                                    {/* Social */}
                                    <div className="flex justify-center gap-4">
                                        <button type="button" className="flex size-11 items-center justify-center rounded-full border border-gray-200 transition-colors hover:bg-gray-50">
                                            <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuA17ktAVVtAqLVm83ahSqpkmTE48UbOQnOvNicIX_Fs8O2d9nbnrlYuv5aoEawoz9mOjdVyCRDglpkezQ28KKHvFswMIfXrn539PgOHbZrUwX4EmTCXK97jiqYuB8RjTFcXGG5bs2AmhbE_nOItyLGie5DCCic8UGUmV59GsEgHVjzue0QIkg0BhXkD50Eu-6snB3-rUStDmHVxyFaEKUQ5mm3khS5_7Vo0qlvefk0H0z_VRgFe1OnmqKi8o4JoS6xB_suLYekG-cQ" alt="Google" width={20} height={20} />
                                        </button>
                                        <button type="button" className="flex size-11 items-center justify-center rounded-full border border-gray-200 transition-colors hover:bg-gray-50">
                                            <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGraIPWf-NjW0r1v1IQM4OoiS-SnyClTqasXi3vEj_OyIl7HUodN-GJko9HRMQI6Ow1zkLPZXSjj2qN-pv4cMYAcyaHzw4UyD14RWY2kJ3pIjbhaKANjMn7vGAACSn9XdQfdgekeFMaHZ5x9I9xHRcqGCR6jPg54Ras2bPT8ab3-oB0T6xqEfZs3KVAQgA27U6SaRBZcSIVvUlGO3vH8WahXBVR__-ExiqzjgpWbLve_EAj98Zi1oI1nLtYfFjP3-_8a0FTrvwWBk" alt="Apple" width={20} height={20} />
                                        </button>
                                    </div>

                                    {/* Terms */}
                                    <p className="text-center text-xs text-text-muted">
                                        By joining, you agree to our{" "}
                                        <Link href={routes.privacyPolicy} className="underline hover:text-primary">Terms</Link>
                                        {" "}and{" "}
                                        <Link href={routes.privacyPolicy} className="underline hover:text-primary">Privacy Policy</Link>.
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT: Photo panel ── */}
                    <div className="relative hidden lg:block lg:w-1/2">
                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/50 to-transparent" />
                        <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2aKLr7t03shI4-Y6ZNgAcYxdJBIH0tTNo5MbU1wM-TU2rU_AVpKZBRP1NCkHzuwRwgoFzGwweomO3RNMkVnaWClifMeKukdzx9zTy_TmsxugTTLsrix4jKA5ksZS2e6OCVlGJkXvF6a48EZLiCTYMGI61Fh3hgyvsjcA1Q7CUnRQ2VboX3ysybtYRBzh0mdAeUuDHw7yExaY1HIE0Dt1T_RHxVoTZh59lMwGeiR-KvVF4YprN2i98XM8RF6XO1o9ADds22yC8FZ0"
                            alt="Vibrant pink strawberry ice cream scoops"
                            fill sizes="50vw" className="object-cover" priority
                        />
                        {/* Quote card */}
                        <div className="absolute bottom-10 left-8 right-8 z-20">
                            <div className="rounded-2xl border border-white/20 bg-white/95 p-5 shadow-2xl backdrop-blur-md">
                                <div className="flex items-start gap-3">
                                    <MaterialIcon name="format_quote" filled className="text-[32px] text-primary shrink-0" />
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm font-medium leading-snug text-text-main">
                                            &quot;The secret ingredient is always love... and maybe a little extra sprinkles.&quot;
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex size-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">A</div>
                                            <span className="text-xs font-bold text-text-muted">Mr. A</span>
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
