import Image from "next/image";
import { Badge, Button, MaterialIcon } from "@/components/ui";

export function BookCtaSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-surface-light shadow-2xl dark:bg-surface-dark md:rounded-[3rem]">
      {/* Decorative blobs */}
      <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-yellow-200 opacity-60 blur-3xl dark:bg-yellow-900/30" />
      <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-primary/20 opacity-60 blur-3xl dark:bg-primary/10" />

      <div className="relative flex flex-col items-center gap-10 p-8 md:flex-row md:p-16">
        {/* Copy */}
        <div className="z-10 flex flex-1 flex-col items-center text-center md:items-start md:text-left">
          <Badge className="mb-6 bg-primary/10 text-primary">
            <MaterialIcon name="menu_book" className="text-sm" />
            Best Seller
          </Badge>

          <h2 className="mb-4 text-3xl font-black leading-[1.1] text-text-main dark:text-white md:text-5xl">
            Mr. A&apos;s Secret <br className="hidden md:block" />
            Recipes Book
          </h2>

          <p className="mb-8 max-w-md text-lg text-text-muted dark:text-gray-300">
            Bring the parlor home. Order the official cookbook today and master
            the art of the scoop.
          </p>

          <Button variant="dark" className="flex h-14 gap-2 px-8 text-base">
            <span>Order Official Cookbook</span>
            <MaterialIcon name="arrow_forward" />
          </Button>
        </div>

        {/* Book image */}
        <div className="flex w-full max-w-[400px] flex-1 items-center justify-center md:max-w-none">
          <div className="relative w-3/4 rotate-3 overflow-hidden rounded-r-2xl rounded-l-md border-l-[12px] border-l-gray-800 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] transition-transform duration-500 hover:rotate-0 dark:border-l-gray-600">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0kCUg26eJsGZ5vAbdhn3OcuDs-32LE9KV-rDU-lpGDOyql6O1rDm3hEnSwJ59CDhRCSIAYBrYhu62_wsJ1GGhEo7Cg6QyXmPUEIxp_dsXbzMhf923bFudCnx2SFKr37yH8coHFFt-fdAWWuwLykR5sQupUQ2aC2slnMpDCt53XUrnpRhKJlCDG07_EOf5-L_EEa1yySWo9JwpMhiYtQxA6mpsjaTV-dX3auVWhUVuDK1IC89ZE0Mam0bzv5-qPsWcZfemqXXCfRo"
              alt="Cover of Mr. A's Secret Recipes Book featuring a stack of ice cream cones"
              width={400}
              height={533}
              className="aspect-[3/4] w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
