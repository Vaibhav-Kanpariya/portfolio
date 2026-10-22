"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";
import { setWorld, useWorld, world } from "./store";
import { SPAWN } from "./Vehicle";

const BEHIND = new THREE.Vector3(0, 7.2, -13.5);
const LOOK_AHEAD = new THREE.Vector3(0, 1.4, 5);
const desired = new THREE.Vector3();
const look = new THREE.Vector3();
const yawQ = new THREE.Quaternion();
const euler = new THREE.Euler();

/**
 * Chase camera. During the intro GSAP flies it from a high shot of the
 * falling letters down to its seat behind the car; after that it follows
 * with a soft spring, pulling back a little at speed.
 */
export default function FollowCamera() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const aspect = useThree((s) => s.viewport.aspect);
  const phase = useWorld((s) => s.phase);
  // portrait screens see less to the sides, so sit further back and higher
  const fit = aspect < 1 ? 1.55 : aspect < 1.4 ? 1.2 : 1;
  const lookNow = useRef(new THREE.Vector3(0, 1, 0));
  const introDone = useRef(false);

  // intro flight
  useEffect(() => {
    if (phase !== "intro") return;
    const start = { x: 18, y: 26, z: 34 };
    const end = { x: SPAWN.x + BEHIND.x * fit, y: SPAWN.y + BEHIND.y * fit, z: SPAWN.z + BEHIND.z * fit };
    camera.position.set(start.x, start.y, start.z);
    lookNow.current.set(0, 2, 4);
    const proxy = { ...start, lx: 0, ly: 2, lz: 4 };
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onUpdate: () => {
        camera.position.set(proxy.x, proxy.y, proxy.z);
        lookNow.current.set(proxy.lx, proxy.ly, proxy.lz);
        camera.lookAt(lookNow.current);
      },
      onComplete: () => {
        introDone.current = true;
        setWorld({ phase: "play" });
      },
    });
    // real elapsed time even on slow frames, so the intro can't stall
    gsap.ticker.lagSmoothing(0);
    const dur = world.reducedMotion ? 0.01 : 4.2;
    tl.to(proxy, { x: end.x, y: end.y, z: end.z, duration: dur }, 0);
    tl.to(proxy, { lx: SPAWN.x, ly: SPAWN.y + 1.4, lz: SPAWN.z + 5, duration: dur * 0.8 }, dur * 0.2);
    // any input skips to the end
    const skip = () => tl.progress(1);
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });
    return () => {
      tl.kill();
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [phase, camera, fit]);

  useFrame((_, delta) => {
    if (world.phase !== "play") return;
    // debug viewpoint for automated checks: window.__look(x,y,z, tx,ty,tz)
    const dbg = window as unknown as { __look?: (...n: number[]) => void; __lookAt?: number[] | null };
    if (!dbg.__look) {
      dbg.__look = (...n: number[]) => {
        dbg.__lookAt = n.length ? n : null;
      };
    }
    if (dbg.__lookAt) {
      const [x, y, z, tx, ty, tz] = dbg.__lookAt;
      camera.position.set(x, y, z);
      camera.lookAt(tx, ty, tz);
      return;
    }
    const car = world.car;
    // yaw only: the camera stays level when the car bounces or rolls
    euler.setFromQuaternion(car.quaternion, "YXZ");
    yawQ.setFromEuler(euler.set(0, euler.y, 0));
    const pull = (1 + Math.min(Math.abs(car.speed) / 30, 0.45)) * fit;
    desired.copy(BEHIND).multiplyScalar(pull).applyQuaternion(yawQ).add(car.position);
    desired.y = Math.max(desired.y, 2.5);
    look.copy(LOOK_AHEAD).applyQuaternion(yawQ).add(car.position);
    const k = 1 - Math.exp(-delta * 3.2);
    camera.position.lerp(desired, k);
    lookNow.current.lerp(look, 1 - Math.exp(-delta * 5));
    camera.lookAt(lookNow.current);
  });

  return null;
}
