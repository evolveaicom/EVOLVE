function AlertFeed({ alerts }) {
  return (
    <div className="alert-feed">
      {alerts.map((alert, idx) => (
        <div key={idx} className={`alert ${alert.type}`}>
          <div className="alert-header">
            <span className="alert-type">{alert.type}</span>
            <span className="alert-time">{formatTime(alert.timestamp)}</span>
          </div>
          <div className="alert-content">
            <span className="param-name">{alert.param}</span>
            <span className="change">
              {alert.oldValue} → {alert.newValue}
            </span>
          </div>
          <div className="effective-time">
            Effective: {formatDate(alert.effective)}
          </div>
        </div>
      ))}
    </div>
  );
} 