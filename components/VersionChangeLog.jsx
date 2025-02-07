import React, { useState, useEffect } from 'react';

function ChangeHistory({ templateId }) {
  const [changes, setChanges] = useState([]);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchTag, setSearchTag] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      const logs = await contract.templateChangeLogs(templateId);
      setChanges(logs.map(log => ({
        ...log,
        date: new Date(log.timestamp * 1000).toLocaleString()
      })));
    };
    loadHistory();
  }, [templateId]);

  const filteredChanges = changes.filter(change => {
    const categoryMatch = filterCategory === 'ALL' || 
      ChangeCategory[change.category] === filterCategory;
    const tagMatch = searchTag === '' || 
      change.tags.some(t => t.toLowerCase().includes(searchTag.toLowerCase()));
    return categoryMatch && tagMatch;
  });

  return (
    <div className="change-history">
      <div className="filters">
        <select onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="ALL">All Categories</option>
          {Object.keys(ChangeCategory).map(cat => 
            isNaN(cat) && <option key={cat} value={cat}>{cat}</option>
          )}
        </select>
        <input
          type="text"
          placeholder="Search tags..."
          value={searchTag}
          onChange={(e) => setSearchTag(e.target.value)}
        />
      </div>
      
      <h4>Version Change History</h4>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Tags</th>
            <th>Reason</th>
            <th>Version</th>
            <th>Modified</th>
            <th>By</th>
            <th>Lock Period</th>
            <th>Fee</th>
            <th>Rebate</th>
          </tr>
        </thead>
        <tbody>
          {filteredChanges.map(change => (
            <tr key={change.version}>
              <td>{ChangeCategory[change.category]}</td>
              <td className="tags-cell">
                {change.tags.map(tag => (
                  <span key={tag} className="tag-badge">{tag}</span>
                ))}
              </td>
              <td className="reason-cell">
                <div className="reason-tooltip">
                  {change.reason.substring(0, 20)}...
                  <span className="tooltip-text">{change.reason}</span>
                </div>
              </td>
              <td>v{change.version}</td>
              <td>{change.date}</td>
              <td>{shortenAddress(change.modifiedBy)}</td>
              <td>
                {change.oldLock/86400}d → {change.newLock/86400}d
              </td>
              <td>
                {change.oldFee}% → {change.newFee}%
              </td>
              <td>
                {change.oldRebate}% → {change.newRebate}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ChangeHistory; 