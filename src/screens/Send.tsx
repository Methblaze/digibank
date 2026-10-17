import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Check } from "lucide-react";
import { Coin, CoinEdge, Hand } from "../components/Art";
import { CoinBurst } from "../components/CoinBurst";
import { useBank } from "../state/BankProvider";
import { canSend, kr, type AccountId } from "../state/bank";
import { go } from "../lib/route";

type Step = "who" | "from" | "amount" | "hand" | "done";
const STEPS: Step[] = ["who", "from", "amount", "hand"];
const QUICK = [50, 100, 200];

function Avatar({ name, hue, size = 56 }: { name: string; hue: number; size?: number }) {
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full font-display font-semibold text-night shadow-clay-sm"
      style={{ width: size, height: size, background: `hsl(${hue} 85% 72%)`, fontSize: size * 0.4 }}
    >
      {name[0]}
    </span>
  );
}

/** Money transfer, after the 2019 redesign: pick a coin, stack the amount, then hand it over. */
export function Send() {
  const { state, dispatch, announce } = useBank();
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>("who");
  const [to, setTo] = useState<string | null>(null);
  const [from, setFrom] = useState<AccountId>("everyday");
  const [raw, setRaw] = useState("");
  const [sent, setSent] = useState<{ amount: number; name: string; from: AccountId } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const handRef = useRef<HTMLDivElement>(null);

  const friend = state.friends.find((f) => f.id === to);
  const amount = Number(raw);
  const valid = canSend(state, from, amount);
  const stack = Math.min(10, Math.ceil(amount / 50) || 0);
  const tooMuch = amount > state.balances[from];

  // Move focus to each new step's heading
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const finish = () => {
    if (!valid || !friend) return;
    dispatch({ type: "send", to: friend.id, from, amount });
    setSent({ amount, name: friend.name, from });
    setStep("done");
    announce(`Sent ${kr(amount)} to ${friend.name}`);
  };

  const back = () => setStep(STEPS[Math.max(0, STEPS.indexOf(step) - 1)]);
  const index = STEPS.indexOf(step);

  return (
    <div className="flex min-h-full flex-col px-5 pt-10">
      {step !== "done" && (
        <div className="flex items-center gap-3">
          {index > 0 ? (
            <button type="button" onClick={back} className="btn-ghost min-h-[44px] w-11 px-0" aria-label="Back">
              <ArrowLeft aria-hidden size={20} />
            </button>
          ) : (
            <span className="w-11" />
          )}
          <ol className="flex flex-1 justify-center gap-2" aria-label={`Step ${index + 1} of ${STEPS.length}`}>
            {STEPS.map((s, i) => (
              <li key={s} className={`h-2 rounded-full transition-all duration-300 ${i <= index ? "w-8 bg-piggy" : "w-2 bg-night-600"}`} />
            ))}
          </ol>
          <span className="w-11" />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.section
          key={step}
          className="flex flex-1 flex-col pt-6"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.22 }}
        >
          {step === "who" && (
            <>
              <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-semibold">
                Who gets the coins?
              </h1>
              <ul className="mt-6 grid grid-cols-2 gap-3">
                {state.friends.map((f, i) => (
                  <motion.li key={f.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.06 }}>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setTo(f.id);
                        setStep("from");
                      }}
                      className="clay flex w-full flex-col items-center gap-2 p-5 hover:bg-night-700"
                    >
                      <Avatar name={f.name} hue={f.hue} />
                      <span className="font-display text-lg font-semibold">{f.name}</span>
                    </motion.button>
                  </motion.li>
                ))}
              </ul>
            </>
          )}

          {step === "from" && (
            <>
              <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-semibold">
                Which coin do you pay from?
              </h1>
              <p className="mt-1 text-mist">Choose an account to send from.</p>
              <div className="mt-6 space-y-3">
                {(["everyday", "piggy"] as AccountId[]).map((id, i) => (
                  <motion.button
                    key={id}
                    type="button"
                    onClick={() => {
                      setFrom(id);
                      setStep("amount");
                    }}
                    disabled={state.balances[id] === 0}
                    className="clay flex w-full items-center gap-4 p-4 text-left hover:bg-night-700 disabled:opacity-50"
                    initial={{ x: 320 }}
                    animate={{ x: 0 }}
                    transition={{ type: "spring", stiffness: 140, damping: 18, delay: i * 0.15 }}
                  >
                    {/* the coin rolls in, as it did in 2019 */}
                    <motion.span initial={{ rotate: 360 }} animate={{ rotate: 0 }} transition={{ type: "spring", stiffness: 140, damping: 18, delay: i * 0.15 }}>
                      <Coin size={56} />
                    </motion.span>
                    <span className="flex-1">
                      <span className="block font-display text-xl font-semibold">{id === "everyday" ? "Everyday" : "Piggy savings"}</span>
                      <span className="block text-mist">{kr(state.balances[id])}</span>
                    </span>
                  </motion.button>
                ))}
              </div>
            </>
          )}

          {step === "amount" && (
            <>
              <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-semibold">
                How much?
              </h1>
              <div className="mt-6 flex items-end gap-5">
                <div className="flex-1">
                  <label htmlFor="amount" className="eyebrow">
                    Amount in kroner
                  </label>
                  <div className="mt-2 flex items-baseline gap-2 border-b-2 border-night-600 pb-1 focus-within:border-piggy">
                    <input
                      id="amount"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      value={raw}
                      onChange={(e) => setRaw(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      aria-describedby="amount-help"
                      aria-invalid={tooMuch}
                      className="w-full bg-transparent font-display text-5xl font-semibold outline-none placeholder:text-night-600"
                      placeholder="0"
                    />
                    <span className="font-display text-2xl text-mist">kr.</span>
                  </div>
                  <p id="amount-help" className={`mt-2 text-sm ${tooMuch ? "text-coral" : "text-mist"}`}>
                    {tooMuch ? `That's more than the ${kr(state.balances[from])} you have.` : `You have ${kr(state.balances[from])}.`}
                  </p>
                </div>
                {/* the coin stack grows with the amount */}
                <div aria-hidden className="relative flex h-44 w-20 flex-col-reverse items-center">
                  <AnimatePresence>
                    {Array.from({ length: stack }, (_, i) => (
                      <motion.div
                        key={i}
                        className="-mt-3"
                        initial={{ y: -80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -30, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 22 }}
                      >
                        <CoinEdge width={64} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2">
                {QUICK.map((q) => (
                  <button key={q} type="button" className="btn-ghost px-2" onClick={() => setRaw(String(q))}>
                    {q} kr.
                  </button>
                ))}
              </div>
              <button type="button" disabled={!valid} onClick={() => setStep("hand")} className="btn-gold mt-auto mb-4 w-full">
                Next
              </button>
            </>
          )}

          {step === "hand" && friend && (
            <>
              <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-semibold">
                Hand it over
              </h1>
              <p className="mt-1 text-mist">
                Drag the coin to {friend.name}'s hand, or use the button.
              </p>
              <div className="relative mt-4 flex flex-1 flex-col items-center justify-between gap-4">
                <motion.div
                  drag={!reduce}
                  dragSnapToOrigin
                  dragElastic={0.6}
                  whileDrag={{ scale: 1.15 }}
                  onDragEnd={(e) => {
                    const r = handRef.current?.getBoundingClientRect();
                    const p = "clientX" in e ? (e as PointerEvent) : null;
                    if (r && p && p.clientX >= r.left && p.clientX <= r.right && p.clientY >= r.top - 40 && p.clientY <= r.bottom) finish();
                  }}
                  className="relative z-10 grid cursor-grab touch-none place-items-center active:cursor-grabbing"
                  aria-hidden
                >
                  <Coin size={96} />
                  <span className="mt-1 font-display text-2xl font-semibold">{kr(amount)}</span>
                </motion.div>
                <motion.svg aria-hidden width="24" height="60" viewBox="0 0 24 60" animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>
                  <path d="M12 2v50M3 44l9 10 9-10" className="text-mist" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 6" />
                </motion.svg>
                <div ref={handRef} className="relative w-full max-w-[260px]">
                  <div className="absolute -top-2 left-1/2 z-10 -translate-x-1/2">
                    <Avatar name={friend.name} hue={friend.hue} size={44} />
                  </div>
                  <Hand className="w-full" />
                </div>
              </div>
              <button type="button" onClick={finish} disabled={!valid} className="btn-gold my-4 w-full">
                Send {kr(amount)} to {friend.name}
              </button>
            </>
          )}

          {step === "done" && sent && (
            <div className="flex flex-1 flex-col items-center pt-6 text-center">
              <div className="relative w-full max-w-[260px]">
                <Hand closed coin className="w-full" />
                <CoinBurst count={12} spread={130} />
              </div>
              <motion.div
                className="mt-4 grid h-14 w-14 place-items-center rounded-full bg-mint text-night shadow-clay-sm"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.35, type: "spring", stiffness: 400, damping: 14 }}
              >
                <Check aria-hidden size={30} strokeWidth={3} />
              </motion.div>
              <h1 ref={headingRef} tabIndex={-1} className="mt-4 text-3xl font-semibold">
                Sent to {sent.name}
              </h1>
              <dl className="clay mt-5 w-full space-y-2 p-5 text-left">
                {[
                  ["Amount", kr(sent.amount)],
                  ["From", sent.from === "everyday" ? "Everyday" : "Piggy savings"],
                  ["When", "Just now"],
                  ["Left in that account", kr(state.balances[sent.from])],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-mist">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-auto grid w-full grid-cols-2 gap-2 py-4">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setRaw("");
                    setTo(null);
                    setSent(null);
                    setStep("who");
                  }}
                >
                  Send more
                </button>
                <button type="button" className="btn-gold" onClick={() => go("home")}>
                  Done
                </button>
              </div>
            </div>
          )}
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
