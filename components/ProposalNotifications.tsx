import React, { useState, useEffect } from 'react';

const useProposalAlerts = () => {
  const [alerts, setAlerts] = useState<ProposalAlert[]>([]);
  
  useEffect(() => {
    const ws = new WebSocket(GOVERNANCE_WS_URL);
    
    ws.onmessage = (event) => {
      const message: ProposalEvent = JSON.parse(event.data);
      setAlerts(prev => [{
        id: Date.now(),
        title: message.title,
        type: message.status === 'Active' ? 'new' : 'result',
        result: message.status
      }, ...prev]);
    };

    return () => ws.close();
  }, []);

  return alerts;
};

export default useProposalAlerts; 