export default function MultiRewardView() {
    const { publicKey } = useWallet();
    const [selectedToken, setSelectedToken] = useState<PublicKey>();
    const [balances, setBalances] = useState<Map<string, number>>(new Map());
    
    useEffect(() => {
        const fetchBalances = async () => {
            const tokenAccounts = await getTokenAccounts(publicKey!);
            const balancesMap = new Map();
            
            for (const { mint, amount } of tokenAccounts) {
                balancesMap.set(mint.toString(), amount);
            }
            
            setBalances(balancesMap);
        };
        
        if (publicKey) fetchBalances();
    }, [publicKey]);

    return (
        <div className="multi-reward-panel">
            <h3>Multi-Token Rewards</h3>
            <TokenSelector 
                tokens={SUPPORTED_TOKENS}
                onSelect={setSelectedToken}
            />
            <div className="reward-list">
                {SUPPORTED_TOKENS.map(token => (
                    <div key={token.mint.toString()} className="reward-item">
                        <span>{token.symbol}: {balances.get(token.mint.toString()) || 0}</span>
                        <button 
                            onClick={() => claimRewards(token.mint)}
                            disabled={!selectedToken?.equals(token.mint)}
                        >
                            Claim {token.symbol}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
} 