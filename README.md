# Digi Bank 2026

A playful mobile banking concept for 16 to 29 year olds, rebuilt in code: https://methblaze.github.io/digibank/

Digi Bank began in 2019 as a UX and interface design project at the IT University of Copenhagen, by a group of five students. It turned dry banking tasks into things you can hold, and was tested with 16 users. This 2026 redesign by Jonathan Kjær keeps every one of those metaphors and moves them from a Figma prototype into a working web app.

It is a design concept, not a real bank. There is no real money, no sign-in and nothing is saved: reloading the page starts over.

Case study: https://portfoliokjaer.vercel.app/work/digibank

## What it does

- **PIN.** Each digit drops a coin into its slot, and the fourth feeds the piggy bank and opens the app. Any four digits work.
- **Balance.** Hidden until you ask for it, then it counts up from zero while your latest payments slide in. The 2019 research found that banking apps show your balance the moment you log in; Digi Bank makes checking it a choice.
- **Wallet.** The wallet opens on its own (2019 testers found the extra tap redundant) and the cards fan out. Pick one to see it up close and freeze it from the card itself.
- **Piggy bank.** A 3D piggy bank you feed with coins. To spend your savings, pick a hammer, mace or sword and tap the piggy six times; it cracks a little with each tap and bursts into coins on the last. The taps add friction on purpose, and you can undo.
- **Send.** Pick a friend, roll in the coin you pay from, stack the amount, then drag the coin into their hand. Every step is numbered and ends with a receipt.

## Accessibility

- Every gesture has a button: the piggy is one large button while you crack it, and the coin you drag has a "Send" button below it.
- With reduced motion turned on, the piggy bank is flat, nothing loops, and the coins and pieces appear without flying. Without WebGL, the flat piggy bank is used too. The 3D piggy can also be switched off on the piggy screen.
- Text meets WCAG AA contrast on every screen, touch targets are at least 44px, and changes such as unlocking, cracking and sending are read out through a live region.

## Built with

Vite, React 18, TypeScript and Tailwind CSS. Motion (motion/react) for the springs, gestures and layout animations; React Three Fiber and three.js for the piggy bank, which is built from primitives, so there is no model to download. three.js is loaded only when you visit the piggy bank.

The colours grow out of the 2019 palette (deep blues and #5C7BEA periwinkle) and its golden piggy bank. The type is Fredoka and Nunito, self-hosted.

## Run it

Use Node 20 or newer.

```bash
npm install
```

```bash
npm run dev
```

```bash
npm test
```

```bash
npm run build
```

Every push to `main` is tested, built and published to GitHub Pages by `.github/workflows/pages.yml`.

## Where things live

- `src/state/bank.ts` holds the demo data (accounts, payments, cards, friends) and the reducer that moves money; `bank.test.ts` tests it.
- `src/screens/` has one file per screen; `src/components/Art.tsx` holds the flat drawings (piggy bank, coins, hand, tools).
- `tokens/` is the design system: one DTCG source for every colour, font, radius and shadow. `npm run tokens:build` writes the Tailwind theme, CSS variables, the Figma sync input and the design system page (`public/design-system/`, live at [/digibank/design-system/](https://methblaze.github.io/digibank/design-system/)); `npm run tokens:check` proves contrast, names and that Figma still matches. The Figma page is [Digi Bank 2026 · Design system](https://www.figma.com/design/OiWVRsdT5PoiNMdZ3eYxmd/DIGI---GREEN-DESIGN-SYSTEM---TOKENS?node-id=0-1).
- `src/piggy3d/PiggyScene.tsx` is the 3D piggy bank. Its cracks are drawn onto the body's texture in six stages; when it breaks, the body swaps for 24 shell pieces that fly out with the coins.
