"use client"

// Importing necessary modules and types
import { useEffect, useLayoutEffect } from "react"
import Lenis from "lenis"
import { ScrollTrigger } from "@/lib/gsap"

// Module-level reference to the active Lenis instance so other client
export let lenisInstance: Lenis | null = null

// Custom hook to initialize and manage the Lenis smooth scrolling library
export function useLenis() {
  // Browsers restore the previous scroll position on reload by default. Fix this by forcing the scroll position to the top on initial render.
  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual"
    }
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    // Creating a new instance of Lenis with specified options
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    lenisInstance = lenis

    // Make sure Lenis itself also starts from the top before anything else
    lenis.scrollTo(0, { immediate: true })

    // Setting up an event listener to update ScrollTrigger on scroll events
    lenis.on("scroll", ScrollTrigger.update)

    // Function to handle the animation frame updates for Lenis
    const raf = (time: number) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Recalculate ScrollTrigger's trigger positions now that Lenis is driving the scroll position
    ScrollTrigger.refresh()

    // Cleanup function to destroy the Lenis instance when the component unmounts
    return () => {
      lenisInstance = null
      lenis.destroy()
    }
  }, [])
}