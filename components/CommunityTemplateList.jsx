import React, { useState, useEffect } from 'react';
import { shortenAddress } from '../utils/addressUtils';

function CommunityTemplates() {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [, community] = await contract.getAvailableTemplates();
      setTemplates(community);
    };
    load();
  }, []);

  const handleVote = async (id) => {
    await contract.voteForTemplate(id);
    setTemplates(t => t.map((temp, idx) => 
      idx === id ? {...temp, votes: temp.votes + 1} : temp
    ));
  };

  return (
    <div className="community-templates">
      <h4>Community Templates (Sorted by Votes)</h4>
      {templates.sort((a,b) => b.votes - a.votes).map((template, idx) => (
        <div key={idx} className="community-template">
          <div className="template-meta">
            <span className="creator">{shortenAddress(template.submitter)}</span>
            <span className="votes">❤️ {template.votes}</span>
          </div>
          <div className="template-content">
            <h5>{template.name}</h5>
            <div>Duration: {template.minDuration}d</div>
            <div>Quorum: {template.quorum}%</div>
            <div>Delay: {template.delay/3600}h</div>
          </div>
          <button 
            onClick={() => handleVote(idx)}
            disabled={hasVoted(template.submitter, idx)}
          >
            Vote
          </button>
        </div>
      ))}
    </div>
  );
}

export default CommunityTemplates; 