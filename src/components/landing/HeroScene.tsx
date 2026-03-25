import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ── Animated water surface ─────────────────────────────────── */
function WaterSurface() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => new THREE.PlaneGeometry(40, 40, 128, 128), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.4;
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z =
        Math.sin(x * 0.4 + t) * 0.25 +
        Math.sin(y * 0.3 + t * 0.7) * 0.2 +
        Math.sin((x + y) * 0.25 + t * 1.2) * 0.15 +
        Math.cos(x * 0.6 - t * 0.5) * 0.1;
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} geometry={geo} rotation={[-Math.PI / 2.3, 0, 0]} position={[0, -1.5, 0]}>
      <meshStandardMaterial
        color="#0a1628"
        metalness={0.6}
        roughness={0.35}
        envMapIntensity={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ── Rising data particles (instanced) ──────────────────────── */
const PARTICLE_COUNT = 200;

function DataParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 30,
        y: Math.random() * 12 - 4,
        z: (Math.random() - 0.5) * 30,
        speed: 0.15 + Math.random() * 0.35,
        scale: 0.02 + Math.random() * 0.06,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    particles.forEach((p, i) => {
      const y = ((p.y + p.speed * t) % 12) - 4;
      dummy.position.set(
        p.x + Math.sin(t * 0.3 + p.phase) * 0.4,
        y,
        p.z + Math.cos(t * 0.2 + p.phase) * 0.4,
      );
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#0ea5e9" transparent opacity={0.55} />
    </instancedMesh>
  );
}

/* ── Accent glow lines ──────────────────────────────────────── */
function GlowLines() {
  const ref = useRef<THREE.Group>(null);

  const lines = useMemo(() => {
    const result: THREE.Vector3[][] = [];
    for (let i = 0; i < 6; i++) {
      const points: THREE.Vector3[] = [];
      const startX = (Math.random() - 0.5) * 20;
      const startZ = (Math.random() - 0.5) * 20;
      for (let j = 0; j < 20; j++) {
        points.push(
          new THREE.Vector3(
            startX + j * 0.8 + Math.sin(j * 0.5) * 1.5,
            -1.2 + Math.sin(j * 0.3) * 0.15,
            startZ + Math.cos(j * 0.4) * 2,
          ),
        );
      }
      result.push(points);
    }
    return result;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.05) * 0.1;
    }
  });

  return (
    <group ref={ref}>
      {lines.map((pts, i) => {
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({ color: '#0ea5e9', transparent: true, opacity: 0.12 });
        const obj = new THREE.Line(geo, mat);
        return <primitive key={i} object={obj} />;
      })}
    </group>
  );
}

/* ── Main exported scene ─────────────────────────────────────── */
export default function HeroScene() {
  return (
    <div className="landing-hero__canvas">
      <Canvas
        camera={{ position: [0, 4, 12], fov: 50, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <fog attach="fog" args={['#060a14', 8, 35]} />
        <ambientLight intensity={0.15} />
        <directionalLight position={[5, 8, 5]} intensity={0.6} color="#0ea5e9" />
        <directionalLight position={[-4, 3, -6]} intensity={0.2} color="#38bdf8" />
        <pointLight position={[0, 3, 0]} intensity={0.4} color="#0ea5e9" distance={15} />
        <WaterSurface />
        <DataParticles />
        <GlowLines />
      </Canvas>
    </div>
  );
}
