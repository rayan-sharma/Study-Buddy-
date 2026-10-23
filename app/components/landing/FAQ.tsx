import { faqItems } from "./data";

export function FAQ() {
  return (
    <section className="py-24 bg-neutral-background px-6" id="faq">
      <div className="max-w-3xl mx-auto">
        <h2
          className="font-heading text-3xl md:text-4xl text-center mb-12"
          data-aos
        >
          Questions? We have answers.
        </h2>

        <div className="space-y-4">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="bg-white rounded-xl border border-border-light px-6 open:shadow-soft transition-shadow"
              data-aos
            >
              <summary className="cursor-pointer text-left font-semibold text-text-primary py-5 marker:text-brand-primary">
                {item.question}
              </summary>
              <p className="text-sm text-text-secondary pb-5">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
