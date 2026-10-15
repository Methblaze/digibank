import { useEffect } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { kr } from "../state/bank";

/**
 * A kroner amount that counts to its value. It starts from `from` (zero by
 * default, as the 2019 balance did) and later counts from the last value.
 * Screen readers get the final amount only.
 */
export function CountUp({ value, from = 0, duration = 1.6, className }: { value: number; from?: number; duration?: number; className?: string }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : from);
  const text = useTransform(mv, (v) => kr(v));

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [value, reduce, duration, mv]);

  return (
    <span className={className}>
      <motion.span aria-hidden className="tabular-nums">
        {text}
      </motion.span>
      <span className="sr-only">{kr(value)}</span>
    </span>
  );
}
