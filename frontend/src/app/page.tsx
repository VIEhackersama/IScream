import {
  HeroSection,
  TopRecipesSection,
  BookCtaSection,
} from "@/components/home";

export default function HomePage() {
  return (
    <div className="w-full max-w-[1024px] flex flex-col gap-16 md:gap-24">
      <HeroSection />
      <TopRecipesSection />
      <BookCtaSection />
    </div>
  );
}
