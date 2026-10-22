"use client";

import { useMemo } from "react";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { career, clusters, skills } from "@/content/portfolio";
import { labelTexture } from "@/components/galaxy/SkillsPile";
import { setWorld, world } from "./store";
import { SignLine, StaticLine } from "./Letters";
import { PALETTE } from "./Environment";

/*
  Map (x right, z forward from the spawn at z = -18):

                     SKILLS crates (0, 95)
       CAREER road (-70, 20..80)          PROJECTS arc (70, 55)
                       name letters (0, 6..11)
     ramp + pins (-45, -45)   spawn (0, -18)    CONTACT mailbox (60, -45)
*/

export const ZONES = {
  projects: new THREE.Vector3(70, 0, 55),
  career: new THREE.Vector3(-70, 0, 20),
  skills: new THREE.Vector3(0, 0, 95),
  contact: new THREE.Vector3(62, 0, -45),
  fun: new THREE.Vector3(-48, 0, -45),
};

const ACCENT = {
  mastermind: "#B9A2FF",
  ntn: "#FF8FB4",
  influenzer: "#FFB877",
  career: "#52E3F2",
  contact: "#F3E07C",
  fun: "#7FDDB0",
};

/* ───────── a pressure pad that opens a panel while the car is on it ───────── */
function Pad({ id, position, size = [5, 4], color }: { id: string; position: [number, number, number]; size?: [number, number]; color: string }) {
  return (
    <group position={position}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[size[0] / 2, 1.2, size[1] / 2]}
          position={[0, 1.2, 0]}
          sensor
          onIntersectionEnter={() => setWorld({ panel: id, zone: id })}
          onIntersectionExit={() => {
            if (world.panel === id) setWorld({ panel: null, zone: null });
          }}
        />
      </RigidBody>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={size} />
        <meshStandardMaterial color={color} transparent opacity={0.55} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[Math.min(size[0], size[1]) * 0.28, Math.min(size[0], size[1]) * 0.34, 40]} />
        <meshStandardMaterial color={PALETTE.ink} roughness={1} />
      </mesh>
    </group>
  );
}

/* ───────── sign post with a label, pointing somewhere ───────── */
function Signpost({
  position,
  text,
  rotationY = Math.PI,
  color = "#F6F1E7",
  flip = false,
}: {
  position: [number, number, number];
  text: string;
  rotationY?: number;
  color?: string;
  /** arrow on the other end of the board */
  flip?: boolean;
}) {
  const w = text.length * 0.55 + 1.2;
  const dir = flip ? -1 : 1;
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.12, 1.6, 0.12]} position={[0, 1.6, 0]} />
      </RigidBody>
      <mesh castShadow position={[0, 1.6, 0]}>
        <boxGeometry args={[0.24, 3.2, 0.24]} />
        <meshStandardMaterial color={PALETTE.ink} />
      </mesh>
      {/* arrow-shaped board */}
      <group position={[(w / 2 - 0.4) * dir, 2.7, 0]}>
        <mesh castShadow>
          <boxGeometry args={[w, 0.9, 0.16]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh castShadow position={[(w / 2 + 0.05) * dir, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.64, 0.64, 0.15]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <SignLine text={text} size={0.5} position={[0, -0.22, 0.09]} color={PALETTE.ink} depth={0.06} />
      </group>
    </group>
  );
}

/* ───────── projects: three plinths in an arc ───────── */
function Plinth({ position, rotationY, id, title, color, children }: { position: [number, number, number]; rotationY: number; id: string; title: string; color: string; children?: React.ReactNode }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow position={[0, 1.1, 0]}>
          <boxGeometry args={[7, 2.2, 3]} />
          <meshStandardMaterial color="#F6F1E7" roughness={0.7} />
        </mesh>
      </RigidBody>
      <mesh position={[0, 2.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.6, 2.6]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
      <SignLine text={title} size={0.95} position={[0, 0.65, 1.52]} color={PALETTE.ink} depth={0.1} />
      <group position={[0, 2.25, 0]}>{children}</group>
      <Pad id={id} position={[0, 0, 4.6]} size={[7, 4]} color={color} />
    </group>
  );
}

function MastermindSculpture() {
  // a funnel: a cone of rings with glowing beads converging to one bright orb
  const beads = useMemo(() => {
    const out: [number, number, number][] = [];
    let s = 9;
    const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0; i < 40; i++) {
      const t = rand();
      const r = 0.3 + t * 2.2;
      const a = rand() * Math.PI * 2;
      out.push([Math.cos(a) * r, 0.6 + t * 2.6, Math.sin(a) * r]);
    }
    return out;
  }, []);
  return (
    <group>
      {[0.6, 1.3, 2.0, 2.7].map((y, i) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5 + i * 0.7, 0.05, 8, 40]} />
          <meshStandardMaterial color={PALETTE.ink} />
        </mesh>
      ))}
      {beads.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial color="#F6F1E7" />
        </mesh>
      ))}
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshStandardMaterial color={ACCENT.mastermind} emissive={ACCENT.mastermind} emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

function NtnSculpture() {
  // a stack of envelopes between two agents, one red one in a bin
  return (
    <group>
      <mesh position={[-2.2, 0.7, 0]} castShadow>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#52E3F2" flatShading />
      </mesh>
      <mesh position={[2.2, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.55, 18, 18]} />
        <meshStandardMaterial color={ACCENT.ntn} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <RigidBody key={i} colliders="cuboid" position={[-0.8 + i * 0.8, 1.2 + i * 0.5, 0]} rotation={[0, 0.3 * i, 0.2]}>
          <mesh castShadow>
            <boxGeometry args={[1.1, 0.7, 0.1]} />
            <meshStandardMaterial color="#F6F1E7" />
          </mesh>
        </RigidBody>
      ))}
      <mesh position={[0, 0.3, -0.9]} castShadow>
        <boxGeometry args={[1.4, 0.6, 0.8]} />
        <meshStandardMaterial color="#FF5D6C" wireframe />
      </mesh>
    </group>
  );
}

function InfluenzerSculpture() {
  const bars = [0.8, 1.4, 1.1, 2.0, 2.6, 3.1];
  return (
    <group position={[-1.8, 0, 0]}>
      {bars.map((h, i) => (
        <mesh key={i} position={[i * 0.72, h / 2, 0]} castShadow>
          <boxGeometry args={[0.5, h, 0.5]} />
          <meshStandardMaterial color={i === bars.length - 1 ? ACCENT.influenzer : PALETTE.ink} />
        </mesh>
      ))}
    </group>
  );
}

function Projects() {
  const c = ZONES.projects;
  // plinths face the spawn (toward -x, -z); arc around the pad centre
  return (
    <group position={[c.x, 0, c.z]}>
      <StaticLine text="PROJECTS" size={2.2} position={[0, 0.02, -2]} rotationY={0} />
      <Plinth id="mastermind" position={[0, 0, 14]} rotationY={Math.PI} title="MASTERMIND" color={ACCENT.mastermind}>
        <MastermindSculpture />
      </Plinth>
      <Plinth id="ntn" position={[-15, 0, 8]} rotationY={Math.PI * 0.72} title="NTN" color={ACCENT.ntn}>
        <NtnSculpture />
      </Plinth>
      <Plinth id="influenzer" position={[15, 0, 8]} rotationY={Math.PI * 1.28} title="INFLUENZER AI" color={ACCENT.influenzer}>
        <InfluenzerSculpture />
      </Plinth>
    </group>
  );
}

/* ───────── career: a road through three arches ───────── */
function Arch({ position, label, year, id, color }: { position: [number, number, number]; label: string; year: string; id: string; color: string }) {
  return (
    <group position={position} rotation={[0, Math.PI, 0]}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow position={[-5, 3, 0]}>
          <boxGeometry args={[1.2, 6, 1.2]} />
          <meshStandardMaterial color="#F6F1E7" />
        </mesh>
        <mesh castShadow position={[5, 3, 0]}>
          <boxGeometry args={[1.2, 6, 1.2]} />
          <meshStandardMaterial color="#F6F1E7" />
        </mesh>
        <mesh castShadow position={[0, 6.9, 0]}>
          <boxGeometry args={[11.2, 2.2, 1.4]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </RigidBody>
      <SignLine text={year} size={0.8} position={[0, 6.0, 0.72]} color={PALETTE.ink} depth={0.08} />
      <SignLine text={label} size={0.58} position={[0, 7.1, 0.72]} color={PALETTE.ink} depth={0.08} />
      <Pad id={id} position={[0, 0, 0]} size={[8, 5]} color={color} />
    </group>
  );
}

function Career() {
  const c = ZONES.career;
  return (
    <group position={[c.x, 0, c.z]}>
      {/* the road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 30]} receiveShadow>
        <planeGeometry args={[9, 70]} />
        <meshStandardMaterial color={PALETTE.sandDark} roughness={1} />
      </mesh>
      <StaticLine text="CAREER" size={2.2} position={[0, 0.02, -8]} />
      {career.map((j, i) => (
        <Arch key={j.id} id={j.id} position={[0, 0, 4 + i * 24]} label={j.label.toUpperCase()} year={j.start.replace(/\D/g, "")} color={ACCENT.career} />
      ))}
    </group>
  );
}

/* ───────── skills: a wall of crates to crash into ───────── */
function Crate({ label, color, position, rotationY }: { label: string; color: string; position: [number, number, number]; rotationY: number }) {
  const materials = useMemo(() => {
    const tex = labelTexture(label, color);
    const face = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 });
    const side = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
    return [side, side, side, side, face, face];
  }, [label, color]);
  const w = Math.min(Math.max(1.6 + label.length * 0.16, 2), 3.6);
  return (
    <RigidBody colliders="cuboid" position={position} rotation={[0, rotationY, 0]} density={0.5} friction={0.8} restitution={0.1} linearDamping={0.3} angularDamping={0.5}>
      <mesh material={materials} castShadow receiveShadow>
        <boxGeometry args={[w, 1.3, 1.3]} />
      </mesh>
    </RigidBody>
  );
}

function Skills() {
  const c = ZONES.skills;
  const crates = useMemo(() => {
    // a wall three deep, built from the bottom up
    const list = [...skills];
    const out: { label: string; color: string; position: [number, number, number]; rotationY: number }[] = [];
    let i = 0;
    for (let row = 0; row < 4 && i < list.length; row++) {
      const perRow = 10 - row;
      for (let k = 0; k < perRow && i < list.length; k++, i++) {
        const sk = list[i];
        out.push({
          label: sk.label,
          color: clusters[sk.cluster].color,
          position: [(k - (perRow - 1) / 2) * 3.4, 0.66 + row * 1.32, 0],
          rotationY: 0,
        });
      }
    }
    return out;
  }, []);
  return (
    <group position={[c.x, 0, c.z]}>
      <StaticLine text="SKILLS" size={2.2} position={[0, 0.02, -14]} />
      <Pad id="skills" position={[0, 0, -7]} size={[14, 5]} color="#7FDDB0" />
      {crates.map((cr) => (
        <Crate key={cr.label} {...cr} />
      ))}
    </group>
  );
}

/* ───────── contact: a giant mailbox ───────── */
function Contact() {
  const c = ZONES.contact;
  return (
    <group position={[c.x, 0, c.z]} rotation={[0, -Math.PI * 0.37, 0]}>
      {/* the visitor arrives from this zone's +z side */}
      <StaticLine text="CONTACT" size={2.2} position={[0, 0.02, 12]} rotationY={Math.PI} />
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow position={[0, 2, 0]}>
          <boxGeometry args={[0.5, 4, 0.5]} />
          <meshStandardMaterial color={PALETTE.ink} />
        </mesh>
        <mesh castShadow position={[0, 5.2, 0]}>
          <boxGeometry args={[3.2, 2.4, 5]} />
          <meshStandardMaterial color={ACCENT.contact} />
        </mesh>
      </RigidBody>
      <mesh castShadow position={[0, 6.4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1.6, 1.6, 5, 24, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color={ACCENT.contact} />
      </mesh>
      {/* slot and flag */}
      <mesh position={[0, 5.4, 2.52]}>
        <boxGeometry args={[1.8, 0.25, 0.06]} />
        <meshStandardMaterial color={PALETTE.ink} />
      </mesh>
      <mesh castShadow position={[1.75, 6.4, 1]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.15, 2.2, 0.6]} />
        <meshStandardMaterial color="#FF5D6C" />
      </mesh>
      <SignLine text="@" size={1.1} position={[0, 4.4, 2.52]} color={PALETTE.ink} depth={0.08} />
      <Pad id="contact" position={[0, 0, 5.5]} size={[8, 5]} color={ACCENT.contact} />
    </group>
  );
}

/* ───────── fun: a ramp and bowling pins ───────── */
function Fun() {
  const c = ZONES.fun;
  const pins = useMemo(() => {
    const out: [number, number][] = [];
    for (let row = 0; row < 4; row++) for (let k = 0; k <= row; k++) out.push([(k - row / 2) * 1.6, row * 1.5]);
    return out;
  }, []);
  return (
    <group position={[c.x, 0, c.z]}>
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0, 6]} rotation={[-0.28, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[8, 0.5, 12]} />
          <meshStandardMaterial color={ACCENT.fun} />
        </mesh>
      </RigidBody>
      {pins.map(([x, z], i) => (
        <RigidBody key={i} colliders="cuboid" position={[x, 1.2, -12 - z]} density={0.3} friction={0.6}>
          <mesh castShadow>
            <capsuleGeometry args={[0.35, 1.5, 4, 10]} />
            <meshStandardMaterial color="#F6F1E7" />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <torusGeometry args={[0.37, 0.06, 6, 16]} />
            <meshStandardMaterial color="#FF5D6C" />
          </mesh>
        </RigidBody>
      ))}
      {/* a few balls to push around */}
      {[-6, -3, 3, 6].map((x) => (
        <RigidBody key={x} colliders="ball" position={[x, 1, -4]} density={0.4} restitution={0.6}>
          <mesh castShadow>
            <sphereGeometry args={[0.9, 20, 20]} />
            <meshStandardMaterial color={["#B9A2FF", "#FF8FB4", "#52E3F2", "#F3E07C"][(x + 6) / 3]} />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
}

export default function Zones() {
  return (
    <group>
      {/* signposts around the spawn */}
      {/* boards face the spawn; after the half turn, a flipped arrow points to world +x */}
      <Signpost position={[9, 0, -8]} text="PROJECTS" rotationY={Math.PI * 1.12} flip color={ACCENT.mastermind} />
      <Signpost position={[-9, 0, -8]} text="CAREER" rotationY={Math.PI * 0.88} color={ACCENT.career} />
      <Signpost position={[11, 0, -24]} text="CONTACT" rotationY={Math.PI * 1.2} flip color={ACCENT.contact} />
      <Signpost position={[-11, 0, -24]} text="RAMP" rotationY={Math.PI * 0.8} color={ACCENT.fun} />
      <Projects />
      <Career />
      <Skills />
      <Contact />
      <Fun />
    </group>
  );
}
