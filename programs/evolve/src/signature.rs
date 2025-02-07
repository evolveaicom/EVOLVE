use anchor_lang::solana_program::ed25519_program;

#[derive(Accounts)]
pub struct VerifySignature<'info> {
    #[account()]
    pub template: Account<'info, GovernanceTemplate>,
    /// CHECK: ED25519 signature verification
    pub signature: AccountInfo<'info>,
    pub signer: Signer<'info>,
}

impl<'info> VerifySignature<'info> {
    pub fn process(
        &mut self,
        message: Vec<u8>,
        signature: [u8; 64],
        public_key: [u8; 32],
    ) -> ProgramResult {
        let instruction = ed25519_program::ed25519_verify(
            &message,
            &signature,
            &public_key,
        );

        invoke(
            &instruction,
            &[
                self.signature.clone(),
                self.signer.clone(),
            ],
        )
    }
} 