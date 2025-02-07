import React, { useMemo } from 'react';

function BufferIndicator({ current, capacity }) {
  const percentage = useMemo(() => (current / capacity) * 100, [current, capacity]);
  
  return (
    <div className="buffer-indicator">
      <div className="gauge-container">
        <div 
          className="gauge-fill"
          style={{ width: `${percentage}%` }}
          data-testid="gauge-fill"
        />
        <div className="gauge-labels">
          <span>0%</span>
          <span className="current-value">{percentage.toFixed(1)}%</span>
          <span>100%</span>
        </div>
      </div>
      <div className="pressure-stats">
        <span>Current: {current} ETH</span>
        <span>Capacity: {capacity} ETH</span>
      </div>
    </div>
  );
}

export default BufferIndicator; 