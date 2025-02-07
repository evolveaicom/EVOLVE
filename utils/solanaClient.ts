import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { EvolveProgram } from "../programs/evolve";

export class EvolveClient {
    private program: Program<EvolveProgram>;
    
    constructor(conn: Connection, wallet: Wallet) {
        const provider = new AnchorProvider(conn, wallet, {});
        this.program = new Program<EvolveProgram>(
            EVOLVE_IDL as EvolveProgram,
            EVOLVE_PROGRAM_ID,
            provider
        );
    }

    async createTemplate(params: {
        name: string;
        lockDays: number;
        fee: number;
        rebate: number;
    }): Promise<string> {
        const templateAccount = Keypair.generate();
        const tx = await this.program.methods
            .createTemplate(
                params.name,
                params.lockDays,
                params.fee,
                params.rebate
            )
            .accounts({
                template: templateAccount.publicKey,
                creator: this.program.provider.wallet.publicKey,
            })
            .signers([templateAccount])
            .rpc();
        return tx;
    }

    async exportTemplateData(templatePubkey: PublicKey) {
        const template = await this.program.account.governanceTemplate
            .fetch(templatePubkey);
        
        return {
            name: template.name,
            version: template.version,
            parameters: {
                lockPeriod: template.lock_period,
                fee: template.fee,
                rebate: template.rebate
            }
        };
    }
} 