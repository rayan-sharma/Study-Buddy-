import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { footerProductLinks, footerTechBadges } from "./data";

export function Footer() {
  return (
    <>
      {/* Final CTA section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center" data-aos>
          <h2 className="font-heading text-4xl md:text-5xl font-normal tracking-tighter mb-4">
            Ready to study{" "}
            <span className="italic text-brand-primary">smarter?</span>
          </h2>
          <p className="text-text-secondary text-lg mb-8 max-w-xl mx-auto">
            Get patient, step-by-step help, interactive visuals, and a study
            board that keeps you on track, any time you need it.
          </p>
          <Link
            href="/Dashboard"
            className="inline-flex items-center justify-center px-8 py-4 bg-text-primary text-white hover:bg-text-primary/90 rounded-sm hover:shadow-soft hover:-translate-y-0.5 transition-all"
          >
            Start Studying
            <ArrowRight className="size-4 ml-1" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-surface pt-16 pb-8 border-t border-border-light">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="text-xl font-heading font-semibold text-text-primary flex items-center gap-2 mb-3">
                <BookOpen className="size-7 text-brand-primary" aria-hidden="true" />
                StudyBuddy
              </div>
              <p className="text-sm text-text-secondary">
                Your AI study companion. Study smarter, not harder.
              </p>
            </div>

            {/* Product links */}
            <div>
              <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">
                Product
              </div>
              <ul className="space-y-2">
                {footerProductLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-brand-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Built with */}
            <div>
              <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">
                Built With
              </div>
              <div className="flex flex-wrap gap-2">
                {footerTechBadges.map((badge) => (
                  <span
                    key={badge}
                    className="px-3 py-1 bg-white rounded-full text-xs font-medium text-text-secondary border border-border-light"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-border-light flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-text-secondary">
              &copy; 2026 StudyBuddy. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-sm text-text-secondary hover:text-brand-primary transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-text-secondary hover:text-brand-primary transition-colors"
              >
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}