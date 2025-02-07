use anchor_lang::prelude::*;
use wormhole_sdk::{
    post_vaa, 
    bridge::Bridge,
    token_bridge::TokenBridge
};

#[derive(Accounts)]
pub struct CrossChainTransfer<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    // Wormhole accounts
    pub wormhole_bridge: Program<'info, Bridge>,
    pub token_bridge: Program<'info, TokenBridge>,
    
    // Token accounts
    #[account(mut)]
    pub from_token_account: AccountInfo<'info>,
    #[account(mut)]
    pub to_token_account: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyVAA<'info> {
    /// CHECK: VAA verification
    pub vaa: AccountInfo<'info>,
    pub wormhole: Program<'info, Bridge>,
}

#[program]
impl<'info> CrossChainTransfer<'info> {
    pub fn execute(
        ctx: Context<Self>,
        amount: u64,
        target_chain: u16,
        target_address: [u8; 32]
    ) -> Result<()> {
        // 1. Initiate token burn on Solana
        let burn_ix = spl_token::instruction::burn(
            &spl_token::id(),
            ctx.accounts.from_token_account.key,
            ctx.accounts.payer.key,
            &[],
            amount
        )?;
        
        // 2. Post VAA to Wormhole
        let vaa = post_vaa(
            ctx.accounts.wormhole_bridge,
            target_chain,
            target_address,
            amount.to_le_bytes()
        )?;
        
        // 3. Create redeem instruction
        let redeem_ix = token_bridge::instruction::redeem(
            &ctx.accounts.token_bridge,
            vaa,
            ctx.accounts.to_token_account.key
        )?;
        
        Ok(())
    }
}

impl<'info> VerifyVAA<'info> {
    pub fn verify(&self) -> Result<()> {
        let guardian_set = self.wormhole.load_guardian_set()?;
        let vaa = parse_vaa(&self.vaa.data.borrow())?;
        
        verify_signatures(
            &vaa,
            &guardian_set,
            MIN_SIGNATURES
        )?;
        
        Ok(())
    }
} 