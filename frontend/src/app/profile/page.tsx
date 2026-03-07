"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { authService, type UserInfo } from "@/services/auth.service";
import { membershipService } from "@/services/membership.service";
import type { MembershipSubscription } from "@/types";
import { MaterialIcon, Button } from "@/components/ui";

export default function ProfilePage() {
    const { isLoggedIn, loading: authLoading } = useAuth();

    // State
    const [profile, setProfile] = useState<UserInfo | null>(null);
    const [subscription, setSubscription] = useState<MembershipSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form fields
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState({ text: "", type: "success" });

    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            window.location.href = "/login";
            return;
        }

        if (!authLoading && isLoggedIn) {
            loadData();
        }
    }, [isLoggedIn, authLoading]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [profileData, subData] = await Promise.all([
                authService.getMe(),
                membershipService.getStatus()
            ]);

            setProfile(profileData);
            setFullName(profileData.fullName || "");
            setEmail(profileData.email || "");

            setSubscription(subData);
        } catch (err) {
            setMessage({
                text: err instanceof Error ? err.message : "Failed to load profile",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: "", type: "success" });

        try {
            await authService.updateProfile({ fullName, email });
            setMessage({ text: "Profile updated successfully!", type: "success" });
            // Refresh to get latest data
            await loadData();
        } catch (err) {
            setMessage({
                text: err instanceof Error ? err.message : "Failed to update profile",
                type: "error"
            });
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <MaterialIcon name="sync" className="animate-spin text-4xl text-primary" />
            </div>
        );
    }

    if (!profile) return null;

    return (
        <main className="container mx-auto max-w-4xl px-4 py-8">
            <h1 className="text-3xl font-serif-display font-bold text-text-main dark:text-white mb-8">
                My Account
            </h1>

            <div className="grid gap-8 md:grid-cols-3">

                {/* Left Column: Settings Form */}
                <div className="md:col-span-2">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <MaterialIcon name="person" className="text-primary" />
                            Personal Information
                        </h2>

                        {message.text && (
                            <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.type === "success"
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={profile.username}
                                    disabled
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700"
                                />
                                <p className="text-xs text-gray-500 mt-1">Username cannot be changed.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:bg-surface-dark dark:border-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:bg-surface-dark dark:border-gray-700"
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={saving || (fullName === profile.fullName && email === profile.email)}
                                    className="min-w-[140px]"
                                >
                                    {saving ? (
                                        <MaterialIcon name="sync" className="animate-spin mr-2" />
                                    ) : null}
                                    {saving ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: Membership Status */}
                <div className="space-y-6">
                    <div className={`rounded-2xl shadow-sm border p-6 relative overflow-hidden ${subscription?.status === "ACTIVE"
                            ? "bg-gradient-to-br from-gray-900 to-black text-white border-black"
                            : "bg-white dark:bg-surface-dark border-gray-100 dark:border-white/5"
                        }`}>
                        {subscription?.status === "ACTIVE" && (
                            <div className="absolute -top-10 -right-10 text-white/5 pointer-events-none">
                                <MaterialIcon name="star" filled className="text-[160px]" />
                            </div>
                        )}

                        <h2 className={`text-lg font-bold mb-2 flex items-center gap-2 ${subscription?.status === "ACTIVE" ? "text-yellow-400" : "text-gray-500"
                            }`}>
                            <MaterialIcon name={subscription?.status === "ACTIVE" ? "workspace_premium" : "card_membership"} filled={subscription?.status === "ACTIVE"} />
                            Membership Status
                        </h2>

                        {subscription?.status === "ACTIVE" ? (
                            <div className="space-y-4">
                                <div>
                                    <div className="text-3xl font-serif-display font-bold text-white mb-1">
                                        {subscription.planCode} Plan
                                    </div>
                                    <div className="text-gray-400 text-sm">
                                        Active until {new Date(subscription.endDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 pb-1.5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wide border border-green-500/30">
                                    <MaterialIcon name="check_circle" className="text-[14px]" />
                                    Active
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                                    You don't have an active premium membership. Upgrade to unlock all recipes!
                                </p>
                                <Link href="/membership" className="block">
                                    <Button
                                        className="w-full bg-gradient-to-r from-primary to-orange-500 hover:opacity-90 text-white"
                                    >
                                        <MaterialIcon name="auto_awesome" className="mr-2" />
                                        Upgrade Now
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </main>
    );
}
