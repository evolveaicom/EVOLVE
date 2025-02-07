import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, OrbitControls } from '@react-three/fiber';
import { Line, Stars } from '@react-three/drei';

function DNAHelix({ mutations }) {
  const helixPoints = useMemo(() => {
    const points = [];
    mutations.forEach((m, idx) => {
      const angle = idx * 0.5;
      points.push(
        new THREE.Vector3(
          Math.cos(angle) * 2,
          Math.sin(angle) * 2,
          idx * 0.5
        )
      );
    });
    return points;
  }, [mutations]);

  return (
    <Canvas>
      <Suspense fallback={null}>
        <Line points={helixPoints} color="#00ff88" lineWidth={3} />
        <OrbitControls autoRotate />
        <Stars radius={100} depth={50} count={5000} factor={4} />
      </Suspense>
    </Canvas>
  );
}

export default DNAHelix; 