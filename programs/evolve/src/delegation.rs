#[account]
pub struct Delegation {
    pub delegator: Pubkey,      // Delegator address
    pub delegatee: Pubkey,      // Delegatee address
    pub amount: u64,           // Delegated amount
    pub lock_until: i64,        // Lock expiration timestamp
    pub revoked: bool,          // Revocation status
}

#[derive(Accounts)]
pub struct CreateDelegation<'info> {
    #[account(init, payer = delegator, space = 8 + 32 + 32 + 8 + 8 + 1)]
    pub delegation: Account<'info, Delegation>,
    #[account(mut)]
    pub delegator: Signer<'info>,
    pub delegatee: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[program]
impl<'info> CreateDelegation<'info> {
    pub fn execute(
        ctx: Context<Self>,
        amount: u64,
        lock_duration: i64
    ) -> Result<()> {
        let delegation = &mut ctx.accounts.delegation;
        delegation.delegator = *ctx.accounts.delegator.key;
        delegation.delegatee = *ctx.accounts.delegatee.key;
        delegation.amount = amount;
        delegation.lock_until = Clock::get()?.unix_timestamp + lock_duration;
        delegation.revoked = false;
        
        // 锁定委托人的代币
        transfer_tokens(
            ctx.accounts.delegator,
            &delegation,
            amount
        )?;
        
        Ok(())
    }
} 