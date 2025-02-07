import React, { useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';

function MutatingDNA({ currentDNA }) {
  const [strandGeometry, setStrandGeometry] = useState(() => {
    return createInitialGeometry(currentDNA);
  });

  const [mutationProgress, setMutationProgress] = useState(0);
  const [mutationEffects, setMutationEffects] = useState({
    pulseIntensity: 0,
    glowColor: new THREE.Color(0x00ff88),
    evolutionStage: 0
  });

  // 创建高级DNA结构
  function createInitialGeometry(dna) {
    const geometry = new THREE.BufferGeometry();
    const helixPoints = [];
    const helixColors = [];
    
    // 双螺旋结构
    for (let i = 0; i < 200; i++) {
      const t = i * 0.3;
      // 主链
      helixPoints.push(
        new THREE.Vector3(
          Math.sin(t) * 2 * dna.virality,
          t * 0.5,
          Math.cos(t) * 2 * dna.adoptionRate
        )
      );
      // 互补链
      helixPoints.push(
        new THREE.Vector3(
          Math.sin(t + Math.PI) * 2 * dna.virality,
          t * 0.5,
          Math.cos(t + Math.PI) * 2 * dna.adoptionRate
        )
      );
      
      // 生物发光颜色
      const color = new THREE.Color();
      color.setHSL(t * 0.02 % 1, 0.8, 0.5);
      helixColors.push(color.r, color.g, color.b);
      helixColors.push(color.r, color.g, color.b);
    }
    
    geometry.setAttribute('position', 
      new THREE.Float32BufferAttribute(helixPoints.flatMap(p => [p.x, p.y, p.z]), 3)
    );
    geometry.setAttribute('color',
      new THREE.Float32BufferAttribute(helixColors, 3)
    );
    
    return geometry;
  }

  useEffect(() => {
    // 复杂的突变动画
    const animate = () => {
      setMutationProgress(prev => {
        const newProgress = prev + 0.01;
        if (newProgress >= 1) {
          // 突变完成，重置效果
          setMutationEffects({
            pulseIntensity: 0,
            glowColor: new THREE.Color(0x00ff88),
            evolutionStage: (mutationEffects.evolutionStage + 1) % 4
          });
          return 0;
        }
        return newProgress;
      });

      // 更新视觉效果
      setMutationEffects(prev => ({
        ...prev,
        pulseIntensity: Math.sin(mutationProgress * Math.PI * 2) * 0.5 + 0.5,
        glowColor: new THREE.Color().lerpColors(
          new THREE.Color(0x00ff88),
          new THREE.Color(0xff0088),
          mutationProgress
        )
      }));
    };

    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [mutationProgress]);

  // 更新几何体
  const updateGeometry = useCallback(() => {
    const vertices = strandGeometry.attributes.position.array;
    const colors = strandGeometry.attributes.color.array;
    
    for (let i = 0; i < vertices.length; i += 3) {
      const idx = i / 3;
      const t = idx * 0.3 + mutationProgress * Math.PI;
      
      // 添加突变扰动
      const noise = simplex.noise3D(
        vertices[i] * 0.1,
        vertices[i + 1] * 0.1,
        mutationProgress
      ) * currentDNA.mutationIntensity;
      
      // 主链突变
      vertices[i] = Math.sin(t) * (2 + noise) * currentDNA.virality;
      vertices[i + 1] = t * 0.5 + noise * 0.5;
      vertices[i + 2] = Math.cos(t) * (2 + noise) * currentDNA.adoptionRate;
      
      // 更新颜色
      const color = new THREE.Color();
      color.setHSL(
        (t * 0.02 + mutationProgress) % 1,
        0.8 + mutationEffects.pulseIntensity * 0.2,
        0.5 + mutationEffects.pulseIntensity * 0.3
      );
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }
    
    strandGeometry.attributes.position.needsUpdate = true;
    strandGeometry.attributes.color.needsUpdate = true;
  }, [mutationProgress, currentDNA, mutationEffects]);

  useFrame(() => {
    updateGeometry();
  });

  return (
    <group>
      <points geometry={strandGeometry}>
        <pointsMaterial
          size={0.1}
          vertexColors
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      <line geometry={strandGeometry}>
        <lineBasicMaterial
          vertexColors
          linewidth={2}
          transparent
          opacity={0.6}
        />
      </line>
      
      {/* 添加辉光效果 */}
      <mesh>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial
          color={mutationEffects.glowColor}
          transparent
          opacity={mutationEffects.pulseIntensity * 0.5}
        />
      </mesh>
      
      {/* 进化阶段指示器 */}
      <EvolutionStageIndicator
        stage={mutationEffects.evolutionStage}
        progress={mutationProgress}
      />
    </group>
  );
}

export default MutatingDNA; 