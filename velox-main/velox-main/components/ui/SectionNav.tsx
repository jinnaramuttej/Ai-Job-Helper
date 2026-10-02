"use client"

import { useRef } from "react"
import { useGSAP, ScrollTrigger } from "@/lib/gsap"
import { lenisInstance } from "@/hooks/useLenis"

// Add a new entry here whenever a new section gets a real id 
const sections = [
    { id: "hero", label: "Home" },
    { id: "features", label: "Features" },
    { id: "showcase", label: "Showcase" },
    { id: "stats", label: "Stats" },
    { id: "cta", label: "Get started" },
]

const ACTIVE_CLASSES = ["bg-[#ededed]", "border-[#ededed]", "scale-125"]
const INACTIVE_CLASSES = ["border-[#555]"]

export default function SectionNav() {
    const container = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        sections.forEach(({ id }) => {
            const el = document.getElementById(id)
            if (!el) return

            ScrollTrigger.create({
                trigger: el,
                start: "top center",
                end: "bottom center",
                onToggle: (self) => {
                    if (!self.isActive) return

                    document.querySelectorAll(".section-dot").forEach((dot) => {
                        dot.classList.remove(...ACTIVE_CLASSES)
                        dot.classList.add(...INACTIVE_CLASSES)
                    })

                    const activeDot = document.querySelector(
                        `.section-dot[data-target="${id}"]`
                    )
                    activeDot?.classList.remove(...INACTIVE_CLASSES)
                    activeDot?.classList.add(...ACTIVE_CLASSES)
                },
            })
        })
    }, { scope: container })

    const scrollToSection = (id: string) => {
        lenisInstance?.scrollTo(`#${id}`, { duration: 1.2 })
    }

    return (
        <div
            ref={container}
            className="fixed right-6 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-4"
        >
            {sections.map(({ id, label }, i) => (
                <button
                    key={id}
                    type="button"
                    aria-label={`Scroll to ${label}`}
                    onClick={() => scrollToSection(id)}
                    className="flex h-4 w-4 cursor-pointer items-center justify-center"
                >
                    <span
                        data-target={id}
                        className={`section-dot h-2 w-2 rounded-full border bg-transparent transition-all duration-300 ${i === 0 ? ACTIVE_CLASSES.join(" ") : INACTIVE_CLASSES.join(" ")
                            }`}
                    />
                </button>
            ))}
        </div>
    )
}
