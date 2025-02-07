import React, { useMemo } from 'react';

function GovernanceComparator({ versions }) {
  const diffDisplay = useMemo(() => {
    return versions.map(([v1, v2]) => ({
      minDuration: v1.minDuration - v2.minDuration,
      quorum: v1.quorum - v2.quorum,
      delayHours: (v1.delay - v2.delay) / 3600
    }));
  }, [versions]);

  return (
    <div className="governance-diff">
      {diffDisplay.map((diff, idx) => (
        <div key={idx} className="diff-item">
          <div className="diff-row">
            <span>Proposal Duration:</span>
            <span className={diff.minDuration > 0 ? 'positive' : 'negative'}>
              {diff.minDuration} days
            </span>
          </div>
          <div className="diff-row">
            <span>Quorum:</span>
            <span className={diff.quorum > 0 ? 'positive' : 'negative'}>
              {diff.quorum}%
            </span>
          </div>
          <div className="diff-row">
            <span>Execution Delay:</span>
            <span className={diff.delayHours > 0 ? 'positive' : 'negative'}>
              {diff.delayHours} hours
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default GovernanceComparator; 