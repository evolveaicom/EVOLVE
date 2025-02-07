import React, { useState, useEffect } from 'react';
import { shortenAddress } from '../utils/addressUtils';
import { ethers } from 'ethers';

function DelegationControls() {
  const [delegatee, setDelegatee] = useState('');
  const [currentDelegate, setCurrentDelegate] = useState('');
  const [isDelegated, setIsDelegated] = useState(false);

  useEffect(() => {
    const loadDelegate = async () => {
      const delegate = await token.delegates(account);
      setCurrentDelegate(delegate);
    };
    loadDelegate();
  }, [account]);

  useEffect(() => {
    const checkDelegation = async () => {
      const delegate = await token.delegates(account);
      setIsDelegated(delegate !== account && delegate !== ethers.constants.AddressZero);
    };
    checkDelegation();
  }, [currentDelegate]);

  return (
    <div className="delegation-panel">
      <h4>Voting Power Delegation</h4>
      <div>Current Delegate: {shortenAddress(currentDelegate)}</div>
      <input
        type="text"
        placeholder="Delegate address"
        value={delegatee}
        onChange={(e) => setDelegatee(e.target.value)}
      />
      <button onClick={() => dao.delegate(delegatee)}>
        Delegate Votes
      </button>
      {isDelegated && (
        <button 
          className="undelegate-btn"
          onClick={() => dao.undelegate()}
        >
          Undelegate
        </button>
      )}
      <DelegationHistory history={delegationHistory} />
    </div>
  );
}

function LockTimer({ lockEnd }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = Math.floor(Date.now()/1000);
      const diff = lockEnd - now;
      if(diff <= 0) {
        setRemaining('Unlocked');
        return;
      }
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      setRemaining(`${hours}h ${minutes}m remaining`);
    };
    
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lockEnd]);

  return <div className="lock-timer">{remaining}</div>;
}

export default DelegationControls; 