"use client";
import React, { useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame, RootState } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";
import * as THREE from "three";
import styles from "./style.module.css";

interface EstrelasProps {
  [key: string]: any;
}

const Estrelas: React.FC<EstrelasProps> = (props) => {
  const referencia = useRef<THREE.Points>(null);
  
  const esfera = useMemo(() => {
    return random.inSphere(new Float32Array(1800), { radius: 1.2 }) as Float32Array;
  }, []);

  useFrame((_state: RootState, delta: number) => {
    if (referencia.current) {
      const dt = Math.min(delta, 0.1);
      referencia.current.rotation.x -= dt / 10;
      referencia.current.rotation.y -= dt / 15;
    }
  });

  return (
    // @ts-ignore
    <group rotation={[0, 0, Math.PI / 4]}>
      {/* @ts-ignore */}
      <Points ref={referencia} positions={esfera} stride={3} frustumCulled {...props}>
        {/* @ts-ignore */}
        <PointMaterial 
          transparent 
          color="#fff" 
          size={0.002} 
          sizeAttenuation={true} 
          depthWrite={false} 
          blending={THREE.AdditiveBlending} 
        />
      </Points>
    </group>
  );
};

const CAMERA_SETTINGS = { position: [0, 0, 1] as [number, number, number] };

const FundoEstelar: React.FC = () => (
  <div className={styles["container-canvas-estelar"]}>
    <Canvas 
      camera={CAMERA_SETTINGS} 
      dpr={[1, 1.5]} 
      gl={{ antialias: false, powerPreference: "high-performance", stencil: false, depth: false }}
    >
      <Suspense fallback={null}>
        <Estrelas />
      </Suspense>
    </Canvas>
  </div>
);

export default FundoEstelar;