import * as THREE from "three";
import { profile } from "@/content/portfolio";
import { regions } from "./layout";

/**
 * Samples the visitor's first view of the name into 3D points.
 *
 * The name is drawn on a canvas in the site's display face, sampled where
 * ink exists, then each sample is un-projected through a copy of the intro
 * camera so the letters sit on a plane in front of it. The dust particles
 * fly to these points on load and leave them as the visitor scrolls.
 */
/** The display face as next/font registered it (a generated family name). */
export function displayFontFamily() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--font-archivo").trim();
  return v ? `${v}, ui-sans-serif, system-ui, sans-serif` : `ui-sans-serif, system-ui, sans-serif`;
}

/** Resolves once the display face can be drawn on a canvas. */
export async function waitForDisplayFont() {
  try {
    await document.fonts.load(`820 100px ${displayFontFamily()}`);
    await document.fonts.ready;
  } catch {
    /* fall back to whatever is available */
  }
}

export function sampleNamePoints(
  width: number,
  height: number,
  maxPoints: number,
  viewOffsetX: number,
  viewOffsetY = 0,
): { points: Float32Array; count: number } {
  const narrow = width < 760;
  const cw = 1200;
  const ch = Math.round((cw * height) / width);
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, cw, ch);
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "alphabetic";
  // the wide cut of the display face, where the browser supports it on canvas
  const c = ctx as CanvasRenderingContext2D & { fontStretch?: string };
  if ("fontStretch" in c) c.fontStretch = "expanded";

  const family = displayFontFamily();
  const fit = (text: string, maxW: number, start: number) => {
    let size = start;
    for (; size > 20; size -= 2) {
      ctx.font = `820 ${size}px ${family}`;
      if (ctx.measureText(text).width <= maxW) break;
    }
    return size;
  };

  const lines = narrow ? [profile.firstName, profile.lastName] : [profile.name];
  const maxW = narrow ? cw * 0.86 : cw * 0.76;
  const size = Math.min(...lines.map((l) => fit(l, maxW, narrow ? 340 : 260)));
  ctx.font = `820 ${size}px ${family}`;
  // vertical placement: upper half on phones (copy sits below), upper-middle on desktop;
  // on desktop also nudged left, clear of the section nav
  const lineH = size * 0.92;
  const blockH = lineH * lines.length;
  const top = narrow ? ch * 0.2 : ch * 0.5 - blockH / 2 - ch * 0.1;
  const shift = narrow ? 0 : -cw * 0.05;
  lines.forEach((line, i) => {
    const w = ctx.measureText(line).width;
    ctx.fillText(line, (cw - w) / 2 + shift, top + lineH * (i + 1) - size * 0.12);
  });

  const data = ctx.getImageData(0, 0, cw, ch).data;
  // choose a sampling step so we land near maxPoints
  let ink = 0;
  for (let i = 3; i < data.length; i += 4 * 4) if (data[i - 3] > 128) ink++;
  ink *= 4;
  const step = Math.max(1, Math.round(Math.sqrt(ink / maxPoints)));

  const xs: number[] = [];
  const ys: number[] = [];
  for (let y = 0; y < ch; y += step) {
    for (let x = 0; x < cw; x += step) {
      if (data[(y * cw + x) * 4] > 128) {
        xs.push(x + (Math.random() - 0.5) * step);
        ys.push(y + (Math.random() - 0.5) * step);
      }
    }
  }

  // intro camera copy
  const cam = new THREE.PerspectiveCamera(50, width / height, 0.1, 500);
  cam.position.set(...regions.intro.camera);
  cam.lookAt(new THREE.Vector3(...regions.intro.target));
  if (viewOffsetX || viewOffsetY) cam.setViewOffset(width, height, viewOffsetX, viewOffsetY, width, height);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();

  const distance = 30;
  const dir = new THREE.Vector3();
  cam.getWorldDirection(dir);
  const planePoint = cam.position.clone().addScaledVector(dir, distance);
  const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(dir, planePoint);
  const ray = new THREE.Ray();
  const ndc = new THREE.Vector3();
  const hit = new THREE.Vector3();

  const n = Math.min(xs.length, maxPoints);
  const points = new Float32Array(n * 3);
  // shuffle so truncation keeps an even spread
  const order = Array.from({ length: xs.length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  for (let k = 0; k < n; k++) {
    const i = order[k];
    ndc.set((xs[i] / cw) * 2 - 1, -((ys[i] / ch) * 2 - 1), 0.5);
    ndc.unproject(cam);
    ray.set(cam.position, ndc.sub(cam.position).normalize());
    ray.intersectPlane(plane, hit);
    points[k * 3] = hit.x;
    points[k * 3 + 1] = hit.y;
    points[k * 3 + 2] = hit.z;
  }
  return { points, count: n };
}

/** Where the pointer is on the name's plane, in world space. */
export function pointerOnNamePlane(
  camera: THREE.Camera,
  px: number,
  py: number,
  out: THREE.Vector3,
) {
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  const planePoint = camera.position.clone().addScaledVector(dir, 30);
  const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(dir, planePoint);
  const ndc = new THREE.Vector3(px, py, 0.5).unproject(camera);
  const ray = new THREE.Ray(camera.position, ndc.sub(camera.position).normalize());
  return ray.intersectPlane(plane, out);
}
