import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CanvasTexture, DoubleSide, SRGBColorSpace, type Group, type Mesh } from "three";

// The 3D piggy bank. Built from primitives (no model download), it cracks in
// six stages drawn onto the body's texture and bursts into shell pieces and
// coins on the last tap. Loaded lazily, only on the piggy screen.

export type PiggySceneProps = { stage: number; shattered: boolean; hitKey: number; feedKey: number };

const GOLD = "#FFC53D";
const DEEP = "#E8A317";
const DARK = "#3A2500";
const BODY_SCALE: [number, number, number] = [1.25, 1, 1];
const FLOOR = -1.1;

// Where on the body texture the camera looks (worked out from the group's turn).
const CRACK_CX = 0.33;
const CRACK_CY = 0.47;

function crackPaths() {
  // Six jagged cracks fanning out from one point, in texture pixels (1024 x 512)
  const cx = CRACK_CX * 1024;
  const cy = CRACK_CY * 512;
  const angles = [-100, -30, 25, 80, 150, 205];
  return angles.map((deg, i) => {
    const rad = (deg * Math.PI) / 180;
    const pts: [number, number][] = [[cx, cy]];
    for (let s = 1; s <= 5; s++) {
      const d = s * 19;
      const j = (s % 2 ? 1 : -1) * (6 + ((i * 5 + s * 7) % 6));
      pts.push([cx + d * Math.cos(rad) * 1.25 - j * Math.sin(rad), cy + d * Math.sin(rad) + j * Math.cos(rad)]);
    }
    return pts;
  });
}

function useBodyTexture(stage: number) {
  const { canvas, texture } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 512;
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 4;
    return { canvas: c, texture: t };
  }, []);
  const paths = useMemo(crackPaths, []);

  useEffect(() => {
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = GOLD;
    ctx.fillRect(0, 0, 1024, 512);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    paths.slice(0, stage).forEach((pts, i) => {
      // the crack, a lighter chipped edge beside it, and a small side branch
      ctx.strokeStyle = "#FFE7A3";
      ctx.lineWidth = 5;
      ctx.beginPath();
      pts.forEach(([x, y], k) => (k ? ctx.lineTo(x + 2, y + 3) : ctx.moveTo(x + 2, y + 3)));
      ctx.stroke();
      ctx.strokeStyle = "#5A3300";
      ctx.lineWidth = 7 - Math.min(i, 3);
      ctx.beginPath();
      pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
      const [bx, by] = pts[3];
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + (i % 2 ? 22 : -22), by + (i % 3 ? 16 : -16));
      ctx.stroke();
    });
    texture.needsUpdate = true;
  }, [stage, canvas, texture, paths]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

type Flyer = { mesh: Mesh | Group; vx: number; vy: number; vz: number; spin: [number, number, number]; floor: number };

function Pig({ stage, shattered, hitKey, feedKey }: PiggySceneProps) {
  const root = useRef<Group>(null);
  const parts = useRef<(Mesh | Group | null)[]>([]);
  const shards = useRef<(Mesh | null)[]>([]);
  const coins = useRef<(Mesh | null)[]>([]);
  const flyers = useRef<Flyer[]>([]);
  const hitAt = useRef(-10);
  const feedAt = useRef(-10);
  const shatterAt = useRef<number | null>(null);
  const clock = useThree((s) => s.clock);
  const texture = useBodyTexture(stage);

  // Body shell pieces: a 6 x 4 grid of sphere patches that together make the body
  const patches = useMemo(() => {
    const list: { phiStart: number; thetaStart: number; dir: [number, number, number] }[] = [];
    for (let a = 0; a < 6; a++)
      for (let b = 0; b < 4; b++) {
        const phi = ((a + 0.5) / 6) * Math.PI * 2;
        const theta = ((b + 0.5) / 4) * Math.PI;
        list.push({
          phiStart: (a / 6) * Math.PI * 2,
          thetaStart: (b / 4) * Math.PI,
          dir: [-Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta)],
        });
      }
    return list;
  }, []);

  useEffect(() => {
    if (hitKey) hitAt.current = clock.elapsedTime;
  }, [hitKey, clock]);
  useEffect(() => {
    if (feedKey) feedAt.current = clock.elapsedTime;
  }, [feedKey, clock]);

  useEffect(() => {
    const all = [...parts.current, ...shards.current, ...coins.current].filter(Boolean) as (Mesh | Group)[];
    if (!shattered) {
      shatterAt.current = null;
      flyers.current = [];
      all.forEach((m) => {
        const o = m.userData.origin as [number, number, number] | undefined;
        if (o) m.position.set(...o);
        m.rotation.set(...((m.userData.rot as [number, number, number]) ?? [0, 0, 0]));
      });
      return;
    }
    shatterAt.current = clock.elapsedTime;
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const fling = (m: Mesh | Group, dir: [number, number, number], speed: number, floor: number) => {
      m.userData.origin ??= m.position.toArray();
      m.userData.rot ??= [m.rotation.x, m.rotation.y, m.rotation.z];
      flyers.current.push({
        mesh: m,
        vx: dir[0] * speed,
        vy: dir[1] * speed + 3 + rnd() * 2,
        vz: dir[2] * speed + 1.2,
        spin: [(rnd() - 0.5) * 9, (rnd() - 0.5) * 9, (rnd() - 0.5) * 9],
        floor,
      });
    };
    parts.current.forEach((m) => {
      if (!m) return;
      const p = m.position;
      const len = Math.hypot(p.x, p.y, p.z) || 1;
      fling(m, [p.x / len, p.y / len, p.z / len], 2.4, FLOOR + 0.1);
    });
    shards.current.forEach((m, i) => m && fling(m, patches[i].dir, 2.2 + rnd(), FLOOR + 0.05));
    coins.current.forEach((m, i) => {
      if (!m) return;
      const a = (i / coins.current.length) * Math.PI * 2;
      fling(m, [Math.cos(a) * 0.6, 0.4, Math.sin(a) * 0.6], 2 + rnd() * 1.5, FLOOR + 0.03);
    });
  }, [shattered, clock, patches]);

  useFrame((state, delta) => {
    const g = root.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 1 / 30);

    // idle: a slow bob and sway
    g.position.y = shattered ? 0 : Math.sin(t * 1.6) * 0.05;
    g.rotation.y = -0.55 + Math.sin(t * 0.5) * 0.12;

    // a tap: wobble and squash, fading out
    const h = t - hitAt.current;
    const wob = h < 1.2 ? Math.exp(-h * 5) : 0;
    g.rotation.z = Math.sin(h * 26) * 0.14 * wob;
    const squash = h < 0.6 ? 1 - 0.1 * Math.exp(-h * 9) * Math.cos(h * 28) : 1;
    g.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));

    // feeding: a happy hop
    const f = t - feedAt.current;
    if (!shattered && f < 0.55) g.position.y += Math.sin((f / 0.55) * Math.PI) * 0.22;

    // shatter: pieces fly, fall and settle on the floor
    if (shatterAt.current != null) {
      for (const fl of flyers.current) {
        const m = fl.mesh;
        if (m.position.y <= fl.floor && fl.vy <= 0) {
          fl.vx *= 0.9;
          fl.vz *= 0.9;
          fl.spin = [fl.spin[0] * 0.8, fl.spin[1] * 0.8, fl.spin[2] * 0.8];
          fl.vy = Math.abs(fl.vy) > 1.2 ? -fl.vy * 0.3 : 0;
          m.position.y = fl.floor;
        } else {
          fl.vy -= 9.8 * dt;
        }
        m.position.x += fl.vx * dt;
        m.position.y += fl.vy * dt;
        m.position.z += fl.vz * dt;
        m.rotation.x += fl.spin[0] * dt;
        m.rotation.y += fl.spin[1] * dt;
        m.rotation.z += fl.spin[2] * dt;
      }
    }
  });

  const keep = (i: number) => (el: Mesh | Group | null) => {
    parts.current[i] = el;
    if (el && !el.userData.origin) {
      el.userData.origin = el.position.toArray();
      el.userData.rot = [el.rotation.x, el.rotation.y, el.rotation.z];
    }
  };
  const deep = <meshPhysicalMaterial color={DEEP} emissive={DEEP} emissiveIntensity={0.12} roughness={0.45} clearcoat={0.5} clearcoatRoughness={0.4} />;

  return (
    <group ref={root}>
      {/* body: whole while cracking, shell pieces once it breaks */}
      <mesh scale={BODY_SCALE} visible={!shattered}>
        <sphereGeometry args={[1, 64, 40]} />
        <meshPhysicalMaterial map={texture} emissive={GOLD} emissiveIntensity={0.1} roughness={0.42} clearcoat={0.6} clearcoatRoughness={0.35} />
      </mesh>
      <group scale={BODY_SCALE} visible={shattered}>
        {patches.map((p, i) => (
          <mesh
            key={i}
            ref={(el) => {
              shards.current[i] = el;
              if (el && !el.userData.origin) {
                el.userData.origin = [0, 0, 0];
                el.userData.rot = [0, 0, 0];
              }
            }}
          >
            <sphereGeometry args={[1, 8, 6, p.phiStart, (Math.PI * 2) / 6, p.thetaStart, Math.PI / 4]} />
            <meshPhysicalMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.1} roughness={0.45} clearcoat={0.5} side={DoubleSide} />
          </mesh>
        ))}
      </group>

      {/* snout and nostrils */}
      <group ref={keep(0)} position={[1.27, -0.06, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.36, 0.4, 0.32, 40]} />
          {deep}
        </mesh>
        {[-0.12, 0.12].map((z) => (
          <mesh key={z} position={[0.165, 0, z]} scale={[0.4, 1, 1]}>
            <sphereGeometry args={[0.065, 16, 12]} />
            <meshStandardMaterial color={DARK} roughness={0.6} />
          </mesh>
        ))}
      </group>
      {/* eyes */}
      {[-1, 1].map((s, i) => (
        <group key={s} ref={keep(1 + i)} position={[1.02, 0.36, s * 0.42]}>
          <mesh>
            <sphereGeometry args={[0.085, 20, 16]} />
            <meshStandardMaterial color="#0A0F24" roughness={0.25} />
          </mesh>
          <mesh position={[0.05, 0.035, s * 0.03]}>
            <sphereGeometry args={[0.026, 10, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
      {/* ears */}
      {[-1, 1].map((s, i) => (
        <mesh key={s} ref={keep(3 + i)} position={[0.6, 0.88, s * 0.4]} rotation={[s * 0.35, 0, -0.4]}>
          <coneGeometry args={[0.24, 0.42, 28]} />
          {deep}
        </mesh>
      ))}
      {/* legs */}
      {[
        [0.6, 0.42],
        [0.6, -0.42],
        [-0.6, 0.42],
        [-0.6, -0.42],
      ].map(([x, z], i) => (
        <mesh key={i} ref={keep(5 + i)} position={[x, -0.86, z]}>
          <cylinderGeometry args={[0.18, 0.16, 0.48, 24]} />
          {deep}
        </mesh>
      ))}
      {/* curly tail */}
      <mesh ref={keep(9)} position={[-1.27, 0.22, 0]} rotation={[0, Math.PI / 2, 0.3]}>
        <torusGeometry args={[0.12, 0.04, 12, 32, Math.PI * 1.6]} />
        {deep}
      </mesh>
      {/* coin slot */}
      <mesh ref={keep(10)} position={[-0.05, 0.99, 0]} visible={!shattered}>
        <boxGeometry args={[0.46, 0.06, 0.1]} />
        <meshStandardMaterial color={DARK} />
      </mesh>

      {/* coins hidden inside until it breaks */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh
          key={i}
          visible={shattered}
          ref={(el) => {
            coins.current[i] = el;
            if (el && !el.userData.origin) {
              el.userData.origin = el.position.toArray();
              el.userData.rot = [0, 0, 0];
            }
          }}
          position={[((i % 4) - 1.5) * 0.18, -0.3 + Math.floor(i / 4) * 0.12, ((i % 3) - 1) * 0.15]}
        >
          <cylinderGeometry args={[0.15, 0.15, 0.045, 28]} />
          <meshPhysicalMaterial color={GOLD} metalness={0.55} roughness={0.28} clearcoat={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Shadow() {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
    g.addColorStop(0, "rgba(0,0,0,0.55)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new CanvasTexture(c);
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR, 0]} scale={[3.6, 2.4, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}

function Aim() {
  const camera = useThree((s) => s.camera);
  useEffect(() => camera.lookAt(0, -0.15, 0), [camera]);
  return null;
}

export default function PiggyScene(props: PiggySceneProps) {
  return (
    // flat: no filmic tone mapping, so the gold stays the 2019 piggy's warm yellow
    <Canvas flat dpr={[1, 2]} camera={{ position: [0.3, 0.9, 5.4], fov: 36 }} gl={{ antialias: true, alpha: true }} aria-hidden>
      <Aim />
      <ambientLight intensity={0.55} color="#FFF1D0" />
      <hemisphereLight args={["#FFF4DA", "#3A4590", 1.1]} />
      <directionalLight position={[3, 5, 5]} intensity={2.1} />
      <directionalLight position={[-4, 2, -3]} intensity={1.2} color="#7C93FF" />
      <Pig {...props} />
      <Shadow />
    </Canvas>
  );
}
