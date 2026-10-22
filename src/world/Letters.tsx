"use client";

import { useMemo } from "react";
import { Text3D } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import fontData from "./archivo.typeface.json";
import { PALETTE } from "./Environment";

type Glyph = { ha: number; x_min: number; x_max: number };

function seeded(start: number) {
  let s = start;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
const glyphs = (fontData as unknown as { glyphs: Record<string, Glyph> }).glyphs;

/** x offset of each character so a line of separate letters reads as one word. */
export function layoutLine(text: string, size: number, tracking = 0.06) {
  const offsets: number[] = [];
  let x = 0;
  for (const ch of text) {
    offsets.push(x);
    const g = glyphs[ch] ?? glyphs["A"];
    x += (g.ha / 1000) * size + tracking * size;
  }
  const width = x - tracking * size;
  return { offsets: offsets.map((o) => o - width / 2), width };
}

const letterMaterial = new THREE.MeshStandardMaterial({ color: "#F6F1E7", roughness: 0.55 });

export function Letter3D({
  char,
  size,
  depth,
  material = letterMaterial,
}: {
  char: string;
  size: number;
  depth: number;
  material?: THREE.Material;
}) {
  return (
    <Text3D
      font={fontData as unknown as string}
      size={size}
      height={depth}
      curveSegments={6}
      bevelEnabled
      bevelThickness={size * 0.03}
      bevelSize={size * 0.025}
      bevelSegments={2}
      material={material}
      castShadow
      receiveShadow
    >
      {char}
    </Text3D>
  );
}

/**
 * The name as loose physical letters. They drop from the sky when the world
 * loads and can be knocked over, pushed around or driven through.
 */
export default function Letters() {
  const rows = useMemo(() => {
    const first = layoutLine("VAIBHAV", 3.2);
    const last = layoutLine("KANPARIYA", 3.2);
    const rand = seeded(5);
    const make = (text: string, offsets: number[], z: number, delayBase: number) =>
      [...text].map((ch, i) => ({
        ch,
        x: -offsets[i],
        z,
        y: 6 + delayBase + i * 0.9 + rand() * 0.6,
        rot: (rand() - 0.5) * 0.08,
        key: `${text}-${i}`,
      }));
    return [...make("VAIBHAV", first.offsets, 4, 0), ...make("KANPARIYA", last.offsets, 12, 3)];
  }, []);

  return (
    <group>
      {rows.map((l) => (
        <RigidBody
          key={l.key}
          colliders="cuboid"
          position={[l.x, l.y, l.z]}
          rotation={[0, Math.PI + l.rot, 0]}
          friction={1}
          restitution={0}
          linearDamping={0.3}
          angularDamping={1.5}
          density={0.6}
        >
          <Letter3D char={l.ch} size={3.2} depth={1.6} />
        </RigidBody>
      ))}
      {/* tagline pressed into the ground in front of the name */}
      <StaticLine text="FULL STACK ENGINEER" size={0.9} position={[0, 0.02, 0]} color={PALETTE.ink} />
      <StaticLine text="AGENTIC SYSTEMS" size={0.9} position={[0, 0.02, -1.6]} color={PALETTE.ink} />
    </group>
  );
}

const flatCache = new Map<string, THREE.MeshStandardMaterial>();
function flatMaterial(color: string) {
  let m = flatCache.get(color);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
    flatCache.set(color, m);
  }
  return m;
}

/** A line of letters lying flat on the ground (no physics). */
export function StaticLine({
  text,
  size,
  position,
  color = PALETTE.ink,
  rotationY = 0,
}: {
  text: string;
  size: number;
  position: [number, number, number];
  color?: string;
  rotationY?: number;
}) {
  const { offsets } = layoutLine(text, size, 0.08);
  const material = flatMaterial(color);
  // laid flat (normal up) and turned so it reads for a viewer arriving from -z
  return (
    <group position={position} rotation={[0, Math.PI + rotationY, 0]}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {[...text].map((ch, i) =>
          ch === " " ? null : (
            <group key={i} position={[offsets[i], 0, 0]}>
              <Text3D font={fontData as unknown as string} size={size} height={0.04} curveSegments={5} material={material} receiveShadow>
                {ch}
              </Text3D>
            </group>
          ),
        )}
      </group>
    </group>
  );
}

/** A line of upright letters on a sign or lintel (no physics). */
export function SignLine({
  text,
  size,
  position,
  color = "#F6F1E7",
  rotationY = 0,
  depth = 0.25,
}: {
  text: string;
  size: number;
  position: [number, number, number];
  color?: string;
  rotationY?: number;
  depth?: number;
}) {
  const { offsets } = layoutLine(text, size, 0.08);
  const material = flatMaterial(color);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {[...text].map((ch, i) =>
        ch === " " ? null : (
          <group key={i} position={[offsets[i], 0, 0]}>
            <Text3D font={fontData as unknown as string} size={size} height={depth} curveSegments={5} material={material} castShadow>
              {ch}
            </Text3D>
          </group>
        ),
      )}
    </group>
  );
}
