#[account]
pub struct MultiRewardPool {
    pub reward_tokens: Vec<Pubkey>,      // Supported reward tokens
    pub reward_rates: HashMap<Pubkey, u64>, // Reward rate per second per token
    pub total_shares: u64,               // Total delegated shares
    pub last_update: i64,                // Last update timestamp
}

#[derive(Accounts)]
pub struct ClaimMultiRewards<'info> {
    #[account(mut)]
    pub pool: Account<'info, MultiRewardPool>,
    #[account(mut)]
    pub delegation: Account<'info, Delegation>,
    #[account(mut)]
    pub reward_vault: AccountInfo<'info>, // 奖励代币保险库
    pub token_program: Program<'info, Token>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
pub struct AddRewardToken<'info> {
    #[account(mut, has_one = admin)]
    pub pool: Account<'info, MultiRewardPool>,
    pub admin: Signer<'info>,
    #[account(init,
        payer = admin,
        token::mint = token_mint,
        token::authority = pool
    )]
    pub reward_vault: Account<'info, TokenAccount>,
    pub token_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[program]
impl<'info> ClaimMultiRewards<'info> {
    pub fn claim_rewards(
        &mut self,
        token_mint: Pubkey
    ) -> Result<()> {
        let time_elapsed = self.clock.unix_timestamp - self.pool.last_update;
        let reward_rate = *self.pool.reward_rates.get(&token_mint)
            .ok_or(ErrorCode::InvalidRewardToken)?;
        
        let reward_amount = time_elapsed as u64 * reward_rate 
            * self.delegation.amount 
            / self.pool.total_shares;
        
        // 转账奖励代币
        transfer(
            &self.reward_vault,
            &self.delegation.delegator,
            reward_amount,
            &self.token_program
        )?;
        
        // 更新奖励池状态
        self.pool.last_update = self.clock.unix_timestamp;
        Ok(())
    }
}

#[program]
impl<'info> AddRewardToken<'info> {
    pub fn execute(
        ctx: Context<Self>,
        initial_rate: u64
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        
        require!(
            !pool.reward_tokens.contains(&ctx.accounts.token_mint.key()),
            ErrorCode::TokenAlreadyAdded
        );
        
        pool.reward_tokens.push(ctx.accounts.token_mint.key());
        pool.reward_rates.insert(ctx.accounts.token_mint.key(), initial_rate);
        
        Ok(())
    }
} 