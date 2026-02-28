import Image from "next/image";
import { Badge, Button, MaterialIcon } from "@/components/ui";

const socialProofAvatars = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDxsraid8z40Dz1O5XcdYrbeaPtObmCHF8OdnJ3b35fzlbWEtdK-ArRZW_zHnZ_diC1IYeDndahcSeIrz4w61_ll-BNhUd_Sv0Wj-jHLzn-z4LKllWKxxf_MA9e6Uw9JXbo49FIZkrY-PK09103tJVmbFpz8zEkNG31hqJ2kJMCO-jqo5SFcOOOUdCClIo-scDAPm9YPMviD8nbo7LQK0g_sY6TlVNeMeC8KXWLi5254FOKEyyCTDAjx6WQ80rtHfK8EK3cNz0cifs",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBeVgud4F8EwwfwMj1j7HsxTJrx7xB_a7WNRDY-ctFDgJ6uX8diJo34f23HOMRV9thEqWJTmzfQoA00YPfJAONCefZ2IkQDv8dFSF9a4Rp_8Hb1mDVINR9yobjtA8y_7XIt40fnWCBnyzSFa75QV42LSXiEEE06uzajbG24cNF0lpzD4yApnSwDeLY-NNvkBiM28nMhfBPMtYVyZ0dvrJJ6lZ0U6H8K8IV8mchH3U3vxcxAsYyDRQvUGakkrMq_VUR4ZAt5eimWxAI",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD4rKFnwLHCJwS4LfkKMnoOAWVkmvlApd_iG32Du6Nyyb-wRXkxBEZAgaClIe93p0gc1ljk1KXWnIjVrbgAh0nvkeudqmFMJ7Mx7pkwR3V1UrQzx5yV1gTATknwI-2LXY_quTNdj4mHJp5TGnvl0gH-5SHkpGhgDaaEm9FaLdWCPNk3CHerrSEzNDg1ajScM9YNfNVtkNatiIWbLMtklXlSQxFs4Rty5RTmlZLv9nNO399bEyvEBRvSX2Kg3GypoBQsav39TaGJJeU",
];

export function HeroSection() {
  return (
    <section className="relative mt-6 md:mt-10 overflow-hidden rounded-[2.5rem] px-8 py-12 md:py-16 md:px-14"
      style={{
        background: "linear-gradient(135deg, #fff9f5 0%, #fff4f0 40%, #fef2f6 100%)",
      }}
    >
      {/* Decorative background circles */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[#FFB347]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[#ff8fa3]/20 blur-3xl" />

      <div className="relative flex flex-col-reverse gap-10 md:flex-row md:items-center">
        {/* ---- Text ---- */}
        <div className="flex flex-1 flex-col items-start gap-6 md:pr-8">
          <div className="flex flex-col gap-4 text-left">
            {/* Warm amber badge */}
            <Badge className="w-fit border border-amber-200 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
              <MaterialIcon name="wb_sunny" className="text-sm" />
              New Summer Flavors
            </Badge>

            {/* Heading with Playfair Display */}
            <h1
              className="font-serif-display text-5xl font-black leading-[1.1] tracking-tight text-text-main dark:text-white md:text-6xl"
            >
              Scoops of{" "}
              <span className="gradient-text">Happiness</span>
              {" "}in Every Bowl!
            </h1>

            <p className="max-w-[480px] text-lg font-medium leading-relaxed text-text-muted dark:text-gray-300">
              Discover secret recipes, order Mr. A&apos;s famous books, or share
              your own frozen creations with our sweet community.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex w-full flex-wrap gap-4">
            <Button className="h-12 flex-1 px-8 text-base shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-primary/40 sm:flex-none">
              Browse Recipes
            </Button>
            <Button
              variant="outline"
              className="h-12 flex-1 border-primary/30 px-8 text-base hover:border-primary hover:bg-primary/5 sm:flex-none"
            >
              Join the Club
            </Button>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex -space-x-3">
              {socialProofAvatars.map((src, i) => (
                <Image
                  key={i}
                  src={src}
                  alt={`Community member ${i + 1}`}
                  width={40}
                  height={40}
                  className="size-10 rounded-full border-2 border-white object-cover shadow-sm dark:border-background-dark"
                />
              ))}
            </div>
            <p className="text-sm font-semibold text-text-muted dark:text-gray-400">
              Join <span className="text-primary font-bold">10k+</span> ice cream lovers
            </p>
          </div>
        </div>

        {/* ---- Hero image ---- */}
        <div className="group relative w-full flex-1">
          {/* Glow aura */}
          <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-[#FFB347]/30 via-primary/15 to-[#ff8fa3]/30 opacity-70 blur-2xl transition-opacity duration-700 group-hover:opacity-100" />

          <div className="relative w-full overflow-hidden rounded-[2rem] shadow-2xl shadow-primary/15 transition-transform duration-500 hover:-translate-y-2">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQEJSuiJRer8s1wL3Lvy4IMobHDHBW6_uXLcO8ea24q0HDFByir7vfeLTGAEVmvTlPem_--3SVhWiKHihIWKX-hYYXBUilYqT1LzaPFyeGWlliysxTbvGnj7IDZc3JcLjRIrG5IO3Gnp1xO7UCuda0kCfzJwmxw6XRb6qsn2TO55hz-UxWQQ6ok1LwavL_VxW1nNDIuW0NoFS0xqI_CNB44O-AuGFdUchxE_0328gZjc537lCMpa8opRwxJ5sKFSZKxlwH-UtnRTw"
              alt="Delicious colorful ice cream sundae with sprinkles"
              width={600}
              height={450}
              className="aspect-square w-full object-cover md:aspect-[4/3]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* Floating badge — float animation */}
          <div className="animate-float absolute -bottom-6 -right-6 flex items-center gap-3 rounded-2xl bg-white/95 p-4 shadow-xl shadow-primary/10 backdrop-blur-sm dark:bg-surface-dark md:-left-10 md:bottom-10 md:right-auto">
            <div className="rounded-full bg-gradient-to-br from-green-100 to-emerald-100 p-2 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <MaterialIcon name="eco" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-text-muted dark:text-gray-400">
                Recipe of the Day
              </p>
              <p className="text-sm font-bold text-text-main dark:text-white">
                Mint Chip Delight
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
