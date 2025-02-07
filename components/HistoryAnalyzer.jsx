import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';

function MutationTimeline({ mutations }) {
  const chartData = useMemo(() => ({
    labels: mutations.map((_, i) => `Gen ${i + 1}`),
    datasets: [
      {
        label: 'Burn Rate',
        data: mutations.map(m => m.burnRate),
        borderColor: '#ff7675',
        tension: 0.4
      },
      {
        label: 'Survival Rate',
        data: mutations.map(m => m.survivalRate),
        borderColor: '#55efc4',
        tension: 0.4
      }
    ]
  }), [mutations]);

  return (
    <div className="history-chart">
      <Line 
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            annotation: {
              annotations: {
                extinctionEvent: {
                  type: 'line',
                  yMin: 0,
                  yMax: 100,
                  borderColor: '#ff7675',
                  borderWidth: 2,
                  label: {
                    content: 'Extinction Event',
                    position: 'end'
                  }
                }
              }
            }
          }
        }}
      />
    </div>
  );
}

export default MutationTimeline; 