const { expect } = require("chai");

describe("Pressure Test Suite", () => {
  let initialBurnRate;
  
  beforeEach(async () => {
    initialBurnRate = await token.burnRate();
  });

  it("Should cap burn rate at 100%", async () => {
    // Test maximum pressure threshold
    await token.connect(ai).updateEnvironmentalPressure(200);
    expect(await token.burnRate()).to.equal(100);
  });

  it("Should maintain linear adjustment under normal pressure", async () => {
    // Test standard pressure application
    const pressure = 30;
    await token.connect(ai).updateEnvironmentalPressure(pressure);
    const expectedRate = initialBurnRate + (initialBurnRate * pressure / 100);
    expect(await token.burnRate()).to.equal(Math.min(expectedRate, 100));
  });
});

describe("Governance Stability Tests", () => {
  it("Should prevent rapid parameter changes", async () => {
    // Initial change
    await token.connect(ai).submitGovernanceProposal(4, 20, 8 hours);
    
    // Attempt immediate second change
    await expect(
      token.connect(ai).submitGovernanceProposal(2, 30, 12 hours)
    ).to.be.revertedWith("Timelock not expired");
  });

  it("Should maintain historical records", async () => {
    await token.connect(ai).submitGovernanceProposal(5, 18, 1 days);
    const history = await token.getGovernanceHistory(1);
    
    expect(history[0].minDuration).to.equal(5);
    expect(history[0].quorum).to.equal(18);
    expect(history[0].delay).to.equal(86400); // 1 day in seconds
  });
});

describe("Extreme Condition Tests", () => {
  it("Should handle maximum pressure continuously", async () => {
    for (let i = 0; i < 5; i++) {
      await token.connect(ai).updateEnvironmentalPressure(100);
      await ethers.provider.send("evm_increaseTime", [3600]); // Advance 1 hour
      await ethers.provider.send("evm_mine");
    }
    expect(await token.burnRate()).to.equal(100);
  });

  it("Should prevent governance takeover", async () => {
    // Simulate rapid successive proposals
    await token.connect(ai).submitGovernanceProposal(1, 49, 6 hours);
    await expect(
      token.connect(ai).submitGovernanceProposal(1, 50, 6 hours)
    ).to.be.revertedWith("Timelock not expired");
  });
});

describe("Alert Severity Tests", () => {
  it("Should classify critical quorum changes", async () => {
    await token.connect(ai).submitGovernanceProposal(3, 35, 1 days);
    const history = await token.getGovernanceHistory(1);
    expect(history[0].severity).to.equal(AlertLevel.CRITICAL);
  });

  it("Should detect high duration changes", async () => {
    await token.connect(ai).submitGovernanceProposal(7, 20, 1 days); // +4 days
    const history = await token.getGovernanceHistory(1);
    expect(history[0].severity).to.equal(AlertLevel.HIGH);
  });
});

describe("Custom Threshold Tests", () => {
  it("Should trigger alerts based on user settings", async () => {
    // Set custom threshold
    await token.connect(user1).setAlertThresholds(2, 5, 6*3600, true);
    
    // Make governance change
    await token.connect(ai).submitGovernanceProposal(3, 8, 12*3600);
    
    // Verify alert severity
    const userThreshold = await token.userThresholds(user1.address);
    expect(userThreshold.customEnabled).to.be.true;
  });

  it("Should ignore disabled thresholds", async () => {
    await token.connect(user2).setAlertThresholds(1, 2, 1*3600, false);
    const result = await token.userThresholds(user2.address);
    expect(result.customEnabled).to.be.false;
  });
});

describe("Threshold Template Tests", () => {
  it("Should load default templates", async () => {
    const templates = await token.getAvailableTemplates();
    expect(templates.length).to.equal(3);
    expect(templates[0].name).to.equal("Conservative");
  });

  it("Should apply template settings", async () => {
    await token.connect(user1).setAlertThresholds(2, 5, 12*3600, true);
    const thresholds = await token.userThresholds(user1.address);
    expect(thresholds.minDuration).to.equal(2);
  });
});

describe("Community Template Tests", () => {
  it("Should accept valid template submissions", async () => {
    await token.connect(user1).submitCommunityTemplate("Test", 3, 15, 24*3600);
    const templates = await token.communityTemplates(0);
    expect(templates.name).to.equal("Test");
  });

  it("Should prevent invalid submissions", async () => {
    await expect(
      token.connect(user1).submitCommunityTemplate("TooLongNameeeeeeeeeeeee", 3, 15, 24*3600)
    ).to.be.revertedWith("Name too long");
  });

  it("Should track template votes", async () => {
    await token.connect(user1).submitCommunityTemplate("Test", 3, 15, 24*3600);
    await token.connect(user2).voteForTemplate(0);
    expect(await token.hasVoted(user2.address, 0)).to.be.true;
  });
});

describe("Reward System Tests", () => {
  it("Should distribute rewards on template adoption", async () => {
    await token.connect(user1).submitCommunityTemplate("Test", 3, 15, 24*3600);
    await token.connect(user2).voteForTemplate(0);
    
    const submitterRewards = await token.userRewards(user1.address);
    const voterRewards = await token.userRewards(user2.address);
    
    expect(submitterRewards[0].amount).to.equal(REWARD_PER_VOTE * 0.5);
    expect(voterRewards[0].amount).to.equal(REWARD_PER_VOTE * 0.5);
  });

  it("Should enforce claim time lock", async () => {
    await token.connect(user1).submitCommunityTemplate("Test", 3, 15, 24*3600);
    await expect(
      token.connect(user1).claimRewards([0])
    ).to.be.revertedWith("Too early");
  });
});

describe("Tokenized Rewards", () => {
  let rewardToken;
  
  beforeEach(async () => {
    const RewardToken = await ethers.getContractFactory("EvolveReward");
    rewardToken = await RewardToken.deploy();
    await token.initializeRewardToken(rewardToken.address);
  });

  it("Should mint rewards on template adoption", async () => {
    await token.submitCommunityTemplate("Test", 3, 15, 24*3600);
    await token.voteForTemplate(0);
    
    const balance = await rewardToken.balanceOf(user1.address);
    expect(balance).to.equal(50); // 50% of 100 EVR
  });
});

describe("Staking System", () => {
  it("Should accept token stakes", async () => {
    await token.connect(user1).stakeTokens(1000);
    const stake = await token.stakes(user1.address);
    expect(stake.amount).to.equal(1000);
  });

  it("Should calculate accurate rewards", async () => {
    await token.connect(user1).stakeTokens(1000);
    await ethers.provider.send("evm_increaseTime", [365 days]);
    
    const rewards = await token.calculateRewards(user1.address);
    expect(rewards).to.equal(100); // 10% of 1000
  });
});

describe("Tiered Staking", () => {
  it("Should apply correct tier rates", async () => {
    await token.connect(user1).stakeTokens(5000);
    const stake = await token.stakes(user1.address);
    const tier = await token.rateTiers(stake.tierIndex);
    
    await ethers.provider.send("evm_increaseTime", [365 days]);
    const rewards = await token.calculateRewards(user1.address);
    expect(rewards).to.equal(5000 * 0.20); // 20% of 5000
  });

  it("Should enforce lock periods", async () => {
    await token.connect(user1).stakeTokens(10000);
    await expect(
      token.connect(user1).unstake()
    ).to.be.revertedWith("Lock period active");
  });
});

describe("Auto Tier Upgrade", () => {
  it("Should upgrade tier on additional stake", async () => {
    await token.connect(user1).stakeTokens(3000);
    await token.connect(user1).stakeTokens(3000);
    
    const position = await token.stakes(user1.address);
    expect(position.tierIndex).to.equal(1); // Should be Tier 2 (5000+)
  });

  it("Should maintain highest tier", async () => {
    await token.connect(user1).stakeTokens(15000);
    const position = await token.stakes(user1.address);
    expect(position.tierIndex).to.equal(2); // Tier 3
  });
});

describe("Partial Withdrawal", () => {
  it("Should allow partial unstaking", async () => {
    await token.connect(user1).stakeTokens(10000);
    await ethers.provider.send("evm_increaseTime", [90 days]);
    
    await token.connect(user1).unstake(5000);
    const position = await token.stakes(user1.address);
    expect(position.amount).to.equal(5000);
  });

  it("Should auto-downgrade tiers", async () => {
    await token.connect(user1).stakeTokens(10000);
    await ethers.provider.send("evm_increaseTime", [90 days]);
    
    await token.connect(user1).unstake(6000);
    const position = await token.stakes(user1.address);
    expect(position.tierIndex).to.equal(1); // Should downgrade to Tier 2
  });
});

describe("Withdrawal Fees", () => {
  beforeEach(async () => {
    await token.configureFees(30, feeCollector.address); // 3% fee
  });

  it("Should deduct fees on withdrawal", async () => {
    await token.connect(user1).stakeTokens(1000);
    await ethers.provider.send("evm_increaseTime", [90 days]);
    
    const preBalance = await token.balanceOf(user1.address);
    await token.connect(user1).unstake(1000);
    const postBalance = await token.balanceOf(user1.address);
    
    expect(postBalance - preBalance).to.equal(970); // 1000 - 3%
  });

  it("Should distribute fees correctly", async () => {
    await token.connect(user1).unstake(1000);
    expect(await token.balanceOf(feeCollector.address)).to.equal(30);
  });
});

describe("Dynamic Fee Tiers", () => {
  it("Should apply correct fee rates", async () => {
    await token.connect(user1).stakeTokens(15000);
    await ethers.provider.send("evm_increaseTime", [90 days]);
    
    // Withdraw 7000 (Tier 2: 2% fee)
    await token.connect(user1).unstake(7000);
    const received = 7000 * 0.98;
    expect(await token.balanceOf(user1.address)).to.equal(received);
  });

  it("Should redistribute fee portions", async () => {
    await token.connect(user1).unstake(1000);
    const burned = 1000 * 0.03 * 0.8; // 3% fee, 80% burned
    expect(await token.totalSupply()).to.equal(initialSupply - burned);
  });
});

describe("DAO Governance", () => {
  let dao;
  
  beforeEach(async () => {
    const DAO = await ethers.getContractFactory("EvolveDAO");
    dao = await DAO.deploy(token.address);
  });

  it("Should execute fee change through proposal", async () => {
    // Create proposal
    const calldata = token.interface.encodeFunctionData("configureFees", [30, feeCollector]);
    await dao.propose([token.address], [0], [calldata], "Lower withdrawal fee");
    
    // Vote and execute
    await dao.castVote(1, 1); // Vote for
    await ethers.provider.send("evm_increaseTime", [45818]);
    await dao.execute([token.address], [0], [calldata], ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Lower withdrawal fee")));
    
    expect(await token.withdrawalFee()).to.equal(30);
  });
});

describe("Vote Delegation", () => {
  it("Should allow vote delegation", async () => {
    await token.connect(user1).delegate(user2.address);
    expect(await token.delegates(user1.address)).to.equal(user2.address);
  });

  it("Should count delegated votes", async () => {
    await token.connect(user1).delegate(user2.address);
    await dao.propose(...);
    
    const votes = await dao.getVotes(user2.address, 1);
    expect(votes).to.equal(await token.balanceOf(user1.address));
  });
});

describe("Delegation Revocation", () => {
  it("Should allow undelegation", async () => {
    await token.connect(user1).delegate(user2.address);
    await dao.undelegate();
    expect(await token.delegates(user1.address)).to.equal(user1.address);
  });

  it("Should reset voting power", async () => {
    await token.connect(user1).delegate(user2.address);
    await dao.undelegate();
    const votes = await dao.getVotes(user1.address, 1);
    expect(votes).to.equal(await token.balanceOf(user1.address));
  });
});

describe("Delegation Time Lock", () => {
  it("Should enforce delegation lock", async () => {
    await token.connect(user1).delegate(user2.address);
    await expect(
      token.connect(user1).undelegate()
    ).to.be.revertedWith("Delegation locked");
  });

  it("Should allow undelegate after lock period", async () => {
    await token.connect(user1).delegate(user2.address);
    await ethers.provider.send("evm_increaseTime", [3 * 86400 + 1]);
    await token.connect(user1).undelegate();
    expect(await token.delegates(user1.address)).to.equal(user1.address);
  });
});

describe("Dynamic Lock Period", () => {
  it("Should update via governance", async () => {
    const calldata = token.interface.encodeFunctionData("setDelegationLock", [5 * 86400]);
    await dao.propose([token.address], [0], [calldata], "Increase lock period");
    
    await dao.execute(...);
    expect(await token.delegationLockPeriod()).to.equal(5 days);
  });

  it("Should affect new delegations", async () => {
    await token.setDelegationLock(7 days);
    await token.connect(user1).delegate(user2.address);
    const record = await token.delegationHistory(user1.address, 0);
    expect(record.lockUntil).to.equal(record.timestamp + 7 days);
  });
});

describe("Governance Templates", () => {
  const testTemplate = {
    name: "LowFeeTemplate",
    lockDays: 7,
    fee: 1,
    rebate: 30
  };

  it("Should create new template via governance", async () => {
    const calldata = token.interface.encodeFunctionData(
      "saveGovernanceTemplate",
      [testTemplate.name, testTemplate.lockDays, testTemplate.fee, testTemplate.rebate]
    );
    
    await dao.propose([token.address], [0], [calldata], "Add Low Fee Template");
    await executeProposal(dao, 1);
    
    const templateId = ethers.utils.id(testTemplate.name);
    const stored = await token.governanceTemplates(templateId);
    expect(stored.fee).to.equal(testTemplate.fee);
  });

  it("Should apply template parameters", async () => {
    const templateId = ethers.utils.id(testTemplate.name);
    await token.applyTemplate(templateId);
    
    expect(await token.delegationLockPeriod()).to.equal(testTemplate.lockDays * 86400);
    expect(await token.withdrawalFee()).to.equal(testTemplate.fee);
  });
});

describe("Template Version Control", () => {
  const templateName = "StableV1";
  
  it("Should create template versions", async () => {
    // Create initial version
    await token.saveGovernanceTemplate(templateName, 7, 1, 30);
    
    // Create updated version
    await token.saveGovernanceTemplate(templateName, 14, 2, 25);
    
    const templateId = ethers.utils.id(templateName);
    const tpl = await token.governanceTemplates(templateId);
    expect(tpl.latestVersion).to.equal(2);
  });

  it("Should apply specific version", async () => {
    const templateId = ethers.utils.id(templateName);
    await token.applyTemplate(templateId, 1);
    expect(await token.delegationLockPeriod()).to.equal(7 days);
    
    await token.applyTemplate(templateId, 2);
    expect(await token.delegationLockPeriod()).to.equal(14 days);
  });
});

describe("Version Change Logs", () => {
  const templateName = "SecureV2";
  
  it("Should record version changes", async () => {
    await token.saveGovernanceTemplate(templateName, 7, 1, 30);
    await token.saveGovernanceTemplate(templateName, 14, 2, 25);
    
    const templateId = ethers.utils.id(templateName);
    const changes = await token.templateChangeLogs(templateId);
    
    expect(changes.length).to.equal(2);
    expect(changes[1].newLock).to.equal(14 * 86400);
  });

  it("Should show correct delta values", async () => {
    const templateId = ethers.utils.id(templateName);
    const change = await token.templateChangeLogs(templateId, 1);
    
    expect(change.oldLock).to.equal(0);
    expect(change.newLock).to.equal(7 * 86400);
    expect(change.oldFee).to.equal(0);
  });
});

describe("Change Reason Tracking", () => {
  it("Should record change reasons", async () => {
    await token.saveGovernanceTemplate(
      "SecureV3", 
      7, 
      1, 
      30,
      "Optimize for lower fee environment"
    );
    
    const changes = await token.templateChangeLogs(ethers.utils.id("SecureV3"));
    expect(changes[0].reason).to.equal("Optimize for lower fee environment");
  });

  it("Should enforce reason length", async () => {
    await expect(
      token.saveGovernanceTemplate("Test", 1, 1, 1, "short")
    ).to.be.revertedWith("Reason too short");
  });
});

describe("Change Categorization", () => {
  it("Should store category and tags", async () => {
    await token.saveGovernanceTemplate(
      "SecureV4",
      7, 1, 30,
      "Optimize security parameters",
      1, // SECURITY category
      ["security", "audit"]
    );
    
    const changes = await token.templateChangeLogs(ethers.utils.id("SecureV4"));
    expect(changes[0].category).to.equal(1);
    expect(changes[0].tags).to.deep.equal(["security", "audit"]);
  });

  it("Should enforce tag limits", async () => {
    await expect(
      token.saveGovernanceTemplate(
        "Test", 1,1,1, "valid reason", 0, 
        ["1","2","3","4","5","6"]
      )
    ).to.be.revertedWith("Too many tags");
  });
});

describe("Governance Statistics", () => {
  const testTags = ["security", "scaling", "test"];

  it("Should track category usage", async () => {
    await token.saveGovernanceTemplate("Test",1,1,1,"reason",1,testTags);
    const stats = await token.templateCategoryStats(ethers.utils.id("Test"));
    expect(stats.security).to.equal(1);
  });

  it("Should count tag usage", async () => {
    await token.saveGovernanceTemplate("Test",1,1,1,"reason",0,testTags);
    expect(await token.tagUsageCount("security")).to.equal(1);
    expect(await token.tagUsageCount("scaling")).to.equal(1);
  });
});

describe("Time Range Filter", () => {
  const templateName = "TimeTest";
  
  it("Should filter changes by timestamp", async () => {
    const start = Math.floor(Date.now()/1000);
    await token.saveGovernanceTemplate(templateName, 7, 1, 30);
    await ethers.provider.send("evm_increaseTime", [3600]);
    await token.saveGovernanceTemplate(templateName, 8, 2, 25);
    const end = Math.floor(Date.now()/1000);
    
    const changes = await token.getChangesByTimeRange(
      ethers.utils.id(templateName), 
      start, 
      end
    );
    expect(changes.length).to.equal(2);
  });
});

describe("Template Comparison", () => {
  const templateNames = ["TemplateA", "TemplateB"];
  
  before(async () => {
    await token.saveGovernanceTemplate(templateNames[0], 7, 1, 30);
    await token.saveGovernanceTemplate(templateNames[1], 14, 2, 25);
  });

  it("Should compare multiple templates", async () => {
    const templateIds = templateNames.map(n => ethers.utils.id(n));
    const comparison = await token.compareTemplates(templateIds);
    
    expect(comparison.names).to.deep.equal(templateNames);
    expect(comparison.versions[0]).to.equal(1);
    expect(comparison.recentParams[0][1]).to.equal(1); // TemplateA fee
  });
});

describe("Data Export", () => {
  const templateName = "ExportTest";
  
  before(async () => {
    await token.saveGovernanceTemplate(
      templateName, 
      7, 1, 30, 
      "Initial version for testing", 
      0, ["test", "export"]
    );
  });

  it("Should export template data", async () => {
    const templateId = ethers.utils.id(templateName);
    const data = await token.exportTemplateData(templateId);
    
    expect(data.name).to.equal(templateName);
    expect(data.changes.length).to.equal(1);
    expect(data.topTags).to.include("test");
  });
});

describe("Batch Export", () => {
  const templates = ["BatchA", "BatchB"];
  
  before(async () => {
    await token.saveGovernanceTemplate(templates[0], 7, 1, 30);
    await token.saveGovernanceTemplate(templates[1], 14, 2, 25);
  });

  it("Should export multiple templates", async () => {
    const templateIds = templates.map(n => ethers.utils.id(n));
    const data = await token.batchExportTemplates(templateIds);
    
    expect(data.names).to.deep.equal(templates);
    expect(data.allChanges[0].length).to.equal(1);
    expect(data.versions[1]).to.equal(1);
  });
});

describe("Data Validation", () => {
  const templateName = "ValidationTest";
  
  before(async () => {
    await token.saveGovernanceTemplate(templateName, 7, 1, 30);
  });

  it("Should verify valid data", async () => {
    const data = await token.exportTemplateData(ethers.utils.id(templateName));
    const isValid = await token.verifyExportData(
      ethers.utils.id(templateName),
      data.name,
      data.latestVersion,
      data.changes
    );
    expect(isValid).to.be.true;
  });

  it("Should detect tampered data", async () => {
    const data = await token.exportTemplateData(ethers.utils.id(templateName));
    data.changes[0].newFee = 99; // Alter fee value
    
    const isValid = await token.verifyExportData(
      ethers.utils.id(templateName),
      data.name,
      data.latestVersion,
      data.changes
    );
    expect(isValid).to.be.false;
  });
});

describe("Signed Exports", () => {
  const templateName = "SignedTest";
  
  before(async () => {
    await token.saveGovernanceTemplate(templateName, 7, 1, 30);
  });

  it("Should verify valid signatures", async () => {
    const data = await token.exportTemplateData(ethers.utils.id(templateName));
    const messageHash = await token.generateExportSignature(
      ethers.utils.id(templateName),
      data.name,
      data.latestVersion,
      data.changes
    );
    
    const sig = await owner.signMessage(ethers.utils.arrayify(messageHash));
    const signer = await token.verifySignedExport(
      ethers.utils.id(templateName),
      data.name,
      data.latestVersion,
      data.changes,
      sig
    );
    
    expect(signer).to.equal(owner.address);
  });
});

describe("Batch Signature Verification", () => {
  const templates = ["BatchSigA", "BatchSigB"];
  let signatures = [];
  
  before(async () => {
    // Generate test signatures
    for(const name of templates) {
      await token.saveGovernanceTemplate(name, 7, 1, 30);
      const data = await token.exportTemplateData(ethers.utils.id(name));
      const messageHash = await token.generateExportSignature(
        ethers.utils.id(name),
        data.name,
        data.latestVersion,
        data.changes
      );
      signatures.push(await owner.signMessage(ethers.utils.arrayify(messageHash)));
    }
  });

  it("Should verify multiple signatures", async () => {
    const templateIds = templates.map(n => ethers.utils.id(n));
    const dataList = await Promise.all(
      templateIds.map(id => token.exportTemplateData(id))
    );
    
    const result = await token.batchVerifySignatures(
      templateIds,
      dataList.map(d => d.name),
      dataList.map(d => d.latestVersion),
      dataList.map(d => d.changes),
      signatures
    );
    
    expect(result.isValid.every(v => v)).to.be.true;
    expect(result.signers.every(s => s === owner.address)).to.be.true;
  });
});

describe("Signature Revocation", () => {
  it("Should revoke valid signatures", async () => {
    const data = await token.exportTemplateData(templateId);
    const validUntil = Math.floor(Date.now()/1000) + 3600;
    
    const messageHash = await token.generateExportSignature(
      templateId,
      data.name,
      data.latestVersion,
      data.changes,
      validUntil
    );
    const sig = await owner.signMessage(ethers.utils.arrayify(messageHash));
    const sigHash = ethers.utils.keccak256(sig);

    await token.revokeSignature(sigHash);
    expect(await token.isSignatureRevoked(sigHash)).to.be.true;
  });

  it("Should reject revoked signatures", async () => {
    const data = await token.exportTemplateData(templateId);
    const validUntil = Math.floor(Date.now()/1000) + 3600;
    
    const messageHash = await token.generateExportSignature(
      templateId,
      data.name,
      data.latestVersion,
      data.changes,
      validUntil
    );
    const sig = await owner.signMessage(ethers.utils.arrayify(messageHash));
    const sigHash = ethers.utils.keccak256(sig);

    await token.revokeSignature(sigHash);
    
    await expect(
      token.verifySignedExport(
        templateId,
        data.name,
        data.latestVersion,
        data.changes,
        validUntil,
        sig
      )
    ).to.be.revertedWith("Signature revoked");
  });
}); 