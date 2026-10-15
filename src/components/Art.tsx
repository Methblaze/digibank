import { useEffect } from "react";
import { motion, useAnimationControls } from "motion/react";

// Flat drawings that carry the 2019 artwork into 2026: the golden piggy bank,
// the coins, the hand and the three tools. All are decorative (aria-hidden);
// the buttons around them carry the labels.

export function Coin({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 40 40" className={className}>
      <circle cx="20" cy="20" r="19" fill="#B87A00" />
      <circle cx="20" cy="18.5" r="17.5" fill="#FFC53D" />
      <circle cx="20" cy="18.5" r="12.5" fill="none" stroke="#E8A317" strokeWidth="2.5" />
      <path d="M15 14v10M15 19l5-5M15 19l5 5M23 24v-6.5a3 3 0 0 1 3-3" fill="none" stroke="#B87A00" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 13a13 13 0 0 1 7-6" stroke="#FFF2C2" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** A coin seen from the side, for stacks and rolls. */
export function CoinEdge({ width = 64, className }: { width?: number; className?: string }) {
  return (
    <svg aria-hidden width={width} height={width * 0.28} viewBox="0 0 64 18" className={className}>
      <ellipse cx="32" cy="11" rx="31" ry="7" fill="#B87A00" />
      <rect x="1" y="7" width="62" height="4" fill="#E8A317" />
      <ellipse cx="32" cy="7" rx="31" ry="6.5" fill="#FFC53D" />
      <ellipse cx="32" cy="7" rx="20" ry="3.6" fill="none" stroke="#E8A317" strokeWidth="1.6" />
    </svg>
  );
}

// Radial wedges the flat piggy splits into; the crack lines run along their edges.
const CX = 112;
const CY = 100;
const ANGLES = [-100, -40, 10, 65, 125, 185];
const wedge = (a: number, b: number) => {
  const r = 220;
  const p = (deg: number) => `${CX + r * Math.cos((deg * Math.PI) / 180)},${CY + r * Math.sin((deg * Math.PI) / 180)}`;
  return `${CX},${CY} ${p(a)} ${p((a + b) / 2)} ${p(b)}`;
};
const WEDGES = ANGLES.map((a, i) => wedge(a, ANGLES[(i + 1) % ANGLES.length] + (i === ANGLES.length - 1 ? 360 : 0)));

// One jagged crack per stage, each starting at the centre and following a wedge edge.
const CRACKS = ANGLES.map((deg, i) => {
  const rad = (deg * Math.PI) / 180;
  const pts: string[] = [`${CX},${CY}`];
  for (let s = 1; s <= 4; s++) {
    const d = s * 17;
    const jitter = (s % 2 ? 1 : -1) * (5 + ((i * 7 + s * 3) % 5));
    pts.push(`${(CX + d * Math.cos(rad) - jitter * Math.sin(rad)).toFixed(1)},${(CY + d * Math.sin(rad) + jitter * Math.cos(rad)).toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
});

function PigArt() {
  return (
    <>
      {/* tail */}
      <path d="M40 92c-14-4-16 10-6 10s6-14-6-12" fill="none" stroke="#E8A317" strokeWidth="5" strokeLinecap="round" />
      {/* legs */}
      {[62, 88, 140, 164].map((x) => (
        <rect key={x} x={x - 9} y="138" width="18" height="28" rx="8" fill="#E8A317" />
      ))}
      {/* ears */}
      <path d="M140 52l8-32 22 26z" fill="#E8A317" />
      <path d="M118 46l2-30 22 22z" fill="#FFC53D" />
      {/* body */}
      <ellipse cx="112" cy="100" rx="78" ry="58" fill="#FFC53D" />
      <ellipse cx="100" cy="78" rx="44" ry="18" fill="#FFE08A" opacity="0.55" />
      {/* snout */}
      <rect x="176" y="84" width="34" height="36" rx="14" fill="#E8A317" />
      <circle cx="190" cy="102" r="3.2" fill="#8A5A00" />
      <circle cx="200" cy="102" r="3.2" fill="#8A5A00" />
      {/* eye */}
      <circle cx="160" cy="80" r="6" fill="#0A0F24" />
      <circle cx="162" cy="78" r="2" fill="#FFFFFF" />
      {/* coin slot */}
      <rect x="90" y="44" width="40" height="7" rx="3.5" fill="#6B4200" />
    </>
  );
}

/**
 * The flat piggy bank: cracks appear one stage at a time, and when it breaks
 * it splits along those cracks. With reduced motion the pieces fade instead.
 */
export function Piggy2D({ stage, shattered, hitKey, feedKey, className }: { stage: number; shattered: boolean; hitKey: number; feedKey: number; className?: string }) {
  const body = useAnimationControls();

  useEffect(() => {
    if (hitKey) body.start({ rotate: [0, -7, 6, -3, 0], scaleY: [1, 0.92, 1.03, 1], transition: { duration: 0.45 } });
  }, [hitKey, body]);
  useEffect(() => {
    if (feedKey) body.start({ y: [0, -14, 0], transition: { duration: 0.45, ease: "easeOut" } });
  }, [feedKey, body]);

  return (
    <svg aria-hidden viewBox="0 0 230 190" className={className} overflow="visible">
      <defs>
        {WEDGES.map((pts, i) => (
          <clipPath key={i} id={`wedge-${i}`}>
            <polygon points={pts} />
          </clipPath>
        ))}
      </defs>
      <ellipse cx="112" cy="174" rx="80" ry="9" fill="#000" opacity="0.3" />
      <motion.g animate={body} style={{ originX: 0.5, originY: 1 }}>
        {/* whole while intact (clipped wedges would show hairline seams) */}
        {!shattered && <PigArt />}
        {WEDGES.map((_, i) => {
          const mid = ((ANGLES[i] + (ANGLES[(i + 1) % ANGLES.length] + (i === ANGLES.length - 1 ? 360 : 0))) / 2) * (Math.PI / 180);
          return (
            <motion.g
              key={i}
              clipPath={`url(#wedge-${i})`}
              initial={false}
              animate={
                shattered
                  ? { x: Math.cos(mid) * 46, y: Math.max(Math.sin(mid) * 30, 0) + 34, rotate: (i % 2 ? 1 : -1) * 24, opacity: 1 }
                  : { x: 0, y: 0, rotate: 0, opacity: 0 }
              }
              transition={shattered ? { type: "spring", stiffness: 160, damping: 13, opacity: { duration: 0 } } : { duration: 0 }}
              style={{ originX: 0.5, originY: 0.5 }}
            >
              <PigArt />
            </motion.g>
          );
        })}
        {!shattered &&
          CRACKS.slice(0, stage).map((d, i) => (
            <motion.path
              key={i}
              d={d}
              fill="none"
              stroke="#5A3300"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.25 }}
            />
          ))}
      </motion.g>
    </svg>
  );
}

export type Tool = "hammer" | "mace" | "sword";

export function ToolArt({ tool, size = 56 }: { tool: Tool; size?: number }) {
  const wood = "#A0663E";
  const steel = "#D5DEFA";
  const edge = "#7C8BBE";
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 64 64">
      {tool === "hammer" && (
        <>
          <rect x="29" y="22" width="7" height="38" rx="3.5" fill={wood} transform="rotate(-35 32 40)" />
          <g transform="rotate(-35 32 40)">
            <rect x="16" y="10" width="32" height="14" rx="5" fill={steel} stroke={edge} strokeWidth="2" />
            <rect x="44" y="12" width="6" height="10" rx="2" fill={edge} />
          </g>
        </>
      )}
      {tool === "mace" && (
        <g transform="rotate(-35 32 40)">
          <rect x="29" y="26" width="7" height="34" rx="3.5" fill={wood} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <path key={a} d="M32.5 4l3 8h-6z" fill={edge} transform={`rotate(${a} 32.5 18)`} />
          ))}
          <circle cx="32.5" cy="18" r="10" fill={steel} stroke={edge} strokeWidth="2" />
        </g>
      )}
      {tool === "sword" && (
        <g transform="rotate(-35 32 40)">
          <path d="M28.5 40V10l4-7 4 7v30z" fill={steel} stroke={edge} strokeWidth="2" strokeLinejoin="round" />
          <rect x="21" y="40" width="23" height="5" rx="2.5" fill={edge} />
          <rect x="29" y="45" width="7" height="13" rx="3" fill={wood} />
          <circle cx="32.5" cy="60" r="3" fill={edge} />
        </g>
      )}
    </svg>
  );
}

const FINGERS = [
  { x: 58, h: 54, r: -12 },
  { x: 82, h: 64, r: -4 },
  { x: 106, h: 64, r: 4 },
  { x: 130, h: 54, r: 12 },
];

/**
 * The open hand from 2019 that you hand coins to, now a neutral glove-like
 * shape. With `coin`, a coin drops onto the palm; `closed` folds the fingers over it.
 */
export function Hand({ closed = false, coin = false, className }: { closed?: boolean; coin?: boolean; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 150" className={className} overflow="visible">
      {/* thumb */}
      <motion.rect
        x="36"
        y="78"
        width="24"
        height="50"
        rx="12"
        fill="#8597F5"
        initial={false}
        animate={{ rotate: closed ? -10 : -48 }}
        transition={{ delay: closed ? 0.55 : 0 }}
        style={{ originX: 0.5, originY: 1 }}
      />
      {/* open fingers, behind the coin */}
      {!closed &&
        FINGERS.map((f) => (
          <rect key={f.x} x={f.x} y={84 - f.h} width="22" height={f.h + 12} rx="11" fill="#9AA9FF" transform={`rotate(${f.r} ${f.x + 11} 90)`} />
        ))}
      {/* palm */}
      <rect x="50" y="72" width="104" height="76" rx="32" fill="#9AA9FF" />
      <path d="M72 116c18 8 42 8 60 0" stroke="#7C8BE8" strokeWidth="4" strokeLinecap="round" fill="none" />
      {coin && (
        <motion.g initial={{ y: -170, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 15 }}>
          <g transform="translate(80 70)">
            <Coin size={44} />
          </g>
        </motion.g>
      )}
      {/* curled fingers, folded over the coin */}
      {closed &&
        FINGERS.map((f, i) => (
          <motion.rect
            key={f.x}
            x={f.x - 4 + i * 2}
            width="24"
            rx="12"
            fill="#8597F5"
            stroke="#9AA9FF"
            strokeWidth="2"
            initial={{ y: 84 - f.h, height: f.h + 12 }}
            animate={{ y: 66, height: 40 }}
            transition={{ delay: 0.45 + i * 0.04, type: "spring", stiffness: 300, damping: 22 }}
          />
        ))}
    </svg>
  );
}
