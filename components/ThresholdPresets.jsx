import React, { useState, useEffect } from 'react';

function TemplateSelector({ onSelect }) {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const loadTemplates = async () => {
      const available = await contract.getAvailableTemplates();
      setTemplates(available);
    };
    loadTemplates();
  }, []);

  return (
    <div className="template-selector">
      <h4>Preset Templates</h4>
      <div className="template-grid">
        {templates.map((template, idx) => (
          <div 
            key={idx}
            className="template-card"
            onClick={() => onSelect(template)}
          >
            <h5>{template.name}</h5>
            <div>Duration: {template.minDuration}d+</div>
            <div>Quorum: {template.quorum}%+</div>
            <div>Delay: {template.delay/3600}h+</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TemplateSelector; 