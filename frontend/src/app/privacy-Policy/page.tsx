// app/privacy/page.tsx

export default function PrivacyPage() {
  return (
    <main className="dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display bg-white min-h-screen">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        {/* Hero Section */}
        <div className="px-6 md:px-20 py-10">
          <div className="max-w-[960px] mx-auto">
            <div className="relative overflow-hidden rounded-xl min-h-[300px] flex flex-col justify-end p-8 md:p-12 bg-primary/5 border border-primary/10">
              {/* Decorative Sprinkles */}
              <div className="absolute top-4 right-10 text-primary opacity-30 transform rotate-12">
                <span className="material-symbols-outlined text-6xl">set_meal</span>
              </div>
              <div className="absolute bottom-20 left-10 text-primary opacity-20 transform -rotate-45">
                <span className="material-symbols-outlined text-4xl">favorite</span>
              </div>

              <div className="z-10">
                <span className="inline-block px-3 py-1 bg-primary text-xs font-bold rounded-full mb-4 uppercase tracking-widest text-white">
                  Legal Stuff
                </span>

                <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-[-0.033em] mb-4">
                  Your Privacy is <span className="text-primary">Sweet</span> to Us
                </h1>

                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl">
                  We handle your personal data as carefully as we handle our secret, triple-churned recipes. No melted
                  info here!
                </p>
              </div>

              {/* Background decoration */}
              <div className="absolute inset-0 opacity-5 sprinkle-pattern pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 md:px-20 pb-20">
          <div className="max-w-[800px] mx-auto">
            <div className="space-y-12">
              {/* Section 1 */}
              <section className="relative">
                <div className="flex items-start gap-4">
                  <div className="mt-1 size-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">data_object</span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-4">1. The Scoops We Collect</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      Just like picking flavors, we collect certain bits of information to make your experience smooth.
                      This includes your name, email for rewards points, and your absolute favorite flavors so we can let
                      you know when they&apos;re back in stock!
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 pl-4">
                      <li>Contact details (Name, Email, Phone)</li>
                      <li>Order history (Your go-to sundaes)</li>
                      <li>Location (To find your nearest parlor)</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section className="relative">
                <div className="flex items-start gap-4">
                  <div className="mt-1 size-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">favorite</span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-4">2. How We Use the Toppings</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      We don&apos;t just sit on this data. We use it to sprinkle joy! Your information helps us process
                      your orders faster, send you birthday treats, and improve our seasonal menu based on what you love
                      most.
                    </p>
                  </div>
                </div>
              </section>

              {/* Decorative Divider */}
              <div className="flex justify-center py-4">
                <div className="flex gap-2">
                  <div className="size-2 rounded-full bg-primary/30" />
                  <div className="size-2 rounded-full bg-primary" />
                  <div className="size-2 rounded-full bg-primary/30" />
                </div>
              </div>

              {/* Section 3 */}
              <section className="relative">
                <div className="flex items-start gap-4">
                  <div className="mt-1 size-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">lock</span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-4">3. Keeping it Chilled (Security)</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      We use industrial-grade encryption (colder than our walk-in freezers) to protect your sensitive
                      details. Your payment information is processed through secure, third-party partners and never
                      stored directly on our ice cream servers.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section className="relative">
                <div className="flex items-start gap-4">
                  <div className="mt-1 size-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">cookie</span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-4">4. Cookies (The Digital Kind)</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      While we prefer the chocolate chip kind, our website uses digital cookies to remember your
                      preferences. These help us understand which parts of our site are the most popular, just like we
                      track which toppings run out first!
                    </p>
                  </div>
                </div>
              </section>

              {/* Contact Card */}
              <div className="bg-slate-900 text-white rounded-xl p-8 mt-12 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">Got Questions?</h3>
                  <p className="text-slate-400">
                    If you&apos;re curious about your data, our DPO (Data Protection Officer) is always ready for a chat.
                  </p>
                </div>
                <a
                  className="bg-primary px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform text-white"
                  href="mailto:privacy@mrasicecream.com"
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}