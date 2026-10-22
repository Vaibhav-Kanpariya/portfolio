"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { regionOrder } from "@/content/portfolio";
import { regions } from "./layout";
import { galaxy } from "./store";

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/**
 * Flies the camera between scroll stops. The camera holds still while a
 * section is being read and only travels in the last part of the gap to the
 * next stop, so text and scene stay in sync.
 */
export default function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);

  const { curve, targets } = useMemo(() => {
    const pts = regionOrder.map((id) => new THREE.Vector3(...regions[id].camera));
    return {
      curve: new THREE.CatmullRomCurve3(pts, false, "centripetal"),
      targets: regionOrder.map((id) => new THREE.Vector3(...regions[id].target)),
    };
  }, []);

  const look = useRef(new THREE.Vector3(...regions.intro.target));
  const desired = useRef(new THREE.Vector3());
  const desiredLook = useRef(new THREE.Vector3());
  const first = useRef(true);

  // On wide screens the text column sits on the left, so shift the
  // projection centre right; the focused star lands beside the text.
  useEffect(() => {
    const { width, height } = size;
    if (width >= 960) camera.setViewOffset(width, height, -width * 0.13, 0, width, height);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }, [camera, size]);

  useFrame((_, delta) => {
    const n = regionOrder.length;
    const s = Math.min(Math.max(galaxy.stop, 0), n - 1);
    const i = Math.min(Math.floor(s), n - 2);
    // reduced motion: cut between views instead of flying
    const e = galaxy.reducedMotion ? (s - i > 0.75 ? 1 : 0) : smoothstep(0.5, 0.95, s - i);

    curve.getPoint((i + e) / (n - 1), desired.current);
    desiredLook.current.lerpVectors(targets[i], targets[i + 1], e);

    if (!galaxy.reducedMotion) {
      desired.current.x += galaxy.pointer.x * 1.4;
      desired.current.y += galaxy.pointer.y * 0.9;
    }

    const k = first.current || galaxy.reducedMotion ? 1 : 1 - Math.exp(-delta * 2.4);
    first.current = false;
    camera.position.lerp(desired.current, k);
    look.current.lerp(desiredLook.current, k);
    camera.lookAt(look.current);
  });

  return null;
}
