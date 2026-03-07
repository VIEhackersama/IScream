"use client";

import { useEffect, useState } from "react";
import { recipeService } from "@/services";
import { RequireAuth } from "@/components/auth/RequireAuth";
import type { Recipe } from "@/types";

/* ─── Skeleton Card ─────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800 animate-pulse">
      <div className="w-full aspect-[4/3] rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="px-1 pb-2 flex flex-col gap-2">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    </div>
  );
}

/* ─── Recipe Card ────────────────────────────────────── */
function RecipeCard({ recipe }: { recipe: Recipe }) {
  const fallbackImg =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAuml-kcfcPWeQBjMtTp9qNy2__FOkkxDJDXMp0QJqHwBlOeWZADpnNTXmemZ9LqvyaimNAdVs1EGRnnOUxNMUVxkrc0G9BGEVgFph5XOdJhYy2DbTEeql1E5LtYvl2Ozk2t1qF1tNfOu5xOilaYGbIWexibTqnCvXEQdONhyYHbLYA2E4Z1DZsnovxi6InrGGTvSbitgbig_XcxY6jjCD031OVC4KSu7-vM88HV18iiqoRA9Y0GU2N_YkcSxDgjCk_I1c9wmUBWrA";

  return (
    <div className="group flex flex-col gap-3 bg-white dark:bg-gray-900 p-3 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-800">
      <div
        className="w-full aspect-[4/3] rounded-lg bg-gray-200 dark:bg-gray-800 bg-center bg-cover relative overflow-hidden"
        style={{ backgroundImage: `url('${recipe.imageUrl || fallbackImg}')` }}
      >
        <div className="absolute top-3 right-3 bg-primary text-white px-2 py-1 rounded text-xs font-bold uppercase tracking-wider shadow-lg">
          Free
        </div>
      </div>

      <div className="px-1 pb-2">
        <h3 className="text-lg font-bold leading-tight mb-1 group-hover:text-primary transition-colors">
          {recipe.flavorName}
        </h3>
        {recipe.shortDescription && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {recipe.shortDescription}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(null);
    recipeService
      .getAll(page, 12)
      .then((res) => {
        setRecipes(res.data?.items ?? []);
        setTotalPages(res.data?.totalPages ?? 1);
      })
      .catch(() => setError("Could not load  recipes. Please try again."))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <RequireAuth featureName="recipes">
      {/* Hero Section */}
      <section className="w-full max-w-7xl py-8 md:py-12">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden relative">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl" />

          <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
            <div className="flex-1 flex flex-col gap-6 text-center md:text-left items-center md:items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide">
                <span className="material-symbols-outlined text-sm">
                  auto_awesome
                </span>
                New Recipes Added Weekly
              </div>

              <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight">
                Scoop Up <br />
                <span className="text-primary">The Fun!</span>
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md">
                Dive into IScream&apos;s secret stash of frozen delights. From
                classic sorbets to wild sundae experiments.
              </p>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                <button
                  onClick={() =>
                    document
                      .getElementById("recipes-grid")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="h-12 px-8 rounded-full bg-primary text-white font-bold text-base shadow-xl shadow-primary/20 hover:bg-red-600 transition-all flex items-center gap-2"
                >
                  Browse Recipes
                  <span className="material-symbols-outlined">
                    arrow_downward
                  </span>
                </button>
                <a
                  href="/submit"
                  className="h-12 px-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 font-bold text-base hover:border-primary/30 transition-all flex items-center"
                >
                  Submit Yours
                </a>
              </div>
            </div>

            <div className="flex-1 w-full relative">
              <div
                className="aspect-square md:aspect-[4/3] w-full rounded-xl bg-gray-100 dark:bg-gray-800 bg-center bg-cover shadow-2xl rotate-2 hover:rotate-0 transition-all duration-500"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA98AAL8Wa1oSl2dPL2P1dj5abs97vYH8hIdaP95Kw3nkfVkQXTRALy8mpz5FImFyxZ0mJqt7pMr5YYyq1SMMHZtxUoq9iJW56OF2XuyeHcevchiVqVIth6xi_LalgH7CbrpA8qT21XiYpn0wiAyPkA3H6KTSTXQQ0W-ROLJf2H_o1--c1Rn6YVQwTgJhXJHVnpJXKVeymzZ3XLl55LOpqx1319uJeRhUVcHSj6fmBNx9Tmk7-Rd1Qfpdf7Pxl5SDwmHfXnYvvdMZ8')",
                }}
              />
              <div
                className="absolute -bottom-6 -left-6 md:bottom-8 md:-left-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce"
                style={{ animationDuration: "3s" }}
              >
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full text-yellow-600 dark:text-yellow-400">
                  <span className="material-symbols-outlined">star</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Top Rated
                  </p>
                  <p className="font-bold">
                    {recipes[0]?.flavorName ?? "Loading..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recipe Grid */}
      <section id="recipes-grid" className="w-full max-w-7xl pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black">
            {loading
              ? "Loading..."
              : error
                ? "Error"
                : `${recipes.length > 0 ? "All Recipes" : "No Recipes Yet"}`}
          </h2>
        </div>

        {error && (
          <div className="w-full py-12 flex flex-col items-center gap-4 text-center">
            <span className="material-symbols-outlined text-4xl text-red-400">
              error
            </span>
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
            <button
              onClick={() => setPage(1)}
              className="h-10 px-6 rounded-full bg-primary text-white text-sm font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {!error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            ) : recipes.length === 0 ? (
              <div className="col-span-4 py-20 text-center text-gray-400">
                <span className="material-symbols-outlined text-5xl mb-4 block">
                  icecream
                </span>
                <p className="text-lg font-medium">
                  No recipes yet. Check back later!
                </p>
              </div>
            ) : (
              recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-10">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center disabled:opacity-40 hover:border-primary transition-colors"
            >
              <span className="material-symbols-outlined text-sm">
                chevron_left
              </span>
            </button>
            <span className="flex items-center text-sm font-semibold text-gray-600 dark:text-gray-300">
              {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center disabled:opacity-40 hover:border-primary transition-colors"
            >
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
            </button>
          </div>
        )}
      </section>
    </RequireAuth>
  );
}
