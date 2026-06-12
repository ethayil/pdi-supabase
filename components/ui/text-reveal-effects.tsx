/** biome-ignore-all lint/suspicious/noArrayIndexKey: index is required */
"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

export function TextRevealEffect({
  text,
  className = "",
  delay = 0,
}: TextRevealProps) {
  const words = text.split(" ");
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });

  let cumulativeCharCount = 0;

  return (
    <div ref={containerRef} className={cn("inline-block", className)}>
      {words.map((word, wordIdx) => {
        const chars = word.split("");
        const wordElement = (
          <span
            key={wordIdx}
            className="inline-block whitespace-nowrap mr-[0.25em]"
          >
            {chars.map((char, charIdx) => {
              const currentDelay =
                delay + cumulativeCharCount * 0.012 + wordIdx * 0.025;
              cumulativeCharCount++;
              return (
                <motion.span
                  key={charIdx}
                  initial={{
                    opacity: 0,
                    y: 12,
                    filter: "blur(6px)",
                    scale: 0.97,
                  }}
                  animate={
                    isInView
                      ? { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }
                      : {}
                  }
                  transition={{
                    type: "spring",
                    stiffness: 150,
                    damping: 15,
                    mass: 0.3,
                    delay: currentDelay,
                  }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
        );
        return wordElement;
      })}
    </div>
  );
}

export function SpotlightCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Required
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Spotlight effect */}
      {isHovering && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
            width: "300px",
            height: "300px",
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
            transform: "translate(-50%, -50%)",
          }}
          animate={{ opacity: [0, 1] }}
          transition={{ duration: 0.2 }}
        />
      )}
      {children}
    </div>
  );
}

export function MovingBorder({
  children,
  duration = 3000,
  className = "",
}: {
  children: React.ReactNode;
  duration?: number;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-[-2px] bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-75 blur-sm">
        <motion.div
          className="absolute inset-0 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: duration / 1000,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
      <div className="relative bg-white dark:bg-gray-900 rounded-full">
        {children}
      </div>
    </div>
  );
}

export function GridBackgroundPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(59 130 246 / 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(59 130 246 / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Moving dots */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

export function AnimatedNumber({
  value,
  duration = 2,
  prefix = "",
  suffix = "",
  className = "",
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inViewRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(inViewRef, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, {
        duration: duration,
        ease: "easeOut",
      });
      return () => controls.stop();
    }
  }, [isInView, count, value, duration]);

  useEffect(() => {
    return rounded.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toLocaleString()}${suffix}`;
      }
    });
  }, [rounded, prefix, suffix]);

  return (
    <span ref={inViewRef} className={className}>
      <span ref={ref}>
        {prefix}0{suffix}
      </span>
    </span>
  );
}
