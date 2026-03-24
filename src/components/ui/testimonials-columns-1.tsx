import React from 'react';

type Testimonial = {
  text?: string;
  quote?: string;
  image: string;
  name: string;
  role: string;
};

export function TestimonialsColumn(props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) {
  const duration = props.duration ?? 15;
  // Cards rendered twice. CSS translateY 0 → -50% scrolls exactly one set upward → seamless loop.
  return (
    <div className={`overflow-hidden ${props.className ?? ''}`}>
      <div
        className="flex flex-col gap-6 animate-scroll-up"
        style={{ animationDuration: `${duration}s` }}
      >
        {[0, 1].map((copy) => (
          <React.Fragment key={copy}>
            {props.testimonials.map(({ text, quote, image, name, role }, i) => (
              <div
                key={`${copy}-${i}`}
                className="w-[300px] flex-shrink-0 rounded-2xl border border-black/[0.07] bg-paper p-7 shadow-card"
              >
                <p className="text-sm leading-[1.75] text-ink-muted">
                  &ldquo;{text ?? quote}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <img
                    src={image}
                    alt={name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium tracking-tight text-ink-main leading-5 truncate">
                      {name}
                    </span>
                    <span className="text-xs leading-5 text-ink-muted tracking-tight truncate">
                      {role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
