import { motion, useReducedMotion } from "motion/react";
import { Coin } from "./Art";

/** A one-off fountain of coins; keyed by the caller so each burst replays. Nothing with reduced motion. */
export function CoinBurst({ count = 14, spread = 160 }: { count?: number; spread?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {Array.from({ length: count }, (_, i) => {
        const angle = -Math.PI / 2 + ((i / (count - 1)) - 0.5) * Math.PI * 1.1;
        const dist = spread * (0.6 + ((i * 37) % 10) / 25);
        return (
          <motion.span
            key={i}
            className="absolute"
            initial={{ x: 0, y: 0, scale: 0.4, rotate: 0, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: [0, Math.sin(angle) * dist, Math.sin(angle) * dist + 140],
              scale: 1,
              rotate: (i % 2 ? 1 : -1) * 220,
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 1.3, ease: "easeOut", times: [0, 0.45, 1] }}
          >
            <Coin size={22 + (i % 3) * 6} />
          </motion.span>
        );
      })}
    </div>
  );
}
