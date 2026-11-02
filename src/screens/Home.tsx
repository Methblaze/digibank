import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Banknote, Bus, Eye, EyeOff, PiggyBank, Popcorn, ShoppingBasket, Users } from "lucide-react";
import { CountUp } from "../components/CountUp";
import { useBank } from "../state/BankProvider";
import { kr, type Tx } from "../state/bank";
import { go } from "../lib/route";

const txIcon: Record<Tx["kind"], typeof Bus> = {
  shop: ShoppingBasket,
  fun: Popcorn,
  travel: Bus,
  income: Banknote,
  friend: Users,
  piggy: PiggyBank,
};

export function Home() {
  const { state, announce } = useBank();
  const [shown, setShown] = useState(false);
  const progress = Math.min(1, state.balances.piggy / state.goal.target);

  const toggle = () => {
    setShown((s) => !s);
    announce(shown ? "Balance hidden" : `Your balance is ${kr(state.balances.everyday)}`);
  };

  return (
    <div className="space-y-8 px-5 pt-10">
      <header>
        <h1 className="text-3xl font-semibold">Everyday account</h1>
      </header>

      {/* Balance: hidden until asked for, then counts up from zero (2019's reframing of checking your balance) */}
      <section aria-labelledby="balance-h">
        <h2 id="balance-h" className="label">
          Balance
        </h2>
        <div className="flex min-h-[64px] items-center">
          <AnimatePresence mode="wait" initial={false}>
            {shown ? (
              <CountUp key="sum" value={state.balances.everyday} className="font-display text-6xl font-semibold" />
            ) : (
              // The cover lifts off when you check
              <motion.p key="cover" aria-hidden className="font-display text-6xl font-semibold text-night-600" exit={{ y: -16, opacity: 0 }} transition={{ duration: 0.2 }}>
                •••• kr.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        {!shown && <p className="text-mist">Tucked away until you ask.</p>}
        <button type="button" onClick={toggle} aria-pressed={shown} className={`${shown ? "btn-ghost" : "btn-blue"} mt-4`}>
          {shown ? <EyeOff aria-hidden size={20} /> : <Eye aria-hidden size={20} />}
          {shown ? "Hide balance" : "Check balance"}
        </button>
      </section>

      <a
        href="#/piggy"
        onClick={(e) => {
          e.preventDefault();
          go("piggy");
        }}
        className="sheet block p-5 hover:bg-night-700"
      >
        <div className="flex items-baseline justify-between">
          <span className="font-display text-lg font-semibold">{state.goal.name}</span>
          <span className="text-sm text-mist">{Math.round(progress * 100)}% saved</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-night-900" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label={`${state.goal.name} savings`}>
          <motion.div className="h-full rounded-full bg-piggy" initial={{ scaleX: 0 }} animate={{ scaleX: progress }} style={{ originX: 0 }} transition={{ duration: 1, ease: "easeOut" }} />
        </div>
      </a>

      <section aria-labelledby="latest-h">
            <h2 id="latest-h" className="label mb-3">
              Latest
            </h2>
            <ul className="sheet rows overflow-hidden">
              {state.txs.slice(0, 6).map((tx, i) => {
                const Icon = txIcon[tx.kind];
                return (
                  <motion.li
                    key={tx.id}
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.15 + i * 0.05, type: "spring", stiffness: 300, damping: 26 }}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-night-700">
                      <Icon aria-hidden size={20} className="text-mist" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{tx.label}</span>
                      <span className="block text-xs text-mist">{tx.when}</span>
                    </span>
                    {shown ? (
                      <span className={`font-display font-semibold tabular-nums ${tx.amount > 0 ? "text-mint" : "text-ink"}`}>
                        {tx.amount > 0 ? "+" : ""}
                        {kr(tx.amount)}
                      </span>
                    ) : (
                      <span className="font-display font-semibold text-mist/50">
                        <span aria-hidden>•••</span>
                        <span className="sr-only">Amount hidden</span>
                      </span>
                    )}
                  </motion.li>
                );
              })}
            </ul>
      </section>
    </div>
  );
}
