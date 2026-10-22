"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import * as THREE from "three";
import Environment from "./Environment";
import Vehicle, { SPAWN } from "./Vehicle";
import FollowCamera from "./FollowCamera";
import Letters from "./Letters";
import Zones from "./Zones";
import Props from "./Props";
import { setWorld, world } from "./store";
import { useKeyboardControls } from "./useControls";

/** Flips the world from loading to the intro once physics and meshes exist. */
function Ready() {
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (world.phase === "loading") setWorld({ phase: "intro" });
    }, 400);
    return () => window.clearTimeout(t);
  }, []);
  return null;
}

export default function World() {
  useKeyboardControls();
  const [dense] = useState(() => typeof window !== "undefined" && window.innerWidth >= 960);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setWorld({ reducedMotion: mq.matches });
    apply();
    mq.addEventListener("change", apply);
    const touch = window.matchMedia("(pointer: coarse)").matches;
    setWorld({ touch });
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <Canvas
      shadows={{ type: THREE.PCFSoftShadowMap }}
      dpr={[1, dense ? 1.75 : 1.5]}
      camera={{ fov: 42, near: 0.5, far: 900, position: [18, 26, 34] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl, camera }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        camera.lookAt(SPAWN.x, 2, SPAWN.z + 20);
      }}
    >
      <Suspense fallback={null}>
        <Physics gravity={[0, -24, 0]} timeStep={1 / 60}>
          <Environment dense={dense} />
          <Ready />
          <Vehicle />
          <Letters />
          <Zones />
          <Props dense={dense} />
        </Physics>
      </Suspense>
      <FollowCamera />
    </Canvas>
  );
}
