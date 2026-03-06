// app/careers/page.tsx

export default function CareersPage() {
  const heroBg =
    "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 60%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuBgCtgnNOAKbnPA5rKRmP8dbmckVDgSbag0H8qFMoZqM-Cwzian9Vr7SKXMEE9MkEkUL-abdOIUcEj4fN-BUHKsQ-BH8enVDw69Ko8zj8bBrprc4DJFljOpw6zqPem6cRw_XfeJtTBnD7_pX1fZSrBZ_EYLe988JEFiI1MQz1Vl6PxdTZkruY1hWgD0DGbz0jC_Kb0i_OduFhkTTqb8O1g1EFqvZsBUJlueLbS9F3PE4GiwFR3Q6mAwBsAMPR23Vn0ykQeCuM9upjzB')";

  const role1Bg =
    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBjJ3ECH6aSYye5ANhSKn_SFKDsCsfWlUXIMSJaYn4YePZXn9vMhLK6FqB9wujtQT4I0xt-a6a4Jcpb1EkPgRXfwIGJLTPjINGgAsPXaERYWl__wIJu4o23Zza4vadogR3Pbbfhi72vN0Dk81Z0Bw_WzMTR4J1bKgN4SoHJvPj_BCe_NfAHQrV7LL9DGrexNObUP-w1KPs6dKAoPH8oZ7WJXmpxUuaKZTpGoMz0ua304DJPW3LPsA3E2eHL0yKlS9YP0y1DyIgP7mwF')";

  const role2Bg =
    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAKw7KtOhlPGF68Eyu0MpVAfh80ZAg15LcimggW9mZ98kQ0xhfBe2ktfLVDm4qfD8NlBRY1bXMrb4PW3Cb9ugPL3RFK-FgBo1KgazE-7J1TX47CxLZcPLu1CpuddUNqmkpAf-J_yM1EauSxgkwlMm1WM6bF74NQHNO9WUZHLOlmRYYSH3xEMu6awO9rQeQYn2R9wpaOqGdA9RNTIqHFLjtiF7GGS5llDrr7iK6RMn7rGZOy1gFWRM9AJaRX04SbrZt2sElLf1t9swx4')";

  const role3Bg =
    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDV5ablz7nwk5nKdOVFE0RwW0wjrd8bJXul_tDRBGwxOteqBpxjkBvl16yGw-TLiULhwJQISnP_N9dg5vQOFt-u4vIAZlFyON6hzIpJ84r5m7pct_LoLVRUxDlehoEhR5O3v9KHsgsykrkK4V6z_N8lbgy7gwnHJhXl_jy5CcWpWDWWKr00he4vxLpbuod_mXiLWMKbQRUi0k_9leYp8uQBaSbWtBX0SoBSUnsO9nPBfRcIGtz4zCo-YQtmxFdf_EHGgVQ4mv8Otke0')";

  const culture1Bg =
    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAJwtntB9NGvpFzd1kIVeu9-DSWlipscwBYcTLuY9STNVUkcbxm4augaPWUAMwVL9cePYVzKOU7f9-KqW53DX0vLIxgWP1pFBu-EDX4-xUJ2SzkE2vwimvgEZtyiHtkpDas8OMjG5eWyvGzMjrwGS5C26ulFwxx3CxVe0S4W1LekxRVmsnHUebNPtyxE6tNgmsrfxP3frg-Qs_rVyzgs63cn3ZwKdtOcEPLhSOHqKVh05TwHU2_a5ioN_aSOG5BoUaTdvQ0FYbxyqvS')";

  const culture2Bg =
    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAV1ybu6KKyGrqUtGRtBggzjmRyDLnboPrFRM6FJw1f9ySXrxY8IrQyxqmRuDFsYAMi-La7LdIzx4wOZb4GSrDPY-N2vVLcLnWfQYq8Zo3383XDwGJgk2Cp4JkY-xIKNBKLkUc4GtPcpbsJOujg8dEyvA_lJ9ySFLZu_2ujo_XT1WPOQDScgBpKUXJKi0WIWrvgDvtopTd2fCkKxTY-7mpF2-4oSlYNIUafZwjyEXKnVf6QauKOjBQG0FEOXtA8xrhDhVPfY8Hr2ie1')";

  return (
    <div className="dark:bg-background-dark text-slate-900 dark:text-slate-100 bg-white">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <main className="flex flex-col flex-1">
            {/* Hero Section */}
            <section className="px-6 md:px-20 py-10">
              <div
                className="relative w-full aspect-[21/9] min-h-[400px] overflow-hidden rounded-xl flex items-end bg-slate-200"
                style={{
                  backgroundImage: heroBg,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="p-8 md:p-12 w-full">
                  <h1 className="text-white text-4xl md:text-6xl font-black leading-tight mb-4 drop-shadow-md">
                    Join the Sweetest Team on Earth!
                  </h1>
                  <p className="text-white/90 text-lg md:text-xl max-w-2xl font-medium">
                    We&apos;re not just scooping ice cream; we&apos;re crafting happiness. Ready to sprinkle some joy
                    into your career?
                  </p>
                </div>
              </div>
            </section>

            {/* Introduction & Stats */}
            <section className="px-6 md:px-20 py-12 flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="flex-1">
                <h2 className="text-slate-900 dark:text-slate-50 text-4xl font-black mb-6">Work with Perks.</h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-xl">
                  At Mr. A&apos;s, we believe work should be as fun as a double-scoop sundae with extra cherries.
                  We&apos;re looking for energetic, creative, and friendly humans to join our growing family.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                <div className="p-6 rounded-lg text-center">
                  <span className="material-symbols-outlined text-primary text-3xl mb-2">savings</span>
                  <p className="text-slate-900 dark:text-slate-100 font-bold text-lg">Sweet Pay</p>
                  <p className="text-slate-500 text-sm">Competitive wages</p>
                </div>
                <div className="p-6 rounded-lg text-center">
                  <span className="material-symbols-outlined text-primary text-3xl mb-2">celebration</span>
                  <p className="text-slate-900 dark:text-slate-100 font-bold text-lg">Free Scoops</p>
                  <p className="text-slate-500 text-sm">Shift rewards</p>
                </div>
              </div>
            </section>

            {/* Open Roles */}
            <section className="px-6 md:px-20 py-16 bg-white dark:bg-slate-900/50">
              <div className="mb-12">
                <h2 className="text-slate-900 dark:text-slate-50 text-3xl font-extrabold">Current Openings</h2>
                <p className="text-slate-500 mt-2">Find the flavor of work that suits you best.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Role 1 */}
                <div className="flex flex-col bg-background-light dark:bg-background-dark p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all group">
                  <div
                    className="h-48 w-full rounded-lg overflow-hidden bg-slate-300 mb-4"
                    style={{
                      backgroundImage: role1Bg,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="px-4 pb-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Scoop Master</h3>
                      <span className="bg-primary text-slate-900 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                        Urgent
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-grow">
                      The heart of our parlor. You&apos;ll craft beautiful cones, engage with fans, and keep the vibes
                      high.
                    </p>
                    <button className="w-full bg-primary hover:bg-primary/90 text-slate-900 font-bold py-3 rounded-full transition-colors flex items-center justify-center gap-2">
                      Apply Now <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>

                {/* Role 2 */}
                <div className="flex flex-col bg-background-light dark:bg-background-dark p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all group">
                  <div
                    className="h-48 w-full rounded-lg overflow-hidden bg-slate-300 mb-4"
                    style={{
                      backgroundImage: role2Bg,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="px-4 pb-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Flavor Inventor</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-grow">
                      Work in our lab to create the next viral sensation. Chemistry meets deliciousness.
                    </p>
                    <button className="w-full bg-slate-200 dark:bg-slate-800 hover:bg-primary text-slate-900 dark:text-slate-100 dark:hover:text-slate-900 font-bold py-3 rounded-full transition-colors flex items-center justify-center gap-2">
                      Submit Portfolio <span className="material-symbols-outlined text-sm">science</span>
                    </button>
                  </div>
                </div>

                {/* Role 3 */}
                <div className="flex flex-col bg-background-light dark:bg-background-dark p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all group">
                  <div
                    className="h-48 w-full rounded-lg overflow-hidden bg-slate-300 mb-4"
                    style={{
                      backgroundImage: role3Bg,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="px-4 pb-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Delivery Star</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-grow">
                      Bring the parlor to our customers&apos; doors. Speed, safety, and a smile are your tools of the
                      trade.
                    </p>
                    <button className="w-full bg-slate-200 dark:bg-slate-800 hover:bg-primary text-slate-900 dark:text-slate-100 dark:hover:text-slate-900 font-bold py-3 rounded-full transition-colors flex items-center justify-center gap-2">
                      Start Rolling <span className="material-symbols-outlined text-sm">delivery_dining</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Culture Section */}
            <section className="px-6 md:px-20 py-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
                  <div
                    className="h-64 rounded-xl overflow-hidden bg-slate-200"
                    style={{
                      backgroundImage: culture1Bg,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div
                    className="h-64 rounded-xl overflow-hidden bg-slate-200 mt-8"
                    style={{
                      backgroundImage: culture2Bg,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                </div>

                <div className="order-1 lg:order-2">
                  <h2 className="text-slate-900 dark:text-slate-50 text-4xl font-black mb-6 leading-tight">
                    Our Culture: <br />
                    <span className="text-primary">Sprinkled with Love</span>
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 leading-relaxed">
                    We&apos;re a diverse group of dreamers who believe that a simple cone can change someone&apos;s day.
                    Our parlors are safe spaces for creativity, laughter, and high-fives. We celebrate wins together and
                    support each other through the busiest rushes.
                  </p>

                  <div className="space-y-4">
                    {[
                      "Inclusion in every scoop",
                      "Creative freedom for flavor naming",
                      "Flexible shifts for students & artists",
                    ].map((t) => (
                      <div key={t} className="flex items-center gap-4">
                        <div className="size-6 bg-primary rounded-full flex items-center justify-center text-slate-900">
                          <span className="material-symbols-outlined text-sm font-bold">check</span>
                        </div>
                        <p className="font-bold">{t}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Final CTA */}
            <section className="mx-6 md:mx-20 mb-20 bg-primary rounded-xl p-10 md:p-20 text-center relative overflow-hidden">
              <div className="absolute -top-10 -left-10 size-40 bg-white/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -right-10 size-40 bg-white/30 rounded-full blur-3xl" />

              <h2 className="text-white text-4xl md:text-5xl font-black mb-6 relative z-10">
                Don&apos;t be cold, apply today!
              </h2>
              <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto relative z-10">
                We&apos;re always looking for stars. Even if you don&apos;t see your perfect role, send us a note about
                why you&apos;d be a great fit for the Mr. A family.
              </p>
              <button className="bg-white text-primary font-bold text-lg px-10 py-4 rounded-full hover:scale-105 transition-transform relative z-10">
                General Application
              </button>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}