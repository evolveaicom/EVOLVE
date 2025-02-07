class GovernanceWatcher:
    def __init__(self, contract):
        self.contract = contract
        self.history = []
        
    def watch_changes(self):
        latest = self.contract.functions.governanceHistoryLength().call()
        if latest > len(self.history):
            new_entries = latest - len(self.history)
            for i in range(new_entries):
                index = len(self.history) + i
                change = self.contract.functions.governanceHistory(index).call()
                self.history.append({
                    'block': change[0],
                    'min_duration': change[1],
                    'quorum': change[2],
                    'delay': change[3]
                })
            return self.history[-new_entries:]
        return []
    
    def analyze_trends(self):
        if len(self.history) < 2:
            return None
            
        latest = self.history[-1]
        previous = self.history[-2]
        
        return {
            'duration_trend': latest['min_duration'] - previous['min_duration'],
            'quorum_trend': latest['quorum'] - previous['quorum'],
            'delay_trend': latest['delay'] - previous['delay']
        } 