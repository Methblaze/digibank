import { motion } from "motion/react";
import { House, PiggyBank, Send, WalletCards } from "lucide-react";
import { go, type Route } from "../lib/route";

const tabs: { route: Route; label: string; Icon: typeof House }[] = [
  { route: "home", label: "Home", Icon: House },
  { route: "wallet", label: "Wallet", Icon: WalletCards },
  { route: "piggy", label: "Piggy", Icon: PiggyBank },
  { route: "send", label: "Send", Icon: Send },
];

export function TabBar({ route }: { route: Route }) {
  return (
    <nav aria-label="Main" className="absolute inset-x-3 bottom-3 z-30 pb-[env(safe-area-inset-bottom)]">
      <ul className="clay flex justify-between p-1.5">
        {tabs.map(({ route: r, label, Icon }) => {
          const active = r === route;
          return (
            <li key={r} className="flex-1">
              <a
                href={r === "home" ? "#/" : `#/${r}`}
                onClick={(e) => {
                  e.preventDefault();
                  go(r);
                }}
                aria-current={active ? "page" : undefined}
                className="relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 rounded-[1.25rem] text-xs font-bold"
              >
                {active && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-[1.25rem] bg-night-600"
                    transition={{ type: "spring", stiffness: 500, damping: 36 }}
                  />
                )}
                <Icon aria-hidden size={22} className={`relative ${active ? "text-piggy" : "text-mist"}`} />
                <span className={`relative ${active ? "text-ink" : "text-mist"}`}>{label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
