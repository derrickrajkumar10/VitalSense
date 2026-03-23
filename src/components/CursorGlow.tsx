import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMove);

    const ticker = gsap.ticker.add(() => {
      current.current.x += (pos.current.x - current.current.x) * 0.08;
      current.current.y += (pos.current.y - current.current.y) * 0.08;
      if (glowRef.current) {
        gsap.set(glowRef.current, {
          x: current.current.x - 200,
          y: current.current.y - 200,
        });
      }
    });

    return () => {
      window.removeEventListener('mousemove', onMove);
      gsap.ticker.remove(ticker);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed top-0 left-0 w-[400px] h-[400px] rounded-full z-0"
      style={{
        background: 'radial-gradient(circle, rgba(219,203,185,0.12) 0%, transparent 70%)',
        willChange: 'transform',
      }}
    />
  );
}
