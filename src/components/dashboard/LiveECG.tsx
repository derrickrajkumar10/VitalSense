import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';

interface LiveECGProps {
  className?: string;
  color?: string;
  height?: number;
}

// A realistic-looking ECG path (P wave, QRS complex, T wave)
const ECG_PATH =
  'M0,30 L18,30 L22,30 L24,26 L26,30 L30,30 L32,28 L34,5 L36,48 L38,30 L42,30 L44,24 L48,30 L60,30 L78,30 L82,30 L84,26 L86,30 L90,30 L92,28 L94,5 L96,48 L98,30 L102,30 L104,24 L108,30 L120,30 L138,30 L142,30 L144,26 L146,30 L150,30 L152,28 L154,5 L156,48 L158,30 L162,30 L164,24 L168,30 L180,30';

export default function LiveECG({ className = '', color = '#6A608A', height = 56 }: LiveECGProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const length = path.getTotalLength();

    // Set up the dash
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
      opacity: 1,
    });

    // Draw in on mount
    const drawTl = gsap.timeline({ delay: 1 });
    drawTl.to(path, {
      strokeDashoffset: 0,
      duration: 1.5,
      ease: 'power2.inOut',
    });

    // After draw-in: run infinite looping scan line effect
    drawTl.call(() => {
      gsap.set(path, { strokeDasharray: `${length * 0.4} ${length * 0.6}` });

      gsap.fromTo(
        path,
        { strokeDashoffset: length },
        {
          strokeDashoffset: -length,
          duration: 2.4,
          ease: 'none',
          repeat: -1,
        }
      );
    });

    return () => {
      drawTl.kill();
      gsap.killTweensOf(path);
    };
  }, []);

  return (
    <svg
      ref={containerRef}
      viewBox="0 0 180 56"
      className={className}
      style={{ height, width: '100%' }}
      preserveAspectRatio="none"
    >
      {/* Grid lines */}
      {[14, 28, 42].map((y) => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2="180"
          y2={y}
          stroke={color}
          strokeWidth="0.3"
          strokeOpacity="0.15"
        />
      ))}
      {[30, 60, 90, 120, 150].map((x) => (
        <line
          key={x}
          x1={x}
          y1="0"
          x2={x}
          y2="56"
          stroke={color}
          strokeWidth="0.3"
          strokeOpacity="0.15"
        />
      ))}

      {/* ECG trace */}
      <path
        ref={pathRef}
        d={ECG_PATH}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0"
      />

      {/* Glow duplicate */}
      <path
        d={ECG_PATH}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.08"
      />
    </svg>
  );
}
