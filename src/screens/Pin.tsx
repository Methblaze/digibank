import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Delete } from "lucide-react";
import { Coin, Piggy2D } from "../components/Art";
import { useBank } from "../state/BankProvider";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

/** Each digit drops a coin into its slot; the fourth coin feeds the piggy and opens the app. */
export function Pin({ onUnlock }: { onUnlock: () => void }) {
  const { announce } = useBank();
  const [pin, setPin] = useState("");
  const [done, setDone] = useState(false);

  const press = useCallback(
    (k: string) => {
      if (done) return;
      if (k === "del") {
        setPin((p) => p.slice(0, -1));
        return;
      }
      if (pin.length >= 4) return;
      setPin(pin + k);
      announce(`${pin.length + 1} of 4 digits`);
    },
    [announce, done, pin],
  );

  const unlock = useRef(onUnlock);
  unlock.current = onUnlock;
  useEffect(() => {
    if (pin.length !== 4) return;
    setDone(true);
    announce("Unlocked");
    const t = window.setTimeout(() => unlock.current(), 900);
    return () => window.clearTimeout(t);
  }, [pin, announce]);

  // A hardware keyboard works too
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      if (e.key === "Backspace") press("del");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  return (
    <div className="flex h-full flex-col px-6 pb-8 pt-10">
      <div className="text-center">
        <Piggy2D stage={0} shattered={false} hitKey={0} feedKey={done ? 1 : 0} className="mx-auto w-28" />
        <h1 className="mt-4 text-3xl font-semibold">Enter your PIN</h1>
        <p className="mt-1 text-mist">Any four digits will do in this demo.</p>
      </div>

      <div className="mt-8 flex justify-center gap-4" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="relative grid h-16 w-14 place-items-center overflow-visible rounded-2xl bg-night-800 shadow-press">
            <AnimatePresence>
              {pin.length > i && (
                <motion.div
                  key="coin"
                  initial={{ y: -70, rotate: -90, opacity: 0 }}
                  animate={done ? { y: -150, x: (1.5 - i) * 58, scale: 0.3, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0, scale: 0.6 }}
                  transition={done ? { duration: 0.5, delay: i * 0.08, ease: "easeIn" } : { type: "spring", stiffness: 520, damping: 18 }}
                >
                  <Coin size={36} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="mt-auto grid grid-cols-3 gap-3" role="group" aria-label="PIN keypad">
        {KEYS.map((k, i) =>
          k === "" ? (
            <span key={i} />
          ) : (
            <motion.button
              key={i}
              type="button"
              onClick={() => press(k)}
              whileTap={{ scale: 0.9 }}
              aria-label={k === "del" ? "Delete last digit" : k}
              className="clay grid h-16 place-items-center font-display text-2xl font-semibold hover:bg-night-700"
            >
              {k === "del" ? <Delete aria-hidden size={26} /> : k}
            </motion.button>
          ),
        )}
      </div>
    </div>
  );
}
