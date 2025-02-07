import React, { useState, useEffect } from 'react';
import { shortenAddress } from '../utils/addressUtils';

function RewardLeaderboard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const load = async () => {
      const eventFilter = contract.filters.TemplateRewarded();
      const events = await contract.queryFilter(eventFilter);
      const rankings = processEvents(events);
      setLeaders(rankings);
    };
    load();
  }, []);

  return (
    <div className="leaderboard">
      <h3>Top Contributors</h3>
      {leaders.map((user, idx) => (
        <div key={idx} className="leader-entry">
          <span>#{idx+1}</span>
          <span>{shortenAddress(user.address)}</span>
          <span>{user.totalRewards} ETH</span>
        </div>
      ))}
    </div>
  );
}

export default RewardLeaderboard; 