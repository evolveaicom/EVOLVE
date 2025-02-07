import React, { useState, useEffect } from 'react';

function ProposalList() {
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    const loadProposals = async () => {
      const filter = daoContract.filters.ProposalCreated();
      const events = await daoContract.queryFilter(filter);
      setProposals(parseProposals(events));
    };
    loadProposals();
  }, []);

  return (
    <div className="dao-proposals">
      <h3>Active Governance Proposals</h3>
      {proposals.map(p => (
        <ProposalItem 
          key={p.id}
          title={p.title}
          forVotes={p.for}
          againstVotes={p.against}
          deadline={p.deadline}
        />
      ))}
    </div>
  );
}

function LockPeriodForm() {
  const [newPeriod, setNewPeriod] = useState('');

  const createProposal = async () => {
    const calldata = token.interface.encodeFunctionData(
      "setDelegationLock", 
      [newPeriod * 86400] // Convert days to seconds
    );
    await dao.propose(
      [token.address],
      [0],
      [calldata],
      `Adjust delegation lock to ${newPeriod} days`
    );
  };

  return (
    <div className="lock-config-panel">
      <input
        type="number"
        value={newPeriod}
        onChange={(e) => setNewPeriod(e.target.value)}
        placeholder="New lock period (days)"
      />
      <button onClick={createProposal}>
        Create Adjustment Proposal
      </button>
    </div>
  );
}

function MultiParameterForm() {
  const [params, setParams] = useState({
    lockPeriod: '',
    fee: '',
    rebate: ''
  });

  const createJointProposal = async () => {
    const calldata = token.interface.encodeFunctionData(
      "configureMultipleParameters",
      [
        params.lockPeriod * 86400, 
        params.fee,
        params.rebate
      ]
    );
    
    await dao.propose(
      [token.address],
      [0],
      [calldata],
      `Update Parameters: Lock ${params.lockPeriod} days, Fee ${params.fee}%, Rebate ${params.rebate}%`
    );
  };

  return (
    <div className="multi-param-form">
      <div className="param-group">
        <label>Lock Period (days)</label>
        <input
          type="number"
          value={params.lockPeriod}
          onChange={(e) => setParams({...params, lockPeriod: e.target.value})}
          min="1"
          max="14"
        />
      </div>
      <div className="param-group">
        <label>Withdrawal Fee (%)</label>
        <input
          type="number"
          value={params.fee}
          onChange={(e) => setParams({...params, fee: e.target.value})}
          min="0"
          max="5"
          step="0.1"
        />
      </div>
      <div className="param-group">
        <label>Fee Rebate (%)</label>
        <input
          type="number"
          value={params.rebate}
          onChange={(e) => setParams({...params, rebate: e.target.value})}
          min="0"
          max="50"
        />
      </div>
      <button onClick={createJointProposal}>
        Create Joint Proposal
      </button>
    </div>
  );
}

function TemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    lockDays: '',
    fee: '',
    rebate: ''
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    const loadTemplates = async () => {
      const ids = await contract.templateIds();
      const loaded = await Promise.all(ids.map(async id => {
        const tpl = await contract.governanceTemplates(id);
        return { id, ...tpl };
      }));
      setTemplates(loaded);
    };
    loadTemplates();
  }, []);

  const createTemplateProposal = async () => {
    const calldata = contract.interface.encodeFunctionData(
      "saveGovernanceTemplate",
      [newTemplate.name, newTemplate.lockDays, newTemplate.fee, newTemplate.rebate]
    );
    
    await dao.propose(
      [contract.address],
      [0],
      [calldata],
      `New Governance Template: ${newTemplate.name}`
    );
  };

  return (
    <div className="template-manager">
      <TemplateExporter templateId={selectedTemplate} />
      <div className="template-form">
        <input
          placeholder="Template Name"
          value={newTemplate.name}
          onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
        />
        <input
          type="number"
          placeholder="Lock Days"
          value={newTemplate.lockDays}
          onChange={e => setNewTemplate({...newTemplate, lockDays: e.target.value})}
        />
        <input
          type="number"
          placeholder="Fee %"
          step="0.1"
          value={newTemplate.fee}
          onChange={e => setNewTemplate({...newTemplate, fee: e.target.value})}
        />
        <input
          type="number"
          placeholder="Rebate %"
          value={newTemplate.rebate}
          onChange={e => setNewTemplate({...newTemplate, rebate: e.target.value})}
        />
        <button onClick={createTemplateProposal}>
          Propose New Template
        </button>
      </div>

      <div className="template-gallery">
        {templates.map(tpl => (
          <div key={tpl.id} className="template-card">
            <h4>{tpl.name}</h4>
            <div>Lock: {tpl.lockPeriod/86400}d</div>
            <div>Fee: {tpl.fee}%</div>
            <div>Rebate: {tpl.rebate}%</div>
            <button onClick={() => setSelectedTemplate(tpl.id)}>
              Apply Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProposalList; 