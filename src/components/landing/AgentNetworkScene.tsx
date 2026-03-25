import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

/* ── Agent metadata ──────────────────────────────────────────── */
const AGENTS = [
  { name: 'Forecasting', color: '#38bdf8', angle: 0, desc: 'LSTM + PINN' },
  { name: 'Monitoring', color: '#22c55e', angle: Math.PI / 2, desc: 'IoT Sensors' },
  { name: 'Risk Analysis', color: '#f97316', angle: Math.PI, desc: 'XGBoost' },
  { name: 'Emergency', color: '#dc2626', angle: (3 * Math.PI) / 2, desc: 'Response' },
];

const ORBIT_RADIUS = 3;

/* ── Central coordinator sphere ──────────────────────────────── */
function CoordinatorNode() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 2) * 0.05);
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#0ea5e9"
          emissiveIntensity={0.4}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      {/* Glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.75, 0.85, 64]} />
        <meshBasicMaterial color="#0ea5e9" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      <Html center distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <div className="landing-agent-label landing-agent-label--coordinator">
          <span className="font-semibold">Coordinator</span>
          <span className="opacity-60 text-[10px]">Supervisor Agent</span>
        </div>
      </Html>
    </group>
  );
}

/* ── Specialist orbiting node ────────────────────────────────── */
function SpecialistNode({ name, color, angle, desc }: typeof AGENTS[number]) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime() * 0.15;
    const a = angle + t;
    groupRef.current.position.set(
      Math.cos(a) * ORBIT_RADIUS,
      Math.sin(clock.getElapsedTime() * 0.5 + angle) * 0.3,
      Math.sin(a) * ORBIT_RADIUS,
    );
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 3 + angle) * 0.08);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>
      <Html center distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <div className="landing-agent-label">
          <span className="font-medium">{name}</span>
          <span className="opacity-50 text-[9px]">{desc}</span>
        </div>
      </Html>
    </group>
  );
}

/* ── Connection lines (data flow) ────────────────────────────── */
function ConnectionLines() {
  const groupRef = useRef<THREE.Group>(null);
  const lines = useMemo(() => AGENTS.map((_, i) => i), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime() * 0.15;
    groupRef.current.children.forEach((child, i) => {
      const a = AGENTS[i].angle + t;
      const line = child as THREE.Line;
      const positions = line.geometry.attributes.position;
      positions.setXYZ(0, 0, 0, 0);
      positions.setXYZ(1, Math.cos(a) * ORBIT_RADIUS, Math.sin(clock.getElapsedTime() * 0.5 + AGENTS[i].angle) * 0.3, Math.sin(a) * ORBIT_RADIUS);
      positions.needsUpdate = true;
    });
  });

  return (
    <group ref={groupRef}>
      {lines.map((i) => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0], 3));
        const mat = new THREE.LineBasicMaterial({ color: AGENTS[i].color, transparent: true, opacity: 0.25 });
        const obj = new THREE.Line(geo, mat);
        return <primitive key={i} object={obj} />;
      })}
    </group>
  );
}

/* ── Flowing particles along connections ─────────────────────── */
const FLOW_COUNT = 40;

function FlowParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() =>
    Array.from({ length: FLOW_COUNT }, (_, i) => ({
      agentIdx: i % AGENTS.length,
      t: Math.random(),
      speed: 0.3 + Math.random() * 0.4,
    })),
    [],
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();
    particles.forEach((p, i) => {
      const agent = AGENTS[p.agentIdx];
      const a = agent.angle + time * 0.15;
      const progress = (p.t + time * p.speed) % 1;
      const endX = Math.cos(a) * ORBIT_RADIUS;
      const endY = Math.sin(time * 0.5 + agent.angle) * 0.3;
      const endZ = Math.sin(a) * ORBIT_RADIUS;
      dummy.position.set(endX * progress, endY * progress, endZ * progress);
      dummy.scale.setScalar(0.04);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, FLOW_COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#0ea5e9" transparent opacity={0.6} />
    </instancedMesh>
  );
}

/* ── Orbit ring ──────────────────────────────────────────────── */
function OrbitRing() {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[ORBIT_RADIUS - 0.02, ORBIT_RADIUS + 0.02, 128]} />
      <meshBasicMaterial color="#0ea5e9" transparent opacity={0.06} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ── Exported scene ──────────────────────────────────────────── */
export default function AgentNetworkScene() {
  return (
    <div className="landing-agent-canvas">
      <Canvas
        camera={{ position: [0, 3, 7], fov: 40, near: 0.1, far: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <fog attach="fog" args={['#060a14', 6, 20]} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        <pointLight position={[0, 2, 0]} intensity={0.6} color="#0ea5e9" distance={10} />
        <CoordinatorNode />
        {AGENTS.map((agent) => (
          <SpecialistNode key={agent.name} {...agent} />
        ))}
        <ConnectionLines />
        <FlowParticles />
        <OrbitRing />
      </Canvas>
    </div>
  );
}
