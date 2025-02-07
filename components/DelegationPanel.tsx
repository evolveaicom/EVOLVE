import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useProgram } from '../hooks/useProgram';
import { Delegation } from '../types/delegation';
import AddressInput from './AddressInput';
import NumberInput from './NumberInput';
import DelegationCard from './DelegationCard';

interface DelegationPanelProps {
    onDelegationCreate?: (delegation: Delegation) => void;
}

export default function DelegationPanel({ onDelegationCreate }: DelegationPanelProps) {
    const { publicKey } = useWallet();
    const { program } = useProgram();
    const [delegations, setDelegations] = useState<Delegation[]>([]);
    const [delegatee, setDelegatee] = useState<PublicKey>();
    const [amount, setAmount] = useState<number>(0);

    useEffect(() => {
        if (!publicKey || !program) return;
        refreshDelegations();
    }, [publicKey, program]);

    const refreshDelegations = async () => {
        if (!program || !publicKey) return;
        
        try {
            const delegations = await program.account.delegation.all([
                { memcmp: { offset: 8, bytes: publicKey.toBase58() }}
            ]);
            setDelegations(delegations.map(d => d.account));
        } catch (error) {
            console.error('Failed to fetch delegations:', error);
        }
    };

    const createDelegation = async (delegatee: PublicKey, amount: number) => {
        if (!publicKey) return;
        
        const tx = await program.methods
            .createDelegation(new BN(amount), 86400)
            .accounts({
                delegator: publicKey,
                delegatee
            })
            .rpc();
        
        await confirmTransaction(tx);
        refreshDelegations();
    };

    const revokeDelegation = async (delegationKey: PublicKey) => {
        // 实现撤销委托的逻辑
    };

    return (
        <div className="delegation-panel">
            <h3>Delegate Voting Power</h3>
            <AddressInput 
                label="Delegate To"
                onChange={setDelegatee}
            />
            <NumberInput 
                label="Amount"
                value={amount}
                onChange={setAmount}
            />
            <button 
                onClick={() => delegatee && createDelegation(delegatee, amount)}
                disabled={!delegatee || amount <= 0}
            >
                Delegate
            </button>
            
            <div className="active-delegations">
                {delegations.map(d => (
                    <DelegationCard 
                        key={d.publicKey.toString()}
                        delegation={d}
                        onRevoke={revokeDelegation}
                    />
                ))}
            </div>
        </div>
    );
} 