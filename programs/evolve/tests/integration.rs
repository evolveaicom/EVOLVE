#[tokio::test]
async fn test_template_creation() {
    let program = test_program();
    let template_name = "Test Template";
    
    let (template_pda, _) = Pubkey::find_program_address(
        &[b"template", template_name.as_bytes()],
        &program.id()
    );

    let tx = program
        .request()
        .accounts(evolve::accounts::CreateTemplate {
            template: template_pda,
            creator: program.payer(),
            system_program: System::id(),
        })
        .args(evolve::instruction::CreateTemplate {
            name: template_name.to_string(),
            lock_days: 7,
            fee: 1,
            rebate: 30,
        })
        .send()
        .await;

    assert!(tx.is_ok());
    
    let template = program.account::<evolve::GovernanceTemplate>(template_pda).await;
    assert_eq!(template.name, template_name);
} 