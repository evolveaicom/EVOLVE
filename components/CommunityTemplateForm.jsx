import React, { useState } from 'react';

function TemplateSubmitter() {
  const [template, setTemplate] = useState({
    name: '',
    duration: 3,
    quorum: 10,
    delay: 24
  });

  const handleSubmit = async () => {
    await contract.submitCommunityTemplate(
      template.name,
      template.duration,
      template.quorum,
      template.delay * 3600
    );
    alert('Template submitted to community!');
  };

  return (
    <div className="template-submitter">
      <h4>Submit New Template</h4>
      <input
        type="text"
        placeholder="Template Name"
        maxLength={20}
        value={template.name}
        onChange={(e) => setTemplate({...template, name: e.target.value})}
      />
      <SliderControl
        label="Duration (days)"
        value={template.duration}
        min={1}
        max={7}
        onChange={(v) => setTemplate({...template, duration: v})}
      />
      <SliderControl
        label="Quorum %"
        value={template.quorum}
        min={5}
        max={30}
        onChange={(v) => setTemplate({...template, quorum: v})}
      />
      <SliderControl
        label="Delay (hours)"
        value={template.delay}
        min={6}
        max={72}
        onChange={(v) => setTemplate({...template, delay: v})}
      />
      <button onClick={handleSubmit}>Submit to Community</button>
    </div>
  );
}

export default TemplateSubmitter; 