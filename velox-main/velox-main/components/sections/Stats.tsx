"use client"

import { useRef } from "react"
import { gsap, useGSAP } from "@/lib/gsap"

const stats = [
    { value: 10000, suffix: "+", label: "Teams onboarded" },
    { value: 40, suffix: "%", label: "Less manual work" },
    { value: 2.5, suffix: "x", label: "Faster turnaround", decimals: 1 },
    { value: 24, suffix: "/7", label: "Always in sync" },
]

export default function Stats() {
    const container = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        const counters = gsap.utils.toArray<HTMLElement>(".stat-value")

        counters.forEach((el) => {
            const target = parseFloat(el.dataset.value || "0")
            const decimals = Number(el.dataset.decimals || 0)
            const suffix = el.dataset.suffix || ""
            const counter = { val: 0 }

            gsap.to(counter, {
                val: target,
                duration: 2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    once: true,
                },
                onUpdate: () => {
                    el.textContent = counter.val.toFixed(decimals) + suffix
                },
            })
        })
    }, { scope: container })

    return (
        <section
            ref={container}
            id="stats"
            className="flex min-h-screen flex-col items-center justify-center gap-16 px-8 py-32 text-center sm:px-12 lg:px-20"
        >
            <h2 className="max-w-2xl text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight">
                Numbers that speak for themselves.
            </h2>

            <div className="grid w-full max-w-5xl grid-cols-2 gap-10 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <span
                            className="stat-value text-[clamp(2.5rem,6vw,4.5rem)] font-bold"
                            data-value={stat.value}
                            data-suffix={stat.suffix}
                            data-decimals={stat.decimals ?? 0}
                        >
                            0
                        </span>
                        <span className="text-sm text-[#888] sm:text-base">{stat.label}</span>
                    </div>
                ))}
            </div>
        </section>
    )
}
