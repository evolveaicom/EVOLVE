#[tokio::test]
async fn test_multi_token_rewards() {
    let test_env = TestEnvironment::new();
    let usdc_mint = test_env.create_mint("USDC", 6).await;
    let eth_mint = test_env.create_mint("WETH", 18).await;
    
    // 添加两种奖励代币
    test_env.add_reward_token(usdc_mint, 100).await;
    test_env.add_reward_token(eth_mint, 50).await;
    
    // 委托100代币
    test_env.create_delegation(100).await;
    
    // 推进时间1天
    test_env.warp_to(86400).await;
    
    // 领取USDC奖励
    let usdc_balance_before = test_env.get_token_balance(usdc_mint).await;
    test_env.claim_rewards(usdc_mint).await;
    let usdc_balance_after = test_env.get_token_balance(usdc_mint).await;
    assert_eq!(usdc_balance_after - usdc_balance_before, 100 * 86400 * 100 / 100);
    
    // 领取ETH奖励
    let eth_balance_before = test_env.get_token_balance(eth_mint).await;
    test_env.claim_rewards(eth_mint).await;
    let eth_balance_after = test_env.get_token_balance(eth_mint).await;
    assert_eq!(eth_balance_after - eth_balance_before, 100 * 86400 * 50 / 100);
}

#[tokio::test]
async fn test_multi_token_distribution() {
    let test_env = TestEnvironment::new();
    let usdc_mint = test_env.create_mint("USDC", 6).await;
    let eth_mint = test_env.create_mint("WETH", 18).await;
    
    // 添加两种奖励代币
    test_env.add_reward_token(usdc_mint, 100).await;
    test_env.add_reward_token(eth_mint, 50).await;
    
    // 委托100代币
    test_env.create_delegation(100).await;
    
    // 推进时间1天
    test_env.warp_to(86400).await;
    
    // 领取USDC奖励
    let usdc_balance_before = test_env.get_token_balance(usdc_mint).await;
    test_env.claim_rewards(usdc_mint).await;
    let usdc_balance_after = test_env.get_token_balance(usdc_mint).await;
    assert_eq!(usdc_balance_after - usdc_balance_before, 100 * 86400 * 100 / 100);
    
    // 领取ETH奖励
    let eth_balance_before = test_env.get_token_balance(eth_mint).await;
    test_env.claim_rewards(eth_mint).await;
    let eth_balance_after = test_env.get_token_balance(eth_mint).await;
    assert_eq!(eth_balance_after - eth_balance_before, 100 * 86400 * 50 / 100);
} 