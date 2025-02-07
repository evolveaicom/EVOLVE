import { WebSocket } from 'ws';
import { Connection } from '@solana/web3.js';

// Monitor parameter change events
const MONITOR_PARAMS = [
    'feeChange', 
    'lockPeriodUpdate',
    'governanceProposal'
];

export function startMonitoring() {
    const ws = new WebSocket(CLUSTER_WS_URL);
    const connection = new Connection(CLUSTER_RPC_URL);
    
    connection.onAccountChange(
        GOVERNANCE_PROGRAM_ID,
        (accountInfo, context) => {
            const decodedData = decodeGovernanceData(accountInfo.data);
            analyzeParameterChanges(decodedData);
        },
        'confirmed'
    );
    
    ws.on('message', (data: Buffer) => {
        const notification = parseTransactionNotification(data);
        if (MONITOR_PARAMS.includes(notification.type)) {
            triggerAlert(notification);
        }
    });
} 