use anchor_lang::prelude::*;

#[account]
pub struct ParameterHistory {
    pub template: Pubkey,       // Associated template PDA
    pub timestamps: Vec<i64>,   // Unix timestamp array
    pub lock_periods: Vec<u8>,  // Lock period history (days)
    pub fees: Vec<u8>,          // Fee percentage history
    pub rebates: Vec<u8>,       // Rebate percentage history
}

#[derive(Accounts)]
pub struct RecordParameterChange<'info> {
    #[account(mut, has_one = template)]
    pub history: Account<'info, ParameterHistory>,
    pub template: Account<'info, GovernanceTemplate>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[program]
impl<'info> RecordParameterChange<'info> {
    pub fn execute(ctx: Context<Self>, new_lock: u8, new_fee: u8, new_rebate: u8) -> Result<()> {
        let history = &mut ctx.accounts.history;
        
        history.timestamps.push(Clock::get()?.unix_timestamp);
        history.lock_periods.push(new_lock);
        history.fees.push(new_fee);
        history.rebates.push(new_rebate);
        
        Ok(())
    }
} 