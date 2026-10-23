"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight, PlayCircle, Bot, MessageCircle, BarChart3, CalendarCheck, Video,
} from "lucide-react";

const features = [
  { Icon: MessageCircle, title: "Real-time answers", text: "Clear, step-by-step explanations" },
  { Icon: BarChart3, title: "Interactive visuals", text: "Explore concepts with graphs and demos" },
  { Icon: CalendarCheck, title: "Tasks & reminders", text: "Stay organized and on top of your goals" },
  { Icon: Video, title: "FaceTime support", text: "Study with a real-time AI companion" },
];

// Graph helpers: plot range is -10..10 on both axes, mapped to a 0..100 viewBox
const X = (v: number) => (v + 10) * 5;
const Y = (v: number) => 100 - (v + 10) * 5;

export function Hero() {
  const [m, setM] = useState(1.8);
  const [b, setB] = useState(0);

  return (
    <section className="hero-gradient pt-40 pb-16 px-6 relative overflow-hidden">
      {/* Blur gradient blob */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-[1220px] h-[543px] blur-gradient rounded-full -rotate-12 z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero heading */}
        <div className="max-w-4xl mx-auto text-center mb-16" data-aos>
          <p className="text-xs tracking-[0.2em] uppercase text-text-secondary mb-6">
            Your AI study companion
          </p>
          <h1 className="font-heading text-6xl md:text-7xl lg:text-8xl font-normal tracking-mega-tight leading-none mb-6">
            Study Smarter,{" "}
            <span className="italic text-brand-primary">Not Harder.</span>
          </h1>
          <p className="text-lg md:text-xl text-text-primary leading-relaxed max-w-2xl mx-auto mb-10">
            Real-time explanations, interactive visuals, and personalized study
            support. Ask anything, explore concepts with live demos, and stay on
            track with your tasks.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/Dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-text-primary text-white hover:bg-text-primary/90 rounded-sm hover:shadow-soft hover:-translate-y-0.5 transition-all"
            >
              Start Studying
              <ArrowRight className="size-4 ml-1" />
            </Link>
            <Link
              href="#canvas"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-text-primary rounded-sm hover:bg-black/5"
            >
              Watch demo
              <PlayCircle className="size-5 ml-1" />
            </Link>
          </div>
        </div>

        {/* Product mockup */}
        <div className="max-w-5xl mx-auto" data-aos>
          <div className="bg-white/30 rounded-xl md:rounded-2xl p-2 md:p-3 shadow-medium">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg md:rounded-xl overflow-hidden relative">
              {/* Window chrome */}
              <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="bg-gray-700 rounded px-4 py-1.5 text-[10px] md:text-xs text-gray-300 font-mono">
                  SESSION: Linear Functions &bull; Step-by-step Mode
                </div>
                <div className="text-brand-primary text-xs font-bold animate-pulse">
                  LIVE
                </div>
              </div>

              {/* Simulation content */}
              <div className="grid grid-cols-1 md:grid-cols-3 md:min-h-[430px]">
                {/* Left: Chat with StudyBuddy */}
                <div className="relative flex flex-col gap-3 p-4 bg-gray-900 border-b md:border-b-0 md:border-r border-gray-700">
                  <div className="self-end max-w-[85%] rounded-lg rounded-tr-sm bg-brand-primary/20 border border-brand-primary/30 px-3 py-2">
                    <p className="text-[11px] md:text-xs text-white leading-snug">
                      Can you explain how changing the slope affects a linear function?
                    </p>
                  </div>

                  <div className="flex gap-2 items-start">
                    <div className="size-7 shrink-0 rounded-full bg-brand-primary/20 text-brand-primary grid place-items-center">
                      <Bot className="size-4" />
                    </div>
                    <div className="rounded-lg rounded-tl-sm bg-white/10 border border-white/10 px-3 py-2">
                      <p className="text-[11px] md:text-xs text-gray-200 leading-snug">
                        Sure! The <span className="text-white font-semibold">slope (m)</span>{" "}
                        sets how steep the line is and which way it goes. Drag the
                        sliders to see it change.
                      </p>
                    </div>
                  </div>

                  {/* Voice / listening indicator */}
                  <div className="mt-auto bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1 items-end h-5">
                        <div className="w-1 h-3 bg-brand-primary animate-bounce" />
                        <div className="w-1 h-5 bg-brand-primary animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <div className="w-1 h-2 bg-brand-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                      <p className="text-[10px] md:text-xs text-white leading-tight font-medium">
                        &ldquo;What happens if the slope is negative?&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Interactive canvas */}
                <div className="md:col-span-2 bg-gray-50 flex flex-col">
                  <div className="flex-1 p-4 relative overflow-hidden">
                    <div className="w-full h-full min-h-[300px] border border-gray-200 rounded-lg bg-white relative shadow-inner overflow-hidden flex flex-col">
                      <div className="p-2 border-b border-gray-100 flex justify-between bg-gray-50/50">
                        <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                          Interactive Graph
                        </span>
                        <span className="text-[10px] font-mono font-bold text-gray-500">
                          y = mx + b
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-[1fr_190px] flex-1">
                        {/* Graph */}
                        <div className="relative min-h-[220px]">
                          <div
                            className="absolute inset-0 opacity-10"
                            style={{
                              backgroundImage: "radial-gradient(#92A0E1 1px, transparent 1px)",
                              backgroundSize: "20px 20px",
                            }}
                          />
                          <svg
                            className="absolute inset-0 w-full h-full"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            role="img"
                            aria-label={`Graph of y = ${m.toFixed(1)}x + ${b.toFixed(1)}`}
                          >
                            <line x1="0" y1="50" x2="100" y2="50" stroke="#9ca3af" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
                            <line x1="50" y1="0" x2="50" y2="100" stroke="#9ca3af" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
                            <line
                              x1={X(-10)} y1={Y(-10 * m + b)} x2={X(10)} y2={Y(10 * m + b)}
                              stroke="#92A0E1" strokeWidth="2" vectorEffect="non-scaling-stroke"
                            />
                            <circle cx="50" cy={Y(b)} r="2" fill="#C2A0E1" />
                          </svg>
                          {/* Floating equation card */}
                          <div className="absolute top-3 left-3 bg-white shadow-xl rounded-md p-3 border border-border-light z-20 animate-float">
                            <p className="text-xs font-mono text-gray-800 font-bold">
                              y = {m.toFixed(1)}x {b < 0 ? "−" : "+"} {Math.abs(b).toFixed(1)}
                            </p>
                            <p className="text-[9px] text-text-secondary mt-1 italic">
                              {m > 0 ? "Rising" : m < 0 ? "Falling" : "Flat"} line
                            </p>
                          </div>
                        </div>

                        {/* Sliders */}
                        <div className="flex flex-col justify-center gap-6 p-4 border-t sm:border-t-0 sm:border-l border-gray-100">
                          <div>
                            <label htmlFor="hero-m" className="flex justify-between text-[11px] text-gray-600 mb-2">
                              Slope (m) <span className="font-semibold text-gray-900">{m.toFixed(1)}</span>
                            </label>
                            <input
                              id="hero-m" type="range" min={-5} max={5} step={0.1} value={m}
                              onChange={(e) => setM(+e.target.value)}
                              className="w-full accent-brand-primary"
                            />
                          </div>
                          <div>
                            <label htmlFor="hero-b" className="flex justify-between text-[11px] text-gray-600 mb-2">
                              Intercept (b) <span className="font-semibold text-gray-900">{b.toFixed(1)}</span>
                            </label>
                            <input
                              id="hero-b" type="range" min={-8} max={8} step={0.1} value={b}
                              onChange={(e) => setB(+e.target.value)}
                              className="w-full accent-brand-primary"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mastery progress bar */}
                  <div className="min-h-12 py-2 bg-white border-t border-gray-200 px-4 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-500">MASTERY</span>
                      <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-primary" style={{ width: "65%" }} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[9px] font-bold rounded">
                        CONCEPT CLEAR
                      </span>
                      <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[9px] font-bold rounded">
                        2 TASKS DUE TODAY
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtle glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-primary via-brand-secondary to-transparent opacity-10 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Feature row */}
        <ul className="max-w-5xl mx-auto mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(({ Icon, title, text }) => (
            <li key={title} className="flex items-start gap-4" data-aos>
              <div className="size-11 shrink-0 rounded-xl bg-white/60 grid place-items-center text-text-primary">
                <Icon className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
                <p className="text-sm text-text-secondary leading-snug mt-0.5">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}