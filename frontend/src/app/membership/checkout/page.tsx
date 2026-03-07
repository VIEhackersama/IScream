"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MaterialIcon, Badge } from "@/components/ui";
import { routes } from "@/config";
import { useAuth } from "@/context/AuthContext";
import { membershipService } from "@/services";
import type { MembershipPlan } from "@/types";

import { Suspense } from "react";

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isLoggedIn, loading: isAuthLoading } = useAuth();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [fetchingPlans, setFetchingPlans] = useState(true);

    const planIdStr = searchParams.get("plan");
    const planId = planIdStr ? parseInt(planIdStr, 10) : null;

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await membershipService.getPlans();
                setPlans(data);
            } catch (error) {
                console.error("Failed to fetch plans:", error);
            } finally {
                setFetchingPlans(false);
            }
        };
        fetchPlans();
    }, []);

    const selectedPlan = planId ? plans.find(p => p.id === planId) : null;

    useEffect(() => {
        if (!isAuthLoading && !isLoggedIn) {
            router.push(`${routes.login}?returnUrl=${encodeURIComponent(`/membership/checkout?plan=${planIdStr || ""}`)}`);
        }
        if (!isAuthLoading && isLoggedIn && !fetchingPlans && !selectedPlan) {
            router.push(routes.membership);
        }
    }, [isLoggedIn, isAuthLoading, planIdStr, fetchingPlans, selectedPlan, router]);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!planId) return;

        setLoading(true);
        try {
            // No real payment gateway — subscribe without a fakePaymentId; backend will create and confirm it.
            await membershipService.subscribe({ planId });
            setSuccess(true);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to process payment");
        } finally {
            setLoading(false);
        }
    };

    if (isAuthLoading || fetchingPlans || (!isLoggedIn && !success)) {
        return <div className="flex min-h-[60vh] items-center justify-center">Loading...</div>;
    }

    if (success) {
        return (
            <div className="flex w-full min-h-[80vh] flex-col items-center justify-center py-20 bg-gradient-to-br from-[#ffe5ec] to-[#f8edeb] dark:from-surface-dark dark:to-[#2a1a1e]">
                <div className="flex flex-col items-center gap-6 rounded-[2.5rem] bg-white px-12 py-16 text-center shadow-2xl shadow-primary/10 max-w-xl dark:bg-surface-dark border sm:border-transparent border-gray-100">
                    <div className="flex size-24 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-primary/30">
                        <MaterialIcon name="verified" filled className="text-[48px]" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-text-main dark:text-white mb-2">Payment Successful!</h2>
                        <p className="mt-2 text-lg text-text-muted">Welcome to the Scoop Squad. Your {selectedPlan?.code} Plan is now active.</p>
                    </div>
                    <button
                        onClick={() => router.push(routes.home)}
                        className="mt-6 rounded-full bg-primary px-10 py-4 font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-hover hover:scale-105 transition-all"
                    >
                        Start Exploring
                    </button>
                    <button
                        onClick={() => router.push(routes.profile)}
                        className="mt-2 text-sm font-semibold text-text-muted hover:text-primary transition-colors"
                    >
                        View My Account
                    </button>
                </div>
            </div>
        );
    }

    if (!selectedPlan) return null;

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#ffe5ec] to-[#f8edeb] dark:from-[#1a1012] dark:to-surface-dark py-12 px-4 md:py-20 flex flex-col items-center">

            <div className="mb-10 text-center">
                <h1 className="text-4xl font-black text-text-main dark:text-white mb-2">Secure Checkout</h1>
                <p className="text-text-muted">Complete your registration to join the Scoop Squad.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-[1000px] items-start">

                {/* Left Column - Order Summary */}
                <div className="lg:col-span-5 flex flex-col">
                    <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-primary/5 dark:bg-surface-dark border border-gray-50 flex flex-col gap-6">
                        <h2 className="text-xl font-bold text-text-main dark:text-white">Order Summary</h2>

                        <div className="flex items-center gap-4">
                            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <MaterialIcon name="icecream" filled className="text-3xl" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-text-main dark:text-white">{selectedPlan.code} Plan</h3>
                                <p className="text-sm text-text-muted">{selectedPlan.durationDays} Days Membership</p>
                                <button onClick={() => router.push(routes.membership)} className="text-xs font-bold text-primary mt-1 hover:underline">
                                    Change Plan
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-gray-200 dark:border-white/10 my-2"></div>

                        <div className="flex flex-col gap-3 text-sm">
                            <div className="flex justify-between text-text-muted">
                                <span>Subtotal</span>
                                <span>${selectedPlan.price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-text-muted">
                                <span>Tax (0%)</span>
                                <span>$0.00</span>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-gray-200 dark:border-white/10 my-2"></div>

                        <div className="flex justify-between items-end">
                            <span className="font-bold text-text-main dark:text-white">Total Due Today</span>
                            <span className="text-3xl font-black text-text-main dark:text-white">${selectedPlan.price.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-6 rounded-full bg-white/50 dark:bg-white/5 py-3 px-6 text-center text-sm font-semibold text-text-muted flex items-center justify-center gap-2">
                        <MaterialIcon name="verified_user" className="text-lg text-primary/70" />
                        100% Secure Transaction with SSL
                    </div>
                </div>

                {/* Right Column - Payment Form */}
                <div className="lg:col-span-7 rounded-[2.5rem] bg-white p-8 md:p-10 shadow-2xl shadow-primary/10 dark:bg-surface-dark border border-gray-100">

                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <MaterialIcon name="credit_card" filled className="text-2xl" />
                        </div>
                        <h2 className="text-2xl font-bold text-text-main dark:text-white">Payment Details</h2>
                        <MaterialIcon name="payments" className="ml-auto text-3xl text-gray-300 dark:text-gray-600" />
                    </div>

                    <form onSubmit={handlePayment} className="flex flex-col gap-6">

                        {/* Name on card */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-text-main dark:text-white">Cardholder Name</label>
                            <div className="relative">
                                <MaterialIcon name="person" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Jane Doe"
                                    defaultValue={user?.fullName || ""}
                                    className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-3.5 pl-12 pr-4 text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-black/20 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Card Number */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-text-main dark:text-white">Card Number</label>
                            <div className="relative">
                                <MaterialIcon name="credit_card" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="0000 0000 0000 0000"
                                    className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-3.5 pl-12 pr-12 text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-black/20 dark:text-white"
                                />
                                <MaterialIcon name="check_circle" filled className="absolute right-4 top-1/2 -translate-y-1/2 text-primary" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {/* Expiry */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-text-main dark:text-white">Expiry Date</label>
                                <div className="relative">
                                    <MaterialIcon name="calendar_month" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="MM/YY"
                                        className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-3.5 pl-12 pr-4 text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-black/20 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* CVV */}
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center justify-between text-sm font-bold text-text-main dark:text-white">
                                    CVV / CVC
                                    <MaterialIcon name="help" className="text-sm text-gray-400 cursor-help" />
                                </label>
                                <div className="relative">
                                    <MaterialIcon name="lock" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="123"
                                        className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-3.5 pl-12 pr-4 text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-black/20 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Save card toggle */}
                        <label className="flex items-center gap-3 cursor-pointer mt-2 group">
                            <div className="relative flex size-5 items-center justify-center rounded border border-gray-300 bg-white group-hover:border-primary dark:border-white/20 dark:bg-black/50">
                                <input type="checkbox" className="peer sr-only" />
                                <MaterialIcon name="check" className="absolute text-[14px] text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                                <div className="absolute inset-0 rounded bg-primary opacity-0 transition-opacity peer-checked:opacity-100 -z-10" />
                            </div>
                            <span className="text-sm font-medium text-text-muted">Save card for future delicious purchases</span>
                        </label>

                        <div className="border-t border-gray-100 dark:border-white/10 my-2"></div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-full bg-primary py-4 font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary-hover hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 text-lg"
                        >
                            {loading ? (
                                "Processing..."
                            ) : (
                                <>
                                    <MaterialIcon name="lock" filled className="text-xl" />
                                    Pay ${selectedPlan.price.toFixed(2)} Securely
                                </>
                            )}
                        </button>

                        <p className="text-center text-xs text-text-muted mt-2">
                            By clicking the button above, you agree to our <a href="#" className="underline hover:text-primary">Terms of Service</a> and <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
                        </p>
                    </form>

                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center">Loading...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
