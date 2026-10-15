import { Component, Suspense, lazy, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Box, RotateCcw, Square } from "lucide-react";
import { Coin, Piggy2D, ToolArt, type Tool } from "../components/Art";
import { CoinBurst } from "../components/CoinBurst";
import { useBank } from "../state/BankProvider";
import { kr } from "../state/bank";
import { hasWebGL } from "../lib/webgl";

const PiggyScene = lazy(() => import("../piggy3d/PiggyScene"));

const TAPS = 6;
const TOOLS: { id: Tool; label: string }[] = [
  { id: "hammer", label: "Hammer" },
  { id: "mace", label: "Mace" },
  { id: "sword", label: "Sword" },
];
const FEEDS = [20, 50, 100];

/** Falls back to the flat piggy if WebGL fails after loading. */
class Fallback extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

type Mode = "idle" | "choose" | "tap" | "broken";

export function PiggyScreen() {
  const { state, dispatch, announce, flat, setFlat } = useBank();
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>(state.balances.piggy > 0 ? "idle" : "broken");
  const [tool, setTool] = useState<Tool>("hammer");
  const [taps, setTaps] = useState(0);
  const [hitKey, setHitKey] = useState(0);
  const [feedKey, setFeedKey] = useState(0);
  const [drop, setDrop] = useState<number | null>(null);
  const [burst, setBurst] = useState(0);
  const tapRef = useRef<HTMLButtonElement>(null);

  const saved = state.balances.piggy;
  const progress = Math.min(1, saved / state.goal.target);
  const can3D = !flat && !reduce && hasWebGL();
  const shattered = mode === "broken" && saved === 0;
  const stage = mode === "tap" ? taps : 0;

  useEffect(() => {
    if (mode === "tap") tapRef.current?.focus();
  }, [mode]);

  const hit = () => {
    if (mode !== "tap") return;
    const next = taps + 1;
    setTaps(next);
    setHitKey((k) => k + 1);
    if (next >= TAPS) {
      dispatch({ type: "crack" });
      setMode("broken");
      setBurst((b) => b + 1);
      announce(`Cracked! ${kr(saved)} moved to your everyday account.`);
    } else {
      announce(`${TAPS - next} more ${TAPS - next === 1 ? "tap" : "taps"}`);
    }
  };

  const feed = (amount: number) => {
    if (amount > state.balances.everyday) return;
    dispatch({ type: "feed", amount });
    setDrop(Date.now());
    window.setTimeout(() => setFeedKey((k) => k + 1), reduce ? 0 : 420);
    announce(`Fed the piggy ${kr(amount)}`);
    if (mode === "broken") setMode("idle");
  };

  const undo = () => {
    dispatch({ type: "undoCrack" });
    setTaps(0);
    setMode("idle");
    announce("Piggy put back together");
  };

  const scene = can3D ? (
    <Fallback fallback={<Piggy2D stage={stage} shattered={shattered} hitKey={hitKey} feedKey={feedKey} className="h-full w-full p-6" />}>
      <Suspense fallback={<Piggy2D stage={stage} shattered={shattered} hitKey={hitKey} feedKey={feedKey} className="h-full w-full p-6" />}>
        <PiggyScene stage={stage} shattered={shattered} hitKey={hitKey} feedKey={feedKey} />
      </Suspense>
    </Fallback>
  ) : (
    <Piggy2D stage={stage} shattered={shattered} hitKey={hitKey} feedKey={feedKey} className="h-full w-full p-6" />
  );

  return (
    <div className="px-5 pt-10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Piggy bank</h1>
          <p className="mt-1 text-mist">Saving for {state.goal.name.toLowerCase()}</p>
        </div>
        <button
          type="button"
          onClick={() => setFlat(!flat)}
          aria-pressed={can3D}
          aria-label="3D piggy bank"
          disabled={Boolean(reduce) || !hasWebGL()}
          className="btn-ghost min-h-[44px] shrink-0 px-4 text-sm"
          title={reduce ? "Reduced motion is on, so the piggy stays flat" : undefined}
        >
          {can3D ? <Box aria-hidden size={16} /> : <Square aria-hidden size={16} />} {can3D ? "3D" : "Flat"}
        </button>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="font-display text-4xl font-semibold">{kr(saved)}</span>
        <span className="text-mist">of {kr(state.goal.target)}</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-night-800 shadow-press" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label="Savings goal">
        <motion.div className="h-full rounded-full bg-piggy" animate={{ scaleX: progress }} style={{ originX: 0 }} />
      </div>

      {/* The stage: the piggy is one big button while you are cracking it */}
      <div className="relative mt-4 h-[280px] overflow-visible rounded-clay bg-gradient-to-b from-night-800 to-night">
        <div className="absolute inset-0">{scene}</div>
        <AnimatePresence>
          {drop && (
            <motion.div
              key={drop}
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 -ml-5"
              initial={{ y: -30, opacity: 1, rotate: 0 }}
              animate={{ y: 70, opacity: [1, 1, 0], rotate: 90 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeIn" }}
              onAnimationComplete={() => setDrop(null)}
            >
              <Coin size={40} />
            </motion.div>
          )}
        </AnimatePresence>
        {mode === "tap" && (
          <>
            <motion.div
              key={hitKey}
              aria-hidden
              className="pointer-events-none absolute right-6 top-4"
              initial={{ rotate: -50, x: 20, y: -10 }}
              animate={{ rotate: [-50, 25, -10], x: [20, -30, 0], y: [-10, 30, 0] }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{ originX: 0.8, originY: 0.9 }}
            >
              <ToolArt tool={tool} size={72} />
            </motion.div>
            <button
              ref={tapRef}
              type="button"
              onClick={hit}
              className="absolute inset-0 cursor-pointer rounded-clay"
              aria-label={`Tap the piggy bank with the ${tool}. ${TAPS - taps} taps to go.`}
            />
          </>
        )}
        {mode === "broken" && saved === 0 && <CoinBurst key={burst} />}
      </div>

      <div className="mt-5 space-y-4">
        {mode === "idle" && (
          <>
            <div>
              <h2 className="eyebrow mb-2">Feed the piggy</h2>
              <div className="grid grid-cols-3 gap-2">
                {FEEDS.map((a) => (
                  <motion.button key={a} type="button" whileTap={{ scale: 0.92 }} onClick={() => feed(a)} className="btn-ghost px-2" disabled={a > state.balances.everyday}>
                    <Coin size={22} /> {a} kr.
                  </motion.button>
                ))}
              </div>
            </div>
            <button type="button" onClick={() => setMode("choose")} className="btn-gold w-full" disabled={saved === 0}>
              Break it open
            </button>
          </>
        )}

        {mode === "choose" && (
          <fieldset>
            <legend className="font-display text-xl font-semibold">Choose your tool</legend>
            <p className="mb-3 text-sm text-mist">Breaking it takes {TAPS} taps, so you only spend your savings on purpose.</p>
            <div className="grid grid-cols-3 gap-2">
              {TOOLS.map((t) => (
                <label key={t.id} className={`clay flex cursor-pointer flex-col items-center gap-1 p-3 ring-2 ${tool === t.id ? "ring-piggy" : "ring-transparent"} has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-ice`}>
                  <input type="radio" name="tool" value={t.id} checked={tool === t.id} onChange={() => setTool(t.id)} className="sr-only" />
                  <ToolArt tool={t.id} size={52} />
                  <span className="font-semibold">{t.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setMode("idle")} className="btn-ghost">
                Not now
              </button>
              <button
                type="button"
                onClick={() => {
                  setTaps(0);
                  setMode("tap");
                  announce(`Tap the piggy ${TAPS} times`);
                }}
                className="btn-gold"
              >
                Let's go
              </button>
            </div>
          </fieldset>
        )}

        {mode === "tap" && (
          <div className="space-y-3 text-center">
            <p className="font-display text-xl font-semibold">Tap the piggy bank to open it</p>
            <div className="flex justify-center gap-2" aria-hidden>
              {Array.from({ length: TAPS }, (_, i) => (
                <motion.span key={i} className={`h-3 w-3 rounded-full ${i < taps ? "bg-piggy" : "bg-night-600"}`} animate={{ scale: i === taps - 1 ? [1, 1.6, 1] : 1 }} />
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setTaps(0);
                setMode("idle");
              }}
              className="btn-ghost w-full"
            >
              Stop, keep my savings
            </button>
          </div>
        )}

        {mode === "broken" && (
          <div className="space-y-3">
            {state.lastCrack != null ? (
              <div className="clay p-4">
                <p className="font-display text-lg font-semibold">{kr(state.lastCrack)} is in your everyday account</p>
                <p className="text-sm text-mist">Changed your mind? You can put it back.</p>
                <button type="button" onClick={undo} className="btn-ghost mt-3 w-full">
                  <RotateCcw aria-hidden size={18} /> Undo
                </button>
              </div>
            ) : (
              <p className="text-mist">Your piggy bank is empty. Feed it to start saving again.</p>
            )}
            <div className="grid grid-cols-3 gap-2">
              {FEEDS.map((a) => (
                <motion.button key={a} type="button" whileTap={{ scale: 0.92 }} onClick={() => feed(a)} className="btn-ghost px-2" disabled={a > state.balances.everyday}>
                  <Coin size={22} /> {a} kr.
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
