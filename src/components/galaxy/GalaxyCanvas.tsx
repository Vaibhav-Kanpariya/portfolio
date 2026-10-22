"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import Dust from "./Dust";
import Constellation from "./Constellation";
import CameraRig from "./CameraRig";
import MastermindStory from "./MastermindStory";
import NtnStory from "./NtnStory";
import SkillsPile from "./SkillsPile";
import Effects from "./Effects";
import { regions } from "./layout";
import { setGalaxy } from "./store";

export default function GalaxyCanvas() {
  const [dpr, setDpr] = useState<[number, number]>([1, 1.75]);
  // bloom on desktop; phones and struggling machines get the raw render
  const [quality, setQuality] = useState<"high" | "low">(() =>
    typeof window !== "undefined" && window.innerWidth >= 960 ? "high" : "low",
  );
  const [dustCount] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 760 ? 3800 : 8500,
  );

  return (
    <Canvas
      dpr={dpr}
      camera={{ fov: 50, near: 0.1, far: 500, position: regions.intro.camera }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      onCreated={({ gl }) => gl.setClearColor("#060A18")}
      onPointerMissed={() => setGalaxy({ selected: null })}
      aria-hidden="true"
    >
      <PerformanceMonitor
        onDecline={() => {
          setDpr([1, 1]);
          setQuality("low");
        }}
      />
      <Dust count={dustCount} />
      <Constellation />
      <MastermindStory />
      <NtnStory />
      <SkillsPile />
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 12, 8]} intensity={1.3} />
      <CameraRig />
      {quality === "high" && <Effects />}
    </Canvas>
  );
}
