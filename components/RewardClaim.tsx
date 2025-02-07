import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { program } from '../utils/program';
import { confirmTransaction } from '../utils/confirmTransaction';
import { LineChart } from './LineChart';

export default function RewardDashboard() {
    const { publicKey } = useWallet();
    const [rewards, setRewards] = useState<number>(0);
    
    const claimRewards = async () => {
        const tx = await program.methods
            .claimDelegationRewards()
            .accounts({
                delegator: publicKey,
                rewardPool: REWARD_POOL_PDA
            })
            .rpc();
        
        await confirmTransaction(tx);
        updateRewards();
    };

    return (
        <div className="reward-card">
            <h3>Delegation Rewards</h3>
            <div className="reward-amount">
                <span>{rewards} EVOLVE</span>
                <button onClick={claimRewards}>Claim</button>
            </div>
            <div className="reward-history">
                <LineChart data={rewardHistory} />
            </div>
        </div>
    );
} 