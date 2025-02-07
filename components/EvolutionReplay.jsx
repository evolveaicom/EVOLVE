import React, { useState, useCallback } from 'react';
import { useEvolution } from '../contexts/EvolutionContext';
import HistoricalDNAViewer from './HistoricalDNAViewer';
import { Canvas, useFrame, Suspense } from '@react-three/fiber';
import * as THREE from 'three';

function EvolutionReplayer() {
  const { mutations } = useEvolution();
  const [replaySpeed, setReplaySpeed] = useState(1.0);
  
  return (
    <div className="replay-system">
      <HistoricalDNAViewer 
        mutations={mutations}
        speed={replaySpeed}
        onSpeedChange={setReplaySpeed}
      />
      <div className="timeline-controls">
        {mutations.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => jumpToGeneration(idx + 1)}
          >
            Generation #{idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

function HistoricalDNAViewer({ mutations, speed }) {
  // Visualize mutation sequence using WebGL
  const generateTimelineMesh = useCallback(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    
    // Generate spiral DNA structure
    mutations.forEach((mutation, idx) => {
      const angle = idx * 0.2;
      const x = Math.cos(angle) * (idx * 0.5);
      const y = Math.sin(angle) * (idx * 0.5);
      const z = idx * 0.1;
      vertices.push(x, y, z);
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return <line geometry={geometry} material={new THREE.LineBasicMaterial({ color: 0x00ff00 })} />;
  }, [mutations]);

  return (
    <Canvas>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        {generateTimelineMesh()}
      </Suspense>
    </Canvas>
  );
}

export default EvolutionReplayer; 