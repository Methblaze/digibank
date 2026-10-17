import { ArrowUpRight } from "lucide-react";

const CASE_URL = "https://portfoliokjaer.vercel.app/work/digibank";
// Built from tokens/ by `npm run tokens:build` into public/design-system/
const DESIGN_SYSTEM_URL = `${import.meta.env.BASE_URL}design-system/`;

/** What this demo is, shown beside the phone on wide screens and from the splash on phones. */
export function About() {
  return (
    <div className="space-y-6">
      <p className="eyebrow">Concept · 2026 redesign</p>
      <h1 className="text-5xl font-semibold leading-[1.05]">
        Banking you can <span className="text-piggy">hold</span>
      </h1>
      <p className="text-lg leading-relaxed text-mist">
        Digi Bank is mobile banking for 16 to 29 year olds, built on things you already understand: a wallet for your
        cards, a piggy bank you crack open, coins you hand to a friend and a balance that counts up from zero.
      </p>
      <p className="leading-relaxed text-mist">
        It began in 2019 as an ITU project by a group of five students and was tested with 16 users. This 2026 redesign
        by Jonathan Kjær keeps every one of those metaphors and rebuilds them in code, with a 3D piggy bank, spring
        motion and a button for every gesture.
      </p>
      <ul className="space-y-2 text-mist">
        {[
          "Your balance stays hidden until you ask for it",
          "The wallet opens on its own, with no extra tap",
          "Freeze a card from the card itself",
          "Clear steps and a receipt when you send money",
        ].map((t) => (
          <li key={t} className="flex gap-3">
            <span aria-hidden className="mt-2 h-2 w-2 shrink-0 rounded-full bg-piggy" />
            {t}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        <a href={CASE_URL} className="btn-ghost w-fit">
          Read the case study <ArrowUpRight aria-hidden size={20} />
        </a>
        <a href={DESIGN_SYSTEM_URL} className="btn-ghost w-fit">
          See the design system
        </a>
      </div>
      <p className="text-sm text-mist">A design concept, not a real bank. No real money, and nothing you do here is saved.</p>
    </div>
  );
}
