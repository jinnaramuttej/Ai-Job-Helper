"use client"

import { useRef } from "react"
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap"

const panels = [
    {
        title: "Dashboard",
        description: "See everything that matters at a glance, updated in real time as your team works.",
    },
    {
        title: "Automations",
        description: "Chain together the busywork so it runs itself in the background, every single time.",
    },
    {
        title: "Reports",
        description: "Instant summaries and trends, generated the moment new data comes in.",
    },
    {
        title: "Integrations",
        description: "Connects to the tools your team already uses, no migration required.",
    },
]

export default function Showcase() {
    const container = useRef<HTMLDivElement>(null)
    const track = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        const trackEl = track.current
        const containerEl = container.current
        if (!trackEl || !containerEl) return

        const scrollDistance = trackEl.scrollWidth - window.innerWidth

        gsap.to(trackEl, {
            x: -scrollDistance,
            ease: "none",
            scrollTrigger: {
                trigger: containerEl,
                start: "top top",
                end: () => `+=${scrollDistance}`,
                scrub: 1,
                pin: true,
                invalidateOnRefresh: true,
            },
        })
    }, { scope: container })

    return (
        <section ref={container} id="showcase" className="relative h-screen overflow-hidden bg-[#0a0a0a]">
            <div
                ref={track}
                className="flex h-full items-center gap-8 px-[10vw] will-change-transform"
            >
                {panels.map((panel, i) => (
                    <div
                        key={i}
                        className="flex h-[70vh] w-[80vw] shrink-0 flex-col justify-end gap-4 rounded-3xl border border-[#222] bg-gradient-to-br from-[#141414] to-[#0a0a0a] p-10 md:w-[55vw] lg:w-[36vw]"
                    >
                        <span className="text-sm text-[#666]">{`0${i + 1}`}</span>
                        <h3 className="text-3xl font-bold">{panel.title}</h3>
                        <p className="max-w-md leading-relaxed text-[#888]">{panel.description}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}
