"use client";

import Features from "./components/Features";
import { Footer } from "./components/footer";
import Hero from "./components/Hero";
import MadeByHumans from "./components/MadeByHumans";
import Navbar from "./components/Navbar.tsx";
import Newsletter from "./components/Newsletter";
import Testimonials from "./components/Testimonials";

export default function Home() {
  return (
    <main className="w-full">
      <Navbar />
      <Hero />
      <Features />
      <Newsletter />

      <MadeByHumans />
      <Footer />
    </main>
  );
}
