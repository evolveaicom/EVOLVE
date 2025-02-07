use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;

#[derive(Accounts)]
pub struct ExportData<'info> {
    #[account(mut)]
    pub template: Account<'info, GovernanceTemplate>,
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = payer
    )]
    pub export_token: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

// 使用Solana的压缩NFT实现数据验证
#[derive(Accounts)]
pub struct CreateExportNFT<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = 200,
        seeds = [b"export", template.key().as_ref()],
        bump
    )]
    pub export_data: Account<'info, ExportMetadata>,
    pub template: Account<'info, GovernanceTemplate>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct ExportMetadata {
    pub template_hash: [u8; 32],
    pub signature: [u8; 64],
    pub valid_until: i64,
}

impl DataExporter {
    // Generate CSV report
    pub fn generate_report(&self) -> Result<Vec<u8>> {
        ...
    }
} 