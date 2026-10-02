"use client"

import { useRef } from "react"
import { gsap, useGSAP } from "@/lib/gsap"
import MagneticButton from "@/components/ui/MagneticButton"

export default function CTA() {
    const container = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        gsap.from(".cta-content > *", {
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
                trigger: container.current,
                start: "top 70%",
                once: true,
            },
        })
    }, { scope: container })

    return (
        <section
            ref={container}
            id="cta"
            className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-32 text-center sm:px-12 lg:px-20"
        >
            <div className="cta-content flex flex-col items-center gap-6">
                <h2 className="max-w-3xl text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[0.95]">
                    Ready to work faster?
                </h2>

                <p className="max-w-xl text-[clamp(1rem,2vw,1.25rem)] leading-relaxed text-[#888]">
                    Join the teams already using Velox to cut busywork and move at the speed of thought.
                </p>

                <MagneticButton className="mt-4 cursor-pointer rounded-full bg-[#ededed] px-10 py-4 text-base font-semibold text-[#080808] transition-colors hover:bg-white">
                    Get started free
                </MagneticButton>
            </div>
        </section>
    )
}
