import { PublicKey } from '@solana/web3.js';

export interface Delegation {
    publicKey: PublicKey;
    delegator: PublicKey;
    delegatee: PublicKey;
    amount: number;
    lockUntil: number;
    revoked: boolean;
}

export interface DelegationProps {
    delegation: Delegation;
    onRevoke?: (delegationKey: PublicKey) => Promise<void>;
} 