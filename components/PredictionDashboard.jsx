function MutationForecast({ predictions }) {
  return (
    <div className="forecast-panel">
      <h3>Next Evolution Forecast</h3>
      <div className="prediction-metrics">
        <div className="metric">
          <label>Burn Rate:</label>
          <span className={getTrendClass(predictions.burnRateTrend)}>
            {predictions.predicted_burn_rate.toFixed(2)}%
          </span>
        </div>
        <div className="metric">
          <label>Survival Probability:</label>
          <span className={getSurvivalClass(predictions.predicted_survival)}>
            {(predictions.predicted_survival * 100).toFixed(1)}%
          </span>
        </div>
      </div>
      <TrendIndicator trend={predictions.mutation_trend} />
    </div>
  );
}

function TrendIndicator({ trend }) {
  const trendConfig = {
    aggressive: { color: '#ff4757', label: '🚀 Aggressive' },
    defensive: { color: '#2ed573', label: '🛡 Defensive' },
    neutral: { color: '#ffa502', label: '⚖ Neutral' }
  };

  return (
    <div className="trend-indicator" style={{ backgroundColor: trendConfig[trend].color }}>
      <span>{trendConfig[trend].label}</span>
      <div className="pulse-effect" />
    </div>
  );
} 