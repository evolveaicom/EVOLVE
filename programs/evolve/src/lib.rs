use anchor_lang::prelude::*;

#[program]
pub mod evolve {
    use super::*;

    #[state]
    pub struct EvolveProgram {
        pub admin: Pubkey,
        pub template_count: u64,
    }

    impl EvolveProgram {
        pub fn new(ctx: Context<Auth>) -> Result<Self> {
            Ok(Self {
                admin: *ctx.accounts.admin.key,
                template_count: 0,
            })
        }
    }

    #[derive(Accounts)]
    pub struct CreateTemplate<'info> {
        #[account(init, payer = creator, space = 8 + 32 + 4 + 1 + 1 + 1)]
        pub template: Account<'info, GovernanceTemplate>,
        #[account(mut)]
        pub creator: Signer<'info>,
        pub system_program: Program<'info, System>,
    }

    #[account]
    pub struct GovernanceTemplate {
        pub name: String,
        pub version: u32,
        pub lock_period: u8,  // Days
        pub fee: u8,          // Percentage
        pub rebate: u8,       // Percentage
        pub active: bool,
    }

    #[derive(Accounts)]
    pub struct UpdateTemplate<'info> {
        #[account(mut, has_one = admin)]
        pub template: Account<'info, GovernanceTemplate>,
        pub admin: Signer<'info>,
    }

    // 添加时间锁功能
    #[account]
    pub struct Timelock {
        pub template: Pubkey,
        pub eta: i64,
        pub queued: bool,
    }

    #[error_code]
    pub enum ErrorCode {
        #[msg("Title exceeds maximum length (64 characters)")]
        TitleTooLong,
        #[msg("Description exceeds maximum length (512 characters)")]
        DescriptionTooLong,
        #[msg("Voting period has ended")]
        VotingClosed,
        #[msg("Insufficient voting power")]
        InsufficientVotingPower
    }
} 