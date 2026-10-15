import { useEffect, useState } from "react";
import { hasWebGL } from "./lib/webgl";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { BankProvider } from "./state/BankProvider";
import { useRoute } from "./lib/route";
import { Splash } from "./screens/Splash";
import { Pin } from "./screens/Pin";
import { Home } from "./screens/Home";
import { Wallet } from "./screens/Wallet";
import { PiggyScreen } from "./screens/PiggyScreen";
import { Send } from "./screens/Send";
import { TabBar } from "./components/TabBar";
import { About } from "./components/About";

type Gate = "splash" | "pin" | "in";

export default function App() {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 380, damping: 30 }}>
      <BankProvider>
        <div className="mx-auto flex min-h-[100dvh] max-w-6xl items-center justify-center gap-16 lg:px-8">
          <aside className="hidden max-w-md lg:block">
            <About />
          </aside>
          <Phone />
        </div>
      </BankProvider>
    </MotionConfig>
  );
}

function Phone() {
  const [gate, setGate] = useState<Gate>("splash");
  const route = useRoute();

  // Once you are in, fetch the 3D piggy quietly so it is ready when you visit
  useEffect(() => {
    if (gate !== "in" || !hasWebGL() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => void import("./piggy3d/PiggyScene"), 2500);
    return () => window.clearTimeout(t);
  }, [gate]);

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-night lg:h-[min(844px,92dvh)] lg:w-[390px] lg:rounded-[3rem] lg:border-[10px] lg:border-night-700 lg:shadow-[0_40px_120px_rgba(92,123,234,0.25)]">
      <AnimatePresence mode="wait" initial={false}>
        {gate === "splash" && (
          <Fade key="splash">
            <Splash onStart={() => setGate("pin")} />
          </Fade>
        )}
        {gate === "pin" && (
          <Fade key="pin">
            <Pin onUnlock={() => setGate("in")} />
          </Fade>
        )}
        {gate === "in" && (
          <Fade key={route}>
            <main className="h-full overflow-y-auto overscroll-contain pb-28">
              {route === "home" && <Home />}
              {route === "wallet" && <Wallet />}
              {route === "piggy" && <PiggyScreen />}
              {route === "send" && <Send />}
            </main>
          </Fade>
        )}
      </AnimatePresence>
      {gate === "in" && <TabBar route={route} />}
    </div>
  );
}

function Fade({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
