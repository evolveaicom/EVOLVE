#[tokio::test]
async fn test_proposal_lifecycle() {
    let test_env = TestEnvironment::new();
    let proposal_title = "Upgrade Protocol Version";
    
    // 创建提案
    let create_tx = test_env
        .create_proposal(proposal_title, "Technical upgrade to v2.0", VotingType::TokenWeighted { min_balance: 100 })
        .await;
    assert!(create_tx.is_ok());

    // 获取提案账户
    let proposal_pda = test_env.get_proposal_pda(proposal_title);
    let proposal = test_env.get_proposal(proposal_pda).await;
    assert_eq!(proposal.status, ProposalStatus::Active);

    // 模拟投票
    let vote_tx = test_env
        .cast_vote(proposal_pda, VoteType::Approve, 500)
        .await;
    assert!(vote_tx.is_ok());

    // 推进时间至投票结束
    test_env.warp_to(proposal.end_time + 1).await;

    // 验证最终状态
    let final_proposal = test_env.get_proposal(proposal_pda).await;
    assert_eq!(final_proposal.status, ProposalStatus::Approved);
    assert_eq!(final_proposal.approve_votes, 500);
}

#[tokio::test]
async fn test_proposal_flow() {
    // Initialize test environment
    let test_env = TestEnvironment::new();
    
    // Create valid proposal
    let tx = test_env.create_proposal(...).await;
} 