"use client";

import { EffectComposer, Bloom } from "@react-three/postprocessing";

/**
 * A restrained bloom so the hottest points (star cores, the orb, emissive
 * agents) bleed light. Desktop only; phones get the raw render.
 */
export default function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={0.82} luminanceSmoothing={0.2} intensity={0.75} mipmapBlur radius={0.55} />
    </EffectComposer>
  );
}
