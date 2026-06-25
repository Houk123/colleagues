import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

interface UseAnimeRevealOptions {
  delay?: number;
  staggerAmount?: number;
  threshold?: number;
  y?: number;
  once?: boolean;
}

export function useAnimeReveal<T extends HTMLElement>(options: UseAnimeRevealOptions = {}) {
  const ref = useRef<T>(null);
  const {
    delay = 0,
    staggerAmount = 0,
    threshold = 0.15,
    y = 30,
    once = true,
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (once) {
      element.style.opacity = "0";
      element.style.transform = `translateY(${y}px)`;
    }

    const targets = staggerAmount > 0 ? element.children : element;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(targets, {
              opacity: [0, 1],
              y: [y, 0],
              duration: 600,
              delay: staggerAmount > 0 ? stagger(staggerAmount, { start: delay }) : delay,
              ease: "outCubic",
            });
            if (once) {
              observer.unobserve(element);
            }
          }
        });
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [delay, staggerAmount, threshold, y, once]);

  return ref;
}

export function useAnimeMount(childrenSelector: string, delay = 0, staggerAmount = 100) {
  useEffect(() => {
    animate(childrenSelector, {
      opacity: [0, 1],
      y: [24, 0],
      duration: 500,
      delay: stagger(staggerAmount, { start: delay }),
      ease: "outCubic",
    });
  }, [childrenSelector, delay, staggerAmount]);
}
