import React, { useState, useEffect } from 'react';

function StakingDashboard() {
  const [stakeAmount, setStakeAmount] = useState('');
  const [userStake, setUserStake] = useState({});

  useEffect(() => {
    const loadStake = async () => {
      const stake = await contract.stakes(account);
      setUserStake(stake);
    };
    loadStake();
  }, [account]);

  return (
    <div className="staking-panel">
      <h3>Stake EVOLVE</h3>
      <input
        type="number"
        value={stakeAmount}
        onChange={(e) => setStakeAmount(e.target.value)}
        placeholder="Amount to stake"
      />
      <button onClick={() => contract.stakeTokens(stakeAmount)}>
        Stake Tokens
      </button>
      
      <div className="staking-info">
        <div>Staked: {userStake.amount || 0} EVOLVE</div>
        <div>Pending Rewards: {calculateRewards(userStake)} EVR</div>
        <button onClick={() => contract.claimRewards()}>
          Claim Rewards
        </button>
      </div>
    </div>
  );
}

function TierSelector({ onSelect }) {
  const [tiers, setTiers] = useState([]);

  useEffect(() => {
    const loadTiers = async () => {
      const tierCount = await contract.rateTierCount();
      const loaded = [];
      for(let i=0; i<tierCount; i++){
        loaded.push(await contract.rateTiers(i));
      }
      setTiers(loaded);
    };
    loadTiers();
  }, []);

  return (
    <div className="tier-selector">
      {tiers.map((tier, idx) => (
        <div key={idx} className="tier-card" onClick={() => onSelect(idx)}>
          <h4>Tier {idx+1}</h4>
          <div>Min: {tier.minStake} EVOLVE</div>
          <div>APY: {tier.rate}%</div>
          <div>Lock: {tier.lockPeriod/86400} days</div>
        </div>
      ))}
    </div>
  );
}

function TierIndicator({ currentTier }) {
  const [nextTier, setNextTier] = useState(null);

  useEffect(() => {
    const checkNextTier = async () => {
      const tiers = await contract.rateTiers();
      if(currentTier < tiers.length - 1) {
        setNextTier(tiers[currentTier + 1]);
      }
    };
    checkNextTier();
  }, [currentTier]);

  return (
    <div className="tier-progress">
      {nextTier && (
        <div className="next-tier">
          Next Tier at {nextTier.minStake} EVOLVE ({nextTier.rate}% APY)
        </div>
      )}
    </div>
  );
}

function WithdrawPanel() {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [available, setAvailable] = useState(0);
  const [feeRate, setFeeRate] = useState(0);

  useEffect(() => {
    const checkAvailability = async () => {
      const amount = await contract.getAvailableToWithdraw(account);
      setAvailable(amount);
    };
    checkAvailability();
  }, [account]);

  useEffect(() => {
    const loadFee = async () => {
      const fee = await contract.withdrawalFee();
      setFeeRate(fee / 10); // Convert basis points to percentage
    };
    loadFee();
  }, []);

  return (
    <div className="withdraw-section">
      <div className="fee-notice">
        Withdrawal fee: {feeRate}% (Min. 24h lock)
      </div>
      <h4>Partial Withdrawal</h4>
      <input
        type="number"
        value={withdrawAmount}
        onChange={(e) => setWithdrawAmount(e.target.value)}
        placeholder={`Available: ${available} EVOLVE`}
      />
      <button 
        onClick={() => contract.unstake(withdrawAmount)}
        disabled={available === 0 || withdrawAmount > available}
      >
        Withdraw
      </button>
    </div>
  );
}

export default StakingDashboard; 