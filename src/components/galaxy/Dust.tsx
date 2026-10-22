"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { galaxy } from "./store";

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float twinkle = 0.65 + 0.35 * sin(uTime * (0.6 + aSeed * 1.8) + aSeed * 40.0);
    float depth = -mv.z;
    // cap the size so dust passing close to the camera stays a speck, not a blob
    gl_PointSize = min(aSize * (60.0 / depth) * twinkle, 4.5) * uPixelRatio;
    vColor = aColor;
    // fade out dust right in front of the lens
    vAlpha = twinkle * smoothstep(1.5, 7.0, depth);
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    gl_FragColor = vec4(vColor, a * vAlpha * 0.85);
  }
`;

function seededRandom(start: number) {
  let seed = start;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/** Background spiral of faint dust. Purely decorative. */
export default function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const seeds = new Float32Array(count);

    const inner = new THREE.Color("#F6D9B8");
    const mid = new THREE.Color("#8C9BFF");
    const outer = new THREE.Color("#3B4F9E");
    const tmp = new THREE.Color();

    const rand = seededRandom(7);
    const gauss = () => (rand() + rand() + rand() - 1.5) / 1.5;

    const arms = 3;
    const radius = 42;
    for (let i = 0; i < count; i++) {
      const r = Math.pow(rand(), 1.6) * radius;
      const arm = ((i % arms) / arms) * Math.PI * 2;
      const spin = r * 0.12;
      const scatter = 0.6 + r * 0.09;
      const a = arm + spin;
      const x = Math.cos(a) * r + gauss() * scatter;
      const z = Math.sin(a) * r + gauss() * scatter;
      const y = gauss() * (1.6 - (r / radius) * 0.9);
      positions.set([x, y, z], i * 3);

      const t = r / radius;
      if (t < 0.35) tmp.copy(inner).lerp(mid, t / 0.35);
      else tmp.copy(mid).lerp(outer, (t - 0.35) / 0.65);
      colors.set([tmp.r, tmp.g, tmp.b], i * 3);

      sizes[i] = 0.6 + rand() * 1.6 + (rand() > 0.985 ? 2.5 : 0);
      seeds[i] = rand();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry, material };
  }, [count]);

  useFrame((state, delta) => {
    const points = ref.current;
    if (!points) return;
    const mat = points.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = galaxy.reducedMotion ? 0 : state.clock.elapsedTime;
    mat.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    if (!galaxy.reducedMotion) points.rotation.y += delta * 0.006;
  });

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
}
