import Image from "next/image";
import { Badge, Button, MaterialIcon } from "@/components/ui";

export function BookCtaSection() {
  return (
    <section
      className="relative mt-10 overflow-hidden rounded-[2.5rem] shadow-2xl"
      style={{
        background: "linear-gradient(135deg, #fffbeb 0%, #fff5e6 35%, #fff0f5 70%, #fef9ff 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#FFB347]/25 blur-3xl" />
      <div className="absolute -bottom-20 right-8 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute right-1/3 top-0 h-40 w-40 rounded-full bg-[#ff8fa3]/20 blur-2xl" />

      <div className="relative flex flex-col items-center gap-10 p-8 md:flex-row md:p-16">
        {/* Copy */}
        <div className="z-10 flex flex-1 flex-col items-center text-center md:items-start md:text-left">
          {/* Gold badge */}
          <Badge className="mb-6 border border-amber-200 bg-amber-50 text-amber-600">
            <MaterialIcon name="auto_stories" className="text-sm" />
            Best Seller
          </Badge>

          <h2 className="font-serif-display mb-4 text-3xl font-black leading-[1.1] text-text-main dark:text-white md:text-5xl">
            Mr. A&apos;s Secret{" "}
            <br className="hidden md:block" />
            Recipes Book
          </h2>

          <p className="mb-8 max-w-md text-lg leading-relaxed text-text-muted dark:text-gray-300">
            Bring the parlor home. Order the official cookbook today and master
            the art of the scoop.
          </p>

          <Button
            variant="dark"
            className="flex h-14 gap-2 px-8 text-base shadow-lg transition-all hover:scale-105"
          >
            <span>Order Official Cookbook</span>
            <MaterialIcon name="arrow_forward" />
          </Button>

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap gap-4">
            {[
              { icon: "verified", text: "Official Edition" },
              { icon: "local_shipping", text: "Free Shipping" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-1.5 text-sm font-semibold text-text-muted">
                <MaterialIcon name={item.icon} className="text-[16px] text-gold" />
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Book image */}
        <div className="flex w-full max-w-[400px] flex-1 items-center justify-center md:max-w-none">
          <div className="relative w-3/4 rotate-3 overflow-hidden rounded-r-2xl rounded-l-md border-l-[12px] border-l-gray-800 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] transition-all duration-500 hover:rotate-0 hover:shadow-[0_30px_70px_-10px_rgba(238,43,82,0.2)] dark:border-l-gray-600">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0kCUg26eJsGZ5vAbdhn3OcuDs-32LE9KV-rDU-lpGDOyql6O1rDm3hEnSwJ59CDhRCSIAYBrYhu62_wsJ1GGhEo7Cg6QyXmPUEIxp_dsXbzMhf923bFudCnx2SFKr37yH8coHFFt-fdAWWuwLykR5sQupUQ2aC2slnMpDCt53XUrnpRhKJlCDG07_EOf5-L_EEa1yySWo9JwpMhiYtQxA6mpsjaTV-dX3auVWhUVuDK1IC89ZE0Mam0bzv5-qPsWcZfemqXXCfRo"
              alt="Cover of Mr. A's Secret Recipes Book featuring a stack of ice cream cones"
              width={400}
              height={533}
              className="aspect-[3/4] w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/15 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
