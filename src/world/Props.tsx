"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { WORLD_HALF } from "./Environment";
import { ZONES } from "./Zones";

const KEEP_CLEAR: [number, number, number][] = [
  [0, 0, 0], // spawn + letters
  ...Object.values(ZONES).map((v) => [v.x, v.z, 0] as [number, number, number]),
];
const CLEAR_RADIUS = 34;

function scatter(count: number, seed: number, minR: number, maxR: number) {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const out: { x: number; z: number; r: number; rot: number }[] = [];
  let guard = 0;
  while (out.length < count && guard++ < count * 40) {
    const x = (rand() * 2 - 1) * (WORLD_HALF - 6);
    const z = (rand() * 2 - 1) * (WORLD_HALF - 6);
    const tooClose = KEEP_CLEAR.some(([cx, cz]) => Math.hypot(x - cx, z - cz) < CLEAR_RADIUS);
    // keep the career road clear too
    const onRoad = Math.abs(x - ZONES.career.x) < 12 && z > ZONES.career.z - 15 && z < ZONES.career.z + 85;
    if (tooClose || onRoad) continue;
    out.push({ x, z, r: minR + rand() * (maxR - minR), rot: rand() * Math.PI * 2 });
  }
  return out;
}

const tmp = new THREE.Object3D();

/** Low-poly trees: two cones on a trunk, instanced. Decorative only. */
function Trees({ count }: { count: number }) {
  const spots = useMemo(() => scatter(count, 31, 0.8, 1.5), [count]);
  const top = useRef<THREE.InstancedMesh>(null);
  const mid = useRef<THREE.InstancedMesh>(null);
  const trunk = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    spots.forEach((p, i) => {
      const h = 5 * p.r;
      tmp.position.set(p.x, h * 0.78, p.z);
      tmp.rotation.set(0, p.rot, 0);
      tmp.scale.set(p.r * 1.0, p.r, p.r * 1.0);
      tmp.updateMatrix();
      top.current?.setMatrixAt(i, tmp.matrix);
      tmp.position.set(p.x, h * 0.48, p.z);
      tmp.scale.set(p.r * 1.35, p.r, p.r * 1.35);
      tmp.updateMatrix();
      mid.current?.setMatrixAt(i, tmp.matrix);
      tmp.position.set(p.x, h * 0.15, p.z);
      tmp.scale.set(p.r, p.r, p.r);
      tmp.updateMatrix();
      trunk.current?.setMatrixAt(i, tmp.matrix);
    });
    [top, mid, trunk].forEach((r) => {
      if (r.current) r.current.instanceMatrix.needsUpdate = true;
    });
  }, [spots]);

  return (
    <group>
      <instancedMesh ref={top} args={[undefined, undefined, spots.length]} castShadow receiveShadow>
        <coneGeometry args={[1.4, 3.2, 7]} />
        <meshStandardMaterial color="#5FBF9A" flatShading />
      </instancedMesh>
      <instancedMesh ref={mid} args={[undefined, undefined, spots.length]} castShadow receiveShadow>
        <coneGeometry args={[1.9, 3.0, 7]} />
        <meshStandardMaterial color="#4AA985" flatShading />
      </instancedMesh>
      <instancedMesh ref={trunk} args={[undefined, undefined, spots.length]} castShadow>
        <cylinderGeometry args={[0.28, 0.36, 1.6, 7]} />
        <meshStandardMaterial color="#8A5A3C" flatShading />
      </instancedMesh>
    </group>
  );
}

/** Rocks you can bump into. */
function Rocks({ count }: { count: number }) {
  const spots = useMemo(() => scatter(count, 77, 0.9, 2.4), [count]);
  return (
    <group>
      {spots.map((p, i) => (
        <RigidBody key={i} type="fixed" colliders="hull" position={[p.x, p.r * 0.55, p.z]} rotation={[p.rot * 0.3, p.rot, 0]}>
          <mesh castShadow receiveShadow scale={[p.r * 1.3, p.r * 0.9, p.r]}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#C9B9A4" flatShading roughness={1} />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
}

export default function Props({ dense }: { dense: boolean }) {
  return (
    <>
      <Trees count={dense ? 140 : 70} />
      <Rocks count={dense ? 26 : 14} />
    </>
  );
}
