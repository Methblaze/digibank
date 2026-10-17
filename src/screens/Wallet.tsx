import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ArrowLeft, Snowflake } from "lucide-react";
import { useBank } from "../state/BankProvider";
import type { Card } from "../state/bank";

const look: Record<Card["kind"], string> = {
  Debit: "from-periwinkle to-periwinkle-deep",
  Travel: "from-coral to-leather",
  Online: "from-mint to-mint-deep",
};

function CardFace({ card, big = false }: { card: Card; big?: boolean }) {
  return (
    <div className={`relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br ${look[card.kind]} p-4 text-night shadow-clay`}>
      <div aria-hidden className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/25" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className={`font-display font-semibold ${big ? "text-xl" : "text-sm"}`}>{card.name}</span>
          <span className="rounded-full bg-night/15 px-2 py-0.5 text-xs font-bold">{card.kind}</span>
        </div>
        <div>
          <div aria-hidden className={`mb-2 rounded-md bg-piggy-pale ${big ? "h-8 w-11" : "h-5 w-7"}`} />
          <span className={`font-display font-semibold tracking-widest ${big ? "text-xl" : "text-sm"}`}>•••• {card.last4}</span>
        </div>
      </div>
      <AnimatePresence>
        {card.frozen && (
          <motion.div
            className="absolute inset-0 grid place-items-center bg-gradient-to-br from-ice/90 to-white/70 backdrop-blur-[2px]"
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className="flex items-center gap-1.5 font-display font-semibold text-night">
              <Snowflake aria-hidden size={big ? 26 : 16} /> Frozen
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The wallet opens by itself (2019 testers found the extra tap redundant), then the cards fan out. */
export function Wallet() {
  const { state, dispatch, announce } = useBank();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const card = state.cards.find((c) => c.id === picked) ?? null;
  const inWallet = state.cards.filter((c) => c.id !== picked);

  useEffect(() => {
    const t = window.setTimeout(() => setOpen(true), 350);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (picked) backRef.current?.focus();
  }, [picked]);

  return (
    <div className="px-5 pt-10">
      <h1 className="text-3xl font-semibold">Wallet</h1>
      <p className="mt-1 text-mist">{card ? "Freeze it if it goes missing." : "Pick a card to see it up close."}</p>

      <LayoutGroup>
        <div className={card ? "mt-6 min-h-[200px]" : ""}>
          <AnimatePresence mode="popLayout">
            {card && (
              <motion.div key="detail" className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div layoutId={`card-${card.id}`} className="mx-auto aspect-[1.586] w-full max-w-[320px]">
                  <CardFace card={card} big />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {card && (
          <div className="mt-2 space-y-3">
            <div className="clay flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-display text-lg font-semibold" id="freeze-label">
                  Freeze card
                </p>
                <p className="text-sm text-mist">{card.frozen ? "Nobody can pay with it right now." : "Pause it in one tap, undo any time."}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={card.frozen}
                aria-labelledby="freeze-label"
                onClick={() => {
                  dispatch({ type: "toggleFreeze", cardId: card.id });
                  announce(card.frozen ? `${card.name} unfrozen` : `${card.name} frozen`);
                }}
                className={`relative h-9 w-16 shrink-0 rounded-full shadow-press transition-colors ${card.frozen ? "bg-ice" : "bg-night-600"}`}
              >
                <motion.span
                  layout
                  className={`absolute top-1 grid h-7 w-7 place-items-center rounded-full bg-ink shadow-clay-sm ${card.frozen ? "right-1" : "left-1"}`}
                >
                  {card.frozen && <Snowflake aria-hidden size={16} className="text-night" />}
                </motion.span>
              </button>
            </div>
            <button ref={backRef} type="button" onClick={() => setPicked(null)} className="btn-ghost w-full">
              <ArrowLeft aria-hidden size={20} /> Put it back in the wallet
            </button>
          </div>
        )}

        {/* The wallet itself */}
        <div className={`relative mx-auto ${card ? "mt-6" : "mt-24"} h-[300px] w-full max-w-[320px] ${card ? "scale-90 opacity-70" : ""} transition-[transform,opacity] duration-300`} style={{ perspective: 900 }}>
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-[170px] rounded-[2rem] bg-leather-deep shadow-clay" />
          <ul className="absolute inset-x-0 bottom-0 h-[170px]" aria-label="Cards in your wallet">
            {inWallet.map((c, i) => {
              const n = inWallet.length;
              const offset = i - (n - 1) / 2;
              return (
                <li key={c.id} className="absolute bottom-6 left-1/2 h-[120px] w-[190px] -translate-x-1/2" style={{ zIndex: 10 - Math.abs(offset) * 2 }}>
                  <motion.button
                    type="button"
                    layoutId={`card-${c.id}`}
                    onClick={() => setPicked(c.id)}
                    aria-label={`${c.name}, ${c.kind}, ending ${c.last4}${c.frozen ? ", frozen" : ""}`}
                    className="block h-full w-full cursor-pointer rounded-2xl"
                    initial={{ y: 40, rotate: 0, x: 0 }}
                    animate={open ? { y: -118 + Math.abs(offset) * 16, x: offset * 70, rotate: offset * 13 } : { y: 40, x: 0, rotate: 0 }}
                    whileHover={{ y: -136 + Math.abs(offset) * 16 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22, delay: open ? 0.25 + i * 0.07 : 0 }}
                    style={{ originY: 1 }}
                  >
                    <CardFace card={c} />
                  </motion.button>
                </li>
              );
            })}
          </ul>
          {/* front pocket */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[118px] rounded-[2rem] bg-leather shadow-clay">
            <div className="absolute inset-3 rounded-[1.5rem] border-2 border-dashed border-leather-deep/70" />
            <div className="absolute left-1/2 top-4 h-3 w-16 -translate-x-1/2 rounded-full bg-leather-deep/60" />
          </div>
          {/* flap: lies over the pocket, then flips back */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-[118px] z-20 h-[64px] rounded-t-[2rem] bg-leather-light shadow-clay"
            style={{ originY: 1, transformPerspective: 900 }}
            initial={{ rotateX: 180 }}
            animate={{ rotateX: open ? 0 : 180, opacity: open ? 0 : 1 }}
            transition={{ duration: 0.45, ease: [0.3, 0.7, 0.3, 1], opacity: { delay: 0.3, duration: 0.15 } }}
          >
            <div className="absolute bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-leather-deep" />
          </motion.div>
        </div>
      </LayoutGroup>
    </div>
  );
}
