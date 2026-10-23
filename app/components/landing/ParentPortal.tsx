import { Check } from "lucide-react";
import { parentChecklist } from "./data";

// Section now shows the student dashboard. Name/export kept so imports don't break.
const columns = [
  { label: "To do", count: 3, color: "text-gray-300" },
  { label: "In progress", count: 2, color: "text-brand-secondary" },
  { label: "Done", count: 1, color: "text-green-400" },
];

const tasks = [
  { title: "Finish linear functions worksheet", tag: "Math", due: "Today" },
  { title: "Draft lab report introduction", tag: "Physics", due: "Today" },
];

export function ParentPortal() {
  return (
    <section
      className="py-24 bg-neutral-dark text-white rounded-[2rem] mx-4 md:mx-12 overflow-hidden"
      id="dashboard"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: dashboard preview card */}
          <div className="order-2 lg:order-1" data-aos>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h4 className="font-heading text-xl font-semibold">
                  Your Study Board
                </h4>
                <span className="text-xs bg-brand-primary/20 text-brand-primary px-3 py-1 rounded-full border border-brand-primary/30">
                  This week
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {columns.map((c) => (
                  <div key={c.label} className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="text-xs text-gray-400 mb-1">{c.label}</div>
                    <div className={`text-2xl font-bold font-heading ${c.color}`}>
                      {c.count}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-300">
                  In progress:
                </div>
                <ul className="space-y-2">
                  {tasks.map((t) => (
                    <li
                      key={t.title}
                      className="flex items-center justify-between gap-3 bg-white/5 border border-white/5 rounded-lg px-3 py-2"
                    >
                      <span className="text-xs text-gray-200">{t.title}</span>
                      <span className="text-[10px] text-brand-primary whitespace-nowrap">
                        {t.tag} &bull; {t.due}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Weekly goal: finish 6 tasks</span>
                    <span className="text-brand-primary">17% Progress</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full mt-2">
                    <div className="h-full bg-brand-primary w-[17%] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: copy */}
          <div className="order-1 lg:order-2" data-aos>
            <div className="inline-block px-3 py-1.5 bg-brand-primary/20 rounded text-xs font-mono font-medium text-brand-primary uppercase tracking-wide mb-6">
              Stay On Track
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-normal tracking-tighter leading-tight mb-6">
              Everything in one{" "}
              <span className="italic text-brand-secondary">study board.</span>
            </h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Stop juggling apps. Keep your tasks, notes, and questions together,
              so you always know what to work on next and how far you&apos;ve come.
            </p>
            <ul className="space-y-4">
              {parentChecklist.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="size-3 text-green-400" />
                  </div>
                  <span className="text-gray-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}