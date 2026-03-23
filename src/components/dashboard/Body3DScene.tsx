import React, { useRef, useState, Suspense, useEffect, useMemo, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { hotspots } from '../../data/dashboardData';

// ─── Model path — place a downloaded human-body.glb in /public/models/ ────────
const MODEL_PATH = '/models/human-body.glb';
// Silence the preload 404 if file is missing
useGLTF.preload(MODEL_PATH);

const BODY_GROUP_Y = -0.72;
const DEFAULT_CAMERA_POS = new THREE.Vector3(0, 0.02, 2.85);
const DEFAULT_CAMERA_TARGET = new THREE.Vector3(0, 0.24, 0);
const HEART_CAMERA_POS = new THREE.Vector3(0.12, 0.14, 2.52);
const HEART_CAMERA_TARGET = new THREE.Vector3(0.08, 0.43, 0.12);

// ─── Anatomical hotspot 3-D positions (body-local space, Y-up) ───────────────
const HOTSPOT_3D: Record<string, [number, number, number]> = {
  head: [0.00, 1.84, 0.06],
  heart: [0.12, 1.10, 0.12],
  lung: [-0.10, 1.12, 0.10],
  abdomen: [0.00, 0.78, 0.12],
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

const SCENE_HOTSPOTS = hotspots.filter((hotspot) => hotspot.id !== 'head');

// ─── GLTF model — loads when /public/models/human-body.glb exists ─────────────
function GltfModel() {
  const { scene } = useGLTF(MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const model = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const tunedMaterials: THREE.Material[] = [];

    const tuneMaterial = (material: THREE.Material, geometry?: THREE.BufferGeometry) => {
      const next = material.clone();
      const hasVertexColors = Boolean(geometry?.getAttribute('color'));

      if ('side' in next) {
        next.side = THREE.DoubleSide;
      }
      if ('vertexColors' in next) {
        next.vertexColors = hasVertexColors;
      }
      if ('toneMapped' in next) {
        next.toneMapped = true;
      }

      next.needsUpdate = true;
      tunedMaterials.push(next);
      return next;
    };

    // Work on a local clone so StrictMode cleanup never breaks the cached GLTF scene.
    model.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map((material) => tuneMaterial(material, mesh.geometry))
          : tuneMaterial(mesh.material, mesh.geometry);
      }
    });

    // Normalise to fit the same space as the primitive body
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = 1.85 / Math.max(size.y, 0.01);

    group.scale.setScalar(scale);
    group.position.set(
      -center.x * scale,
      0.70 - center.y * scale,   // align centre with primitive body centre
      -center.z * scale,
    );

    return () => {
      tunedMaterials.forEach((material) => material.dispose());
    };
  }, [model]);

  return (
    <group ref={groupRef}>
      <primitive object={model} />
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

  useEffect(() => () => mat.dispose(), [mat]);

  return (
    <group>
      {/* Head */}
      <mesh position={[0, 1.70, 0]} material={mat}>
        <sphereGeometry args={[0.132, 26, 26]} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.548, 0]} material={mat}>
        <cylinderGeometry args={[0.055, 0.067, 0.115, 16]} />
      </mesh>
      {/* Chest */}
      <mesh position={[0, 1.290, 0]} scale={[1.20, 1, 0.80]} material={mat}>
        <capsuleGeometry args={[0.128, 0.22, 8, 20]} />
      </mesh>
      {/* Abdomen */}
      <mesh position={[0, 0.978, 0]} scale={[1.05, 1, 0.76]} material={mat}>
        <capsuleGeometry args={[0.114, 0.18, 8, 20]} />
      </mesh>
      {/* Pelvis */}
      <mesh position={[0, 0.724, 0]} scale={[1.14, 0.72, 0.84]} material={mat}>
        <sphereGeometry args={[0.118, 18, 18]} />
      </mesh>
      {/* Shoulders */}
      {([-1, 1] as const).map(s => (
        <mesh key={s} position={[s * 0.218, 1.42, 0]} material={mat}>
          <sphereGeometry args={[0.070, 14, 14]} />
        </mesh>
      ))}
      {/* Upper arms */}
      {([-1, 1] as const).map(s => (
        <mesh key={s} position={[s * 0.248, 1.175, 0]} rotation={[0, 0, s * 0.14]} material={mat}>
          <capsuleGeometry args={[0.055, 0.246, 6, 14]} />
        </mesh>
      ))}
      {/* Elbows */}
      {([-1, 1] as const).map(s => (
        <mesh key={s} position={[s * 0.270, 0.870, 0]} material={mat}>
          <sphereGeometry args={[0.053, 12, 12]} />
        </mesh>
      ))}
      {/* Forearms */}
      {([-1, 1] as const).map(s => (
        <mesh key={s} position={[s * 0.280, 0.652, 0]} rotation={[0, 0, s * 0.07]} material={mat}>
          <capsuleGeometry args={[0.044, 0.216, 6, 14]} />
        </mesh>
      ))}
      {/* Hands */}
      {([-1, 1] as const).map(s => (
        <mesh key={s} position={[s * 0.285, 0.490, 0]} scale={[1, 0.8, 0.62]} material={mat}>
          <sphereGeometry args={[0.054, 12, 12]} />
        </mesh>
      ))}
      {/* Thighs */}
      {([-1, 1] as const).map(s => (
        <mesh key={s} position={[s * 0.112, 0.380, 0]} material={mat}>
          <capsuleGeometry args={[0.076, 0.268, 6, 16]} />
        </mesh>
      ))}
      {/* Knees */}
      {([-1, 1] as const).map(s => (
        <mesh key={s} position={[s * 0.110, 0.098, 0]} material={mat}>
          <sphereGeometry args={[0.067, 12, 12]} />
        </mesh>
      ))}
      {/* Shins */}
      {([-1, 1] as const).map(s => (
        <mesh key={s} position={[s * 0.106, -0.126, 0]} material={mat}>
          <capsuleGeometry args={[0.059, 0.242, 6, 14]} />
        </mesh>
      ))}
      {/* Feet */}
      {([-1, 1] as const).map(s => (
        <mesh key={s} position={[s * 0.106, -0.334, 0.022]} scale={[0.88, 0.50, 1.42]} material={mat}>
          <sphereGeometry args={[0.066, 12, 12]} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Interactive anatomical marker ───────────────────────────────────────────
interface HeartDetailCardProps {
  readonly visible: boolean;
}

function HeartDetailCard({ visible }: HeartDetailCardProps) {
  if (!visible) return null;

  return (
    <Html
      position={[0.32, 0.06, 0.02]}
      distanceFactor={1.55}
      zIndexRange={[220, 0]}
      style={{ pointerEvents: 'auto' }}
    >
      <div style={{ transform: 'translate(28px, -56%)' }}>
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'relative',
            width: 336,
            borderRadius: 28,
            border: '1px solid rgba(255,255,255,0.48)',
            background: 'linear-gradient(160deg, rgba(255,255,255,0.42) 0%, rgba(249,244,238,0.22) 42%, rgba(234,229,244,0.18) 100%)',
            boxShadow: '0 32px 70px rgba(64,53,84,0.14), inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(255,255,255,0.18)',
            backdropFilter: 'blur(22px) saturate(180%)',
            WebkitBackdropFilter: 'blur(22px) saturate(180%)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at top left, rgba(255,255,255,0.46), transparent 42%), radial-gradient(circle at 85% 18%, rgba(142,128,178,0.18), transparent 24%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', padding: '18px 18px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '5px 11px',
                    borderRadius: 999,
                    background: 'rgba(106,96,138,0.10)',
                    border: '1px solid rgba(106,96,138,0.12)',
                    color: '#6A608A',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6A608A', boxShadow: '0 0 0 5px rgba(106,96,138,0.10)' }} />
                  Cardiac Focus
                </div>
                <div style={{ marginTop: 12, color: '#26211F', fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em' }}>
                  Heart Metrics
                </div>
                <div style={{ marginTop: 5, color: 'rgba(44,41,38,0.68)', fontSize: 12, lineHeight: 1.55, maxWidth: 220 }}>
                  Mild arrhythmic activity with stable oxygenation and a moderate pressure elevation trend.
                </div>
              </div>

              <div
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 22,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.75), rgba(226,223,236,0.30))',
                  border: '1px solid rgba(255,255,255,0.62)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 10px 30px rgba(106,96,138,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6A608A',
                  flexShrink: 0,
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
                </svg>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                marginTop: 16,
              }}
            >
              {[
                ['Pulse', '74 bpm'],
                ['Blood Pressure', '135/85'],
                ['HRV', '42 ms'],
                ['Rhythm', 'Irregular'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    borderRadius: 18,
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.34), rgba(255,255,255,0.18))',
                    border: '1px solid rgba(255,255,255,0.32)',
                    padding: '12px 13px',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.42)',
                  }}
                >
                  <div style={{ color: 'rgba(44,41,38,0.46)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    {label}
                  </div>
                  <div style={{ marginTop: 7, color: '#26211F', fontSize: 19, fontWeight: 700, letterSpacing: '-0.03em' }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 14,
                borderRadius: 20,
                padding: '14px 14px 12px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.26), rgba(255,255,255,0.16))',
                border: '1px solid rgba(255,255,255,0.28)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.38)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ color: '#6A608A', fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                  Live Pulse Trace
                </span>
                <span style={{ color: 'rgba(44,41,38,0.56)', fontSize: 11, fontFamily: '"JetBrains Mono","Courier New",monospace' }}>
                  72 bpm
                </span>
              </div>
              <svg viewBox="0 0 220 46" style={{ width: '100%', height: 46 }}>
                <defs>
                  <linearGradient id="heart-card-wave" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(106,96,138,0.10)" />
                    <stop offset="48%" stopColor="#6A608A" />
                    <stop offset="100%" stopColor="rgba(106,96,138,0.14)" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 26 L34 26 L40 24 L46 26 L60 26 L68 26 L74 12 L80 36 L86 26 L116 26 L124 26 L132 23 L138 26 L154 26 L164 26 L170 14 L176 34 L182 26 L220 26"
                  fill="none"
                  stroke="url(#heart-card-wave)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>
    </Html>
  );
}

interface MarkerProps {
  hotspot: (typeof SCENE_HOTSPOTS)[number];
  isActive: boolean;
  isExpanded: boolean;
  overlaysHidden: boolean;
  onSelect: (id: string) => void;
}

function Marker({ hotspot, isActive, isExpanded, overlaysHidden, onSelect }: MarkerProps) {
  const [hovered, setHovered] = useState(false);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const dotRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const pos = HOTSPOT_3D[hotspot.id] ?? ([0, 0, 0] as [number, number, number]);
  const sc = STATUS_COLORS[hotspot.status];
  const isHeart = hotspot.id === 'heart';
  const isPulsing = isHeart || hotspot.status === 'active';
  const isHighlighted = hovered || isActive || isExpanded;
  const dotRadius = isHeart ? 0.024 : 0.020;
  const haloRadius = isHeart ? 0.050 : 0.038;

  // 72bpm heartbeat rings + smooth dot scale
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const bpm = 72;
    const period = 60 / bpm; // 0.833s

    if (isPulsing) {
      const beat = (t % period) / period;
      const pulse = Math.max(0, Math.sin(beat * Math.PI));

      if (ring1Ref.current) {
        ring1Ref.current.scale.setScalar(1 + pulse * 1.5);
        (ring1Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.26 * (1 - pulse);
      }
      const beat2 = ((t + 0.13) % period) / period;
      const p2 = Math.max(0, Math.sin(beat2 * Math.PI));
      if (ring2Ref.current) {
        ring2Ref.current.scale.setScalar(1 + p2 * 1.1);
        (ring2Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.18 * (1 - p2);
      }
    }

    if (dotRef.current) {
      const target = isHighlighted ? 1.22 : 1.0;
      const cur = dotRef.current.scale.x;
      dotRef.current.scale.setScalar(cur + (target - cur) * 0.10);
    }

    if (shellRef.current) {
      const target = isHighlighted ? 1.08 : 1.0;
      const cur = shellRef.current.scale.x;
      shellRef.current.scale.setScalar(cur + (target - cur) * 0.08);
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.55;
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
            <sphereGeometry args={[haloRadius, 16, 16]} />
            <meshBasicMaterial color={sc.dot} transparent opacity={0.45} depthWrite={false} />
          </mesh>
          <mesh ref={ring2Ref}>
            <sphereGeometry args={[haloRadius, 16, 16]} />
            <meshBasicMaterial color={sc.dot} transparent opacity={0.28} depthWrite={false} />
          </mesh>
        </>
      )}

      <mesh ref={shellRef}>
        <sphereGeometry args={[haloRadius, 18, 18]} />
        <meshBasicMaterial
          color={sc.dot}
          transparent
          opacity={isHeart ? 0.16 : 0.10}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[haloRadius * 0.78, isHeart ? 0.005 : 0.004, 14, 48]} />
        <meshBasicMaterial
          color={sc.dot}
          transparent
          opacity={isHighlighted ? 0.58 : 0.34}
          depthWrite={false}
        />
      </mesh>

      <mesh
        ref={dotRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        onClick={(e) => { e.stopPropagation(); onSelect(hotspot.id); }}
      >
        <sphereGeometry args={[dotRadius, 22, 22]} />
        <meshPhysicalMaterial
          color={isHeart ? '#F4F0FA' : '#EEF1E8'}
          emissive={sc.dot}
          emissiveIntensity={isHeart ? 0.42 : 0.22}
          roughness={0.08}
          metalness={0.04}
          transparent
          opacity={0.88}
          transmission={0.38}
          thickness={1.2}
          ior={1.16}
          clearcoat={0.8}
          clearcoatRoughness={0.16}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[isHeart ? 0.010 : 0.008, 12, 12]} />
        <meshBasicMaterial color={sc.dot} />
      </mesh>

      {hovered && !isHeart && !isExpanded && !overlaysHidden && (
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

      {hotspot.id === 'heart' && <HeartDetailCard visible={isExpanded && !overlaysHidden} />}
    </group>
  );
}

// ─── Scene lighting + body + controls ────────────────────────────────────────
interface SceneProps {
  activeHotspot: string;
  expandedHotspot: string | null;
  overlaySuppressed: boolean;
  onHotspotChange: (id: string) => void;
}

function RotatingBodyGroup({ children }: { readonly children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.16;
  });

  return <group ref={groupRef}>{children}</group>;
}

function CameraRig({ focusHeart }: { readonly focusHeart: boolean }) {
  const { camera } = useThree();

  useFrame(() => {
    const targetPosition = focusHeart ? HEART_CAMERA_POS : DEFAULT_CAMERA_POS;
    const lookTarget = focusHeart ? HEART_CAMERA_TARGET : DEFAULT_CAMERA_TARGET;

    camera.position.lerp(targetPosition, 0.08);
    camera.lookAt(lookTarget);
  });

  return null;
}

function Scene({ activeHotspot, expandedHotspot, overlaySuppressed, onHotspotChange }: SceneProps) {
  const focusHeart = expandedHotspot === 'heart';

  return (
    <>
      <CameraRig focusHeart={focusHeart} />

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
      <RotatingBodyGroup>
        <group position={[0, BODY_GROUP_Y, 0]}>
          <GltfBoundary fallback={<PrimitiveBody />}>
            <Suspense fallback={<PrimitiveBody />}>
              <GltfModel />
            </Suspense>
          </GltfBoundary>

          {/* Anatomical markers */}
          {SCENE_HOTSPOTS.map((hs) =>
            HOTSPOT_3D[hs.id] ? (
              <Marker
                key={hs.id}
                hotspot={hs}
                isActive={hs.id === activeHotspot}
                isExpanded={hs.id === expandedHotspot}
                overlaysHidden={overlaySuppressed}
                onSelect={onHotspotChange}
              />
            ) : null
          )}
        </group>
      </RotatingBodyGroup>

      {/* ── Camera controls ── */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 2.4}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate={false}
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
  overlaySuppressed?: boolean;
}

export default function Body3DScene({
  activeHotspot,
  onHotspotChange,
  overlaySuppressed = false,
}: Body3DSceneProps) {
  const [heartCardDismissed, setHeartCardDismissed] = useState(true);
  const expandedHotspot =
    !overlaySuppressed && activeHotspot === 'heart' && !heartCardDismissed ? 'heart' : null;

  const handleHotspotChange = (id: string) => {
    onHotspotChange(id);
    setHeartCardDismissed(id !== 'heart');
  };

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '280px' }}>
      <Canvas
        gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
        camera={{ fov: 42, position: [0, 0, 2.85], near: 0.05, far: 50 }}
        shadows
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        onPointerMissed={() => setHeartCardDismissed(true)}
      >
        <Scene
          activeHotspot={activeHotspot}
          expandedHotspot={expandedHotspot}
          overlaySuppressed={overlaySuppressed}
          onHotspotChange={handleHotspotChange}
        />
      </Canvas>
    </div>
  );
}
