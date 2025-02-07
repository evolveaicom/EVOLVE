import React, { useEffect, useState } from 'react';
import { useEvolution } from '../contexts/EvolutionContext';
import MutationStage from './MutationStage';
import DNAStrand from './DNAStrand';
import EvolutionPressureGauge from './EvolutionPressureGauge';

function EvolutionTimeline() {
  const { mutations, currentDNA, currentProposals, handleVote, environmentalPressure } = useEvolution();
  
  return (
    <div className="darwin-viewer">
      <div className="evolution-stats">
        <span>Current Generation: {mutations.length}</span>
        <span>Survival Rate: {currentDNA.survivalRate}%</span>
        <EvolutionPressureGauge pressure={currentDNA.environmentPressure} />
      </div>
      
      {mutations.map((mutation, idx) => (
        <MutationStage 
          key={idx}
          version={mutation.version}
          dna={mutation.visualDNA}
          onHover={() => showGeneticTree(mutation.mutationPath)}
          mutationData={{
            burnRate: mutation.newBurnRate,
            adoptionRate: mutation.survivalRate,
            generation: idx + 1
          }}
        />
      ))}
      
      <div className="mutation-process">
        <DNAStrand 
          currentDNA={currentDNA}
          mutationOptions={currentProposals}
          onVote={handleVote}
          pressureLevel={environmentalPressure}
        />
      </div>
    </div>
  );
}

export default EvolutionTimeline; 