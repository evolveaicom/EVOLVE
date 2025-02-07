import React, { useState } from 'react';

function TemplateComparator() {
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);

  const loadComparison = async () => {
    const data = await contract.compareTemplates(selectedTemplates);
    setComparisonData(data);
  };

  return (
    <div className="comparator">
      <TemplateSelector 
        selected={selectedTemplates}
        onSelect={setSelectedTemplates}
        maxSelection={3}
      />
      
      <button onClick={loadComparison} disabled={selectedTemplates.length < 2}>
        Compare Templates
      </button>

      {comparisonData && (
        <div className="comparison-grid">
          <div className="header-row">
            <div>Metric</div>
            {comparisonData.names.map((name, i) => (
              <div key={i} className="template-column">
                <h4>{name}</h4>
                <div>v{comparisonData.versions[i]}</div>
              </div>
            ))}
          </div>
          
          <div className="data-row">
            <div>Total Changes</div>
            {comparisonData.changeCounts.map((count, i) => (
              <div key={i}>{count}</div>
            ))}
          </div>

          <div className="data-row">
            <div>Current Lock (days)</div>
            {comparisonData.recentParams.map((params, i) => (
              <div key={i}>{params[0]/86400}</div>
            ))}
          </div>

          <div className="data-row">
            <div>Current Fee (%)</div>
            {comparisonData.recentParams.map((params, i) => (
              <div key={i}>{params[1]}</div>
            ))}
          </div>

          <div className="data-row">
            <div>Current Rebate (%)</div>
            {comparisonData.recentParams.map((params, i) => (
              <div key={i}>{params[2]}</div>
            ))}
          </div>
        </div>
      )}

      {/* Add timeline comparison */}
      {comparisonData && (
        <div className="trend-comparison">
          {selectedTemplates.map((templateId, i) => (
            <ParameterTimeline 
              key={i}
              templateId={templateId} 
              title={comparisonData.names[i]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TemplateComparator; 