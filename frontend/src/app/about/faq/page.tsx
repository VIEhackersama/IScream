// app/faq/page.tsx
import Link from "next/link";

export default function FaqPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-10 py-10 md:py-14">
      {/* Header / Top nav (nếu bạn đã có Navbar global thì có thể bỏ block này) */}
      <div className="w-full mb-10">
        <div className="flex items-center justify-between gap-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-card-dark/70 backdrop-blur-md px-5 md:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-2xl">icecream</span>
            </div>
            <div className="font-extrabold tracking-tight text-lg">Mr. A&apos;s</div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-primary" href="/">
              Menu
            </Link>
            <Link className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-primary" href="/order-books">
              Shop
            </Link>
            <Link className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-primary" href="/recipes">
              Recipes
            </Link>
            <Link className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-primary" href="/contact">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <label className="hidden sm:block">
              <div className="flex items-center gap-2 rounded-full bg-white dark:bg-background-dark border border-gray-200 dark:border-white/10 px-4 h-10">
                <span className="material-symbols-outlined text-xl text-gray-400">search</span>
                <input
                  className="w-56 bg-transparent outline-none text-sm text-text-main dark:text-white placeholder:text-gray-400"
                  placeholder="Ask a question..."
                />
              </div>
            </label>

            <div className="h-10 w-10 overflow-hidden rounded-full border border-primary/30 bg-primary/5" />

            <button className="md:hidden rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-card-dark border border-gray-200 dark:border-white/10 p-6 md:p-12">
        <div className="grid gap-10 md:grid-cols-2 items-center">
          <div className="order-2 md:order-1 text-center md:text-left">
            <span className="inline-flex items-center rounded-full bg-primary text-white px-4 py-1 text-xs font-bold uppercase tracking-wider">
              Help Center
            </span>

            <h1 className="mt-5 text-4xl md:text-6xl font-black leading-tight tracking-tight text-text-main dark:text-white">
              Got Questions? <br />
              <span className="text-primary">We Have Answers!</span>
            </h1>

            <p className="mt-5 text-base md:text-lg text-text-muted dark:text-gray-300 max-w-md mx-auto md:mx-0">
              Everything you need to know about Mr. A&apos;s sweet world. From scooping tips to secret recipes!
            </p>
          </div>

          <div className="order-1 md:order-2 relative">
            <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl rotate-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Ice cream shop"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMPzvKQjnqMI0zbLktc7shVjGPIyD8VPghMuUHP89WYhbwB_39ZEun9jBcJ7iQhIr8H9PdSlHrxW7GiL9XpPmBejpE1aiYvwZulREbk6Uh8B_2sFc_42k4uouDxbthA3Ozd04MYZWqYINFI5yp-yZMMm3O74Ugjg3hRlF4lsU5DlBMbw-jc7AJQ7REjwdqqrDoKwPVvpisuYHyLdB8VU860-7LDG8XR2kiyYAyX2EUmDmJxQXRLI3WDXHEC26F5ryNHPm9p6HnDB_d"
              />
            </div>

            <div className="absolute -bottom-4 -left-2 md:-left-4 bg-white dark:bg-background-dark p-4 rounded-2xl shadow-xl flex items-center gap-2 -rotate-2 border border-gray-200 dark:border-white/10">
              <span className="material-symbols-outlined text-primary">favorite</span>
              <span className="font-bold text-text-main dark:text-white">Loved by kids!</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content grid */}
      <section className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar */}
        <aside className="lg:col-span-3 flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted px-2">Categories</p>

          <button className="flex items-center gap-3 p-4 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/30 text-left">
            <span className="material-symbols-outlined">star</span>
            General
          </button>

          {[
            { icon: "group", label: "Membership" },
            { icon: "menu_book", label: "Ordering Books" },
            { icon: "restaurant_menu", label: "Recipes" },
          ].map((x) => (
            <button
              key={x.label}
              className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-card-dark text-gray-700 dark:text-gray-200 font-semibold hover:bg-primary/5 dark:hover:bg-white/5 text-left transition-all border border-gray-200 dark:border-white/10"
            >
              <span className="material-symbols-outlined">{x.icon}</span>
              {x.label}
            </button>
          ))}
        </aside>

        {/* Main FAQ */}
        <div className="lg:col-span-9 space-y-10">
          {/* General section */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">info</span>
              </div>
              <h2 className="text-2xl font-extrabold text-text-main dark:text-white">General Questions</h2>
            </div>

            <div className="space-y-4">
              <FaqItem
                open
                q="What are your opening hours?"
                a={
                  <>
                    We&apos;re open for sprinkles and smiles from{" "}
                    <span className="font-bold text-primary">10 AM to 9 PM</span> every single day! On weekends, we stay
                    open until 11 PM for those late-night sugar cravings.
                  </>
                }
              />

              <FaqItem
                q="Do you have dairy-free options?"
                a={
                  <>
                    Absolutely! We have fruit sorbets and coconut-milk based ice creams that are 100% vegan and dairy-free.
                    Try our &quot;Midnight Coconut&quot; — it&apos;s a fan favorite!
                  </>
                }
              />

              <FaqItem
                q="Where is Mr. A's located?"
                a={
                  <>
                    You can find our main parlor at 123 Gelato Lane. Just follow the smell of fresh waffle cones!
                  </>
                }
              />
            </div>
          </section>

          {/* Membership & Recipes cards */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">workspace_premium</span>
              </div>
              <h2 className="text-2xl font-extrabold text-text-main dark:text-white">Membership &amp; Recipes</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard
                icon="redeem"
                title="How do I join the Scoop Club?"
                desc='Signing up is easy! Click "Join Now" on the homepage. You’ll get a free scoop on your birthday!'
              />
              <InfoCard
                icon="blender"
                title="Can I access secret recipes?"
                desc='Scoop Club members get exclusive access to the monthly "Recipe Reveal" where we show you how to make toppings at home!'
              />
            </div>
          </section>

          {/* Ordering Books section */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                <span className="material-symbols-outlined">menu_book</span>
              </div>
              <h2 className="text-2xl font-extrabold text-text-main dark:text-white">Ordering Books</h2>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-text-main dark:bg-card-dark text-white p-7 md:p-10 border border-white/10">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full -mr-20 -mt-20 blur-3xl" />

              <div className="grid gap-8 md:grid-cols-[1fr_220px] items-center relative">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black mb-3">
                    &quot;The Ultimate Ice Cream Guide&quot;
                  </h3>
                  <p className="text-white/70 mb-6">
                    Our best-selling colorful guide for young chefs is now available for shipping worldwide!
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                      <span>Step-by-step illustrations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                      <span>Over 50 kid-friendly flavors</span>
                    </div>
                  </div>

                  <Link
                    href="/order-books"
                    className="inline-flex mt-7 bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary-hover transition-colors"
                  >
                    Order Your Copy
                  </Link>
                </div>

                <div className="w-[200px] h-[280px] bg-black/20 rounded-2xl shadow-2xl rotate-6 overflow-hidden border border-white/10 mx-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Book Cover"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcDVke0mAXw_BlGIoFZ-hzExHYXhB7mqo1JcMy0m9cFRtXAyilbv5jwINfMVxXx3XJpG4gSezDuXAQ0yFGB4gUSjGUGkmQVMIaFeHglFIGSepdXJ6LGsq_uH4fI8rfNyMklr38kfbyMlb1RSeFR2msPwUN8ghU0-5GAlCikwCLGpUPHl4lxfE142bWrDyhXdND9BC1zmaJ0inzbE1aV-ZzbqOuNfPiTPfSEj6kdRjX4wx9ybhNVqcp29QTzn-rDGK6-q77njS2n5xi"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Contact support */}
          <section className="rounded-3xl bg-white dark:bg-card-dark border border-gray-200 dark:border-white/10 p-8 md:p-12 text-center">
            <h2 className="text-3xl font-black text-text-main dark:text-white">Still have questions?</h2>
            <p className="mt-3 text-text-muted dark:text-gray-300 max-w-xl mx-auto">
              Can&apos;t find what you&apos;re looking for? Our friendly scoopers are here to help with anything you need!
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover px-8 py-4 rounded-full text-white font-bold transition-colors shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined">mail</span>
                Email Us
              </Link>

              <a
                href="tel:+15550000000"
                className="inline-flex items-center gap-2 bg-gray-100 dark:bg-white/5 px-8 py-4 rounded-full text-gray-800 dark:text-gray-200 font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined">call</span>
                Call the Parlor
              </a>
            </div>
          </section>
        </div>
      </section>

      {/* Footer note */}
      <div className="mt-14 pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-muted uppercase tracking-widest font-bold">
        <p>© 2024 Mr. A&apos;s Ice Cream Parlor. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-text-main dark:hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-text-main dark:hover:text-white">
            Terms
          </Link>
          <Link href="/cookies" className="hover:text-text-main dark:hover:text-white">
            Cookies
          </Link>
        </div>
      </div>
    </div>
  );
}

function FaqItem({
  q,
  a,
  open,
}: {
  q: string;
  a: React.ReactNode;
  open?: boolean;
}) {
  return (
    <details
      className="group rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-card-dark shadow-sm"
      open={open}
    >
      <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
        <span className="font-extrabold text-lg text-text-main dark:text-white">{q}</span>
        <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180">
          expand_more
        </span>
      </summary>
      <div className="px-6 pb-6 text-text-muted dark:text-gray-300 leading-relaxed">{a}</div>
    </details>
  );
}

function InfoCard({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-6 bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-white/10 hover:border-primary/40 transition-all hover:shadow-lg">
      <h3 className="font-extrabold text-lg mb-2 flex items-center gap-2 text-text-main dark:text-white">
        <span className="material-symbols-outlined text-primary">{icon}</span>
        {title}
      </h3>
      <p className="text-text-muted dark:text-gray-300 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}