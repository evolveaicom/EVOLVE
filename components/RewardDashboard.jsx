import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function RewardStatus({ user }) {
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    const load = async () => {
      const userRewards = await contract.userRewards(user);
      setRewards(userRewards);
    };
    load();
  }, [user]);

  return (
    <div className="reward-dashboard">
      <h3>Template Rewards</h3>
      <div className="reward-list">
        {rewards.map((reward, idx) => (
          <div key={idx} className="reward-item">
            <div>Template #{reward.templateId}</div>
            <div>{reward.amount} EVR</div>
            <div>Unlock: {formatDate(reward.claimTime)}</div>
            <button 
              disabled={Date.now()/1000 < reward.claimTime}
              onClick={() => claimReward(idx)}
            >
              {reward.claimable ? "Claim" : `Unlocks in ${daysRemaining(reward.claimTime)}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function RewardItem({ reward }) {
  return (
    <div className="reward-item">
      <div>Template #{reward.templateId}</div>
      <div>{reward.amount} EVR</div>
      <div>Unlock: {formatDate(reward.claimTime)}</div>
    </div>
  );
}

export default RewardStatus; 