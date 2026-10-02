This is personal learning project, built to practice **GSAP + Lenis** animations.

# Velox 

A high-performance AI productivity SaaS landing page built with Next.js, GSAP, and Lenis. Created as a portfolio project to demonstrate advanced scroll-driven animations and modern frontend architecture.

Live demo: [velox-delta-six.vercel.app](https://velox-delta-six.vercel.app/) 

---

## What this project demonstrates

- Scroll-triggered animations using GSAP ScrollTrigger
- Smooth scrolling with Lenis
- Pinned sections with horizontal scroll
- Text reveal animations per word and per character
- Counter animations that trigger on viewport entry
- Parallax effects on hero section
- Magnetic hover effects on CTA buttons
- Page transition animation

---

## Tech stack

| Technology | Purpose |
|---|---|
| Next.js 15 | Framework, App Router |
| GSAP 3 + ScrollTrigger | Animations |
| Lenis | Smooth scroll |
| Tailwind CSS | Styling |
| TypeScript | Type safety |

---

## Project structure

```
velox/
├── app/
│   ├── layout.tsx          # Root layout, Lenis provider
│   └── page.tsx            # Main landing page
├── components/
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Showcase.tsx    # Pinned horizontal scroll
│   │   ├── Stats.tsx       # Counter animations
│   │   └── CTA.tsx
│   └── ui/
│       ├── MagneticButton.tsx
│       └── TextReveal.tsx
├── hooks/
│   ├── useGSAP.ts          # GSAP context wrapper
│   └── useLenis.ts         # Lenis smooth scroll
└── lib/
    └── gsap.ts             # GSAP registration and config
```

---

## Getting started

```bash
git clone https://github.com/sadeniemela/velox
cd velox
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Key implementation details

### GSAP with Next.js App Router

Next.js App Router runs on the server by default. GSAP manipulates the DOM, which only exists on the client. This means every GSAP animation must run inside a `useEffect` or the `useGSAP` hook from `@gsap/react`, and components that use GSAP need the `"use client"` directive.

### Lenis + GSAP ScrollTrigger sync

Lenis and GSAP ScrollTrigger must be connected so that ScrollTrigger reads scroll position from Lenis instead of the native browser scroll. This is done by updating ScrollTrigger inside the Lenis `raf` loop.

### Pinned section

The showcase section uses `ScrollTrigger.pin` to keep the section fixed while the user scrolls through horizontal content. The horizontal distance is calculated dynamically based on the number of items and viewport width.

---

## License

MIT
