"use client"

import { useRef } from "react"
import { gsap, useGSAP } from "@/lib/gsap"

const features = [
    {
        title: "Automate the busywork",
        description: "Velox handles repetitive tasks in the background so your team can stay focused on the work that actually moves the needle.",
    },
    {
        title: "Understand in seconds",
        description: "Summaries, insights and next steps are generated the moment new data lands, no digging required.",
    },
    {
        title: "Built for how teams work",
        description: "Every workflow adapts to your team's existing tools instead of forcing you into a new one.",
    },
    {
        title: "Stay in sync",
        description: "Every update is reflected across your tools instantly, so nobody is ever working from stale information.",
    },
    {
        title: "Secure by default",
        description: "Your data is encrypted end-to-end and never used to train models outside your workspace.",
    },
    {
        title: "Scales with you",
        description: "From a two-person team to a thousand-person org, Velox adapts without slowing down.",
    },
]

export default function Features() {
    const container = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        gsap.from(".feature-card", {
            y: 60,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            clearProps: "transform,opacity",
            scrollTrigger: {
                trigger: container.current,
                start: "top 75%",
            },
        })
    }, { scope: container })

    return (
        <section ref={container} id="features" className="min-h-screen flex flex-col items-center justify-center gap-16 py-32 px-8 sm:px-12 lg:px-20 xl:px-28 text-center">
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight max-w-3xl mx-auto">
                Everything your team needs, nothing it doesn&apos;t.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 w-full max-w-6xl text-center mx-10">
                {features.map((feature, i) => (
                    <div
                        key={i}
                        className="feature-card border border-[#222] rounded-2xl px-5 sm:px-8 lg:px-10 pb-5 sm:pb-8 lg:pb-10 pt-10 sm:pt-14 lg:pt-16 flex flex-col gap-4 bg-[#0d0d0d] min-h-50"
                    >
                        <h3 className="text-xl font-semibold">{feature.title}</h3>
                        <p className="text-[#888] leading-relaxed p-3 m-3">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}
