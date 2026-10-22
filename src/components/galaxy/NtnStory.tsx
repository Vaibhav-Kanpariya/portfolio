"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { nodeById, regions } from "./layout";
import { glowTexture } from "./glow";
import { galaxy, isChaos } from "./store";
import { smoothstep, storyProgress, storyWeight } from "./story";
import Ring, { type RingUniforms } from "./Ring";

/*
  NTN, told with envelopes.

  Two agents trade mail across an arc. As the visitor scrolls:
  p = 0.00–0.35  mail flows both ways
  p = 0.35–0.45  one send fails: it turns red and drops into the dead-letter bin
  p = 0.45–0.60  it waits in the bin while the retry timer fills
  p = 0.60–0.85  it rises, turns healthy, and completes the trip
  p = 0.85–1.00  deal closed: a stamp lands on the creator's side
*/

const LEFT = new THREE.Vector3(-3.8, 0.3, 0);
const RIGHT = new THREE.Vector3(3.8, 0.3, 0);
const ARC_TOP = new THREE.Vector3(0, 3.3, 0);
const BIN = new THREE.Vector3(0, -2.7, 0);
const CYAN = "#52E3F2";
const PINK = "#FF8FB4";
const RED = "#FF5D6C";
const PAPER = "#E9EDF8";

const scratch = new THREE.Vector3();

const arcPoint = (u: number, out: THREE.Vector3) => {
  // quadratic bezier LEFT -> ARC_TOP -> RIGHT
  const a = 1 - u;
  out.set(
    a * a * LEFT.x + 2 * a * u * ARC_TOP.x + u * u * RIGHT.x,
    a * a * LEFT.y + 2 * a * u * ARC_TOP.y + u * u * RIGHT.y,
    a * a * LEFT.z + 2 * a * u * ARC_TOP.z + u * u * RIGHT.z,
  );
  return out;
};

/** How large a set piece can be for the current viewport: smaller on phones. */
export function useStoryScale() {
  const { width, height } = useThree((s) => s.size);
  return Math.min(1, Math.max(0.58, width / height / 1.4));
}

function Envelope({ color = PAPER }: { color?: string }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.05, 0.68, 0.06]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          roughness={0.5}
        />
      </mesh>
      {/* the flap: a darker chevron on the front */}
      <mesh position={[0, 0.13, 0.035]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.42, 0.42, 0.01]} />
        <meshStandardMaterial color="#9aa4c2" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.36, 0.04]}>
        <boxGeometry args={[1.05, 0.2, 0.01]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          roughness={0.5}
        />
      </mesh>
      <sprite scale={2.2}>
        <spriteMaterial
          map={glowTexture()}
          color={color}
          transparent
          opacity={0.25}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

function Agent({
  position,
  color,
  shape,
}: {
  position: THREE.Vector3;
  color: string;
  shape: "ico" | "sphere";
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = galaxy.reducedMotion ? 0 : state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.4;
    ref.current.rotation.x = Math.sin(t * 0.5) * 0.2;
  });
  return (
    <group position={position}>
      <group ref={ref}>
        <mesh>
          {shape === "ico" ? (
            <icosahedronGeometry args={[0.8, 1]} />
          ) : (
            <sphereGeometry args={[0.7, 24, 24]} />
          )}
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            wireframe={shape === "ico"}
            roughness={0.4}
          />
        </mesh>
        {shape === "ico" && (
          <mesh>
            <icosahedronGeometry args={[0.45, 2]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1}
            />
          </mesh>
        )}
      </group>
      <sprite scale={4}>
        <spriteMaterial
          map={glowTexture()}
          color={color}
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

const FLOW = 6;

export default function NtnStory() {
  const origin = nodeById("ntn")!.position;
  const scale = useStoryScale();
  const root = useRef<THREE.Group>(null);
  const flow = useRef<(THREE.Group | null)[]>([]);
  const hero = useRef<THREE.Group>(null);
  const heroPaper = useRef<THREE.MeshStandardMaterial[]>([]);
  const heroGlow = useRef<THREE.SpriteMaterial>(null);
  const timer = useRef<THREE.Mesh>(null);
  const renew = useRef<THREE.Mesh>(null);
  const stamp = useRef<THREE.Mesh>(null);
  const check = useRef<THREE.Group>(null);
  const bin = useRef<THREE.LineSegments>(null);

  // face the camera: rotate the set piece so its x axis runs across the screen
  const rotationY = useMemo(() => {
    const cam = new THREE.Vector3(...regions.ntn.camera);
    const tgt = new THREE.Vector3(...regions.ntn.target);
    const d = cam.sub(tgt);
    return Math.atan2(d.x, d.z);
  }, []);

  const arcLineObj = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 48; i++)
      pts.push(arcPoint(i / 48, new THREE.Vector3()));
    const geometry = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({
        color: "#9aa4c2",
        transparent: true,
        depthWrite: false,
      }),
    );
  }, []);
  const binGeometry = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.8, 1.1, 1.1)),
    [],
  );

  const tmp = scratch;
  const arcRef = useRef<THREE.Line>(null);
  const redColor = useMemo(() => new THREE.Color(RED), []);
  const paperColor = useMemo(() => new THREE.Color(PAPER), []);
  const cyanColor = useMemo(() => new THREE.Color(CYAN), []);
  const retryColor = useMemo(
    () => new THREE.Color(PAPER).lerp(new THREE.Color(CYAN), 0.35),
    [],
  );

  useFrame((state) => {
    if (!root.current) return;
    const w = storyWeight("ntn");
    root.current.visible = w > 0.01;
    if (w <= 0.01) return;
    const p = storyProgress("ntn");
    const t = galaxy.reducedMotion ? 0.37 : state.clock.elapsedTime;

    // conversation: envelopes travelling both ways, quieter once one fails
    const flowAlpha = (1 - 0.6 * smoothstep(0.33, 0.4, p)) * w;
    flow.current.forEach((g, i) => {
      if (!g) return;
      const dir = i % 2 === 0 ? 1 : -1;
      let u = (t * (isChaos() ? 1.2 : 0.16) + i / FLOW) % 1;
      if (dir < 0) u = 1 - u;
      arcPoint(u, tmp);
      g.position.copy(tmp);
      g.rotation.z = dir * (0.5 - u) * 0.8;
      g.rotation.y = Math.sin(t * 2 + i) * 0.25;
      const fade = Math.sin((dir < 0 ? 1 - u : u) * Math.PI);
      g.visible = fade > 0.02;
      g.scale.setScalar(0.75 + 0.25 * fade);
      g.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.Material | undefined;
        if (m && "opacity" in m) {
          m.transparent = true;
          (m as THREE.Material & { opacity: number }).opacity =
            (o.type === "Sprite" ? 0.25 : 1) * fade * flowAlpha;
        }
      });
    });

    // the one that fails
    if (hero.current) {
      const g = hero.current;
      let visible = p >= 0.33;
      const pos = tmp;
      let col = paperColor;
      let glowCol = cyanColor;
      if (p < 0.35) {
        arcPoint(0.5 + (p - 0.33) * 2, pos);
      } else if (p < 0.45) {
        // fall into the bin
        const f = smoothstep(0.35, 0.45, p);
        arcPoint(0.52, pos);
        pos.lerp(BIN, f);
        pos.y += Math.sin(f * Math.PI) * -0.4;
        g.rotation.z = f * 2.2;
        col = redColor;
        glowCol = redColor;
      } else if (p < 0.6) {
        pos.set(BIN.x, BIN.y + Math.sin(t * 3) * 0.05, BIN.z);
        g.rotation.z = 2.2;
        col = redColor;
        glowCol = redColor;
      } else if (p < 0.85) {
        // retry: rise to the arc and finish the trip
        const f = smoothstep(0.6, 0.85, p);
        const u = 0.52 + 0.48 * f;
        arcPoint(u, pos);
        const rise = smoothstep(0, 0.35, f);
        pos.lerp(BIN, 1 - rise);
        g.rotation.z = (1 - rise) * 2.2 - (0.5 - u) * 0.8;
        col = retryColor;
        glowCol = cyanColor;
      } else {
        visible = false;
      }
      g.visible = visible;
      g.position.copy(pos);
      g.scale.setScalar(1.15);
      heroPaper.current.forEach((m) => {
        m.color.copy(col);
        m.emissive.copy(col);
      });
      if (heroGlow.current) {
        heroGlow.current.color.copy(glowCol);
        heroGlow.current.opacity = 0.4 * w;
      }
    }

    // bin and its retry timer
    if (bin.current) {
      const m = bin.current.material as THREE.LineBasicMaterial;
      m.opacity =
        (0.25 +
          0.55 * smoothstep(0.33, 0.45, p) -
          0.4 * smoothstep(0.75, 0.9, p)) *
        w;
    }
    if (timer.current) {
      const u = (timer.current.material as THREE.ShaderMaterial)
        .uniforms as RingUniforms;
      u.uFill.value = smoothstep(0.45, 0.6, p);
      u.uAlpha.value =
        (smoothstep(0.42, 0.47, p) - smoothstep(0.62, 0.7, p)) * w;
    }
    // the watch-renewal clock on the creator's side, always running
    if (renew.current) {
      const u = (renew.current.material as THREE.ShaderMaterial)
        .uniforms as RingUniforms;
      u.uFill.value = 1 - ((t / 7) % 1);
      u.uAlpha.value = 0.55 * w;
    }
    // stamp
    if (stamp.current) {
      const f = smoothstep(0.85, 1, p);
      const u = (stamp.current.material as THREE.ShaderMaterial)
        .uniforms as RingUniforms;
      u.uFill.value = 1;
      u.uAlpha.value = (1 - f) * smoothstep(0.85, 0.88, p) * w;
      stamp.current.scale.setScalar(1 + f * 2.2);
    }
    if (check.current) {
      const f = smoothstep(0.86, 0.95, p);
      check.current.visible = f > 0;
      check.current.scale.setScalar(0.2 + 0.8 * f);
      check.current.position.y = 1.9 + f * 0.3;
    }
    if (arcRef.current)
      (arcRef.current.material as THREE.LineBasicMaterial).opacity = 0.18 * w;
  });

  return (
    <group
      ref={root}
      position={origin}
      rotation={[0, rotationY, 0]}
      scale={scale}
    >
      <group position={[1.6, 0, 0]}>
        <primitive ref={arcRef} object={arcLineObj} />

        <Agent position={LEFT} color={CYAN} shape="ico" />
        <Agent position={RIGHT} color={PINK} shape="sphere" />

        {Array.from({ length: FLOW }, (_, i) => (
          <group
            key={i}
            ref={(el) => {
              flow.current[i] = el;
            }}
          >
            <Envelope />
          </group>
        ))}

        <group ref={hero}>
          <group>
            <mesh>
              <boxGeometry args={[1.05, 0.68, 0.06]} />
              <meshStandardMaterial
                ref={(m) => {
                  if (m) heroPaper.current[0] = m;
                }}
                color={PAPER}
                emissive={PAPER}
                emissiveIntensity={0.4}
                roughness={0.5}
              />
            </mesh>
            <mesh position={[0, 0.13, 0.035]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.42, 0.42, 0.01]} />
              <meshStandardMaterial color="#5d6890" roughness={0.6} />
            </mesh>
            <sprite scale={2.6}>
              <spriteMaterial
                ref={heroGlow}
                map={glowTexture()}
                color={CYAN}
                transparent
                opacity={0.4}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </sprite>
          </group>
        </group>

        {/* dead-letter bin */}
        <lineSegments ref={bin} geometry={binGeometry} position={BIN}>
          <lineBasicMaterial color={RED} transparent depthWrite={false} />
        </lineSegments>
        <group
          position={[BIN.x, BIN.y + 1.1, BIN.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <Ring ref={timer} radius={1.3} color={RED} inner={0.84} />
        </group>

        {/* watch renewal clock beside the creator */}
        <group position={[RIGHT.x + 1.3, RIGHT.y + 1.2, 0]}>
          <Ring ref={renew} radius={0.42} color={PINK} inner={0.7} />
        </group>

        {/* stamp + check when the deal closes */}
        <group position={[RIGHT.x, RIGHT.y, 0.2]}>
          <Ring ref={stamp} radius={1.2} color={CYAN} inner={0.88} />
        </group>
        <group ref={check} position={[RIGHT.x, RIGHT.y + 1.9, 0.2]}>
          <mesh position={[-0.18, -0.1, 0]} rotation={[0, 0, -0.8]}>
            <boxGeometry args={[0.5, 0.12, 0.08]} />
            <meshStandardMaterial
              color={CYAN}
              emissive={CYAN}
              emissiveIntensity={1}
            />
          </mesh>
          <mesh position={[0.2, 0.05, 0]} rotation={[0, 0, 0.9]}>
            <boxGeometry args={[0.9, 0.12, 0.08]} />
            <meshStandardMaterial
              color={CYAN}
              emissive={CYAN}
              emissiveIntensity={1}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}
