"use client"

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export default function Hero() {

    const container = useRef<HTMLDivElement>(null);
    const words = [
        "Find",
        "jobs.",
        "Get",
        "hired.",
        "Build",
        "careers.",
    ]

  useGSAP(() => {
    const tl = gsap.timeline()

    tl.from(".hero-word", {
      y: 80,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
    })
    .from(".hero-sub", {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
    }, "-=0.3")
    .from(".hero-cta", {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
    }, "-=0.4")

  }, { scope: container })


    return (
        <section ref={container} id="hero"
            className="min-h-screen flex flex-col items-center justify-center gap-6 py-16 px-6 sm:px-12 lg:px-20 text-center overflow-x-hidden relative"
            style={{ pointerEvents: 'auto' }} // Ensure links are clickable if scene blocks them
        >
            <h1 className="text-[clamp(3.5rem,7vw,6rem)] leading-[0.9] hero-title font-bold">
                {words.map((word, i) => (
                    <span key={i} className="hero-word p-1 sm:p-2 block text-ink">
                        {word}
                    </span>
                ))}
            </h1>

            <p className="hero-sub text-[clamp(1rem,2vw,1.25rem)] text-muted max-w-2xl mx-auto leading-relaxed">
            AI Job Helper matches your skills to the perfect roles and prepares you for success.
            </p>

            <div className="hero-cta flex gap-4 mt-6 z-10 relative pointer-events-auto">
              <a href="/login" className="px-6 py-3 rounded-full bg-accent text-white font-medium hover:bg-accent-strong transition-colors">
                Log in
              </a>
              <a href="/signup" className="px-6 py-3 rounded-full border border-line text-ink font-medium hover:bg-surface transition-colors">
                Sign up
              </a>
            </div>

        </section>
    )
}