import React, { useRef, useState, Suspense, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { hotspots } from '../../data/dashboardData';

// ─── Model path — place a downloaded human-body.glb in /public/models/ ────────
const MODEL_PATH = '/models/human-body.glb';
// Silence the preload 404 if file is missing
useGLTF.preload(MODEL_PATH);

// ─── Anatomical hotspot 3-D positions (body-local space, Y-up) ───────────────
const HOTSPOT_3D: Record<string, [number, number, number]> = {
  head: [0.12, 1.72, 0.12],
  heart: [-0.07, 1.22, 0.15],
  lung: [0.09, 1.22, 0.15],
  abdomen: [0.00, 0.90, 0.15],
};

// ─── Vitals shown in each tooltip ────────────────────────────────────────────
const HOTSPOT_VITALS: Record<string, { label: string; value: string; unit: string }[]> = {
  head: [
    { label: 'Neural Status', value: 'Normal', unit: '' },
    { label: 'Reflexes', value: 'Intact', unit: '' },
    { label: 'Orientation', value: 'Full', unit: '' },
  ],
  heart: [
    { label: 'Heart Rate', value: '72', unit: 'bpm' },
    { label: 'Rhythm', value: 'Irregular', unit: '' },
    { label: 'HRV', value: '42', unit: 'ms' },
    { label: 'BP', value: '135/85', unit: 'mmHg' },
  ],
  lung: [
    { label: 'SpO₂', value: '99', unit: '%' },
    { label: 'Resp Rate', value: '14', unit: 'br/m' },
    { label: 'Chest', value: 'Clear', unit: '' },
  ],
  abdomen: [
    { label: 'Temperature', value: '36.8', unit: '°C' },
    { label: 'GI Status', value: 'Normal', unit: '' },
  ],
};

const STATUS_COLORS = {
  normal: { dot: '#63755A', fill: '#D2DECB' },
  active: { dot: '#6A608A', fill: '#E2DFEC' },
  warning: { dot: '#8A4B4B', fill: '#E8D5D5' },
} as const;

// ─── GLTF model — loads when /public/models/human-body.glb exists ─────────────
function GltfModel() {
  const { scene } = useGLTF(MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Enable shadows on every mesh
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // Apply SSS skin material
        mesh.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#C8957B'),
          roughness: 0.62,
          metalness: 0,
          thickness: 1.4,
          attenuationColor: new THREE.Color('#C84422'),
          attenuationDistance: 0.85,
          specularIntensity: 0.44,
          specularColor: new THREE.Color('#FFE0C8'),
          clearcoat: 0.06,
          clearcoatRoughness: 0.90,
          side: THREE.FrontSide,
        });
      }
    });

    // Normalise to fit the same space as the primitive body
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = 1.85 / Math.max(size.y, 0.01);

    group.scale.setScalar(scale);
    group.position.set(
      -center.x * scale,
      0.70 - center.y * scale,   // align centre with primitive body centre
      -center.z * scale,
    );
  }, [scene]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

// ─── ErrorBoundary — shows primitives when GLB is not found ──────────────────
class GltfBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { /* silently swallow */ }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

// ─── Primitive human body — used as placeholder & fallback ───────────────────
function PrimitiveBody() {
  // Single shared material created once
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#C8957B'),
    roughness: 0.62,
    metalness: 0,
    thickness: 1.4,
    attenuationColor: new THREE.Color('#C84422'),
    attenuationDistance: 0.85,
    specularIntensity: 0.44,
    specularColor: new THREE.Color('#FFE0C8'),
    clearcoat: 0.06,
    clearcoatRoughness: 0.90,
  }), []);

  const m = <primitive object={mat} attach="material" />;

  return (
    <group>
      {/* Head */}
      <mesh position={[0, 1.70, 0]}>
        <sphereGeometry args={[0.132, 26, 26]} />{m}
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.548, 0]}>
        <cylinderGeometry args={[0.055, 0.067, 0.115, 16]} />{m}
      </mesh>
      {/* Chest */}
      <mesh position={[0, 1.290, 0]} scale={[1.20, 1, 0.80]}>
        <capsuleGeometry args={[0.128, 0.22, 8, 20]} />{m}
      </mesh>
      {/* Abdomen */}
      <mesh position={[0, 0.978, 0]} scale={[1.05, 1, 0.76]}>
        <capsuleGeometry args={[0.114, 0.18, 8, 20]} />{m}
      </mesh>
      {/* Pelvis */}
      <mesh position={[0, 0.724, 0]} scale={[1.14, 0.72, 0.84]}>
        <sphereGeometry args={[0.118, 18, 18]} />{m}
      </mesh>
      {/* Shoulders */}
      {([-1, 1] as const).map(s => (
        <mesh key={s} position={[s * 0.218, 1.42, 0]}>
          <sphereGeometry args={[0.070, 14, 14]} />{m}
        </mesh>
      ))}
      {/* Upper arms */}
      {([-1, 1] as const).map(s => (
        <mesh key={s} position={[s * 0.248, 1.175, 0]} rotation={[0, 0, s * 0.14]}>
          <capsuleGeometry args={[0.055, 0.246, 6, 14]} />{m}
        </mesh>
      ))}
      {/* Elbows */}
      {([-1, 1] as const).map(s => (
        <mesh key={s} position={[s * 0.270, 0.870, 0]}>
          <sphereGeometry args={[0.053, 12, 12]} />{m}
        </mesh>
      ))}
      {/* Forearms */}
      {([-1, 1] as const).map(s => (
        <mesh key={s} position={[s * 0.280, 0.652, 0]} rotation={[0, 0, s * 0.07]}>
          <capsuleGeometry args={[0.044, 0.216, 6, 14]} />{m}
        </mesh>
      ))}
      {/* Hands */}
      {([-1, 1] as const).map(s => (
        <mesh key={s} position={[s * 0.285, 0.490, 0]} scale={[1, 0.8, 0.62]}>
          <sphereGeometry args={[0.054, 12, 12]} />{m}
        </mesh>
      ))}
      {/* Thighs */}
      {([-1, 1] as const).map(s => (
        <mesh key={s} position={[s * 0.112, 0.380, 0]}>
          <capsuleGeometry args={[0.076, 0.268, 6, 16]} />{m}
        </mesh>
      ))}
      {/* Knees */}
      {([-1, 1] as const).map(s => (
        <mesh key={s} position={[s * 0.110, 0.098, 0]}>
          <sphereGeometry args={[0.067, 12, 12]} />{m}
        </mesh>
      ))}
      {/* Shins */}
      {([-1, 1] as const).map(s => (
        <mesh key={s} position={[s * 0.106, -0.126, 0]}>
          <capsuleGeometry args={[0.059, 0.242, 6, 14]} />{m}
        </mesh>
      ))}
      {/* Feet */}
      {([-1, 1] as const).map(s => (
        <mesh key={s} position={[s * 0.106, -0.334, 0.022]} scale={[0.88, 0.50, 1.42]}>
          <sphereGeometry args={[0.066, 12, 12]} />{m}
        </mesh>
      ))}
    </group>
  );
}

// ─── Interactive anatomical marker ───────────────────────────────────────────
interface MarkerProps {
  hotspot: (typeof hotspots)[number];
  isActive: boolean;
  onSelect: (id: string) => void;
}

function Marker({ hotspot, isActive, onSelect }: MarkerProps) {
  const [hovered, setHovered] = useState(false);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const dotRef = useRef<THREE.Mesh>(null);

  const pos = HOTSPOT_3D[hotspot.id] ?? ([0, 0, 0] as [number, number, number]);
  const sc = STATUS_COLORS[hotspot.status];
  const isHeart = hotspot.id === 'heart';
  const isPulsing = isHeart || hotspot.status === 'active';

  // 72bpm heartbeat rings + smooth dot scale
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const bpm = 72;
    const period = 60 / bpm; // 0.833s

    if (isPulsing) {
      const beat = (t % period) / period;
      const pulse = Math.max(0, Math.sin(beat * Math.PI));

      if (ring1Ref.current) {
        ring1Ref.current.scale.setScalar(1 + pulse * 2.0);
        (ring1Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.50 * (1 - pulse);
      }
      const beat2 = ((t + 0.13) % period) / period;
      const p2 = Math.max(0, Math.sin(beat2 * Math.PI));
      if (ring2Ref.current) {
        ring2Ref.current.scale.setScalar(1 + p2 * 1.4);
        (ring2Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.32 * (1 - p2);
      }
    }

    if (dotRef.current) {
      const target = (hovered || isActive) ? 1.40 : 1.0;
      const cur = dotRef.current.scale.x;
      dotRef.current.scale.setScalar(cur + (target - cur) * 0.10);
    }
  });

  // tooltip offset — keep it inside the view
  const ttX = hotspot.id === 'heart' ? -0.55
    : hotspot.id === 'lung' ? 0.55
      : hotspot.id === 'head' ? 0.45
        : 0.48;

  const vitals = HOTSPOT_VITALS[hotspot.id] ?? [];

  return (
    <group position={pos}>
      {/* Pulse rings */}
      {isPulsing && (
        <>
          <mesh ref={ring1Ref}>
            <sphereGeometry args={[0.040, 12, 12]} />
            <meshBasicMaterial color={sc.dot} transparent opacity={0.45} depthWrite={false} />
          </mesh>
          <mesh ref={ring2Ref}>
            <sphereGeometry args={[0.040, 12, 12]} />
            <meshBasicMaterial color={sc.dot} transparent opacity={0.28} depthWrite={false} />
          </mesh>
        </>
      )}

      {/* Outer glow halo */}
      <mesh>
        <sphereGeometry args={[0.054, 14, 14]} />
        <meshBasicMaterial
          color={sc.dot}
          transparent
          opacity={(hovered || isActive) ? 0.22 : 0.08}
          depthWrite={false}
        />
      </mesh>

      {/* Main dot */}
      <mesh
        ref={dotRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        onClick={(e) => { e.stopPropagation(); onSelect(hotspot.id); }}
      >
        <sphereGeometry args={[0.036, 18, 18]} />
        <meshStandardMaterial
          color={(hovered || isActive) ? sc.dot : sc.fill}
          emissive={sc.dot}
          emissiveIntensity={(hovered || isActive) ? 0.65 : 0.22}
          roughness={0.22}
          metalness={0.14}
        />
      </mesh>

      {/* Bright inner core */}
      <mesh>
        <sphereGeometry args={[0.013, 10, 10]} />
        <meshBasicMaterial color={sc.dot} />
      </mesh>

      {/* ── HTML tooltip ── */}
      {hovered && (
        <Html
          position={[ttX, 0.04, 0]}
          distanceFactor={3.0}
          zIndexRange={[200, 0]}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div style={{
            background: 'linear-gradient(135deg, rgba(28,24,20,0.97) 0%, rgba(44,38,32,0.97) 100%)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '14px',
            padding: '13px 15px',
            minWidth: '168px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(12px)',
            fontFamily: '"Inter", system-ui, sans-serif',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: sc.dot, flexShrink: 0,
                boxShadow: `0 0 8px ${sc.dot}, 0 0 16px ${sc.dot}44`,
              }} />
              <span style={{
                color: '#FFFFFF', fontWeight: 700, fontSize: '11px',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                {hotspot.label}
              </span>
            </div>

            {/* Vital rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {vitals.map((v) => (
                <div key={v.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                  <span style={{
                    color: 'rgba(255,255,255,0.48)', fontSize: '9px',
                    letterSpacing: '0.07em', textTransform: 'uppercase',
                    fontFamily: '"JetBrains Mono","Courier New",monospace',
                  }}>
                    {v.label}
                  </span>
                  <span style={{
                    color: '#FFFFFF', fontWeight: 600, fontSize: '12px',
                    fontFamily: '"JetBrains Mono","Courier New",monospace',
                    whiteSpace: 'nowrap',
                  }}>
                    {v.value}
                    {v.unit && (
                      <span style={{ color: 'rgba(255,255,255,0.40)', fontSize: '9px', marginLeft: '3px' }}>
                        {v.unit}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Status footer */}
            <div style={{
              marginTop: '10px', paddingTop: '8px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: hotspot.status === 'warning' ? '#CF6679'
                  : hotspot.status === 'active' ? '#9E96C0'
                    : '#7FA070',
                boxShadow: `0 0 4px ${hotspot.status === 'warning' ? '#CF667988'
                    : hotspot.status === 'active' ? '#9E96C088'
                      : '#7FA07088'
                  }`,
              }} />
              <span style={{
                color: 'rgba(255,255,255,0.45)', fontSize: '9px',
                letterSpacing: '0.09em', textTransform: 'uppercase',
                fontFamily: '"JetBrains Mono","Courier New",monospace',
              }}>
                {hotspot.vitalSummary}
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── Scene lighting + body + controls ────────────────────────────────────────
interface SceneProps {
  activeHotspot: string;
  onHotspotChange: (id: string) => void;
}

function Scene({ activeHotspot, onHotspotChange }: SceneProps) {
  return (
    <>
      {/* ── Lighting ── */}
      {/* Ambient — very soft warm base */}
      <ambientLight intensity={0.22} color="#FFE8DC" />

      {/* Hemisphere sky/ground — warm above, deep red-brown below (skin scatter) */}
      <hemisphereLight args={['#FFF4EC', '#2A0A00', 0.45]} />

      {/* Key light — warm, upper-right-front (mimics Marmoset studio) */}
      <directionalLight
        position={[2.0, 3.5, 2.5]}
        intensity={1.30}
        color="#FFE0C4"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Fill light — cool, left side (separates from background) */}
      <directionalLight
        position={[-2.2, 1.5, 1.8]}
        intensity={0.40}
        color="#C4D4FF"
      />

      {/* Rim / back light — warm orange-red, creates edge glow (key Marmoset look) */}
      <directionalLight
        position={[-0.5, 2.0, -3.0]}
        intensity={0.55}
        color="#FF7744"
      />

      {/* Under-chin fill — subtle upward catch */}
      <directionalLight
        position={[0, -1.5, 1.5]}
        intensity={0.18}
        color="#FFD0A0"
      />

      {/* ── Body (GLTF with primitive fallback) ── */}
      <group position={[0, -0.72, 0]}>
        <GltfBoundary fallback={<PrimitiveBody />}>
          <Suspense fallback={<PrimitiveBody />}>
            <GltfModel />
          </Suspense>
        </GltfBoundary>

        {/* Anatomical markers */}
        {hotspots.map((hs) =>
          HOTSPOT_3D[hs.id] ? (
            <Marker
              key={hs.id}
              hotspot={hs}
              isActive={hs.id === activeHotspot}
              onSelect={onHotspotChange}
            />
          ) : null
        )}
      </group>

      {/* ── Camera controls ── */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 2.4}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate
        autoRotateSpeed={0.5}
        dampingFactor={0.07}
        enableDamping
      />
    </>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
interface Body3DSceneProps {
  activeHotspot: string;
  onHotspotChange: (id: string) => void;
}

export default function Body3DScene({ activeHotspot, onHotspotChange }: Body3DSceneProps) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '280px' }}>
      <Canvas
        gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
        camera={{ fov: 42, position: [0, 0, 2.85], near: 0.05, far: 50 }}
        shadows
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        <Scene activeHotspot={activeHotspot} onHotspotChange={onHotspotChange} />
      </Canvas>
    </div>
  );
}
