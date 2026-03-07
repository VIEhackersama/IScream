"use client";

import { useState } from "react";
import { feedbackService } from "@/services";
import type { CreateFeedbackRequest } from "@/types";

export default function FeedbackPage() {
  const [form, setForm] = useState<CreateFeedbackRequest>({
    name: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) {
      setError("Please enter your feedback message.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await feedbackService.submit(form);
      setSuccess(true);
    } catch {
      setError("Failed to send feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <main className="flex-1 flex flex-col lg:flex-row w-full">
        {/* Left Hero Section */}
        <section className="lg:w-1/2 relative min-h-[300px] lg:min-h-[calc(100vh-65px)] flex items-center justify-center overflow-hidden bg-primary/10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent z-10" />

          <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply blur-xl opacity-70 animate-blob" />
          <div className="absolute top-10 right-10 w-32 h-32 bg-primary rounded-full mix-blend-multiply blur-xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply blur-xl opacity-70 animate-blob animation-delay-4000" />

          <img
            alt="Delicious strawberry ice cream cone melting slightly"
            className="absolute inset-0 w-full h-full object-cover z-0"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOEVumhXoVGlR6x_X5aH3-lBOAknTqk9TIOSE6oE66HUObxyqCjII-jPc6nh7JfP6YZfryaFMWxQkLYqsYGbcVeKhM5YBxZA-Sb2XTIfXYEWL2LCzfqVDchpv_MqzXx-C51Zpt9Ru2Ikp6wjeXapRVib_lORGORUpqyJ2Q7ik366QfdZggJ83gZIS2a8Y5bLidoNu3C9RhfCINjmMKLbZQi7-xQlL3I4c7iM_M_m9eP061CA_j71e6pK4rQFFltEaublSD13vzaoY"
          />

          <div className="relative z-20 p-10 text-center lg:text-left bg-white/30 backdrop-blur-md rounded-3xl m-8 lg:m-0 lg:bg-transparent lg:backdrop-blur-none border border-white/50 lg:border-none shadow-xl lg:shadow-none">
            <h1 className="text-[#181112] lg:text-white text-4xl lg:text-6xl font-extrabold tracking-tight drop-shadow-sm lg:drop-shadow-md">
              What&apos;s the <br /> Scoop?
            </h1>
            <p className="mt-4 text-[#181112] lg:text-white font-medium text-lg lg:text-xl drop-shadow-sm">
              Help us create the next big flavor.
            </p>
          </div>
        </section>

        {/* Right Form Section */}
        <section className="lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 lg:p-20 bg-background-light dark:bg-background-dark">
          <div className="w-full max-w-[560px] flex flex-col gap-6">
            <div>
              <h2 className="text-text-main dark:text-white tracking-tight text-[32px] md:text-[40px] font-extrabold leading-tight">
                We Want the Scoop!
              </h2>
              <p className="text-text-muted dark:text-gray-400 text-base md:text-lg font-normal leading-normal pt-2">
                Have a flavor idea? Loved a recipe? Let us know below.
              </p>
            </div>

            {/* Success state */}
            {success ? (
              <div className="flex flex-col items-center gap-5 py-8 text-center">
                <div className="size-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                  <span className="material-symbols-outlined text-5xl">check_circle</span>
                </div>
                <h3 className="text-2xl font-black text-text-main dark:text-white">
                  Thank you! 🎉
                </h3>
                <p className="text-text-muted dark:text-gray-400">
                  Your feedback has been sent successfully. We will review it as soon as possible!
                </p>
                <button
                  onClick={() => { setSuccess(false); setForm({ name: "", email: "", message: "" }); }}
                  className="h-12 px-8 rounded-full bg-primary text-white font-bold hover:bg-red-600 transition-colors"
                >
                  Send another feedback
                </button>
              </div>
            ) : (
              <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                {error && (
                  <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl">
                    {error}
                  </p>
                )}

                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-text-main dark:text-gray-200 text-sm font-bold ml-2">Your Name</label>
                  <div className="flex w-full items-stretch rounded-full bg-white dark:bg-surface-dark border border-transparent focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-sm">
                    <div className="text-primary flex items-center justify-center pl-5">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-full text-text-main dark:text-white focus:outline-0 focus:ring-0 border-none bg-transparent h-14 placeholder:text-text-muted px-4 text-base font-normal leading-normal"
                      placeholder="Jane Doe"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label className="text-text-main dark:text-gray-200 text-sm font-bold ml-2">Email Address</label>
                  <div className="flex w-full items-stretch rounded-full bg-white dark:bg-surface-dark border border-transparent focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-sm">
                    <div className="text-primary flex items-center justify-center pl-5">
                      <span className="material-symbols-outlined">mail</span>
                    </div>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-full text-text-main dark:text-white focus:outline-0 focus:ring-0 border-none bg-transparent h-14 placeholder:text-text-muted px-4 text-base font-normal leading-normal"
                      placeholder="scoops@example.com"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-2">
                  <label className="text-text-main dark:text-gray-200 text-sm font-bold ml-2">
                    What&apos;s on your mind? <span className="text-primary">*</span>
                  </label>
                  <div className="flex w-full items-start rounded-[2rem] bg-white dark:bg-surface-dark border border-transparent focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-sm p-2">
                    <div className="text-primary flex items-start justify-center pl-4 pt-3">
                      <span className="material-symbols-outlined">chat_bubble</span>
                    </div>
                    <textarea
                      className="form-textarea flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-[1.5rem] text-text-main dark:text-white focus:outline-0 focus:ring-0 border-none bg-transparent min-h-[140px] placeholder:text-text-muted px-4 py-3 text-base font-normal leading-normal"
                      placeholder="Tell us about your dream flavor..."
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <button
                  className="mt-4 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-4 bg-primary hover:bg-primary-light text-white text-lg font-bold leading-normal tracking-[0.015em] transition-all shadow-lg shadow-primary/30 transform active:scale-[0.98] disabled:opacity-60"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <span className="truncate">Send Feedback</span>
                      <span className="material-symbols-outlined ml-2 text-xl">send</span>
                    </>
                  )}
                </button>

                <div className="text-center mt-2">
                  <p className="text-xs text-text-muted">
                    By clicking send, you agree to our{" "}
                    <a className="underline hover:text-primary" href="#">
                      Terms of Service
                    </a>
                    .
                  </p>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}