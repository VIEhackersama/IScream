import Link from "next/link";
import { MaterialIcon } from "@/components/ui";
import { siteConfig, routes } from "@/config";
import type { FooterSection } from "@/types";

const footerSections: FooterSection[] = [
  {
    title: "Support",
    links: [
      { label: "Contact Us", href: routes.contact },
      { label: "FAQ's", href: routes.faq },
      { label: "Feedback", href: routes.feedback },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Mr. A", href: routes.about },
      { label: "Careers", href: routes.careers },
      { label: "Privacy Policy", href: routes.privacyPolicy },
    ],
  },
];

export function Footer() {
  return (
    <footer
      className="mt-10 w-full border-t border-primary/10 pt-12"
      style={{ background: "linear-gradient(180deg, #fdf4f5 0%, #fdfaf9 100%)" }}
    >
      <div className="px-4 md:px-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href={routes.home} className="mb-5 flex items-center gap-2">
              <div
                className="flex size-9 items-center justify-center rounded-full text-white"
                style={{ background: "linear-gradient(135deg, #ee2b52, #ff8fa3)" }}
              >
                <MaterialIcon name="icecream" filled className="text-[18px]" />
              </div>
              <h3 className="font-serif-display font-bold text-text-main dark:text-white">
                {siteConfig.shortName}
              </h3>
            </Link>
            <p className="max-w-[200px] text-sm leading-relaxed text-text-muted dark:text-gray-400">
              Spreading joy one scoop at a time since {siteConfig.foundedYear}.
            </p>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <h4 className="mb-1 text-xs font-black uppercase tracking-widest text-text-main dark:text-white">
                {section.title}
              </h4>
              {section.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-text-muted transition-colors hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}

          {/* Social column */}
          <div className="flex flex-col gap-3">
            <h4 className="mb-1 text-xs font-black uppercase tracking-widest text-text-main dark:text-white">
              Social
            </h4>
            <div className="flex gap-3">
              {/* Twitter */}
              <a
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex size-10 items-center justify-center rounded-full border border-gray-200 bg-white text-text-muted shadow-sm transition-all hover:border-[#1DA1F2] hover:text-[#1DA1F2] hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
                aria-label="Twitter"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex size-10 items-center justify-center rounded-full border border-gray-200 bg-white text-text-muted shadow-sm transition-all hover:border-[#E1306C] hover:text-[#E1306C] hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.072 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.85-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between border-t border-primary/10 pb-6 pt-6 md:flex-row">
          <p className="text-sm text-text-muted dark:text-gray-500">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-text-main dark:text-gray-300">
              {siteConfig.name}
            </span>
            . All rights reserved.
          </p>
          <p className="mt-2 text-xs text-text-muted md:mt-0">
            Made with <span className="text-primary">♥</span> for ice cream lovers
          </p>
        </div>
      </div>
    </footer>
  );
}
