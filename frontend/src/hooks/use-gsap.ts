import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function useGsapFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, delay, ease: 'power3.out' }
      );
    }
  }, [delay]);

  return ref;
}

export function useGsapStagger(selector: string, delay = 0) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll(selector);
      gsap.fromTo(
        elements,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          delay,
          ease: 'power2.out',
        }
      );
    }
  }, [selector, delay]);

  return containerRef;
}

export function useGsapSlideIn(direction: 'left' | 'right' | 'up' | 'down' = 'left', delay = 0) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const from: Record<string, number> = { opacity: 0 };
      if (direction === 'left') from.x = -60;
      else if (direction === 'right') from.x = 60;
      else if (direction === 'up') from.y = -60;
      else from.y = 60;

      gsap.fromTo(
        ref.current,
        from,
        { opacity: 1, x: 0, y: 0, duration: 0.8, delay, ease: 'power3.out' }
      );
    }
  }, [direction, delay]);

  return ref;
}

export function useGsapScale(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.6, delay, ease: 'back.out(1.7)' }
      );
    }
  }, [delay]);

  return ref;
}

export function animatePageEnter(container: HTMLElement) {
  const elements = container.querySelectorAll('[data-animate]');
  gsap.fromTo(
    elements,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out',
    }
  );
}

export function animateHoverScale(element: HTMLElement) {
  gsap.to(element, {
    scale: 1.02,
    duration: 0.3,
    ease: 'power2.out',
  });
}

export function animateHoverReset(element: HTMLElement) {
  gsap.to(element, {
    scale: 1,
    duration: 0.3,
    ease: 'power2.out',
  });
}
