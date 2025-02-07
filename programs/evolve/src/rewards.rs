#[account]
pub struct RewardPool {
    pub total_shares: u64,          // 总委托份额
    pub total_rewards: u64,          // 奖励池总量
    pub last_update: i64,            // 最后更新时间戳
    pub reward_rate: u64,            // 每秒奖励率
}

#[derive(Accounts)]
pub struct StakeDelegation<'info> {
    #[account(mut)]
    pub pool: Account<'info, RewardPool>,
    #[account(mut)]
    pub delegation: Account<'info, Delegation>,
    pub clock: Sysvar<'info, Clock>,
}

#[program]
impl<'info> StakeDelegation<'info> {
    pub fn update_rewards(&mut self) -> Result<()> {
        let time_elapsed = self.clock.unix_timestamp - self.pool.last_update;
        let new_rewards = time_elapsed as u64 * self.pool.reward_rate;
        
        self.pool.total_rewards += new_rewards;
        self.pool.last_update = self.clock.unix_timestamp;
        
        // 按比例分配奖励
        let delegation_share = self.delegation.amount * 1_000_000 / self.pool.total_shares;
        let reward = new_rewards * delegation_share / 1_000_000;
        
        self.delegation.pending_rewards += reward;
        Ok(())
    }
}

impl RewardPool {
    pub fn adjust_reward_rate(
        &mut self,
        total_delegated: u64,
        target_apy: u64
    ) -> Result<()> {
        let annual_seconds = 365 * 24 * 60 * 60;
        let rate = (total_delegated * target_apy) / (annual_seconds * 100);
        
        self.reward_rate = rate;
        Ok(())
    }

    // Update reward accumulation
    pub fn update_rewards(&mut self) {
        let elapsed_time = ...;
        self.total_rewards += elapsed_time * self.reward_rate;
    }
} 