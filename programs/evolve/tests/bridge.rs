#[tokio::test]
async fn test_cross_chain_transfer() {
    let program = test_program();
    let eth_recipient = [0u8; 32];
    
    let tx = program
        .request()
        .accounts(evolve::accounts::CrossChainTransfer {
            payer: program.payer(),
            wormhole_bridge: wormhole_program(),
            token_bridge: token_bridge_program(),
            from_token_account: test_token_account(),
            to_token_account: eth_recipient,
            system_program: System::id(),
        })
        .args(evolve::instruction::CrossChainTransfer {
            amount: 100_000_000, // 100 tokens (6 decimals)
            target_chain: 2,     // Ethereum
            target_address: eth_recipient,
        })
        .send()
        .await;

    assert!(tx.is_ok());
    
    // Verify token burn on Solana
    let token_account = get_token_balance(test_token_account()).await;
    assert_eq!(token_account, INITIAL_BALANCE - 100_000_000);
} 