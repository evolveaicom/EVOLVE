#[program]
impl VotingSystem {
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        proposal_type: ProposalType
    ) -> Result<()> {
        require!(title.len() < 64, ErrorCode::TitleTooLong);
        require!(description.len() < 512, ErrorCode::DescriptionTooLong);
        
        let proposal = &mut ctx.accounts.proposal;
        proposal.creator = *ctx.accounts.creator.key;
        proposal.start_time = Clock::get()?.unix_timestamp;
        proposal.end_time = proposal.start_time + VOTING_PERIOD;
        proposal.status = ProposalStatus::Active;
        
        Ok(())
    }

    pub fn cast_vote(
        ctx: Context<CastVote>,
        vote_type: VoteType,
        voting_power: u64
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        require!(proposal.status == ProposalStatus::Active, ErrorCode::VotingClosed);
        
        match vote_type {
            VoteType::Approve => proposal.approve_votes += voting_power,
            VoteType::Reject => proposal.reject_votes += voting_power,
        }
        
        Ok(())
    }
}

#[account]
pub struct Proposal {
    pub title: String,          // Max 64 chars
    pub description: String,    // Max 512 chars
    pub creator: Pubkey,
    pub start_time: i64,
    pub end_time: i64,
    pub approve_votes: u64,
    pub reject_votes: u64,
    pub status: ProposalStatus,
    pub voting_type: VotingType,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum VotingType {
    TokenWeighted {   // Weighted by token balance
        min_balance: u64 
    },
    TimeLockWeighted { // Weighted by token lock duration
        min_lock_duration: u64 
    },
    Quadratic {        // Quadratic voting
        coefficient: f64
    }
}

impl Proposal {
    pub fn calculate_voting_power(
        &self,
        voter: &Account<Wallet>,
        delegations: &[Delegation],
        current_time: i64
    ) -> Result<u64> {
        let mut total_power = 0u64;
        
        // 计算直接投票权
        let base_power = match self.voting_type {
            VotingType::TokenWeighted { min_balance } => {
                require!(voter.balance >= min_balance, ErrorCode::InsufficientVotingPower);
                voter.balance
            },
            VotingType::TimeLockWeighted { min_lock_duration } => {
                let lock_duration = current_time - voter.deposit_time;
                require!(lock_duration >= min_lock_duration, ErrorCode::InsufficientLockTime);
                lock_duration as u64
            },
            VotingType::Quadratic { coefficient } => {
                let raw_power = (voter.balance as f64).sqrt() * coefficient;
                Ok(raw_power.floor() as u64)
            }
        };
        total_power += base_power?;
        
        // 计算委托投票权
        for d in delegations {
            if d.delegatee == voter.key() && !d.revoked && current_time < d.lock_until {
                total_power += d.amount;
            }
        }
        
        Ok(total_power)
    }
} 