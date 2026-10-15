import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Info, X } from "lucide-react";
import { Piggy2D } from "../components/Art";
import { About } from "../components/About";

/** The 2019 prototype opened on a "CLICK ME" screen; this keeps the invitation. */
export function Splash({ onStart }: { onStart: () => void }) {
  const [about, setAbout] = useState(false);
  return (
    <div className="relative flex h-full flex-col items-center justify-between px-6 pb-10 pt-14 text-center">
      <button type="button" onClick={() => setAbout(true)} className="btn-ghost absolute right-4 top-4 min-h-[44px] px-4 text-sm lg:hidden">
        <Info aria-hidden size={18} /> About
      </button>
      <div />
      <div>
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: [0, -10, 0], opacity: 1 }}
          transition={{ y: { duration: 2.4, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.4 } }}
        >
          <Piggy2D stage={0} shattered={false} hitKey={0} feedKey={0} className="mx-auto w-56" />
        </motion.div>
        <h1 className="mt-8 text-6xl font-semibold tracking-tight">
          digi <span className="text-piggy">bank</span>
        </h1>
        <p className="mt-3 text-lg text-mist">Money you can hold, crack and hand over.</p>
      </div>
      <div className="w-full space-y-4">
        <motion.button type="button" onClick={onStart} className="btn-gold w-full text-xl" whileTap={{ scale: 0.96 }}>
          Tap to start
        </motion.button>
        <p className="text-sm text-mist">A design concept. Not a real bank.</p>
      </div>

      <AnimatePresence>
        {about && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="About this concept"
            className="absolute inset-0 z-40 overflow-y-auto bg-night px-6 pb-10 pt-16 text-left"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
          >
            <button type="button" autoFocus onClick={() => setAbout(false)} className="btn-ghost absolute right-4 top-4 min-h-[44px] px-4 text-sm">
              <X aria-hidden size={18} /> Close
            </button>
            <About />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
