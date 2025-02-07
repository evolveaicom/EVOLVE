import React, { useState, useEffect } from 'react';
import LineChart from './LineChart';

function ParameterTimeline({ templateId }) {
  const [history, setHistory] = useState({});
  const [selectedParam, setSelectedParam] = useState('lock');

  useEffect(() => {
    const loadHistory = async () => {
      const data = await contract.getHistoricalParameters(templateId, 5);
      setHistory({
        timestamps: data.timestamps.map(t => new Date(t*1000)),
        locks: data.locks.map(l => l/86400),
        fees: data.fees,
        rebates: data.rebates
      });
    };
    loadHistory();
  }, [templateId]);

  return (
    <div className="timeline">
      <select value={selectedParam} onChange={e => setSelectedParam(e.target.value)}>
        <option value="lock">Lock Period</option>
        <option value="fee">Withdrawal Fee</option>
        <option value="rebate">Fee Rebate</option>
      </select>
      
      <LineChart
        data={history.timestamps?.map((t,i) => ({
          date: t.toLocaleDateString(),
          value: history[selectedParam+'s']?.[i] || 0
        }))}
        xKey="date"
        yKey="value"
      />
    </div>
  );
}

export default ParameterTimeline; 