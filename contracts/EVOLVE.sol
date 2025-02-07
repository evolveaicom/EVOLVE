// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract DarwinMeme {
    string public constant name = "$EVOLVE";
    string public symbol = "EvoV1";
    
    // Token base parameters
    uint256 public totalSupply;
    uint8 public decimals = 9;
    uint256 public burnRate = 3; // Base burn rate %
    
    // Evolution system parameters
    struct Mutation {
        string newSymbol;
        uint256 timestamp;
        uint256 newBurnRate;
        string visualDNA; // IPFS hash for mutation visual
        uint256 parentDNA;  // Index of parent mutation
        uint256 survivalRate; // Percentage of holders adopting this mutation
        uint256 voteCount; // Total votes received
        uint256 adaptationScore;
        bool isExtinct;
    }
    
    Mutation[] public mutationHistory;
    Mutation[] public currentProposals;
    uint256 public constant MUTATION_CYCLE = 1 days;
    
    // AI operator address
    address public aiOperator;
    
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowances;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event MutationProposal(uint256 proposalId);
    event MutationApplied(uint256 mutationId);
    
    // 添加环境压力参数
    struct Environment {
        uint256 pressure;          // 0-100
        uint256 complexity;        // 0-100
        uint256 resourceScarcity;  // 0-100
        uint256 competitionLevel;  // 0-100
        uint256 lastUpdate;
    }

    Environment public environment;
    
    // 添加压力事件
    event EnvironmentPressureUpdated(uint256 timestamp, uint256 pressure, uint256 newBurnRate);
    
    // Add to contract events
    event MutationRecord(
        uint256 indexed generation,
        string symbol,
        uint256 burnRate,
        uint256 environmentalPressure,
        uint256 survivalRate,
        uint256 timestamp
    );
    
    // 添加治理参数
    struct Governance {
        uint256 minProposalDuration;
        uint256 quorumPercentage;
        uint256 executionDelay;
    }

    Governance public governance = Governance({
        minProposalDuration: 3 days,
        quorumPercentage: 15,
        executionDelay: 1 days
    });

    // 添加时间锁机制
    modifier timelocked() {
        require(block.timestamp >= mutationHistory[mutationHistory.length-1].timestamp + governance.executionDelay, 
            "Timelock not expired");
        _;
    }

    // Add governance history tracking
    struct GovernanceChange {
        uint256 timestamp;
        uint256 minDuration;
        uint256 quorum;
        uint256 delay;
    }

    GovernanceChange[] public governanceHistory;

    // Add notification event
    event GovernanceAlert(
        uint256 indexed changeId,
        address initiatedBy,
        string changeType,
        int256 valueBefore,
        int256 valueAfter,
        uint256 effectiveTime,
        AlertLevel severity,
        address[] subscribers
    );

    // Add notification subscription
    struct NotificationPref {
        address subscriber;
        bool emailAlerts;
        bool smsAlerts;
        bool onChainAlerts;
    }

    mapping(address => NotificationPref) public notificationPrefs;

    function setNotificationPref(
        bool email,
        bool sms,
        bool onChain
    ) external {
        notificationPrefs[msg.sender] = NotificationPref(
            msg.sender,
            email,
            sms,
            onChain
        );
    }

    // Modify governance update function
    function submitGovernanceProposal(
        uint256 newMinDuration,
        uint256 newQuorum,
        uint256 newDelay
    ) external onlyAI timelocked {
        require(newQuorum <= 50, "Quorum exceeds limit");
        require(newDelay >= 6 hours, "Delay too short");
        
        // Record changes with alerts
        _emitGovernanceChange("minDuration", governance.minProposalDuration, newMinDuration);
        _emitGovernanceChange("quorum", governance.quorumPercentage, newQuorum);
        _emitGovernanceChange("delay", governance.executionDelay, newDelay);

        governance = Governance(newMinDuration, newQuorum, newDelay);
        governanceHistory.push(GovernanceChange(
            block.timestamp,
            newMinDuration,
            newQuorum,
            newDelay
        ));
        emit GovernanceUpdated(block.timestamp, newMinDuration, newQuorum, newDelay);
    }

    event GovernanceUpdated(
        uint256 timestamp,
        uint256 newMinDuration,
        uint256 newQuorum,
        uint256 newDelay
    );
    
    // Add template structure
    struct ThresholdTemplate {
        string name;
        uint256 minDuration;
        uint256 quorum;
        uint256 delay;
    }

    ThresholdTemplate[] public presetTemplates;

    // Add reward token interface
    interface IEvolveReward {
        function mintRewards(address to, uint256 amount) external;
    }

    // Modify reward parameters
    IEvolveReward public rewardToken;
    uint256 public constant REWARD_PER_VOTE = 100; // 100 EVR per vote

    // Add tier structure
    struct RateTier {
        uint256 minStake;
        uint256 rate;
        uint256 lockPeriod;
    }

    RateTier[] public rateTiers;

    constructor(uint256 initialSupply, address _rewardToken) {
        totalSupply = initialSupply * 10**decimals;
        balances[msg.sender] = totalSupply;
        aiOperator = msg.sender;
        
        // Initialize first mutation
        mutationHistory.push(Mutation({
            newSymbol: "EvoV1",
            timestamp: block.timestamp,
            newBurnRate: burnRate,
            visualDNA: "QmBaseDNA...",
            parentDNA: 0,
            survivalRate: 100,
            voteCount: 0,
            adaptationScore: 100,
            isExtinct: false
        }));
        
        // Add default templates
        presetTemplates.push(ThresholdTemplate("Conservative", 2, 5, 12 hours));
        presetTemplates.push(ThresholdTemplate("Balanced", 3, 10, 24 hours));
        presetTemplates.push(ThresholdTemplate("Aggressive", 5, 15, 48 hours));
        rewardToken = IEvolveReward(_rewardToken);
        
        rateTiers.push(RateTier(1000 * 10**decimals, 15, 30 days));  // Tier 1: 15% APY
        rateTiers.push(RateTier(5000 * 10**decimals, 20, 60 days));   // Tier 2: 20% APY 
        rateTiers.push(RateTier(10000 * 10**decimals, 25, 90 days));  // Tier 3: 25% APY
    }
    
    // Core evolution logic
    function proposeMutations(
        string[] calldata symbols,
        uint256[] calldata newRates,
        string[] calldata dnaHashes
    ) external onlyAI {
        require(currentProposals.length == 0, "Existing proposals");
        
        for (uint i=0; i<3; i++) {
            currentProposals.push(Mutation({
                newSymbol: symbols[i],
                newBurnRate: newRates[i],
                visualDNA: dnaHashes[i],
                timestamp: block.timestamp,
                parentDNA: 0,
                survivalRate: 100,
                voteCount: 0,
                adaptationScore: 0,
                isExtinct: false
            }));
        }
    }
    
    function voteForMutation(uint256 proposalId) external {
        require(proposalId < currentProposals.length, "Invalid proposal");
        uint256 votePower = balances[msg.sender];
        require(votePower > 0, "No tokens");
        
        // Voting burns tokens
        _burn(msg.sender, votePower);
        currentProposals[proposalId].voteCount += votePower;
    }
    
    function applyMutation() external {
        require(block.timestamp >= mutationHistory[0].timestamp + MUTATION_CYCLE, 
               "Evolution cycle ongoing");
        
        // Find winning proposal
        uint256 winningId;
        uint256 maxVotes;
        for (uint i=0; i<currentProposals.length; i++) {
            if (currentProposals[i].voteCount > maxVotes) {
                maxVotes = currentProposals[i].voteCount;
                winningId = i;
            }
        }
        
        // Apply mutation
        Mutation memory winner = currentProposals[winningId];
        symbol = winner.newSymbol;
        burnRate = winner.newBurnRate;
        mutationHistory.push(winner);
        _applyGeneticRules(mutationHistory.length - 1);
        
        // Reset proposals
        delete currentProposals;
        emit MutationApplied(mutationHistory.length - 1);
        
        emit MutationRecord(
            mutationHistory.length,
            winner.newSymbol,
            winner.newBurnRate,
            environmentalPressure,
            winner.survivalRate,
            block.timestamp
        );
    }
    
    // Token economic model enhancements
    function _transfer(address sender, address recipient, uint256 amount) internal {
        uint256 burnAmount = amount * burnRate / 100;
        uint256 transferAmount = amount - burnAmount;
        
        balances[sender] -= amount;
        balances[recipient] += transferAmount;
        
        if (burnAmount > 0) {
            totalSupply -= burnAmount;
            emit Transfer(sender, address(0), burnAmount);
        }
        emit Transfer(sender, recipient, transferAmount);
    }
    
    modifier onlyAI() {
        require(msg.sender == aiOperator, "AI only");
        _;
    }
    
    // Add genetic inheritance function
    function _applyGeneticRules(uint256 newMutationId) private {
        Mutation storage current = mutationHistory[newMutationId];
        
        // Calculate three-generation genetic influence
        uint256[3] memory heritageWeights = [40, 25, 15]; // Recent generation weights
        uint256 accumulatedBurnRate;
        
        for (uint i=0; i<3 && current.parentDNA !=0; i++) {
            Mutation storage ancestor = mutationHistory[current.parentDNA];
            accumulatedBurnRate += ancestor.newBurnRate * heritageWeights[i];
            current.parentDNA = ancestor.parentDNA;
        }
        
        // Current mutation weight
        current.newBurnRate = (accumulatedBurnRate + current.newBurnRate * 20) / 100;
        
        // Environmental adaptation factor
        uint256 environmentFactor = environmentalPressure > 50 ? 2 : 1;
        current.newBurnRate = current.newBurnRate * environmentFactor;
        
        _checkExtinctionConditions(current);
    }
    
    // Separate extinction condition checks
    function _checkExtinctionConditions(Mutation storage current) private {
        uint256 declineRate = mutationHistory[current.parentDNA].survivalRate - current.survivalRate;
        if (declineRate > 20 && environmentalPressure > 75) {
            _triggerExtinction();
        }
    }
    
    // Add extinction mechanism
    function _triggerExtinction() private {
        burnRate = 100; // 100% burn rate
        symbol = "EXTINCT";
        aiOperator = address(0); // Disable future mutations
    }
    
    // Pressure affects burn rate
    function updateEnvironmentalPressure(uint256 pressure) external onlyAI {
        require(pressure <= 100, "Pressure exceeds 100%");
        environmentalPressure = pressure;
        
        // Optimized dynamic adjustment formula
        uint256 newBurnRate = burnRate + (burnRate * pressure / 100);
        burnRate = newBurnRate > 100 ? 100 : newBurnRate;
        
        // Record pressure event
        emit EnvironmentPressureUpdated(block.timestamp, pressure, newBurnRate);
    }

    // 添加治理状态检查
    function checkGovernanceStatus() public view returns (
        uint256 nextAvailableChange,
        uint256 currentQuorum,
        uint256 activeDelay
    ) {
        return (
            mutationHistory[mutationHistory.length-1].timestamp + governance.executionDelay,
            governance.quorumPercentage,
            governance.executionDelay
        );
    }

    // 添加压力缓冲池
    uint256 public pressureBuffer;
    uint256 public constant BUFFER_CAPACITY = 1000 ether;

    // Add buffer safety checks
    function absorbPressure(uint256 pressure) external onlyAI {
        require(pressure <= 100, "Pressure exceeds maximum");
        uint256 bufferNeeded = pressure * 1 ether;
        
        // Calculate actual absorption
        uint256 absorbed = bufferNeeded;
        if (pressureBuffer + bufferNeeded > BUFFER_CAPACITY) {
            absorbed = BUFFER_CAPACITY - pressureBuffer;
        }
        
        pressureBuffer += absorbed;
        environmentalPressure = environmentalPressure * (1000 - absorbed / 1 ether) / 1000;
        
        emit PressureAbsorbed(pressure, environmentalPressure);
    }

    // Add emergency pressure release
    function emergencyPressureRelease() external onlyAI {
        uint256 released = pressureBuffer / 2;
        pressureBuffer -= released;
        environmentalPressure = environmentalPressure > 50 ? 50 : environmentalPressure;
        emit EmergencyPressureReleased(released);
    }

    event PressureAbsorbed(uint256 initialPressure, uint256 newPressure);
    event PressureReleased(uint256 amount, uint256 currentPressure);
    event EmergencyPressureReleased(uint256 amount);

    // Add stability check before mutations
    function checkStability() public view returns (bool) {
        uint256[] memory recentRates = new uint256[](3);
        for (uint i=0; i<3 && i<mutationHistory.length; i++) {
            recentRates[i] = mutationHistory[mutationHistory.length-1-i].newBurnRate;
        }
        return _isStable(recentRates);
    }

    // Internal stability check logic
    function _isStable(uint256[] memory rates) private pure returns (bool) {
        if (rates.length < 2) return true;
        uint256 maxChange;
        for (uint i=1; i<rates.length; i++) {
            uint256 change = rates[i] > rates[i-1] ? 
                rates[i] - rates[i-1] : rates[i-1] - rates[i];
            if (change > maxChange) maxChange = change;
        }
        return maxChange <= 5; // Max 5% change between generations
    }

    // Add history query function
    function getGovernanceHistory(uint256 count) public view returns (GovernanceChange[] memory) {
        uint256 resultSize = count < governanceHistory.length ? count : governanceHistory.length;
        GovernanceChange[] memory result = new GovernanceChange[](resultSize);
        
        for (uint256 i = 0; i < resultSize; i++) {
            result[i] = governanceHistory[governanceHistory.length - 1 - i];
        }
        return result;
    }

    // Add version comparison function
    function compareGovernanceVersions(uint256 version1, uint256 version2) 
        public 
        view 
        returns (
            int256 minDurationDiff,
            int256 quorumDiff,
            int256 delayDiff
        ) 
    {
        require(version1 < governanceHistory.length, "Invalid version1");
        require(version2 < governanceHistory.length, "Invalid version2");
        
        GovernanceChange memory v1 = governanceHistory[version1];
        GovernanceChange memory v2 = governanceHistory[version2];
        
        return (
            int256(v1.minDuration) - int256(v2.minDuration),
            int256(v1.quorum) - int256(v2.quorum),
            int256(v1.delay) - int256(v2.delay)
        );
    }

    // Add severity levels
    enum AlertLevel { CRITICAL, HIGH, MEDIUM, LOW }

    // Modify alert event
    event GovernanceAlert(
        uint256 indexed changeId,
        address initiatedBy,
        string changeType,
        int256 valueBefore,
        int256 valueAfter,
        uint256 effectiveTime,
        AlertLevel severity,
        address[] subscribers
    );

    // Add severity calculation
    function _calculateSeverity(
        string memory changeType,
        int256 delta
    ) private pure returns (AlertLevel) {
        if (keccak256(bytes(changeType)) == keccak256(bytes("quorum"))) {
            if (abs(delta) >= 15) return AlertLevel.CRITICAL;
            if (abs(delta) >= 10) return AlertLevel.HIGH;
        }
        
        if (abs(delta) >= 30) return AlertLevel.CRITICAL;
        if (abs(delta) >= 20) return AlertLevel.HIGH;
        if (abs(delta) >= 10) return AlertLevel.MEDIUM;
        return AlertLevel.LOW;
    }

    function abs(int256 x) private pure returns (uint256) {
        return x >= 0 ? uint256(x) : uint256(-x);
    }

    // Update emission with severity
    function _emitGovernanceChange(
        string memory changeType,
        uint256 before,
        uint256 after
    ) private {
        if (before != after) {
            int256 delta = int256(after) - int256(before);
            AlertLevel severity = _calculateSeverity(changeType, delta);
            
            emit GovernanceAlert(
                governanceHistory.length,
                msg.sender,
                changeType,
                int256(before),
                int256(after),
                block.timestamp + governance.executionDelay,
                severity,
                _getSubscribers(severity)
            );
        }
    }

    // Get subscribers based on severity
    function _getSubscribers(AlertLevel level) 
        private view returns (address[] memory) 
    {
        uint256 count;
        // First pass: count qualified subscribers
        for (uint256 i = 0; i < subscriberList.length; i++) {
            if (_shouldNotify(subscriberList[i], level)) {
                count++;
            }
        }
        
        // Second pass: populate addresses
        address[] memory result = new address[](count);
        uint256 index;
        for (uint256 i = 0; i < subscriberList.length; i++) {
            if (_shouldNotify(subscriberList[i], level)) {
                result[index++] = subscriberList[i];
            }
        }
        return result;
    }

    // Add user threshold structure
    struct AlertThreshold {
        uint256 minDuration;
        uint256 quorum;
        uint256 delay;
        bool customEnabled;
    }

    mapping(address => AlertThreshold) public userThresholds;

    // Add threshold setting function
    function setAlertThresholds(
        uint256 _minDuration,
        uint256 _quorum,
        uint256 _delay,
        bool _enabled
    ) external {
        userThresholds[msg.sender] = AlertThreshold({
            minDuration: _minDuration,
            quorum: _quorum,
            delay: _delay,
            customEnabled: _enabled
        });
    }

    // Modify severity calculation
    function _calculateUserSeverity(
        address user,
        string memory changeType,
        int256 delta
    ) private view returns (AlertLevel) {
        AlertThreshold storage threshold = userThresholds[user];
        if (!threshold.customEnabled) return AlertLevel.LOW;
        
        uint256 absoluteDelta = abs(delta);
        uint256 userThreshold = 0;
        
        if (keccak256(bytes(changeType)) == keccak256(bytes("minDuration"))) {
            userThreshold = threshold.minDuration;
        } else if (keccak256(bytes(changeType)) == keccak256(bytes("quorum"))) {
            userThreshold = threshold.quorum;
        } else if (keccak256(bytes(changeType)) == keccak256(bytes("delay"))) {
            userThreshold = threshold.delay;
        }
        
        if (userThreshold == 0) return AlertLevel.LOW;
        if (absoluteDelta >= userThreshold) return AlertLevel.CRITICAL;
        return AlertLevel.LOW;
    }

    // Add community template structure
    struct CommunityTemplate {
        address submitter;
        string name;
        uint256 minDuration;
        uint256 quorum;
        uint256 delay;
        uint256 votes;
        uint256 submitTime;
    }

    CommunityTemplate[] public communityTemplates;
    mapping(address => mapping(uint256 => bool)) public hasVoted;

    // Add template submission
    function submitCommunityTemplate(
        string memory name,
        uint256 minDuration,
        uint256 quorum,
        uint256 delay
    ) external {
        require(bytes(name).length <= 20, "Name too long");
        require(minDuration <= 7, "Duration exceeds max");
        require(quorum <= 30, "Quorum too high");
        
        communityTemplates.push(CommunityTemplate(
            msg.sender,
            name,
            minDuration,
            quorum,
            delay,
            0,
            block.timestamp
        ));
    }

    // Add template voting
    function voteForTemplate(uint256 templateId) external {
        require(templateId < communityTemplates.length, "Invalid template");
        require(!hasVoted[msg.sender][templateId], "Already voted");
        
        communityTemplates[templateId].votes++;
        hasVoted[msg.sender][templateId] = true;
        
        // Record voter reward eligibility
        uint256 voterShare = (templateRewards[templateId] / 2) / communityTemplates[templateId].votes;
        userRewards[msg.sender].push(TemplateReward({
            recipient: msg.sender,
            templateId: templateId,
            rewardAmount: voterShare,
            claimTime: block.timestamp + 7 days
        }));
    }

    // Update template getter
    function getAvailableTemplates() public view returns (
        ThresholdTemplate[] memory official,
        CommunityTemplate[] memory community
    ) {
        official = presetTemplates;
        community = communityTemplates;
    }

    // Add reward structure
    struct TemplateReward {
        address recipient;
        uint256 templateId;
        uint256 rewardAmount;
        uint256 claimTime;
    }

    mapping(uint256 => uint256) public templateRewards; // templateId => totalReward
    mapping(address => TemplateReward[]) public userRewards;

    // Update reward distribution
    function _distributeRewards(uint256 templateId) private {
        CommunityTemplate storage ct = communityTemplates[templateId];
        uint256 rewardPool = ct.votes * REWARD_PER_VOTE;
        
        // 50% to submitter, 50% to voters
        uint256 submitterShare = rewardPool / 2;
        rewardToken.mintRewards(ct.submitter, submitterShare);
        
        // Distribute voter shares
        uint256 voterShare = (rewardPool - submitterShare) / ct.votes;
        // Track individual voter rewards
    }

    // Update claim function
    function claimRewards(uint256[] memory rewardIndexes) external {
        uint256 total;
        for (uint256 i = 0; i < rewardIndexes.length; i++) {
            TemplateReward storage r = userRewards[msg.sender][rewardIndexes[i]];
            require(block.timestamp >= r.claimTime, "Too early");
            total += r.rewardAmount;
            delete userRewards[msg.sender][rewardIndexes[i]];
        }
        rewardToken.mintRewards(msg.sender, total);
    }

    // Modify staking structure
    struct StakePosition {
        uint256 amount;
        uint256 stakedSince;
        uint256 unlockTime;
        uint256 tierIndex;
    }

    mapping(address => StakePosition) public stakes;
    uint256 public constant REWARD_RATE = 10; // 10% APY

    // Add tier auto-upgrade logic
    function _updateTier(address user) private {
        StakePosition storage position = stakes[user];
        uint256 newTier = findApplicableTier(position.amount);
        
        if(newTier != position.tierIndex) {
            position.tierIndex = newTier;
            position.unlockTime = block.timestamp + rateTiers[newTier].lockPeriod;
        }
    }

    function findApplicableTier(uint256 amount) public view returns(uint256) {
        for(uint256 i = rateTiers.length - 1; i >= 0; i--) {
            if(amount >= rateTiers[i].minStake) {
                return i;
            }
        }
        return 0;
    }

    // Update staking function
    function stakeTokens(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        _transfer(msg.sender, address(this), amount);
        
        StakePosition storage position = stakes[msg.sender];
        position.amount += amount;
        _updateTier(msg.sender);
        
        // Initialize time for new stakers
        if(position.stakedSince == 0) {
            position.stakedSince = block.timestamp;
        }
    }

    function calculateRewards(address user) public view returns(uint256) {
        StakePosition memory position = stakes[user];
        if(position.amount == 0) return 0;
        
        RateTier memory tier = rateTiers[position.tierIndex];
        uint256 duration = block.timestamp - position.stakedSince;
        return (position.amount * tier.rate * duration) / (365 days * 100);
    }

    function claimRewards() external {
        uint256 rewards = calculateRewards(msg.sender);
        require(rewards > 0, "No rewards available");
        
        _mint(msg.sender, rewards);
        stakes[msg.sender].lastRewardClaimed = block.timestamp;
    }

    // Add fee parameters
    uint256 public withdrawalFee = 5; // 0.5% in basis points (1% = 100)
    address public feeCollector;

    // Add dynamic fee structure
    struct FeeTier {
        uint256 minAmount;
        uint256 feeRate; 
    }

    FeeTier[] public feeTiers;
    uint256 public feeRebate = 20; // 20% of fees redistributed

    // Update fee calculation
    function calculateFee(uint256 amount) public view returns (uint256) {
        for(uint256 i = feeTiers.length - 1; i >= 0; i--) {
            if(amount >= feeTiers[i].minAmount) {
                return (amount * feeTiers[i].feeRate) / 1000;
            }
        }
        return (amount * withdrawalFee) / 1000;
    }

    // Modify unstake function
    function unstake(uint256 amount) external {
        StakePosition storage position = stakes[msg.sender];
        require(position.amount >= amount, "Insufficient staked");
        require(block.timestamp >= position.unlockTime, "Lock period active");
        
        uint256 fee = calculateFee(amount);
        uint256 rebate = (fee * feeRebate) / 100;
        uint256 burned = fee - rebate;
        
        _transfer(address(this), feeCollector, rebate);
        _burn(address(this), burned);
        _transfer(address(this), msg.sender, amount - fee);
        
        // Update position
        position.amount -= amount;
        _updateTier(msg.sender);
        
        emit Withdrawal(msg.sender, amount, fee);
    }

    // Add fee configuration function (restricted)
    function configureFees(uint256 newFee, address collector) external onlyGovernance {
        require(newFee <= 50, "Fee too high");
        withdrawalFee = newFee;
        feeCollector = collector;
        emit FeeParametersUpdated(block.timestamp, newFee, collector);
    }

    // Add view function to check withdrawable amount
    function getAvailableToWithdraw(address user) public view returns(uint256) {
        StakePosition memory position = stakes[user];
        if(block.timestamp < position.unlockTime) return 0;
        return position.amount;
    }

    event Withdrawal(address indexed user, uint256 amount, uint256 fee);

    // Replace constant with variable and add governance control
    uint256 public delegationLockPeriod = 3 days;
    address public lockConfigurator;

    // Add lock period configuration
    function setDelegationLock(uint256 newPeriod) external onlyGovernance {
        require(newPeriod <= 14 days, "Lock period too long");
        delegationLockPeriod = newPeriod;
        emit LockPeriodUpdated(block.timestamp, newPeriod);
    }

    // Update delegation record creation
    function delegate(address delegatee) external {
        require(delegatee != msg.sender, "Cannot self-delegate");
        require(delegatee != address(0), "Invalid delegatee");
        
        DelegationRecord[] storage history = delegationHistory[msg.sender];
        if(history.length > 0) {
            require(block.timestamp >= history[history.length-1].lockUntil, 
                "Previous delegation locked");
        }
        
        _delegate(msg.sender, delegatee);
        history.push(DelegationRecord(
            delegatee,
            block.timestamp,
            block.timestamp + delegationLockPeriod // Use configurable period
        ));
    }

    // Update undelegate function
    function undelegate() external {
        DelegationRecord[] storage history = delegationHistory[msg.sender];
        require(history.length > 0, "No delegation history");
        require(block.timestamp >= history[history.length-1].lockUntil, 
            "Delegation locked");
        
        _delegate(msg.sender, msg.sender);
    }

    // Add delegation history tracking
    struct DelegationRecord {
        address delegator;
        address delegatee;
        uint256 timestamp;
    }

    mapping(address => DelegationRecord[]) public delegationHistory;

    function _delegate(address delegator, address delegatee) internal override {
        super._delegate(delegator, delegatee);
        delegationHistory[delegator].push(DelegationRecord(
            delegator,
            delegatee,
            block.timestamp
        ));
        emit DelegationChanged(delegator, delegatee);
    }

    event DelegationChanged(address indexed delegator, address indexed delegatee);
    event LockPeriodUpdated(uint256 timestamp, uint256 newPeriod);

    // Add multi-parameter configuration function
    function configureMultipleParameters(
        uint256 newLockPeriod,
        uint256 newFee,
        uint256 newRebate
    ) external onlyGovernance {
        require(newLockPeriod <= 14 days, "Lock period too long");
        require(newFee <= 50, "Fee too high");
        require(newRebate <= 50, "Rebate too high");
        
        delegationLockPeriod = newLockPeriod;
        withdrawalFee = newFee;
        feeRebate = newRebate;
        
        emit MultiParameterUpdated(block.timestamp, newLockPeriod, newFee, newRebate);
    }

    // Update governance event
    event MultiParameterUpdated(
        uint256 timestamp,
        uint256 newLockPeriod,
        uint256 newFee,
        uint256 newRebate
    );

    // Add version control to templates
    struct TemplateVersion {
        uint256 version;
        uint256 lockPeriod;
        uint256 fee;
        uint256 rebate;
        uint256 timestamp;
    }

    struct GovernanceTemplate {
        string name;
        uint256 latestVersion;
        mapping(uint256 => TemplateVersion) versions;
    }

    // Add version change log structure
    struct VersionChange {
        address modifiedBy;
        uint256 version;
        uint256 timestamp;
        uint256 oldLock;
        uint256 newLock;
        uint256 oldFee;
        uint256 newFee;
        uint256 oldRebate;
        uint256 newRebate;
        string reason; // Add change reason
        ChangeCategory category;
        string[] tags;
    }

    mapping(bytes32 => VersionChange[]) public templateChangeLogs;

    // Add reason length validation
    modifier validReason(string calldata reason) {
        bytes memory reasonBytes = bytes(reason);
        require(reasonBytes.length >= 10, "Reason too short");
        require(reasonBytes.length <= 280, "Reason exceeds limit");
        _;
    }

    // Add category enum and mapping
    enum ChangeCategory {
        OPTIMIZATION,
        SECURITY,
        GOVERNANCE,
        ECONOMIC,
        COMMUNITY
    }

    // Add tag validation
    modifier validTags(string[] calldata tags) {
        require(tags.length <= 5, "Too many tags");
        for(uint i=0; i<tags.length; i++) {
            bytes memory tag = bytes(tags[i]);
            require(tag.length >= 2 && tag.length <= 20, "Invalid tag length");
        }
        _;
    }

    // Add category statistics
    struct CategoryStats {
        uint256 optimization;
        uint256 security;
        uint256 governance;
        uint256 economic;
        uint256 community;
    }

    mapping(bytes32 => CategoryStats) public templateCategoryStats;

    // Add tag statistics
    mapping(string => uint256) public tagUsageCount;

    // Modify template saving function
    function saveGovernanceTemplate(
        string calldata name,
        uint256 lockDays,
        uint256 feePercent,
        uint256 rebatePercent,
        string calldata changeReason,
        ChangeCategory category,
        string[] calldata tags
    ) external onlyGovernance validReason(changeReason) validTags(tags) {
        bytes32 id = keccak256(abi.encodePacked(name));
        GovernanceTemplate storage tpl = governanceTemplates[id];
        
        // Capture previous values
        uint256 prevLock = 0;
        uint256 prevFee = 0;
        uint256 prevRebate = 0;
        
        if(tpl.latestVersion > 0) {
            TemplateVersion memory lastVer = tpl.versions[tpl.latestVersion];
            prevLock = lastVer.lockPeriod;
            prevFee = lastVer.fee;
            prevRebate = lastVer.rebate;
        }
        
        uint256 newVersion = tpl.latestVersion + 1;
        tpl.versions[newVersion] = TemplateVersion({
            version: newVersion,
            lockPeriod: lockDays * 1 days,
            fee: feePercent,
            rebate: rebatePercent,
            timestamp: block.timestamp
        });
        tpl.latestVersion = newVersion;
        
        // Record change log
        templateChangeLogs[id].push(VersionChange({
            modifiedBy: msg.sender,
            version: newVersion,
            timestamp: block.timestamp,
            oldLock: prevLock,
            newLock: lockDays * 1 days,
            oldFee: prevFee,
            newFee: feePercent,
            oldRebate: prevRebate,
            newRebate: rebatePercent,
            reason: changeReason,
            category: category,
            tags: tags
        }));
        
        // Update category stats
        templateCategoryStats[id][category]++;
        
        // Update tag stats
        for(uint i=0; i<tags.length; i++) {
            tagUsageCount[tags[i]]++;
        }
        
        emit VersionChangeLogged(id, newVersion, msg.sender);
    }

    event VersionChangeLogged(bytes32 indexed templateId, uint256 version, address indexed modifier);

    // Add time range query functions
    function getChangesByTimeRange(
        bytes32 templateId,
        uint256 startTime,
        uint256 endTime
    ) external view returns (VersionChange[] memory) {
        VersionChange[] storage allChanges = templateChangeLogs[templateId];
        VersionChange[] memory filtered = new VersionChange[](allChanges.length);
        uint256 count = 0;
        
        for(uint i=0; i<allChanges.length; i++) {
            if(allChanges[i].timestamp >= startTime && 
               allChanges[i].timestamp <= endTime) {
                filtered[count] = allChanges[i];
                count++;
            }
        }
        
        VersionChange[] memory result = new VersionChange[](count);
        for(uint i=0; i<count; i++) {
            result[i] = filtered[i];
        }
        return result;
    }

    // Add multi-template comparison function
    function compareTemplates(bytes32[] calldata templateIds) 
        external 
        view 
        returns (
            string[] memory names,
            uint256[] memory versions,
            uint256[] memory changeCounts,
            uint256[][] memory recentParams
        ) 
    {
        names = new string[](templateIds.length);
        versions = new uint256[](templateIds.length);
        changeCounts = new uint256[](templateIds.length);
        recentParams = new uint256[][](templateIds.length);
        
        for(uint i=0; i<templateIds.length; i++) {
            GovernanceTemplate storage tpl = governanceTemplates[templateIds[i]];
            names[i] = tpl.name;
            versions[i] = tpl.latestVersion;
            changeCounts[i] = templateChangeLogs[templateIds[i]].length;
            
            if(tpl.latestVersion > 0) {
                TemplateVersion memory ver = tpl.versions[tpl.latestVersion];
                recentParams[i] = new uint256[](3);
                recentParams[i][0] = ver.lockPeriod;
                recentParams[i][1] = ver.fee;
                recentParams[i][2] = ver.rebate;
            }
        }
    }

    // Add historical parameter tracking
    function getHistoricalParameters(bytes32 templateId, uint256 versionCount) 
        external 
        view 
        returns (
            uint256[] memory timestamps,
            uint256[] memory locks,
            uint256[] memory fees,
            uint256[] memory rebates
        )
    {
        GovernanceTemplate storage tpl = governanceTemplates[templateId];
        uint256 totalVersions = tpl.latestVersion;
        versionCount = versionCount > totalVersions ? totalVersions : versionCount;
        
        timestamps = new uint256[](versionCount);
        locks = new uint256[](versionCount);
        fees = new uint256[](versionCount);
        rebates = new uint256[](versionCount);
        
        for(uint i=0; i<versionCount; i++) {
            uint256 version = totalVersions - i;
            TemplateVersion memory ver = tpl.versions[version];
            timestamps[i] = ver.timestamp;
            locks[i] = ver.lockPeriod;
            fees[i] = ver.fee;
            rebates[i] = ver.rebate;
        }
    }

    // Add data export interface
    function exportTemplateData(bytes32 templateId) 
        external 
        view 
        returns (
            string memory name,
            uint256 latestVersion,
            VersionChange[] memory changes,
            CategoryStats memory stats,
            string[] memory topTags
        )
    {
        GovernanceTemplate storage tpl = governanceTemplates[templateId];
        name = tpl.name;
        latestVersion = tpl.latestVersion;
        changes = templateChangeLogs[templateId];
        stats = templateCategoryStats[templateId];
        
        // Tag frequency analysis
        string[5] memory top5Tags;
        uint256[5] memory maxCounts;
        
        for(uint i=0; i<changes.length; i++) {
            for(uint j=0; j<changes[i].tags.length; j++) {
                string memory tag = changes[i].tags[j];
                uint256 count = tagUsageCount[tag];
                
                // Update top 5 tags
                for(uint k=0; k<5; k++) {
                    if(count > maxCounts[k]) {
                        // Shift existing values
                        for(uint m=4; m>k; m--) {
                            top5Tags[m] = top5Tags[m-1];
                            maxCounts[m] = maxCounts[m-1];
                        }
                        // Insert new value
                        top5Tags[k] = tag;
                        maxCounts[k] = count;
                        break;
                    }
                }
            }
        }
        
        topTags = top5Tags;
    }

    // Add batch export function
    function batchExportTemplates(bytes32[] calldata templateIds) 
        external 
        view 
        returns (
            string[] memory names,
            uint256[] memory versions,
            VersionChange[][] memory allChanges
        )
    {
        names = new string[](templateIds.length);
        versions = new uint256[](templateIds.length);
        allChanges = new VersionChange[][](templateIds.length);
        
        for(uint i=0; i<templateIds.length; i++) {
            GovernanceTemplate storage tpl = governanceTemplates[templateIds[i]];
            names[i] = tpl.name;
            versions[i] = tpl.latestVersion;
            allChanges[i] = templateChangeLogs[templateIds[i]];
        }
    }

    // Add data validation functions
    function verifyExportData(
        bytes32 templateId,
        string calldata name,
        uint256 version,
        VersionChange[] calldata changes
    ) external view returns (bool) {
        GovernanceTemplate storage tpl = governanceTemplates[templateId];
        if(keccak256(abi.encodePacked(tpl.name)) != keccak256(abi.encodePacked(name))) return false;
        if(tpl.latestVersion != version) return false;
        if(changes.length != templateChangeLogs[templateId].length) return false;
        
        for(uint i=0; i<changes.length; i++) {
            VersionChange storage original = templateChangeLogs[templateId][i];
            if(original.timestamp != changes[i].timestamp ||
               original.newLock != changes[i].newLock ||
               original.newFee != changes[i].newFee) {
                return false;
            }
        }
        return true;
    }

    function generateDataHash(
        bytes32 templateId,
        string calldata name,
        uint256 version,
        VersionChange[] calldata changes
    ) external view returns (bytes32) {
        return keccak256(abi.encode(
            templateId,
            keccak256(bytes(name)),
            version,
            changes.length
        ));
    }

    // Add timestamp protection
    function generateExportSignature(
        bytes32 templateId,
        string calldata name,
        uint256 version,
        VersionChange[] calldata changes,
        uint256 validUntil
    ) external view returns (bytes32) {
        return keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            keccak256(abi.encode(
                block.chainid,
                address(this),
                templateId,
                keccak256(bytes(name)),
                version,
                changes.length,
                validUntil // Include expiration timestamp
            ))
        ));
    }

    // Add signature revocation
    mapping(bytes32 => bool) public revokedSignatures;
    event SignatureRevoked(bytes32 indexed sigHash, address revokedBy, uint256 timestamp);

    function revokeSignature(bytes32 sigHash) external onlyOwner {
        require(!revokedSignatures[sigHash], "Already revoked");
        revokedSignatures[sigHash] = true;
        emit SignatureRevoked(sigHash, msg.sender, block.timestamp);
    }

    function isSignatureRevoked(bytes32 sigHash) external view returns (bool) {
        return revokedSignatures[sigHash];
    }

    // Update verification function
    function verifySignedExport(
        bytes32 templateId,
        string calldata name,
        uint256 version,
        VersionChange[] calldata changes,
        uint256 validUntil,
        bytes calldata signature
    ) external view returns (address) {
        require(block.timestamp <= validUntil, "Signature expired");
        bytes32 messageHash = generateExportSignature(
            templateId, 
            name,
            version,
            changes,
            validUntil
        );
        bytes32 sigHash = keccak256(signature);
        require(!revokedSignatures[sigHash], "Signature revoked");
        
        return ECDSA.recover(messageHash, signature);
    }

    // Add batch signature verification
    function batchVerifySignatures(
        bytes32[] calldata templateIds,
        string[] calldata names,
        uint256[] calldata versions,
        VersionChange[][] calldata changesList,
        bytes[] calldata signatures
    ) external view returns (address[] memory signers, bool[] memory isValid) {
        require(templateIds.length == signatures.length, "Array length mismatch");
        
        signers = new address[](templateIds.length);
        isValid = new bool[](templateIds.length);
        
        for(uint i=0; i<templateIds.length; i++) {
            try this.verifySignedExport(
                templateIds[i],
                names[i],
                versions[i],
                changesList[i],
                signatures[i]
            ) returns (address signer) {
                signers[i] = signer;
                isValid[i] = true;
            } catch {
                isValid[i] = false;
            }
        }
    }
}

contract EvolveDAO is Governor, GovernorSettings, GovernorVotes {
    constructor(IVotes _token)
        Governor("EvolveDAO")
        GovernorSettings(1, 45818, 1000e18)
        GovernorVotes(_token)
    {}
    
    function votingDelay() public view override returns (uint256) {
        return 1; 
    }
    
    function votingPeriod() public view override returns (uint256) {
        return 45818; 
    }

    function delegate(address delegatee) external {
        EvolveToken(address(token)).delegate(delegatee);
    }
} 