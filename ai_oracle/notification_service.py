class GovernanceNotifier:
    def __init__(self, contract, webhook_url):
        self.watcher = GovernanceWatcher(contract)
        self.webhook = webhook_url
        self.last_alert = 0
        
    def monitor(self):
        changes = self.watcher.watch_changes()
        if changes:
            for change in changes:
                self._send_alert(change)
            return True
        return False
    
    def _send_alert(self, change):
        payload = {
            "type": "governance_change",
            "timestamp": change['block'],
            "parameters": {
                "min_duration": change['min_duration'],
                "quorum": change['quorum'],
                "delay": change['delay']
            }
        }
        requests.post(self.webhook, json=payload)
        
    def format_webhook_message(self, change):
        return {
            "embeds": [{
                "title": "Governance Parameter Change",
                "fields": [
                    {"name": "Proposal Duration", "value": f"{change['min_duration']} days"},
                    {"name": "Quorum %", "value": f"{change['quorum']}%"},
                    {"name": "Execution Delay", "value": f"{change['delay']} seconds"}
                ],
                "timestamp": datetime.utcnow().isoformat()
            }]
        }

class PriorityNotifier(GovernanceNotifier):
    SEVERITY_CHANNELS = {
        'CRITICAL': ['sms', 'email', 'push'],
        'HIGH': ['email', 'push'],
        'MEDIUM': ['push'],
        'LOW': ['in_app']
    }

    def _send_priority_alert(self, change, severity):
        channels = self.SEVERITY_CHANNELS.get(severity, ['in_app'])
        message = self._format_message(change, severity)
        
        if 'sms' in channels:
            self._send_sms(message)
        if 'email' in channels:
            self._send_email(message)
        if 'push' in channels:
            self._send_push_notification(message)
    
    def _format_message(self, change, severity):
        return {
            "title": f"[{severity}] Governance Change",
            "content": f"{change['param']} changed from {change['old']} to {change['new']}",
            "severity": severity,
            "timestamp": change['timestamp']
        } 

class PersonalizedNotifier(PriorityNotifier):
    def get_personalized_severity(self, user, change):
        # Get user's custom thresholds from blockchain
        thresholds = self.contract.functions.userThresholds(user).call()
        if not thresholds['customEnabled']:
            return super().get_severity(change)
            
        delta = abs(change['new'] - change['old'])
        if change['param'] == 'minDuration' and delta >= thresholds['minDuration']:
            return 'CRITICAL'
        if change['param'] == 'quorum' and delta >= thresholds['quorum']:
            return 'CRITICAL'
        if change['param'] == 'delay' and delta >= thresholds['delay']:
            return 'CRITICAL'
        return 'LOW'
    
    def send_personalized_alert(self, user, change):
        severity = self.get_personalized_severity(user, change)
        if severity != 'LOW':
            self._send_priority_alert(change, severity) 