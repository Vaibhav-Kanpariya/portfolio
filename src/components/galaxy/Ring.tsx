"use client";

import { forwardRef, useMemo } from "react";
import * as THREE from "three";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const fragment = /* glsl */ `
  uniform float uFill, uAlpha, uInner;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    vec2 c = vUv - 0.5;
    float r = length(c) * 2.0;
    float band = smoothstep(uInner - 0.04, uInner, r) * (1.0 - smoothstep(0.96, 1.0, r));
    float ang = atan(c.x, c.y);           // 0 at top, clockwise
    float a01 = (ang + 3.14159265) / 6.2831853;
    a01 = 1.0 - fract(a01 + 0.5);
    float lit = step(a01, uFill);
    float track = 0.18;
    gl_FragColor = vec4(uColor, band * uAlpha * max(lit, track));
  }
`;

export type RingUniforms = {
  uFill: { value: number };
  uAlpha: { value: number };
  uInner: { value: number };
  uColor: { value: THREE.Color };
};

/** A flat progress ring that always faces the camera's up axis of its parent. */
const Ring = forwardRef<THREE.Mesh, { radius: number; color: string; inner?: number }>(function Ring(
  { radius, color, inner = 0.8 },
  ref,
) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uFill: { value: 0 },
          uAlpha: { value: 0 },
          uInner: { value: inner },
          uColor: { value: new THREE.Color(color) },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    [color, inner],
  );
  return (
    <mesh ref={ref} material={material}>
      <planeGeometry args={[radius * 2, radius * 2]} />
    </mesh>
  );
});

export default Ring;
