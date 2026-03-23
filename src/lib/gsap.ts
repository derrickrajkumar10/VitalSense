import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, TextPlugin, CustomEase);

// Signature eases
CustomEase.create('vitalize', 'M0,0 C0.22,1 0.36,1 1,1');
CustomEase.create('vitalize-soft', 'M0,0 C0.16,1 0.3,1 1,1');
CustomEase.create('vitalize-sharp', 'M0,0 C0.4,0 0.2,1 1,1');

export { gsap, ScrollTrigger };
