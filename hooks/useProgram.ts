import { useMemo } from 'react';
import { Program, AnchorProvider } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { EvolveIDL } from '../idl/evolve';

const PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID');

export const useProgram = () => {
    const wallet = useAnchorWallet();
    
    const program = useMemo(() => {
        if (!wallet) return null;
        
        const connection = new Connection('YOUR_RPC_URL');
        const provider = new AnchorProvider(connection, wallet, {});
        
        return new Program(EvolveIDL, PROGRAM_ID, provider);
    }, [wallet]);

    return { program };
}; 