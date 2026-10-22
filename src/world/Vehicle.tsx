"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody, useBeforePhysicsStep, useRapier, type RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useWorld, world } from "./store";

/*
  A small rover. The chassis is one dynamic body; the wheels are raycasts
  handled by Rapier's vehicle controller (the same idea as the cannon.js
  raycast vehicle Bruno Simon's car uses), so it has real suspension and
  can be pushed around by the things it hits.
*/

export const SPAWN = new THREE.Vector3(0, 1.2, -18);
const HALF: [number, number, number] = [0.95, 0.32, 1.7]; // chassis half extents
const WHEEL_RADIUS = 0.46;
const WHEEL_X = 0.98;
const WHEEL_FRONT_Z = 1.15;
const WHEEL_BACK_Z = -1.15;
const WHEEL_Y = -0.12;
const REST = 0.42;
const ENGINE = 125;
const BOOST = 1.6;
const BRAKE = 2.2;
const MAX_STEER = 0.55;

const wheelOffsets: [number, number, number][] = [
  [-WHEEL_X, WHEEL_Y, WHEEL_FRONT_Z],
  [WHEEL_X, WHEEL_Y, WHEEL_FRONT_Z],
  [-WHEEL_X, WHEEL_Y, WHEEL_BACK_Z],
  [WHEEL_X, WHEEL_Y, WHEEL_BACK_Z],
];

const BODY = "#F25F5C";
const INK = "#1E2140";
const RIM = "#E9EDF8";
const TYRE = "#22233A";

function Wheel() {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, 0.36, 18]} />
        <meshStandardMaterial color={TYRE} roughness={0.9} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[WHEEL_RADIUS * 0.55, WHEEL_RADIUS * 0.55, 0.37, 12]} />
        <meshStandardMaterial color={RIM} roughness={0.4} metalness={0.2} />
      </mesh>
    </group>
  );
}

function Body({ headlights }: { headlights: React.RefObject<THREE.MeshStandardMaterial | null> }) {
  return (
    <group>
      {/* lower body */}
      <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[1.9, 0.5, 3.4]} />
        <meshStandardMaterial color={BODY} roughness={0.5} />
      </mesh>
      {/* nose wedge */}
      <mesh castShadow position={[0, 0.02, 1.85]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[1.7, 0.35, 0.6]} />
        <meshStandardMaterial color={BODY} roughness={0.5} />
      </mesh>
      {/* cabin */}
      <mesh castShadow position={[0, 0.62, -0.35]}>
        <boxGeometry args={[1.5, 0.62, 1.7]} />
        <meshStandardMaterial color={INK} roughness={0.35} metalness={0.1} />
      </mesh>
      {/* windshield */}
      <mesh position={[0, 0.6, 0.55]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[1.42, 0.55, 0.08]} />
        <meshStandardMaterial color="#9fd8ff" roughness={0.1} metalness={0.3} transparent opacity={0.7} />
      </mesh>
      {/* roof rack / antenna */}
      <mesh castShadow position={[0.55, 1.05, -0.9]}>
        <cylinderGeometry args={[0.03, 0.03, 0.9, 6]} />
        <meshStandardMaterial color={RIM} />
      </mesh>
      <mesh position={[0.55, 1.52, -0.9]}>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshStandardMaterial color="#52E3F2" emissive="#52E3F2" emissiveIntensity={1.4} />
      </mesh>
      {/* headlights */}
      {[-0.6, 0.6].map((x) => (
        <mesh key={x} position={[x, 0.08, 1.98]}>
          <boxGeometry args={[0.32, 0.16, 0.08]} />
          <meshStandardMaterial ref={x < 0 ? headlights : undefined} color="#FFF2C0" emissive="#FFF2C0" emissiveIntensity={1.2} />
        </mesh>
      ))}
      {/* tail lights */}
      {[-0.65, 0.65].map((x) => (
        <mesh key={x} position={[x, 0.08, -1.72]}>
          <boxGeometry args={[0.3, 0.14, 0.06]} />
          <meshStandardMaterial color="#FF3B4E" emissive="#FF3B4E" emissiveIntensity={0.9} />
        </mesh>
      ))}
      {/* bumper */}
      <mesh castShadow position={[0, -0.12, 1.75]}>
        <boxGeometry args={[1.95, 0.18, 0.2]} />
        <meshStandardMaterial color={INK} />
      </mesh>
    </group>
  );
}

export default function Vehicle() {
  const chassis = useRef<RapierRigidBody>(null);
  const wheels = useRef<(THREE.Group | null)[]>([]);
  const headlights = useRef<THREE.MeshStandardMaterial>(null);
  const { world: physics } = useRapier();
  const controller = useRef<ReturnType<typeof physics.createVehicleController> | null>(null);
  const resetCount = useWorld((s) => s.resetCount);
  const phase = useWorld((s) => s.phase);
  const tmpV = useMemo(() => new THREE.Vector3(), []);
  const tmpQ = useMemo(() => new THREE.Quaternion(), []);
  const flippedFor = useRef(0);

  // build the vehicle once the chassis body exists
  useEffect(() => {
    const body = chassis.current;
    if (!body) return;
    const v = physics.createVehicleController(body);
    wheelOffsets.forEach((o) => {
      v.addWheel({ x: o[0], y: o[1], z: o[2] }, { x: 0, y: -1, z: 0 }, { x: -1, y: 0, z: 0 }, REST, WHEEL_RADIUS);
    });
    for (let i = 0; i < 4; i++) {
      v.setWheelSuspensionStiffness(i, 32);
      v.setWheelSuspensionCompression(i, 2.4);
      v.setWheelSuspensionRelaxation(i, 3.6);
      v.setWheelMaxSuspensionTravel(i, 0.5);
      v.setWheelFrictionSlip(i, 1.6);
      v.setWheelSideFrictionStiffness(i, 0.8);
    }
    controller.current = v;
    return () => {
      physics.removeVehicleController(v);
      controller.current = null;
    };
  }, [physics]);

  // reset: back to spawn, upright, still
  useEffect(() => {
    const body = chassis.current;
    if (!body) return;
    body.setTranslation({ x: SPAWN.x, y: SPAWN.y + 0.5, z: SPAWN.z }, true);
    body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
    body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    body.setAngvel({ x: 0, y: 0, z: 0 }, true);
  }, [resetCount]);

  useBeforePhysicsStep((w) => {
    const v = controller.current;
    const body = chassis.current;
    if (!v || !body) return;
    const { forward, steer, brake, boost } = world.input;
    const driving = world.phase === "play";
    const speed = v.currentVehicleSpeed();
    // less steering lock at speed, so it doesn't spin out
    const lock = MAX_STEER * (1 - Math.min(Math.abs(speed) / 40, 0.6));
    const steering = driving ? steer * lock : 0;
    v.setWheelSteering(0, steering);
    v.setWheelSteering(1, steering);
    let force = driving ? forward * ENGINE * (boost ? BOOST : 1) : 0;
    // reversing is slower
    if (force < 0) force *= 0.6;
    // engine on all four wheels, a little more on the back
    v.setWheelEngineForce(0, force * 0.4);
    v.setWheelEngineForce(1, force * 0.4);
    v.setWheelEngineForce(2, force * 0.6);
    v.setWheelEngineForce(3, force * 0.6);
    // brake when asked, or gently when coasting so it doesn't roll forever
    const b = brake ? BRAKE : forward === 0 ? 0.25 : 0;
    for (let i = 0; i < 4; i++) v.setWheelBrake(i, b);
    v.updateVehicle(w.timestep);
  });

  useFrame((_, delta) => {
    const v = controller.current;
    const body = chassis.current;
    if (!v || !body) return;
    // wheel visuals follow the suspension and spin
    for (let i = 0; i < 4; i++) {
      const g = wheels.current[i];
      if (!g) continue;
      const c = v.wheelChassisConnectionPointCs(i);
      const len = v.wheelSuspensionLength(i) ?? REST;
      if (c) g.position.set(c.x, c.y - len, c.z);
      g.rotation.set(v.wheelRotation(i) ?? 0, v.wheelSteering(i) ?? 0, 0, "YXZ");
    }
    // publish the pose for the camera and the sun
    const p = body.translation();
    const q = body.rotation();
    world.car.position.set(p.x, p.y, p.z);
    world.car.quaternion.set(q.x, q.y, q.z, q.w);
    world.car.speed = v.currentVehicleSpeed();
    const dbg = window as unknown as { __car?: () => unknown; __teleport?: (x: number, z: number, yaw: number) => void };
    dbg.__car = () => ({ x: +p.x.toFixed(1), y: +p.y.toFixed(1), z: +p.z.toFixed(1), speed: +world.car.speed.toFixed(1), phase: world.phase });
    dbg.__teleport = (x, z, yaw) => {
      body.setTranslation({ x, y: 1.5, z }, true);
      body.setRotation({ x: 0, y: Math.sin(yaw / 2), z: 0, w: Math.cos(yaw / 2) }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    };
    // brake lights
    if (headlights.current) headlights.current.emissiveIntensity = world.input.brake ? 2.4 : 1.2;
    // fell off the world or stayed upside down: put it back
    tmpV.set(0, 1, 0).applyQuaternion(tmpQ.set(q.x, q.y, q.z, q.w));
    flippedFor.current = tmpV.y < 0.2 ? flippedFor.current + delta : 0;
    if (p.y < -20 || flippedFor.current > 2.5) {
      flippedFor.current = 0;
      body.setTranslation({ x: p.x, y: p.y < -20 ? SPAWN.y + 2 : p.y + 2, z: p.z }, true);
      if (p.y < -20) body.setTranslation({ x: SPAWN.x, y: SPAWN.y + 2, z: SPAWN.z }, true);
      body.setRotation({ x: 0, y: q.y, z: 0, w: q.w }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  });

  return (
    <RigidBody
      ref={chassis}
      colliders={false}
      position={[SPAWN.x, phase === "loading" ? SPAWN.y + 14 : SPAWN.y, SPAWN.z]}
      mass={1}
      linearDamping={0.12}
      angularDamping={1.2}
      canSleep={false}
      ccd
    >
      <CuboidCollider args={HALF} density={2.2} friction={0.6} restitution={0.1} />
      <Body headlights={headlights} />
      {wheelOffsets.map((o, i) => (
        <group
          key={i}
          position={o}
          ref={(el) => {
            wheels.current[i] = el;
          }}
        >
          <Wheel />
        </group>
      ))}
    </RigidBody>
  );
}
