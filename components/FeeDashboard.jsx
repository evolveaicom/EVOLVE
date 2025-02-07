import React, { useState, useEffect } from 'react';
import FeeTierChart from './FeeTierChart';

function FeeStatistics() {
  const [feeData, setFeeData] = useState({
    totalCollected: 0,
    totalBurned: 0,
    tierDistribution: []
  });

  useEffect(() => {
    const loadData = async () => {
      const events = await contract.queryFilter("Withdrawal");
      const stats = processFeeEvents(events);
      setFeeData(stats);
    };
    loadData();
  }, []);

  return (
    <div className="fee-dashboard">
      <h3>Fee Analytics</h3>
      <div>Total Collected: {feeData.totalCollected} EVOLVE</div>
      <div>Total Burned: {feeData.totalBurned} EVOLVE</div>
      <FeeTierChart data={feeData.tierDistribution} />
    </div>
  );
}

export default FeeStatistics; 