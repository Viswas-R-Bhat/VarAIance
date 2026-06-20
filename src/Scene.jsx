import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// ----------------------------------------------------------------------------
// NeuralField — a cursor-reactive constellation of clustered nodes wired by
// thin synapse lines. Additive blending gives the points a soft self-glow so
// the field reads as "live data" rather than a static starfield.
// ----------------------------------------------------------------------------
function NeuralField() {
  const group = useRef();
  const pointsRef = useRef();

  const { positions, colors, sizes, linePositions, lineColors } = useMemo(() => {
    const COUNT = 540;
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const siz = new Float32Array(COUNT);
    const color = new THREE.Color();

    const clusters = [
      new THREE.Vector3(-2.6, 0.5, -0.2),
      new THREE.Vector3(0.15, -0.2, -0.4),
      new THREE.Vector3(2.5, 0.4, 0.25),
      new THREE.Vector3(-0.9, 1.2, 0.6),
      new THREE.Vector3(1.4, -1.1, 0.3),
    ];

    const palette = ["#00e6c4", "#19a7ff", "#7c5cff", "#d7fbff"];
    const nodes = [];

    for (let i = 0; i < COUNT; i += 1) {
      const cluster = clusters[i % clusters.length];
      const spread = i % 9 === 0 ? 2.4 : 0.82;
      const theta = Math.random() * Math.PI * 2;
      const radius = Math.pow(Math.random(), 0.42) * spread;
      const x = cluster.x + Math.cos(theta) * radius;
      const y = cluster.y + Math.sin(theta) * radius * 0.6 + (Math.random() - 0.5) * 0.9;
      const z = cluster.z + (Math.random() - 0.5) * 1.7;
      nodes.push(new THREE.Vector3(x, y, z));
      pos.set([x, y, z], i * 3);

      color.set(palette[i % palette.length]);
      col.set([color.r, color.g, color.b], i * 3);
      siz[i] = i % 9 === 0 ? 0.06 : 0.022 + Math.random() * 0.02;
    }

    // Wire nearby nodes together into synapses.
    const lineData = [];
    const lineCol = [];
    const c = new THREE.Color("#3ad8ff");
    for (let i = 0; i < 220; i += 1) {
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      const b = nodes[Math.floor(Math.random() * nodes.length)];
      if (a.distanceTo(b) < 1.25) {
        lineData.push(a.x, a.y, a.z, b.x, b.y, b.z);
        lineCol.push(c.r, c.g, c.b, c.r, c.g, c.b);
      }
    }

    return {
      positions: pos,
      colors: col,
      sizes: siz,
      linePositions: new Float32Array(lineData),
      lineColors: new Float32Array(lineCol),
    };
  }, []);

  // A round, soft sprite so points glow instead of rendering as hard squares.
  const sprite = useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.9)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      // Slow autonomous drift, gently steered by the cursor for parallax.
      group.current.rotation.y = t * 0.04 + pointer.x * 0.22;
      group.current.rotation.x = -0.05 + pointer.y * 0.12;
      group.current.position.y = Math.sin(t * 0.35) * 0.06;
    }
    if (pointsRef.current) {
      pointsRef.current.material.size = 0.05 + Math.sin(t * 0.9) * 0.006;
    }
  });

  return (
    <group ref={group}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
          <bufferAttribute attach="attributes-size" count={sizes.length} array={sizes} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          map={sprite}
          vertexColors
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={linePositions.length / 3} array={linePositions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={lineColors.length / 3} array={lineColors} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.14} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

export default function Scene({ reducedMotion = false }) {
  // For users who prefer reduced motion, skip the WebGL canvas entirely and
  // let the CSS gradient backdrop carry the hero. No animation, no GPU cost.
  if (reducedMotion) return <div className="hero-scene hero-scene--static" aria-hidden="true" />;

  return (
    <div className="hero-scene" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5.4], fov: 46 }}
        dpr={[1, 1.7]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <fog attach="fog" args={["#03060a", 4.2, 9.5]} />
        <NeuralField />
      </Canvas>
    </div>
  );
}
