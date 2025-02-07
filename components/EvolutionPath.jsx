import React, { useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { gridHelper } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';

function MutationPath({ mutations }) {
  const linePoints = useMemo(() => {
    return mutations.flatMap((m, i) => [
      new THREE.Vector3(i * 2, m.burnRate / 10, 0),
      new THREE.Vector3(i * 2 + 1, m.survivalRate / 2, 0)
    ]);
  }, [mutations]);

  return (
    <Canvas>
      <Suspense fallback={null}>
        <Line points={linePoints} color="hotpink" lineWidth={2} />
        <OrbitControls enableZoom={false} />
        <gridHelper args={[20, 20]} />
      </Suspense>
    </Canvas>
  );
}

export default MutationPath; 