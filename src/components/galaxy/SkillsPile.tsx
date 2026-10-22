"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { CuboidCollider, Physics, RigidBody, useRapier, type RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { clusters, regionOrder, skills } from "@/content/portfolio";
import { galaxy, isChaos, setGalaxy } from "./store";
import { displayFontFamily } from "./namePoints";
import { glowTexture } from "./glow";

/** Where the pile lives: a tray well below the galaxy's disk. */
export const TRAY = new THREE.Vector3(0, -22, 0);
const FLOOR_Y = TRAY.y;
const SKILLS_INDEX = regionOrder.indexOf("skills");

const scratchPlane = new THREE.Plane();
const scratchHit = new THREE.Vector3();
const scratchDir = new THREE.Vector3();

export function labelTexture(label: string, color: string) {
  const w = 512;
  const h = 256;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#10152b";
  const fam = displayFontFamily();
  const x = ctx as CanvasRenderingContext2D & { fontStretch?: string };
  if ("fontStretch" in x) x.fontStretch = "expanded";
  let size = 96;
  do {
    ctx.font = `800 ${size}px ${fam}`;
    size -= 4;
  } while (ctx.measureText(label).width > w * 0.82 && size > 30);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, w / 2, h / 2 + 6);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

type BlockProps = {
  label: string;
  color: string;
  start: [number, number, number];
  rotation: [number, number, number];
};

function Block({ label, color, start, rotation }: BlockProps) {
  const body = useRef<RapierRigidBody>(null);
  const camera = useThree((s) => s.camera);
  const { rapier } = useRapier();
  const width = Math.min(Math.max(1.5 + label.length * 0.17, 1.9), 3.9);
  const size: [number, number, number] = [width, 1.0, 1.15];

  const materials = useMemo(() => {
    const tex = labelTexture(label, color);
    const face = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.42, metalness: 0.05 });
    const side = new THREE.MeshStandardMaterial({ color, roughness: 0.42, metalness: 0.05 });
    // +x, -x, +y (top), -y, +z (front), -z (back)
    return [side, side, face, side, face, face];
  }, [label, color]);

  const drag = useRef<{ offset: THREE.Vector3; last: THREE.Vector3; vel: THREE.Vector3; t: number } | null>(null);

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const rb = body.current;
    if (!rb) return;
    rb.wakeUp();
    if (e.pointerType === "touch") {
      // a tap pops the block; dragging would fight page scrolling
      rb.applyImpulse({ x: (Math.random() - 0.5) * 6, y: 14 + Math.random() * 6, z: (Math.random() - 0.5) * 6 }, true);
      rb.applyTorqueImpulse({ x: Math.random() * 2, y: Math.random() * 2, z: Math.random() * 2 }, true);
      return;
    }
    (e.target as Element).setPointerCapture(e.pointerId);
    const p = rb.translation();
    const pos = new THREE.Vector3(p.x, p.y, p.z);
    camera.getWorldDirection(scratchDir);
    scratchPlane.setFromNormalAndCoplanarPoint(scratchDir, pos);
    e.ray.intersectPlane(scratchPlane, scratchHit);
    drag.current = { offset: scratchHit.clone().sub(pos), last: pos.clone(), vel: new THREE.Vector3(), t: performance.now() };
    rb.setBodyType(rapier.RigidBodyType.KinematicPositionBased, true);
    setGalaxy({ grabbing: true });
  };

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const d = drag.current;
    const rb = body.current;
    if (!d || !rb) return;
    e.stopPropagation();
    camera.getWorldDirection(scratchDir);
    scratchPlane.setFromNormalAndCoplanarPoint(scratchDir, d.last);
    if (!e.ray.intersectPlane(scratchPlane, scratchHit)) return;
    const target = scratchHit.sub(d.offset);
    // keep it above the floor and inside the tray
    target.y = Math.max(target.y, FLOOR_Y + 0.7);
    target.x = THREE.MathUtils.clamp(target.x, -10, 10);
    target.z = THREE.MathUtils.clamp(target.z, -7, 7);
    const now = performance.now();
    const dt = Math.max((now - d.t) / 1000, 1 / 240);
    d.vel.copy(target).sub(d.last).divideScalar(dt).multiplyScalar(0.5).add(d.vel.clone().multiplyScalar(0.5));
    d.last.copy(target);
    d.t = now;
    rb.setNextKinematicTranslation({ x: target.x, y: target.y, z: target.z });
  };

  const release = (e: ThreeEvent<PointerEvent>) => {
    const d = drag.current;
    const rb = body.current;
    if (!d || !rb) return;
    e.stopPropagation();
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    rb.setBodyType(rapier.RigidBodyType.Dynamic, true);
    const v = d.vel.clampLength(0, 28);
    rb.setLinvel({ x: v.x, y: v.y, z: v.z }, true);
    rb.setAngvel({ x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 4, z: (Math.random() - 0.5) * 4 }, true);
    drag.current = null;
    setGalaxy({ grabbing: false });
  };

  return (
    <RigidBody
      ref={body}
      colliders="cuboid"
      position={start}
      rotation={rotation}
      restitution={0.25}
      friction={0.8}
      linearDamping={0.15}
      angularDamping={0.3}
      ccd
    >
      <mesh
        material={materials}
        castShadow
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={release}
        onPointerCancel={release}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "grab";
        }}
        onPointerOut={() => {
          if (!drag.current) document.body.style.cursor = "";
        }}
      >
        <boxGeometry args={size} />
      </mesh>
    </RigidBody>
  );
}

/**
 * Pauses the simulation while the pile is off-screen, hides it once the
 * camera has flown away (it sits below the galaxy and would otherwise peek
 * into other views), and flips gravity in chaos mode.
 */
function Governor({ onActive, children }: { onActive: (v: boolean) => void; children: React.ReactNode }) {
  const rapier = useRapier();
  const worldRef = useRef(rapier.world);
  const scene = useRef<THREE.Group>(null);
  const active = useRef(false);
  const chaosPhase = useRef(0);
  useFrame((state) => {
    const dist = Math.abs(galaxy.stop - SKILLS_INDEX);
    const near = dist < 0.7;
    if (near !== active.current) {
      active.current = near;
      onActive(near);
    }
    if (scene.current) scene.current.visible = dist < 0.8;
    if (isChaos()) {
      const t = state.clock.elapsedTime;
      worldRef.current.gravity = { x: Math.sin(t * 1.3) * 10, y: 7, z: Math.cos(t * 1.1) * 10 };
      chaosPhase.current = 1;
    } else if (chaosPhase.current) {
      worldRef.current.gravity = { x: 0, y: -16, z: 0 };
      chaosPhase.current = 0;
    }
  });
  return <group ref={scene}>{children}</group>;
}

function Tray() {
  return (
    <group position={[TRAY.x, FLOOR_Y, TRAY.z]}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[11, 3, 8]} position={[0, -3, 0]} />
        <CuboidCollider args={[0.5, 8, 8]} position={[-11.5, 8, 0]} />
        <CuboidCollider args={[0.5, 8, 8]} position={[11.5, 8, 0]} />
        <CuboidCollider args={[11, 8, 0.5]} position={[0, 8, -8.5]} />
        <CuboidCollider args={[11, 8, 0.5]} position={[0, 8, 8.5]} />
      </RigidBody>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color="#0c1330" roughness={0.9} />
      </mesh>
      <sprite position={[0, 0.2, 0]} scale={30}>
        <spriteMaterial map={glowTexture()} color="#1b2a6a" transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <pointLight position={[0, 9, 4]} intensity={160} color="#9fd8ff" distance={30} decay={2} />
    </group>
  );
}

const blocks: BlockProps[] = (() => {
  let s = 17;
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  return skills.map((sk, i) => ({
    label: sk.label,
    color: clusters[sk.cluster].color,
    start: [(rand() - 0.5) * 12, FLOOR_Y + 3 + (i % 6) * 1.6 + rand() * 1.2, (rand() - 0.5) * 6] as [number, number, number],
    rotation: [rand() * 0.6, rand() * Math.PI * 2, rand() * 0.6] as [number, number, number],
  }));
})();

function PileScene() {
  const [active, setActive] = useState(false);
  return (
    <Physics gravity={[0, -16, 0]} paused={!active} timeStep={1 / 60} maxCcdSubsteps={4}>
      <Governor onActive={setActive}>
        <Tray />
        {blocks.map((b) => (
          <Block key={b.label} {...b} />
        ))}
      </Governor>
    </Physics>
  );
}

/** Mounts the physics world only once the visitor is on their way down to it. */
export default function SkillsPile() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      if (galaxy.stop > SKILLS_INDEX - 1.5) setMounted(true);
      else raf = requestAnimationFrame(check);
    };
    raf = requestAnimationFrame(check);
    return () => cancelAnimationFrame(raf);
  }, []);
  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <PileScene />
    </Suspense>
  );
}
