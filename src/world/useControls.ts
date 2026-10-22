"use client";

import { useEffect } from "react";
import { resetCar, setWorld, world } from "./store";

const KEYS: Record<string, keyof typeof held> = {
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  Space: "brake",
  ShiftLeft: "boost",
  ShiftRight: "boost",
};

const held = { up: false, down: false, left: false, right: false, brake: false, boost: false };

function apply() {
  // keyboard wins when any key is held; otherwise the joystick's values stay
  const any = held.up || held.down || held.left || held.right;
  if (any) {
    world.input.forward = (held.up ? 1 : 0) - (held.down ? 1 : 0);
    world.input.steer = (held.left ? 1 : 0) - (held.right ? 1 : 0);
  } else if (!world.touch) {
    world.input.forward = 0;
    world.input.steer = 0;
  }
  world.input.brake = held.brake;
  world.input.boost = held.boost;
}

/** Keyboard driving. The touch joystick writes to the same input object. */
export function useKeyboardControls() {
  useEffect(() => {
    const typing = (e: KeyboardEvent) => e.target instanceof HTMLElement && /^(INPUT|TEXTAREA)$/.test(e.target.tagName);
    const down = (e: KeyboardEvent) => {
      if (typing(e) || e.metaKey || e.ctrlKey) return;
      const k = KEYS[e.code];
      if (k) {
        e.preventDefault();
        held[k] = true;
        apply();
      } else if (e.code === "KeyR") {
        resetCar();
      } else if (e.code === "Escape") {
        setWorld({ panel: null });
      } else if (e.code === "KeyH") {
        setWorld({ horn: world.horn + 1 });
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = KEYS[e.code];
      if (k) {
        held[k] = false;
        apply();
      }
    };
    const blur = () => {
      (Object.keys(held) as (keyof typeof held)[]).forEach((k) => (held[k] = false));
      apply();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);
}
