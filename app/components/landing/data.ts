// Static data for landing page sections
// Export names are unchanged so existing imports keep working.

import {
  Heart,
  MessageCircleQuestion,
  Video,
  TrendingUp,
  Shapes,
  Sparkles,
} from "lucide-react";

// ─── Feature cards (previously "Socratic Edge") ─────────────────────────────
export const socraticFeatures = [
  {
    icon: Heart,
    title: "Patient, Step-by-Step",
    description:
      "StudyBuddy never gets frustrated. It will rephrase, illustrate, and walk you through a concept as many times as it takes to make it click.",
  },
  {
    icon: MessageCircleQuestion,
    title: "Ask Anything",
    description:
      "Get clear, real-time explanations for any subject. Ask follow-ups, request examples, and build real understanding instead of memorizing answers.",
  },
  {
    icon: Video,
    title: "Study Together Live",
    description:
      "Jump on a FaceTime-style session with a real-time AI companion, so studying feels like working with a friend instead of a chore.",
  },
];

// ─── Canvas feature cards ────────────────────────────────────────────────────
export const canvasFeatures = [
  {
    icon: TrendingUp,
    title: "Interactive Graphs",
    description:
      "Drag sliders and watch functions change instantly. See how slope, intercepts, and curves behave in real time.",
  },
  {
    icon: Shapes,
    title: "Concept Demos",
    description:
      "Explore geometry, physics, and more with hands-on demos you can manipulate, instead of static diagrams.",
  },
  {
    icon: Sparkles,
    title: "Built Around Your Question",
    description:
      "No canned slides. Visuals are generated on the fly based on what you\u2019re stuck on.",
  },
];

// ─── Stats for Social Proof ─────────────────────────────────────────────────
// Product facts, not performance claims. Swap in measured numbers once you have them.
export const stats = [
  { value: "24/7", label: "Available any time" },
  { value: "4-in-1", label: "Chat, tasks, notes & canvas" },
  { value: "Live", label: "Interactive visuals" },
  { value: "Step-by-step", label: "Clear explanations" },
];

// ─── Testimonials ────────────────────────────────────────────────────────────
// PLACEHOLDERS: replace with real quotes from real users before launch.
export const testimonials = [
  {
    quote:
      "Seeing the graph change as I moved the slider made slope finally make sense. I stopped dreading math homework.",
    name: "Student A",
    role: "11th grade student",
    initials: "SA",
  },
  {
    quote:
      "Having my tasks, notes, and questions in one place keeps me organized. I always know what to work on next.",
    name: "Student B",
    role: "College freshman",
    initials: "SB",
  },
  {
    quote:
      "It explains things step by step without making me feel behind. I actually ask more questions now.",
    name: "Student C",
    role: "High school sophomore",
    initials: "SC",
  },
];

// ─── FAQ items ───────────────────────────────────────────────────────────────
// TODO: confirm pricing and privacy answers before launch.
export const faqItems = [
  {
    question: "What can I ask StudyBuddy?",
    answer:
      "Anything about your studies. Ask for explanations, worked examples, or a visual demo, and follow up as many times as you need.",
  },
  {
    question: "What are interactive visuals?",
    answer:
      "Live graphs and demos you can manipulate. For example, drag the slope slider on a linear function and watch the line change as you explain it back.",
  },
  {
    question: "How do tasks and reminders work?",
    answer:
      "Add tasks, move them from To do to In progress to Done, and keep notes alongside them so you always know what to tackle next.",
  },
  {
    question: "What if I get stuck?",
    answer:
      "Tell StudyBuddy where you\u2019re lost. It will break the problem into smaller steps or show it a different way until it makes sense.",
  },
  {
    question: "Is StudyBuddy free, and is my data safe?",
    answer:
      "TODO: add your current pricing and privacy details here.",
  },
];

// ─── Dashboard checklist (previously "Parent portal") ───────────────────────
export const parentChecklist = [
  "Organize work into To do, In progress, and Done",
  "Keep notes next to your chats and subjects",
  "Reminders so deadlines never sneak up on you",
];

// ─── Footer nav links ───────────────────────────────────────────────────────
export const footerProductLinks = [
  { label: "Features", href: "#how-it-works" },
  { label: "Interactive Canvas", href: "#canvas" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "FAQ", href: "#faq" },
];

export const footerTechBadges = ["Claude", "Next.js", "Supabase"];