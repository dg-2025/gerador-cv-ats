"use client";
import React, { useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";
import "./style.css";

const Estrelas = (props) => {
    const referencia = useRef();
    const esfera = useMemo(() => {
        return random.inSphere(new Float32Array(1800), { radius: 1.2 });
    }, []);

    useFrame((state, delta) => {
        if (referencia.current) {
            const dt = Math.min(delta, 0.1);
            referencia.current.rotation.x -= dt / 10;
            referencia.current.rotation.y -= dt / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={referencia} positions={esfera} stride={3} frustumCulled {...props}>
                <PointMaterial transparent color="#fff" size={0.002} sizeAttenuation={true} depthWrite={false} blending={2} />
            </Points>
        </group>
    );
};

const CAMERA_SETTINGS = { position: [0, 0, 1] };

const FundoEstelar = () => (
    <div className="container-canvas-estelar">
        <Canvas camera={CAMERA_SETTINGS} dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: "high-performance", stencil: false, depth: false }}>
            <Suspense fallback={null}>
                <Estrelas />
            </Suspense>
        </Canvas>
    </div>
);

export default FundoEstelar;