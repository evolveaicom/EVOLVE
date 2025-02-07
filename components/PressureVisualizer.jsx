import React, { useMemo } from 'react';
import { Radar } from 'react-chartjs-2';

function PressureRadar({ currentDNA }) {
  const radarData = useMemo(() => ({
    labels: ['Market Cap', 'ETH Price', 'Holder Growth', 'Social Sentiment', 'Burn Rate'],
    datasets: [{
      data: [
        currentDNA.marketCapPressure,
        currentDNA.ethPricePressure,
        currentDNA.holderGrowth,
        currentDNA.socialSentiment,
        currentDNA.burnRatePressure
      ],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgb(255, 99, 132)'
    }]
  }), [currentDNA]);

  return (
    <div className="pressure-radar">
      <Radar 
        data={radarData}
        options={{
          scale: {
            r: {
              beginAtZero: true,
              max: 100
            }
          }
        }}
      />
    </div>
  );
}

export default PressureRadar; 