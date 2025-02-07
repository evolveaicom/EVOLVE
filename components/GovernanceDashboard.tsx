export default function GovernanceView() {
    const { proposals } = useGovernanceData();
    
    return (
        <div className="dashboard">
            <ProposalCreationPanel />
            <div className="proposal-list">
                {proposals.map((proposal, index) => (
                    <ProposalCard 
                        key={index}
                        title={proposal.title}
                        status={proposal.status}
                        endTime={proposal.endTime}
                    />
                ))}
            </div>
            <VotingPowerWidget />
            <ParameterHistoryChart />
        </div>
    );
}

const VotingPowerWidget = () => {
  const { publicKey } = useWallet();
  const [votingPower, setVotingPower] = useState(0);

  useEffect(() => {
    const fetchVotingPower = async () => {
      const power = await program.methods
        .getVotingPower()
        .accounts({ voter: publicKey })
        .view();
      setVotingPower(power);
    };
    if (publicKey) fetchVotingPower();
  }, [publicKey]);

  return (
    <div className="voting-widget">
      <h3>Your Voting Power</h3>
      <ProgressBar value={votingPower} max={1000} />
      <div className="power-details">
        <span>Current: {votingPower}</span>
        <span>Required: 1000</span>
      </div>
    </div>
  );
}; 