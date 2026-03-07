"use client";

import { useState } from "react";
import { submissionService } from "@/services";
import { RequireAuth } from "@/components/auth/RequireAuth";
import type { CreateSubmissionRequest } from "@/types";

interface Ingredient {
  amount: string;
  name: string;
}

export default function SubmitRecipePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { amount: "", name: "" },
    { amount: "", name: "" },
  ]);
  const [steps, setSteps] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addIngredient = () =>
    setIngredients((prev) => [...prev, { amount: "", name: "" }]);

  const removeIngredient = (idx: number) =>
    setIngredients((prev) => prev.filter((_, i) => i !== idx));

  const updateIngredient = (
    idx: number,
    field: keyof Ingredient,
    value: string,
  ) =>
    setIngredients((prev) =>
      prev.map((ing, i) => (i === idx ? { ...ing, [field]: value } : ing)),
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter the recipe name.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const ingredientText = ingredients
      .filter((i) => i.name.trim())
      .map((i) => (i.amount ? `${i.amount} ${i.name}` : i.name))
      .join("\n");

    const payload: CreateSubmissionRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      ingredients: ingredientText || undefined,
      steps: steps.trim() || undefined,
    };

    try {
      const res = await submissionService.submit(payload);
      setSubmissionId(res.data?.submissionId ?? null);
      setSuccess(true);
    } catch {
      setError("Failed to submit recipe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setSubmissionId(null);
    setTitle("");
    setDescription("");
    setIngredients([
      { amount: "", name: "" },
      { amount: "", name: "" },
    ]);
    setSteps("");
    setError(null);
  };

  return (
    <RequireAuth featureName="recipe submission">
      <main className="flex-1 flex justify-center py-8 px-4 sm:px-6 lg:px-8 bg-background-light dark:bg-background-dark text-[#181112] font-display min-h-screen flex-col">
        <div className="max-w-3xl w-full flex flex-col gap-8">
          {/* Page Heading */}
          <div className="flex flex-col gap-3 text-center sm:text-left">
            <h1 className="text-[#181112] dark:text-white text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em]">
              Share Your <span className="text-primary">Scoop!</span>
            </h1>
            <p className="text-[#896169] dark:text-[#ccb0b6] text-lg font-normal leading-normal max-w-xl mx-auto sm:mx-0">
              Get featured on IScream&apos;s menu! Fill out the details below to
              share your sweetest creation with the world.
            </p>
          </div>

          {/* Success State */}
          {success ? (
            <div className="bg-white dark:bg-[#1a0c0f] rounded-lg shadow-sm p-8 sm:p-12 flex flex-col items-center gap-5 text-center border border-[#f0ebec] dark:border-[#3a2025]">
              <div className="size-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                <span className="material-symbols-outlined text-5xl">
                  check_circle
                </span>
              </div>
              <h2 className="text-2xl font-black text-[#181112] dark:text-white">
                Recipe submitted successfully! 🎉
              </h2>
              <p className="text-[#896169] dark:text-[#ccb0b6]">
                Recipe submitted successfully. We will review and respond as
                soon as possible.
              </p>
              {submissionId && (
                <div className="bg-gray-50 dark:bg-[#2a151a] rounded-lg px-5 py-3">
                  <p className="text-xs text-gray-400 mb-1">
                    Your submission ID:
                  </p>
                  <code className="text-sm font-mono text-primary break-all">
                    {submissionId}
                  </code>
                </div>
              )}
              <button
                onClick={handleReset}
                className="mt-2 h-12 px-8 rounded-full bg-primary text-white font-bold hover:bg-[#d92348] transition-colors"
              >
                Submit another recipe
              </button>
            </div>
          ) : (
            /* Form */
            <div className="bg-white dark:bg-[#1a0c0f] rounded-lg shadow-sm p-6 sm:p-8 flex flex-col gap-8 border border-[#f0ebec] dark:border-[#3a2025]">
              {error && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl">
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {/* Recipe Name */}
                <div className="flex flex-col gap-2">
                  <label
                    className="text-[#181112] dark:text-gray-100 text-base font-bold leading-normal"
                    htmlFor="recipe-name"
                  >
                    What do you call this masterpiece?{" "}
                    <span className="text-primary">*</span>
                  </label>
                  <input
                    id="recipe-name"
                    type="text"
                    placeholder="e.g., 'Midnight Fudge Explosion'"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="form-input flex w-full min-w-0 resize-none overflow-hidden rounded-full text-[#181112] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#e6dbdd] dark:border-[#4a2e34] bg-white dark:bg-[#2a151a] focus:border-primary h-14 placeholder:text-[#896169] px-6 text-base font-normal leading-normal transition-all"
                    required
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                  <label
                    className="text-[#181112] dark:text-gray-100 text-base font-bold leading-normal"
                    htmlFor="recipe-desc"
                  >
                    What&apos;s the story behind it?
                  </label>
                  <textarea
                    id="recipe-desc"
                    rows={3}
                    placeholder="Tell us what inspired this flavor..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-textarea flex w-full min-w-0 resize-none rounded-2xl text-[#181112] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#e6dbdd] dark:border-[#4a2e34] bg-white dark:bg-[#2a151a] focus:border-primary placeholder:text-[#896169] p-6 text-base font-normal leading-normal transition-all"
                  />
                </div>

                {/* Ingredients */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[#181112] dark:text-gray-100 text-base font-bold leading-normal">
                      What goes into the mix?
                    </h3>
                  </div>

                  <div className="flex flex-col gap-3">
                    {ingredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className="flex flex-wrap sm:flex-nowrap gap-3 items-start"
                      >
                        <div className="w-full sm:w-1/3">
                          <input
                            type="text"
                            placeholder="Amount (e.g. 2 scoops)"
                            value={ing.amount}
                            onChange={(e) =>
                              updateIngredient(idx, "amount", e.target.value)
                            }
                            className="form-input w-full rounded-full text-[#181112] dark:text-white focus:ring-2 focus:ring-primary/20 border border-[#e6dbdd] dark:border-[#4a2e34] bg-white dark:bg-[#2a151a] focus:border-primary h-12 placeholder:text-[#896169] px-5 text-base"
                          />
                        </div>
                        <div className="w-full sm:w-2/3 flex gap-2">
                          <input
                            type="text"
                            placeholder="Ingredient (e.g. Vanilla Bean)"
                            value={ing.name}
                            onChange={(e) =>
                              updateIngredient(idx, "name", e.target.value)
                            }
                            className="form-input w-full rounded-full text-[#181112] dark:text-white focus:ring-2 focus:ring-primary/20 border border-[#e6dbdd] dark:border-[#4a2e34] bg-white dark:bg-[#2a151a] focus:border-primary h-12 placeholder:text-[#896169] px-5 text-base"
                          />
                          <button
                            type="button"
                            onClick={() => removeIngredient(idx)}
                            className="shrink-0 size-12 flex items-center justify-center text-[#896169] hover:text-primary hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                            aria-label="Delete ingredient"
                          >
                            <span className="material-symbols-outlined">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addIngredient}
                    className="flex w-max cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-transparent text-primary hover:bg-red-50 dark:hover:bg-red-900/20 gap-2 pl-4 text-sm font-bold leading-normal tracking-[0.015em] transition-colors self-start -ml-4 mt-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      add_circle
                    </span>
                    <span className="truncate">Add Another Ingredient</span>
                  </button>
                </div>

                {/* Instructions */}
                <div className="flex flex-col gap-2">
                  <label
                    className="text-[#181112] dark:text-gray-100 text-base font-bold leading-normal"
                    htmlFor="instructions"
                  >
                    How do we make it?
                  </label>
                  <textarea
                    id="instructions"
                    rows={6}
                    placeholder="Step 1: Mix the magic dust with..."
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    className="form-textarea flex w-full min-w-0 resize-y rounded-2xl text-[#181112] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#e6dbdd] dark:border-[#4a2e34] bg-white dark:bg-[#2a151a] focus:border-primary placeholder:text-[#896169] p-6 text-base font-normal leading-normal transition-all"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex min-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-primary hover:bg-[#d92348] hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all text-white text-lg font-bold leading-normal tracking-[0.015em] w-full sm:w-auto disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <span className="material-symbols-outlined animate-spin mr-2">
                          progress_activity
                        </span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <span className="truncate">Submit Recipe</span>
                        <span className="material-symbols-outlined ml-2">
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          <p className="text-center text-[#896169] text-sm">
            By submitting, you agree to IScream&apos;s{" "}
            <a className="underline hover:text-primary" href="#">
              Community Guidelines
            </a>
            .
          </p>
        </div>
      </main>
    </RequireAuth>
  );
}
