import React, { useState } from 'react';
import SliderControl from './SliderControl';
import TemplateSelector from './TemplateSelector';

function ThresholdControls({ user }) {
  const [thresholds, setThresholds] = useState({
    minDuration: 3,
    quorum: 10,
    delay: 24,
    enabled: false
  });

  const handleTemplateSelect = (template) => {
    setThresholds({
      minDuration: template.minDuration,
      quorum: template.quorum,
      delay: template.delay / 3600,
      enabled: true
    });
  };

  return (
    <div className="threshold-settings">
      <h3>Alert Thresholds</h3>
      <TemplateSelector onSelect={handleTemplateSelect} />
      <div className="threshold-group">
        <label>
          <input 
            type="checkbox"
            checked={thresholds.enabled}
            onChange={(e) => setThresholds({...thresholds, enabled: e.target.checked})}
          />
          Enable Custom Thresholds
        </label>
      </div>
      
      <div className="threshold-sliders">
        <SliderControl
          label="Proposal Duration Change (days)"
          value={thresholds.minDuration}
          min={1}
          max={7}
          onChange={(v) => setThresholds({...thresholds, minDuration: v})}
        />
        <SliderControl
          label="Quorum % Change"
          value={thresholds.quorum}
          min={5}
          max={30}
          onChange={(v) => setThresholds({...thresholds, quorum: v})}
        />
        <SliderControl
          label="Delay Change (hours)"
          value={thresholds.delay}
          min={6}
          max={72}
          onChange={(v) => setThresholds({...thresholds, delay: v})}
        />
      </div>
      
      <button 
        onClick={() => contract.setAlertThresholds(
          thresholds.minDuration,
          thresholds.quorum,
          thresholds.delay * 3600,
          thresholds.enabled
        )}
      >
        Save Thresholds
      </button>
    </div>
  );
}

export default ThresholdControls; 