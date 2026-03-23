import { gsap } from './gsap';

// Reusable GSAP animation presets
export const fadeUp = (el: Element | string, delay = 0, duration = 0.9) =>
  gsap.fromTo(
    el,
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration, delay, ease: 'vitalize' }
  );

export const fadeIn = (el: Element | string, delay = 0, duration = 0.8) =>
  gsap.fromTo(
    el,
    { opacity: 0 },
    { opacity: 1, duration, delay, ease: 'vitalize-soft' }
  );

export const staggerFadeUp = (
  els: Element[] | string,
  stagger = 0.1,
  delay = 0
) =>
  gsap.fromTo(
    els,
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 0.8, delay, stagger, ease: 'vitalize' }
  );

export const scaleIn = (el: Element | string, delay = 0) =>
  gsap.fromTo(
    el,
    { opacity: 0, scale: 0.93 },
    { opacity: 1, scale: 1, duration: 0.9, delay, ease: 'vitalize' }
  );

export const slideInLeft = (el: Element | string, delay = 0) =>
  gsap.fromTo(
    el,
    { opacity: 0, x: -60 },
    { opacity: 1, x: 0, duration: 0.9, delay, ease: 'vitalize' }
  );

export const slideInRight = (el: Element | string, delay = 0) =>
  gsap.fromTo(
    el,
    { opacity: 0, x: 60 },
    { opacity: 1, x: 0, duration: 0.9, delay, ease: 'vitalize' }
  );

// Page transition variants for Framer Motion
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const pageVariants = {
  initial: { opacity: 0, y: 24, filter: 'blur(4px)' },
  enter: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.65, ease: EASE },
  },
  exit: {
    opacity: 0,
    y: -16,
    filter: 'blur(4px)',
    transition: { duration: 0.4, ease: EASE },
  },
};

// Framer Motion shared variants
export const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

export const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE },
  },
};
