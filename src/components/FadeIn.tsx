"use client";

import { useEffect, useRef, useState } from "react";

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  threshold?: number;
};

export default function FadeIn({
  children,
  className,
  delayMs = 0,
  threshold = 0.15,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    // If IntersectionObserver isn't available, render immediately.
    return !("IntersectionObserver" in window);
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If IntersectionObserver isn't available, show immediately.
    if (!("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      data-visible={visible ? "true" : "false"}
      className={`powerlay-reveal ${className ?? ""}`}
      style={
        {
          // Used by `.powerlay-reveal` in `globals.css`.
          ["--powerlay-reveal-delay" as unknown as string]: `${delayMs}ms`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

