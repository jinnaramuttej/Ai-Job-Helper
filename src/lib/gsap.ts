// Importing gsap and the ScrollTrigger plugin
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Registering the ScrollTrigger plugin with gsap
gsap.registerPlugin(ScrollTrigger);

// Re-exporting gsap and ScrollTrigger for use in other parts of the application
export { gsap, ScrollTrigger, useGSAP };