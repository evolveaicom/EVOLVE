use anchor_lang::prelude::*;
use spl_account_compression::program::SplAccountCompression;

#[derive(Accounts)]
pub struct CreateVerifiedExport<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    // Compressed NFT storage
    #[account(
        init,
        payer = payer,
        space = 200,
        seeds = [b"cNFT", template.key().as_ref()],
        bump
    )]
    pub c_nft: Account<'info, CnftMetadata>,
    
    // Merkle树账户
    #[account(mut)]
    pub merkle_tree: AccountInfo<'info>,
    
    pub template: Account<'info, GovernanceTemplate>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct CnftMetadata {
    pub data_hash: [u8; 32],
    pub timestamp: i64,
    pub version: u32,
}

#[derive(Accounts)]
pub struct VerifyVAA<'info> {
    /// CHECK: VAA verification
    pub vaa: AccountInfo<'info>,
    pub wormhole: Program<'info, Bridge>,
}

#[account]
pub struct CnftProof {
    pub merkle_root: [u8; 32], // Merkle root
    pub proof_path: Vec<[u8; 32]>, // Verification path
} 