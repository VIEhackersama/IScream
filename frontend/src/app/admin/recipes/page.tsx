"use client";

import { useState, useEffect, useCallback } from "react";
import AdminShell from "../_components/AdminShell";
import { MaterialIcon } from "@/components/ui";
import { adminRecipeService, type CreateRecipeRequest, type UpdateRecipeRequest } from "@/services/admin.recipe.service";
import type { Recipe } from "@/types";

// ── Category helpers (derived from flavorName — backend has no category field) ──
const CATEGORIES = ["All Types", "Gelato", "Sorbet", "Yogurt", "Ice Cream", "Other"] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<string, string> = {
    Gelato: "bg-blue-100 text-blue-700",
    Sorbet: "bg-purple-100 text-purple-700",
    Yogurt: "bg-pink-100 text-pink-700",
    "Ice Cream": "bg-amber-100 text-amber-700",
    Other: "bg-gray-100 text-gray-600",
};

function guessCategory(name: string): string {
    const n = name.toLowerCase();
    if (n.includes("gelato")) return "Gelato";
    if (n.includes("sorbet")) return "Sorbet";
    if (n.includes("yogurt")) return "Yogurt";
    return "Ice Cream";
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ isActive }: { isActive: boolean }) {
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${isActive ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}
        >
            <span className={`size-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-yellow-500"}`} />
            {isActive ? "Published" : "Draft"}
        </span>
    );
}

// ── Empty avatar for recipe ───────────────────────────────────────────────────
function RecipeAvatar({ url, name }: { url?: string; name: string }) {
    if (url) {
        return (
            <img src={url} alt={name} className="size-11 rounded-xl object-cover shadow-sm" />
        );
    }
    return (
        <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-lg font-black text-primary shadow-sm">
            {name[0]?.toUpperCase() ?? "R"}
        </div>
    );
}

// ── Confirm delete dialog ─────────────────────────────────────────────────────
function ConfirmDialog({
    recipe,
    onConfirm,
    onCancel,
}: {
    recipe: Recipe;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-100">
                    <MaterialIcon name="delete_forever" filled className="text-[24px] text-red-500" />
                </div>
                <h3 className="text-lg font-black text-text-main">Delete Recipe?</h3>
                <p className="mt-1 text-sm text-text-muted">
                    This will soft-delete <strong>&ldquo;{recipe.flavorName}&rdquo;</strong>. It can be restored later.
                </p>
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-text-muted hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Recipe Form Modal ─────────────────────────────────────────────────────────
function RecipeModal({
    mode,
    recipe,
    onClose,
    onSaved,
}: {
    mode: "create" | "edit";
    recipe?: Recipe;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [form, setForm] = useState({
        flavorName: recipe?.flavorName ?? "",
        shortDescription: recipe?.shortDescription ?? "",
        ingredients: recipe?.ingredients ?? "",
        procedure: recipe?.procedure ?? "",
        imageUrl: recipe?.imageUrl ?? "",
        isActive: recipe?.isActive ?? true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value, type } = e.target;
        setForm((p) => ({
            ...p,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.flavorName.trim()) { setError("Flavor name is required."); return; }
        setLoading(true);
        setError("");
        try {
            if (mode === "create") {
                const payload: CreateRecipeRequest = {
                    flavorName: form.flavorName.trim(),
                    shortDescription: form.shortDescription || undefined,
                    ingredients: form.ingredients || undefined,
                    procedure: form.procedure || undefined,
                    imageUrl: form.imageUrl || undefined,
                };
                await adminRecipeService.create(payload);
            } else {
                const payload: UpdateRecipeRequest = {
                    flavorName: form.flavorName.trim(),
                    shortDescription: form.shortDescription || undefined,
                    ingredients: form.ingredients || undefined,
                    procedure: form.procedure || undefined,
                    imageUrl: form.imageUrl || undefined,
                    isActive: form.isActive,
                };
                await adminRecipeService.update(recipe!.id, payload);
            }
            onSaved();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An error occurred.");
        } finally {
            setLoading(false);
        }
    }

    const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15";
    const labelCls = "block text-xs font-semibold text-gray-500 mb-1";

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm py-8">
            <div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                            <MaterialIcon name={mode === "create" ? "add" : "edit"} filled className="text-primary text-[20px]" />
                        </div>
                        <h2 className="text-lg font-black text-text-main">
                            {mode === "create" ? "Add New Recipe" : "Edit Recipe"}
                        </h2>
                    </div>
                    <button onClick={onClose} className="size-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
                        <MaterialIcon name="close" className="text-[20px]" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                        <MaterialIcon name="error" filled className="text-[16px] shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                    <div>
                        <label className={labelCls}>Flavor Name *</label>
                        <input name="flavorName" value={form.flavorName} onChange={handleChange}
                            placeholder="e.g. Classic Vanilla Bean" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Short Description</label>
                        <input name="shortDescription" value={form.shortDescription} onChange={handleChange}
                            placeholder="Brief description..." className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Image URL</label>
                        <input name="imageUrl" value={form.imageUrl} onChange={handleChange}
                            placeholder="https://..." className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Ingredients</label>
                        <textarea name="ingredients" value={form.ingredients} onChange={handleChange}
                            placeholder="List ingredients..." rows={3} className={inputCls + " resize-none"} />
                    </div>
                    <div>
                        <label className={labelCls}>Procedure</label>
                        <textarea name="procedure" value={form.procedure} onChange={handleChange}
                            placeholder="Describe the steps..." rows={3} className={inputCls + " resize-none"} />
                    </div>

                    {mode === "edit" && (
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className={`relative h-5 w-9 rounded-full transition-colors ${form.isActive ? "bg-primary" : "bg-gray-200"}`}>
                                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="sr-only" />
                                <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                            </div>
                            <span className="text-sm font-semibold text-text-main">Published</span>
                        </label>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-text-muted hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-white shadow-md shadow-primary/25 hover:bg-primary-hover disabled:opacity-60">
                            {loading ? <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : null}
                            {mode === "create" ? "Create Recipe" : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminRecipesPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<Category>("All Types");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [modal, setModal] = useState<{ mode: "create" | "edit"; recipe?: Recipe } | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const PAGE_SIZE = 10;

    // ── Fetch ────────────────────────────────────────────────────────────────
    const fetchRecipes = useCallback(async (page: number) => {
        setLoading(true);
        setError("");
        try {
            const res = await adminRecipeService.getAll(page, PAGE_SIZE);
            if (res.success && res.data) {
                setRecipes(res.data.items);
                setTotalCount(res.data.totalCount);
                setTotalPages(res.data.totalPages);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load recipes.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRecipes(currentPage); }, [currentPage, fetchRecipes]);

    // ── Filter (client-side search + category) ───────────────────────────────
    const filtered = recipes.filter((r) => {
        const matchSearch = search === "" ||
            r.flavorName.toLowerCase().includes(search.toLowerCase()) ||
            (r.shortDescription ?? "").toLowerCase().includes(search.toLowerCase());
        const cat = guessCategory(r.flavorName);
        const matchCat = activeCategory === "All Types" || cat === activeCategory;
        return matchSearch && matchCat;
    });

    // ── Delete ───────────────────────────────────────────────────────────────
    async function confirmDelete(recipe: Recipe) {
        setActionLoading(recipe.id);
        try {
            await adminRecipeService.remove(recipe.id);
            setDeleteTarget(null);
            fetchRecipes(currentPage);
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Delete failed.");
        } finally {
            setActionLoading(null);
        }
    }

    // ── Quick toggle publish ─────────────────────────────────────────────────
    async function togglePublish(recipe: Recipe) {
        setActionLoading(recipe.id);
        try {
            await adminRecipeService.update(recipe.id, { isActive: !recipe.isActive });
            fetchRecipes(currentPage);
        } catch {
            // silent
        } finally {
            setActionLoading(null);
        }
    }

    // ── Pagination buttons ───────────────────────────────────────────────────
    function PaginationBtn({ page, active }: { page: number; active: boolean }) {
        return (
            <button
                onClick={() => setCurrentPage(page)}
                className={`flex size-8 items-center justify-center rounded-full text-sm font-bold transition-all ${active ? "bg-primary text-white shadow-md shadow-primary/30" : "text-text-muted hover:bg-gray-100"
                    }`}
            >
                {page}
            </button>
        );
    }

    const pageNums: (number | "…")[] = [];
    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pageNums.push(i);
    } else {
        pageNums.push(1);
        if (currentPage > 3) pageNums.push("…");
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pageNums.push(i);
        if (currentPage < totalPages - 2) pageNums.push("…");
        pageNums.push(totalPages);
    }

    return (
        <AdminShell activePage="recipes" breadcrumb="Recipes">

            {/* ── Header ── */}
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-[2rem] font-black leading-tight tracking-tight text-text-main">
                        Recipe Management
                    </h1>
                    <p className="mt-1 text-sm text-text-muted">
                        Manage your ice cream library.{" "}
                        <span className="font-bold text-text-main">Total Recipes: {totalCount}</span>
                    </p>
                </div>
                <button
                    onClick={() => setModal({ mode: "create" })}
                    className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover active:scale-[0.98]"
                >
                    <MaterialIcon name="add" className="text-[18px]" />
                    Add New Recipe
                </button>
            </div>

            {/* ── Search + Filter bar ── */}
            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                {/* Search */}
                <div className="relative flex-1 min-w-[220px]">
                    <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by title, ingredient, or author..."
                        className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-black outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
                    />
                </div>

                {/* Category filters */}
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${activeCategory === cat
                                    ? "bg-text-main text-white"
                                    : "bg-gray-100 text-text-muted hover:bg-gray-200"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Table ── */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                {error && (
                    <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4 text-sm text-red-600">
                        <MaterialIcon name="error" filled className="text-[16px]" />
                        {error}
                        <button onClick={() => fetchRecipes(currentPage)} className="ml-auto text-xs font-semibold underline">Retry</button>
                    </div>
                )}

                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-gray-100">
                            {["Recipe Name", "Category", "Date Added", "Status", "Actions"].map((h) => (
                                <th key={h} className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-16 text-center">
                                    <span className="inline-block size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-16 text-center text-sm text-gray-400">
                                    <MaterialIcon name="search_off" className="mb-2 text-[40px] text-gray-200" />
                                    <p>No recipes found.</p>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((recipe, idx) => {
                                const isLast = idx === filtered.length - 1;
                                const cat = guessCategory(recipe.flavorName);
                                const isProcessing = actionLoading === recipe.id;
                                return (
                                    <tr
                                        key={recipe.id}
                                        className={`group transition-colors hover:bg-gray-50 ${!isLast ? "border-b border-gray-100" : ""}`}
                                    >
                                        {/* Recipe Name */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <RecipeAvatar url={recipe.imageUrl} name={recipe.flavorName} />
                                                <div>
                                                    <p className="font-bold text-text-main">{recipe.flavorName}</p>
                                                    <p className="text-xs text-gray-400">ID: #{recipe.id.slice(0, 7).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="px-6 py-4">
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_COLORS[cat] ?? "bg-gray-100 text-gray-600"}`}>
                                                • {cat}
                                            </span>
                                        </td>

                                        {/* Date Added */}
                                        <td className="px-6 py-4 text-text-muted">
                                            {new Date(recipe.createdAt).toLocaleDateString("en-US", {
                                                month: "short", day: "numeric", year: "numeric",
                                            })}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <StatusBadge isActive={recipe.isActive} />
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100">
                                                {isProcessing ? (
                                                    <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                                ) : (
                                                    <>
                                                        {/* Toggle publish */}
                                                        <button
                                                            onClick={() => togglePublish(recipe)}
                                                            title={recipe.isActive ? "Unpublish" : "Publish"}
                                                            className="flex size-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                                                        >
                                                            <MaterialIcon name={recipe.isActive ? "visibility_off" : "visibility"} className="text-[16px]" />
                                                        </button>
                                                        {/* Edit */}
                                                        <button
                                                            onClick={() => setModal({ mode: "edit", recipe })}
                                                            title="Edit"
                                                            className="flex size-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                                                        >
                                                            <MaterialIcon name="edit" className="text-[16px]" />
                                                        </button>
                                                        {/* Delete */}
                                                        <button
                                                            onClick={() => setDeleteTarget(recipe)}
                                                            title="Delete"
                                                            className="flex size-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                                                        >
                                                            <MaterialIcon name="delete" className="text-[16px]" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                        <p className="text-sm text-text-muted">
                            Showing{" "}
                            <span className="font-bold text-text-main">
                                {(currentPage - 1) * PAGE_SIZE + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-bold text-text-main">
                                {Math.min(currentPage * PAGE_SIZE, totalCount)}
                            </span>{" "}
                            of{" "}
                            <span className="font-bold text-text-main">{totalCount}</span>{" "}
                            results
                        </p>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="flex size-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 disabled:opacity-30"
                            >
                                <MaterialIcon name="chevron_left" className="text-[20px]" />
                            </button>
                            {pageNums.map((p, i) =>
                                p === "…" ? (
                                    <span key={`ellipsis-${i}`} className="px-1 text-sm text-gray-400">…</span>
                                ) : (
                                    <PaginationBtn key={p} page={p} active={p === currentPage} />
                                )
                            )}
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="flex size-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 disabled:opacity-30"
                            >
                                <MaterialIcon name="chevron_right" className="text-[20px]" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Modals ── */}
            {modal && (
                <RecipeModal
                    mode={modal.mode}
                    recipe={modal.recipe}
                    onClose={() => setModal(null)}
                    onSaved={() => { setModal(null); fetchRecipes(currentPage); }}
                />
            )}

            {deleteTarget && (
                <ConfirmDialog
                    recipe={deleteTarget}
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={() => confirmDelete(deleteTarget)}
                />
            )}
        </AdminShell>
    );
}
