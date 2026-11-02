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
    <nav aria-label="Main" className="absolute inset-x-0 bottom-0 z-30 border-t border-night-700 bg-night-900 pb-[env(safe-area-inset-bottom)]">
      <ul className="flex justify-between px-2">
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
                className="relative flex min-h-[64px] flex-col items-center justify-center gap-0.5 text-xs font-bold"
              >
                {active && (
                  <motion.span
                    layoutId="tab-mark"
                    className="absolute inset-x-6 top-0 h-[3px] rounded-b-full bg-piggy"
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
