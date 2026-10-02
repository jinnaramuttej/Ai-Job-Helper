"use client"

import { useRef, type MouseEvent, type ReactNode } from "react"
import { gsap } from "@/lib/gsap"

type QuickSetter = (value: number) => void

export default function MagneticButton({
    children,
    className = "",
    onClick,
    strength = 0.35,
}: {
    children: ReactNode
    className?: string
    onClick?: () => void
    strength?: number
}) {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const quickX = useRef<QuickSetter | null>(null)
    const quickY = useRef<QuickSetter | null>(null)

    const ensureQuickSetters = () => {
        if (!buttonRef.current) return
        if (!quickX.current) {
            quickX.current = gsap.quickTo(buttonRef.current, "x", {
                duration: 0.5,
                ease: "power3.out",
            })
        }
        if (!quickY.current) {
            quickY.current = gsap.quickTo(buttonRef.current, "y", {
                duration: 0.5,
                ease: "power3.out",
            })
        }
    }

    const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
        const el = buttonRef.current
        if (!el) return

        ensureQuickSetters()

        const rect = el.getBoundingClientRect()
        const relX = e.clientX - (rect.left + rect.width / 2)
        const relY = e.clientY - (rect.top + rect.height / 2)

        quickX.current?.(relX * strength)
        quickY.current?.(relY * strength)
    }

    const handleMouseLeave = () => {
        ensureQuickSetters()
        quickX.current?.(0)
        quickY.current?.(0)
    }

    return (
        <button
            ref={buttonRef}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={className}
        >
            {children}
        </button>
    )
}
