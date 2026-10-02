"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

function SpinningModel() {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/background.glb");

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name === "Cube") {
        child.visible = false;
      }
    });
  }, [scene]);

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

export default function SceneBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 3]} intensity={1} />
        <Suspense fallback={null}>
          <SpinningModel />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/background.glb");
