import { useEffect, useRef, useState } from "react";

interface WiggleHeadingProps {
  text: string;
  className?: string;
  soft?: boolean;
}

/** Heading whose letters bounce in with a quick staggered wiggle the first time it scrolls into view. */
export default function WiggleHeading({ text, className = "", soft = false }: WiggleHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [go, setGo] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGo(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  let n = 0;
  const words = text.split(" ");
  return (
    <h2 ref={ref} aria-label={text} className={className}>
      {words.map((word, wi) => (
        <span key={wi} aria-hidden="true">
          <span className="inline-block whitespace-nowrap">
            {word.split("").map((ch) => {
              const i = n++;
              return (
                <span
                  key={i}
                  className="wiggle-letter inline-block"
                  style={{
                    opacity: go ? undefined : 0,
                    animationName: go ? (soft ? "letter-jiggle-soft" : "letter-jiggle") : undefined,
                    animationDuration: soft ? "1500ms" : "900ms",
                    animationTimingFunction: soft ? "cubic-bezier(0.22, 1, 0.36, 1)" : "cubic-bezier(0.34, 1.56, 0.64, 1)",
                    animationFillMode: "both",
                    animationDelay: 150 + i * (soft ? 80 : 45) + "ms",
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
          {wi < words.length - 1 ? " " : null}
        </span>
      ))}
    </h2>
  );
}
