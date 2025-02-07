function FitnessRadial({ score }) {
  return (
    <div className="fitness-radial">
      <CircularProgressbar
        value={score}
        maxValue={1}
        strokeWidth={8}
        styles={buildStyles({
          pathColor: `rgba(62, 152, 199, ${score})`,
          trailColor: '#eee',
          strokeLinecap: 'round'
        })}
      />
      <div className="score-label">
        {Math.round(score * 100)}%
      </div>
    </div>
  );
} 