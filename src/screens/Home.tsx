import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Banknote, Bus, Eye, EyeOff, PiggyBank, Popcorn, Send, ShoppingBasket, Users, WalletCards } from "lucide-react";
import { CountUp } from "../components/CountUp";
import { useBank } from "../state/BankProvider";
import { kr, type Tx } from "../state/bank";
import { go, type Route } from "../lib/route";

const txIcon: Record<Tx["kind"], typeof Bus> = {
  shop: ShoppingBasket,
  fun: Popcorn,
  travel: Bus,
  income: Banknote,
  friend: Users,
  piggy: PiggyBank,
};

const actions: { route: Route; label: string; hint: string; Icon: typeof Bus; tint: string }[] = [
  { route: "wallet", label: "Wallet", hint: "Your cards", Icon: WalletCards, tint: "bg-leather text-night" },
  { route: "piggy", label: "Piggy", hint: "Savings", Icon: PiggyBank, tint: "bg-piggy text-night" },
  { route: "send", label: "Send", hint: "Hand over coins", Icon: Send, tint: "bg-periwinkle text-night" },
];

export function Home() {
  const { state, announce } = useBank();
  const [shown, setShown] = useState(false);
  const progress = Math.min(1, state.balances.piggy / state.goal.target);

  const toggle = () => {
    setShown((s) => !s);
    announce(shown ? "Balance hidden" : `Your balance is ${kr(state.balances.everyday)}`);
  };

  return (
    <div className="space-y-6 px-5 pt-10">
      <header>
        <p className="eyebrow">Everyday account</p>
        <h1 className="mt-1 text-3xl font-semibold">Hey there</h1>
      </header>

      {/* Balance: hidden until asked for, then counts up from zero (2019's reframing of checking your balance) */}
      <section aria-labelledby="balance-h" className="clay relative overflow-hidden p-6">
        <div aria-hidden className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-periwinkle/25 blur-2xl" />
        <h2 id="balance-h" className="eyebrow">
          Balance
        </h2>
        <div className="mt-2 min-h-[56px]">
          {shown ? (
            <CountUp value={state.balances.everyday} className="font-display text-5xl font-semibold" />
          ) : (
            <p className="font-display text-2xl text-mist">Tucked away until you ask</p>
          )}
        </div>
        <button type="button" onClick={toggle} aria-pressed={shown} className={`${shown ? "btn-ghost" : "btn-blue"} mt-4`}>
          {shown ? <EyeOff aria-hidden size={20} /> : <Eye aria-hidden size={20} />}
          {shown ? "Hide balance" : "Check balance"}
        </button>
      </section>

      <nav aria-label="Quick actions" className="grid grid-cols-3 gap-3">
        {actions.map(({ route, label, hint, Icon, tint }) => (
          <motion.a
            key={route}
            href={`#/${route}`}
            onClick={(e) => {
              e.preventDefault();
              go(route);
            }}
            whileTap={{ scale: 0.94 }}
            whileHover={{ y: -2 }}
            className="clay flex min-h-[120px] flex-col justify-between p-4"
          >
            <span className={`grid h-11 w-11 place-items-center rounded-2xl shadow-clay-sm ${tint}`}>
              <Icon aria-hidden size={22} />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold leading-tight">{label}</span>
              <span className="block text-xs text-mist">{hint}</span>
            </span>
          </motion.a>
        ))}
      </nav>

      <a
        href="#/piggy"
        onClick={(e) => {
          e.preventDefault();
          go("piggy");
        }}
        className="clay block p-5"
      >
        <div className="flex items-baseline justify-between">
          <span className="font-display text-lg font-semibold">{state.goal.name}</span>
          <span className="text-sm text-mist">{Math.round(progress * 100)}% saved</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-night-900 shadow-press" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label={`${state.goal.name} savings`}>
          <motion.div className="h-full rounded-full bg-piggy" initial={{ scaleX: 0 }} animate={{ scaleX: progress }} style={{ originX: 0 }} transition={{ duration: 1, ease: "easeOut" }} />
        </div>
      </a>

      <AnimatePresence>
        {shown && (
          <motion.section aria-labelledby="latest-h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 id="latest-h" className="eyebrow mb-3">
              Latest
            </h2>
            <ul className="space-y-2">
              {state.txs.slice(0, 6).map((tx, i) => {
                const Icon = txIcon[tx.kind];
                return (
                  <motion.li
                    key={tx.id}
                    initial={{ x: 80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.09, type: "spring", stiffness: 300, damping: 26 }}
                    className="flex items-center gap-3 rounded-2xl bg-night-800 p-3"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-night-700">
                      <Icon aria-hidden size={20} className="text-mist" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{tx.label}</span>
                      <span className="block text-xs text-mist">{tx.when}</span>
                    </span>
                    <span className={`font-display font-semibold tabular-nums ${tx.amount > 0 ? "text-mint" : "text-ink"}`}>
                      {tx.amount > 0 ? "+" : ""}
                      {kr(tx.amount)}
                    </span>
                  </motion.li>
                );
              })}
            </ul>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
