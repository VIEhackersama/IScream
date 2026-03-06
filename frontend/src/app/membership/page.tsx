"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon, Badge } from "@/components/ui";
import { routes } from "@/config";
import { useAuth } from "@/context/AuthContext";
import { membershipService } from "@/services";

export default function MembershipPage() {
    const router = useRouter();
    const { user, isLoggedIn } = useAuth();
    const [loading, setLoading] = useState(false);

    // Navigate to checkout with the selected plan
    const handleSubscribe = async (planId: "MONTHLY_15" | "YEARLY_150") => {
        if (!isLoggedIn) {
            router.push(`${routes.login}?returnUrl=${encodeURIComponent(routes.membership)}`);
            return;
        }

        setLoading(true);
        router.push(`/membership/checkout?plan=${planId}`);
    };

    return (
        <div className="flex w-full flex-col items-center px-4 py-16 md:py-24 max-w-[1200px] mx-auto">
            {/* Header Section */}
            <div className="mb-16 flex flex-col items-center text-center">
                <Badge className="mb-6 border-transparent bg-primary/10 text-primary dark:bg-primary/20 flex gap-2 w-max">
                    <MaterialIcon name="stars" className="text-sm" />
                    PREMIUM ACCESS
                </Badge>

                <h1 className="font-serif-display text-5xl md:text-[5rem] font-black leading-tight tracking-tight text-text-main dark:text-white mb-6">
                    Sweeten the Deal!
                </h1>

                <p className="max-w-[600px] text-lg md:text-xl font-medium leading-relaxed text-text-muted">
                    Join the Scoop Squad and unlock exclusive flavors of content. Choose the plan that fits your appetite.
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid w-full gap-8 md:grid-cols-2 md:max-w-[900px]">

                {/* Monthly Plan */}
                <div className="relative flex flex-col items-start rounded-[2.5rem] bg-white p-10 shadow-xl shadow-gray-200/50 dark:bg-surface-dark dark:shadow-none border border-gray-100">
                    <h3 className="text-sm font-black tracking-widest uppercase text-text-muted mb-6">The Single Scoop</h3>
                    <div className="flex items-end gap-2 mb-4">
                        <span className="text-6xl font-black text-text-main dark:text-white">$15</span>
                        <span className="text-xl font-bold text-text-muted pb-2">/ mo</span>
                    </div>
                    <p className="text-sm text-text-muted mb-10 w-full pb-8 border-b border-gray-100">Perfect for tasting the waters.</p>

                    <ul className="flex flex-col gap-5 mb-12 w-full">
                        {[
                            "Full Recipe Access",
                            "Monthly Newsletter",
                            "Community Forum Access"
                        ].map((perk, i) => (
                            <li key={i} className="flex items-center gap-4 text-text-main font-semibold">
                                <MaterialIcon name="icecream" filled className="text-primary text-xl" />
                                {perk}
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => handleSubscribe("MONTHLY_15")}
                        disabled={loading}
                        className="mt-auto w-full rounded-full border-2 border-gray-200 py-4 font-bold text-text-main hover:border-text-main transition-colors disabled:opacity-50"
                    >
                        {loading ? "Processing..." : "Select Monthly"}
                    </button>
                </div>

                {/* Yearly Plan (Best Value) */}
                <div className="relative flex flex-col items-start rounded-[2.5rem] bg-white p-10 shadow-2xl shadow-primary/10 border-[3px] border-primary dark:bg-surface-dark">
                    {/* Badge */}
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1.5 flex items-center gap-1.5 shadow-lg shadow-primary/20">
                        <MaterialIcon name="verified" filled className="text-white text-sm" />
                        <span className="text-xs font-black uppercase tracking-wider text-white">Best Value</span>
                    </div>

                    <h3 className="text-sm font-black tracking-widest uppercase text-primary mb-6">The Sundae Special</h3>
                    <div className="flex items-end gap-2 mb-4">
                        <span className="text-6xl font-black text-text-main dark:text-white">$150</span>
                        <span className="text-xl font-bold text-text-muted pb-2">/ yr</span>
                    </div>

                    <div className="mb-10 w-full pb-8 border-b border-gray-100">
                        <span className="inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
                            Save $30 compared to monthly!
                        </span>
                    </div>

                    <ul className="flex flex-col gap-5 mb-12 w-full">
                        <li className="flex items-center gap-4 text-text-main font-bold">
                            <MaterialIcon name="check_circle" filled className="text-primary text-xl" />
                            All Monthly perks
                        </li>
                        {[
                            "Early Access to Books",
                            "Exclusive Merch",
                            "\"Mr. A's\" Secret Menu"
                        ].map((perk, i) => (
                            <li key={i} className="flex items-center gap-4 text-text-main font-semibold">
                                <MaterialIcon name="icecream" filled className="text-primary text-xl" />
                                {perk}
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => handleSubscribe("YEARLY_150")}
                        disabled={loading}
                        className="mt-auto w-full rounded-full bg-primary py-4 font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary-hover hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? "Processing..." : "Proceed to Payment"}
                    </button>
                </div>
            </div>

            {/* Footer Trust Markers */}
            <div className="mt-20 flex flex-col items-center gap-4 opacity-50">
                <div className="flex items-center gap-2 text-sm font-bold tracking-wider uppercase text-text-muted">
                    <MaterialIcon name="lock" className="text-sm" /> Secure Payment
                </div>
                <div className="flex gap-4">
                    <span className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-500">VISA</span>
                    <span className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-500">Mastercard</span>
                    <span className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-500">Amex</span>
                </div>
            </div>
        </div>
    );
}
