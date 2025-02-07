function AlertLevelBadge({ level }) {
  const levelConfig = {
    [AlertLevel.CRITICAL]: { color: '#ff4757', label: 'CRITICAL' },
    [AlertLevel.HIGH]: { color: '#ffa502', label: 'HIGH' },
    [AlertLevel.MEDIUM]: { color: '#ffd700', label: 'MEDIUM' },
    [AlertLevel.LOW]: { color: '#7bed9f', label: 'LOW' }
  };

  return (
    <span 
      className="alert-badge"
      style={{ backgroundColor: levelConfig[level].color }}
    >
      {levelConfig[level].label}
    </span>
  );
}

function EnhancedAlertFeed({ alerts }) {
  return (
    <div className="alert-feed">
      {alerts.map((alert, idx) => (
        <div key={idx} className={`alert level-${alert.severity}`}>
          <div className="alert-header">
            <AlertLevelBadge level={alert.severity} />
            <span className="alert-type">{alert.param}</span>
            <span className="alert-time">{formatTime(alert.timestamp)}</span>
          </div>
          {/* ... rest of alert content ... */}
        </div>
      ))}
    </div>
  );
} 