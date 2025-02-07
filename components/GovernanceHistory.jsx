import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';

function GovernanceTimeline({ history }) {
  const chartData = useMemo(() => ({
    labels: history.map((_, i) => `Change ${i + 1}`),
    datasets: [
      {
        label: 'Quorum %',
        data: history.map(h => h.quorum),
        borderColor: '#4cd137',
        yAxisID: 'y'
      },
      {
        label: 'Execution Delay (hours)',
        data: history.map(h => h.delay / 3600),
        borderColor: '#e84118',
        yAxisID: 'y1'
      }
    ]
  }), [history]);

  return (
    <div className="governance-chart">
      <Line
        data={chartData}
        options={{
          responsive: true,
          interaction: { mode: 'index' },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: { text: 'Quorum %', display: true }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: { text: 'Delay (hours)', display: true }
            }
          }
        }}
      />
    </div>
  );
}

export default GovernanceTimeline; 