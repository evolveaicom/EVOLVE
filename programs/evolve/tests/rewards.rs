#[tokio::test]
async fn test_reward_distribution() {
    let test_env = TestEnvironment::new();
    let pool = test_env.initialize_pool(1000).await;
    
    // 委托100代币
    test_env.create_delegation(100).await;
    
    // 推进时间1周
    test_env.warp_to(604800).await;
    
    // 计算预期奖励
    let expected_reward = 100 * 7 * 24 * 3600 * pool.reward_rate / pool.total_shares;
    
    // 领取奖励
    let claim_tx = test_env.claim_rewards().await;
    assert!(claim_tx.is_ok());
    
    // 验证余额变化
    let balance = test_env.get_token_balance().await;
    assert_eq!(balance, INITIAL_BALANCE + expected_reward);
} 