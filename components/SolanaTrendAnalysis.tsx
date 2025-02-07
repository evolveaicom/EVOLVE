import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

export function SolanaParameterTimeline({ templatePDA }: { templatePDA: PublicKey }) {
    const wallet = useAnchorWallet();
    const [history, setHistory] = useState<ParameterHistory>();

    useEffect(() => {
        const fetchHistory = async () => {
            const historyPDA = await findHistoryPDA(templatePDA);
            const accountInfo = await connection.getAccountInfo(historyPDA);
            if (accountInfo) {
                const decoded = ParameterHistory.decode(accountInfo.data);
                setHistory(decoded);
            }
        };
        fetchHistory();
    }, [templatePDA]);

    return (
        <div className="sol-trend">
            <LineChart
                data={history?.timestamps.map((ts, i) => ({
                    date: new Date(ts * 1000).toISOString(),
                    lock: history.lock_periods[i],
                    fee: history.fees[i],
                    rebate: history.rebates[i]
                }))}
            />
        </div>
    );
}

// 生成PDA帮助函数
async function findHistoryPDA(templatePDA: PublicKey): Promise<PublicKey> {
    return (await PublicKey.findProgramAddress(
        [b"history", templatePDA.toBuffer()],
        EVOLVE_PROGRAM_ID
    ))[0];
} 