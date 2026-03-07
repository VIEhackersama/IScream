"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { membershipService } from "@/services/membership.service";
import { recipeService } from "@/services/recipe.service";
import { MaterialIcon, Button } from "@/components/ui";
import type { Recipe } from "@/types";

/* ─── Skeleton Card ─────────────────────────────────── */
function SkeletonCard() {
    return (
        <div className="flex flex-col gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse">
            <div className="w-full aspect-[4/3] rounded-xl bg-gray-200 dark:bg-gray-800" />
            <div className="px-1 pb-2 flex flex-col gap-2 mt-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
            </div>
        </div>
    );
}

/* ─── Premium Recipe Card ────────────────────────────────────── */
function PremiumRecipeCard({ recipe }: { recipe: Recipe }) {
    const fallbackImg =
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAuml-kcfcPWeQBjMtTp9qNy2__FOkkxDJDXMp0QJqHwBlOeWZADpnNTXmemZ9LqvyaimNAdVs1EGRnnOUxNMUVxkrc0G9BGEVgFph5XOdJhYy2DbTEeql1E5LtYvl2Ozk2t1qF1tNfOu5xOilaYGbIWexibTqnCvXEQdONhyYHbLYA2E4Z1DZsnovxi6InrGGTvSbitgbig_XcxY6jjCD031OVC4KSu7-vM88HV18iiqoRA9Y0GU2N_YkcSxDgjCk_I1c9wmUBWrA";

    return (
        <div className="group relative flex flex-col gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-yellow-500/10 hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-yellow-500/20 dark:border-white/5 hover:border-yellow-500/50">
            <div
                className="w-full aspect-[4/3] rounded-xl bg-gray-100 dark:bg-gray-800 bg-center bg-cover relative overflow-hidden"
                style={{ backgroundImage: `url('${recipe.imageUrl || fallbackImg}')` }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-yellow-400 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-yellow-500/30 flex items-center gap-1">
                    <MaterialIcon name="star" filled className="text-[14px]" />
                    VIP
                </div>
            </div>

            <div className="px-2 pb-2 mt-2 z-10">
                <h3 className="text-xl font-bold leading-tight mb-2 text-text-main dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                    {recipe.flavorName}
                </h3>
                {recipe.shortDescription && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {recipe.shortDescription}
                    </p>
                )}
                <div className="mt-4 flex items-center gap-2 text-yellow-600 dark:text-yellow-500/80 text-sm font-semibold uppercase tracking-wider group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition-colors">
                    <span>Unlock Recipe</span>
                    <MaterialIcon name="arrow_forward" className="text-[16px] group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </div>
    );
}

export default function VipRecipesPage() {
    const router = useRouter();
    const { isLoggedIn, loading: authLoading } = useAuth();
    const [verifying, setVerifying] = useState(true);
    const [loading, setLoading] = useState(true);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;

        if (!isLoggedIn) {
            router.push('/login?returnUrl=/membership/vip');
            return;
        }

        const verifyMembershipAndLoad = async () => {
            try {
                const subStatus = await membershipService.getStatus();
                if (subStatus?.status !== "ACTIVE") {
                    router.push('/membership'); // Not VIP, redirect to buy
                    return;
                }
                setVerifying(false);

                // Fetch recipes
                const res = await recipeService.getAll(1, 48); // Load more for VIPs
                setRecipes(res.data?.items ?? []);
            } catch (err) {
                console.error("Failed to load VIP data:", err);
                setError("Failed to load your VIP recipes. Please try again.");
                setVerifying(false); // Make sure to stop verifying so the error or reload UI shows up
            } finally {
                setLoading(false);
            }
        };

        verifyMembershipAndLoad();
    }, [isLoggedIn, authLoading, router]);

    if (authLoading || verifying) {
        return (
            <div className="flex justify-center items-center min-h-[80vh] bg-white dark:bg-gray-950 text-yellow-500 w-full fixed inset-0 z-50">
                <div className="flex flex-col items-center gap-4">
                    <MaterialIcon name="diamond" className="animate-pulse text-6xl text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                    <p className="text-sm font-bold tracking-[0.2em] uppercase">Verifying Premium Access...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#faf8f5] dark:bg-gray-950 text-text-main dark:text-white selection:bg-yellow-500/30">
            {/* VIP Hero Section */}
            <section className="relative w-full py-20 md:py-32 overflow-hidden flex flex-col items-center text-center px-4">
                {/* Background effects */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                        <MaterialIcon name="workspace_premium" filled className="text-lg" />
                        Premium Member Access
                    </div>

                    <h1 className="text-5xl md:text-7xl font-serif-display font-black leading-tight tracking-tight mb-6 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-500 dark:from-white dark:via-white dark:to-white/60 bg-clip-text text-transparent">
                        The Master<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-300 dark:to-yellow-600">Class</span> Vault
                    </h1>

                    <p className="max-w-2xl text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                        Welcome to the inner circle. As a premium member, you have full access to our most closely guarded recipes and techniques.
                    </p>
                </div>
            </section>

            {/* Recipes Grid Section */}
            <section className="relative z-10 w-full max-w-[1400px] mx-auto px-6 pb-32">
                <div className="flex items-center justify-between mb-12 border-b border-gray-200 dark:border-white/10 pb-6">
                    <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <MaterialIcon name="auto_awesome" className="text-yellow-500" />
                        Exclusive Recipes
                    </h2>
                </div>

                {error ? (
                    <div className="w-full py-20 flex flex-col items-center gap-6 text-center bg-white dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm">
                        <MaterialIcon name="error_outline" className="text-5xl text-red-400" />
                        <p className="text-gray-600 dark:text-gray-400 max-w-md">{error}</p>
                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-yellow-500 hover:bg-yellow-400 text-white dark:text-black border-none"
                        >
                            Retry Connection
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                        ) : recipes.length === 0 ? (
                            <div className="col-span-full py-32 text-center text-gray-400 dark:text-gray-500 flex flex-col items-center">
                                <MaterialIcon name="inventory_2" className="text-6xl mb-6 opacity-50" />
                                <p className="text-xl font-medium">The vault is currently empty.</p>
                                <p className="text-sm mt-2">New exclusive recipes are being crafted right now.</p>
                            </div>
                        ) : (
                            recipes.map(r => (
                                <div key={r.id} onClick={() => router.push(`/recipes/${r.id}`)}>
                                    <PremiumRecipeCard recipe={r} />
                                </div>
                            ))
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}
