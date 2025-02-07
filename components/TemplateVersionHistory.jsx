import React, { useState, useEffect } from 'react';

function VersionSelector({ template }) {
  const [selectedVersion, setSelectedVersion] = useState(template.latestVersion);
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    const loadVersions = async () => {
      const loaded = [];
      for(let v = 1; v <= template.latestVersion; v++) {
        const ver = await contract.getTemplateVersion(template.id, v);
        loaded.push(ver);
      }
      setVersions(loaded);
    };
    loadVersions();
  }, [template]);

  return (
    <div className="version-selector">
      <select 
        value={selectedVersion} 
        onChange={(e) => setSelectedVersion(Number(e.target.value))}
      >
        {versions.map(ver => (
          <option key={ver.version} value={ver.version}>
            v{ver.version} - {new Date(ver.timestamp*1000).toLocaleDateString()}
          </option>
        ))}
      </select>
      
      <button onClick={() => contract.applyTemplate(template.id, selectedVersion)}>
        Apply v{selectedVersion}
      </button>
      
      <div className="version-details">
        <div>Lock: {versions[selectedVersion-1]?.lockPeriod/86400}d</div>
        <div>Fee: {versions[selectedVersion-1]?.fee}%</div>
        <div>Rebate: {versions[selectedVersion-1]?.rebate}%</div>
      </div>
    </div>
  );
}

export default VersionSelector; 