import { CanvasFeatures } from "./components/landing/CanvasFeatures";
import { FAQ } from "./components/landing/FAQ";
import { Footer } from "./components/landing/Footer";
import { Hero } from "./components/landing/Hero";
import { Navbar } from "./components/landing/Navbar";
import { ParentPortal } from "./components/landing/ParentPortal";
import { SocialProof } from "./components/landing/SocialProof";
import { SocraticEdge } from "./components/landing/SocraticEdge";

export default function Page() {
  return (
    <main className="bg-neutral-background text-text-primary">
      <Navbar />
      <Hero />
      <SocraticEdge />
      <CanvasFeatures />
      <ParentPortal />
      <SocialProof />
      <FAQ />
      <Footer />
    </main>
  );
}
