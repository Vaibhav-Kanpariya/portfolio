"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { world } from "./store";

export const PALETTE = {
  sand: "#E8DAC4",
  sandDark: "#D8C6A8",
  skyTop: "#7C86CF",
  skyHorizon: "#EFD3BC",
  sun: "#FFE9CF",
  ink: "#1E2140",
};

export const WORLD_HALF = 160; // playable square, walls beyond

/* ───────── sky dome: a vertical gradient that also sets the fog colour ───────── */
const skyVertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const skyFragment = /* glsl */ `
  uniform vec3 uTop, uHorizon, uSun;
  uniform vec3 uSunDir;
  varying vec3 vWorld;
  void main() {
    vec3 d = normalize(vWorld);
    float h = clamp(d.y, 0.0, 1.0);
    vec3 c = mix(uHorizon, uTop, pow(h, 0.55));
    float s = pow(max(dot(d, normalize(uSunDir)), 0.0), 18.0);
    c += uSun * s * 0.6;
    // below the horizon fade to the ground colour so the seam never shows
    c = mix(c, uHorizon, smoothstep(0.0, -0.08, d.y));
    gl_FragColor = vec4(c, 1.0);
  }
`;

export const SUN_DIR = new THREE.Vector3(-0.45, 0.6, 0.35).normalize();

function Sky() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: skyVertex,
        fragmentShader: skyFragment,
        uniforms: {
          uTop: { value: new THREE.Color(PALETTE.skyTop) },
          uHorizon: { value: new THREE.Color(PALETTE.skyHorizon) },
          uSun: { value: new THREE.Color(PALETTE.sun) },
          uSunDir: { value: SUN_DIR },
        },
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
      }),
    [],
  );
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ camera }) => {
    // keep the dome centred on the camera so it never ends
    ref.current?.position.copy(camera.position);
  });
  return (
    <mesh ref={ref} material={material} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[800, 32, 16]} />
    </mesh>
  );
}

/* ───────── ground: sand with a faint dot grid for a sense of speed ───────── */
function groundTexture() {
  const s = 256;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = PALETTE.sand;
  ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = PALETTE.sandDark;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      ctx.beginPath();
      ctx.arc(x * 64 + 32, y * 64 + 32, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(80, 80);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function Ground() {
  const tex = useMemo(() => groundTexture(), []);
  return (
    <RigidBody type="fixed" colliders={false} friction={1}>
      <CuboidCollider args={[WORLD_HALF + 40, 1, WORLD_HALF + 40]} position={[0, -1, 0]} />
      {/* walls so nothing leaves the world */}
      <CuboidCollider args={[1, 10, WORLD_HALF + 40]} position={[WORLD_HALF, 10, 0]} />
      <CuboidCollider args={[1, 10, WORLD_HALF + 40]} position={[-WORLD_HALF, 10, 0]} />
      <CuboidCollider args={[WORLD_HALF + 40, 10, 1]} position={[0, 10, WORLD_HALF]} />
      <CuboidCollider args={[WORLD_HALF + 40, 10, 1]} position={[0, 10, -WORLD_HALF]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[(WORLD_HALF + 40) * 2, (WORLD_HALF + 40) * 2]} />
        <meshStandardMaterial map={tex} roughness={1} />
      </mesh>
    </RigidBody>
  );
}

/* ───────── sun with a shadow camera that follows the car ───────── */
function Sun({ quality }: { quality: number }) {
  const light = useRef<THREE.DirectionalLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const { scene } = useThree();
  useEffect(() => {
    scene.add(target);
    return () => {
      scene.remove(target);
    };
  }, [scene, target]);
  useFrame(() => {
    const l = light.current;
    if (!l) return;
    const p = world.car.position;
    target.position.set(p.x, 0, p.z);
    l.position.set(p.x + SUN_DIR.x * 60, SUN_DIR.y * 60, p.z + SUN_DIR.z * 60);
    l.target = target;
  });
  return (
    <directionalLight
      ref={light}
      color={PALETTE.sun}
      intensity={2.4}
      castShadow
      shadow-mapSize={[quality, quality]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.03}
      shadow-camera-near={5}
      shadow-camera-far={160}
      shadow-camera-left={-55}
      shadow-camera-right={55}
      shadow-camera-top={55}
      shadow-camera-bottom={-55}
    />
  );
}

export default function Environment({ dense }: { dense: boolean }) {
  return (
    <>
      <Sky />
      <fog attach="fog" args={[PALETTE.skyHorizon, 90, 260]} />
      <hemisphereLight args={[PALETTE.skyTop, PALETTE.sand, 0.9]} />
      <Sun quality={dense ? 2048 : 1024} />
      <Ground />
    </>
  );
}
