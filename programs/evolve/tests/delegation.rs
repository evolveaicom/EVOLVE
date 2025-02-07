#[tokio::test]
async fn test_delegated_voting() {
    let test_env = TestEnvironment::new();
    let alice = test_env.create_user(1000).await;
    let bob = test_env.create_user(500).await;
    
    // Alice委托500给Bob
    test_env.create_delegation(&alice, &bob, 500, 86400).await;
    
    // 创建提案
    let proposal_pda = test_env.create_proposal("Test").await;
    
    // Bob使用自己的500 + 委托的500进行投票
    test_env.cast_vote(proposal_pda, &bob, 1000).await;
    
    let proposal = test_env.get_proposal(proposal_pda).await;
    assert_eq!(proposal.approve_votes, 1000);
    
    // 验证委托锁定
    test_env.warp_to(86400).await;
    assert!(test_env.revoke_delegation(&alice).await.is_err());
    
    test_env.warp_to(86401).await;
    assert!(test_env.revoke_delegation(&alice).await.is_ok());

    // Advance time to end of voting period
    test_env.warp_to(proposal.end_time + 1).await;
} 