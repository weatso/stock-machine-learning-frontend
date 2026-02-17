'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Float, Environment, Stars } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function Crystal() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Animasi Rotasi Lambat
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group>
      <Float 
        speed={2} 
        rotationIntensity={1.5} 
        floatIntensity={2} 
      >
        <mesh ref={meshRef} scale={2.8}>
          {/* Geometri Icosahedron */}
          <icosahedronGeometry args={[1, 0]} />
          
          {/* Material Kaca "Mahal" */}
          <MeshTransmissionMaterial 
            backside={false}
            samples={16} 
            resolution={1024} 
            transmission={1} 
            roughness={0.0} 
            thickness={3.5} 
            ior={1.5} 
            chromaticAberration={1} 
            anisotropy={20}
            distortion={0.5} 
            distortionScale={0.5}
            temporalDistortion={0.2}
            color="#a1a1aa" 
            background={new THREE.Color("#09090b")} // PERBAIKAN DI SINI (bg -> background)
          />
        </mesh>
      </Float>
    </group>
  );
}

export default function CrystalBackground() {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 bg-zinc-950 pointer-events-none">
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 45 }} 
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]} 
      >
        <Environment preset="city" /> 
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Crystal />
      </Canvas>
    </div>
  );
}