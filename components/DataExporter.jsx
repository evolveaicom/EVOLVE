import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { arrayify } from 'ethers';

function TemplateExporter({ templateId }) {
  const [exportData, setExportData] = useState(null);

  const handleExport = async (format) => {
    const data = await contract.exportTemplateData(templateId);
    
    // Convert to desired format
    let content, mimeType, extension;
    if(format === 'csv') {
      content = [
        ['Template Name', data.name],
        ['Latest Version', data.latestVersion],
        [],
        ['Version', 'Date', 'Lock Days', 'Fee%', 'Rebate%', 'Category', 'Tags', 'Reason']
      ].concat(
        data.changes.map(c => [
          c.version,
          new Date(c.timestamp*1000).toISOString(),
          c.newLock/86400,
          c.newFee,
          c.newRebate,
          ChangeCategory[c.category],
          c.tags.join(';'),
          `"${c.reason.replace(/"/g, '""')}"`
        ])
      ).map(row => row.join(',')).join('\n');
      
      mimeType = 'text/csv';
      extension = 'csv';
    } else {
      content = JSON.stringify({
        metadata: {
          name: data.name,
          latestVersion: data.latestVersion,
          totalChanges: data.changes.length
        },
        stats: data.stats,
        topTags: data.topTags,
        changes: data.changes.map(c => ({
          ...c,
          timestamp: new Date(c.timestamp*1000).toISOString(),
          lockDays: c.newLock/86400
        }))
      }, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    }
    
    // Create downloadable file
    const blob = new Blob([content], {type: mimeType});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `template_${data.name}_${Date.now()}.${extension}`;
    link.click();
  };

  return (
    <div className="data-exporter">
      <button onClick={() => handleExport('json')}>Export JSON</button>
      <button onClick={() => handleExport('csv')}>Export CSV</button>
    </div>
  );
}

function convertToCSV(data) {
  const headers = [
    'Version', 'Timestamp', 'Lock Period', 'Fee', 'Rebate', 
    'Category', 'Tags', 'Reason'
  ].join(',');
  
  const rows = data.changes.map(change => 
    [change.version, change.timestamp, change.newLock/86400, 
     change.newFee, change.newRebate, 
     ChangeCategory[change.category], 
     change.tags.join(';'), 
     `"${change.reason}"`].join(',')
  ).join('\n');
  
  return new Blob([headers + '\n' + rows], {type: 'text/csv'});
}

function BatchExporter() {
  const [selectedTemplates, setSelectedTemplates] = useState([]);

  const handleBatchExport = async (format) => {
    const data = await contract.batchExportTemplates(selectedTemplates);
    
    const zip = new JSZip();
    data.names.forEach((name, i) => {
      const content = format === 'json' 
        ? JSON.stringify({
            name,
            version: data.versions[i],
            changes: data.allChanges[i]
          }, null, 2)
        : convertToCSV(data.allChanges[i]);
      
      zip.file(`${name}_${Date.now()}.${format}`, content);
    });

    const blob = await zip.generateAsync({type:"blob"});
    saveAs(blob, `templates_export_${Date.now()}.zip`);
  };

  return (
    <div className="batch-exporter">
      <TemplateSelector 
        multiSelect={true}
        onSelect={setSelectedTemplates}
      />
      <button 
        onClick={() => handleBatchExport('json')}
        disabled={selectedTemplates.length === 0}
      >
        Export as JSON Bundle
      </button>
      <button
        onClick={() => handleBatchExport('csv')}
        disabled={selectedTemplates.length === 0}
      >
        Export as CSV Bundle
      </button>
    </div>
  );
}

function DataValidator({ templateId }) {
  const [validationResult, setValidation] = useState(null);
  const [fileData, setFileData] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const data = JSON.parse(e.target.result);
      setFileData(data);
      
      // Verify data on-chain
      const isValid = await contract.verifyExportData(
        templateId,
        data.metadata.name,
        data.metadata.latestVersion,
        data.changes
      );
      
      setValidation(isValid);
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="validator">
      <input type="file" onChange={handleFileUpload} accept=".json" />
      {validationResult !== null && (
        <div className={`result ${validationResult ? 'valid' : 'invalid'}`}>
          {validationResult ? '✓ Valid Data' : '✗ Data Tampered'}
        </div>
      )}
      {fileData && (
        <div className="hash-comparison">
          On-chain Hash: {contract.generateDataHash(
            templateId,
            fileData.metadata.name,
            fileData.metadata.latestVersion,
            fileData.changes
          )}
        </div>
      )}
    </div>
  );
}

function SignedExporter({ templateId }) {
  const [signature, setSignature] = useState('');
  const [expiration, setExpiration] = useState(3600); // 1 hour default
  
  const handleSignExport = async () => {
    const data = await contract.exportTemplateData(templateId);
    const validUntil = Math.floor(Date.now()/1000) + expiration;
    
    const messageHash = await contract.generateExportSignature(
      templateId,
      data.name,
      data.latestVersion,
      data.changes,
      validUntil
    );
    
    const sig = await signer.signMessage(arrayify(messageHash));
    setSignature(JSON.stringify({ sig, validUntil }));
  };

  return (
    <div className="signed-exporter">
      <div className="expiration-selector">
        <label>Signature Validity: </label>
        <select value={expiration} onChange={e => setExpiration(Number(e.target.value))}>
          <option value={300}>5 Minutes</option>
          <option value={3600}>1 Hour</option>
          <option value={86400}>1 Day</option>
          <option value={604800}>1 Week</option>
        </select>
      </div>
      <TemplateExporter templateId={templateId} />
      <button onClick={handleSignExport}>Sign Export</button>
      {signature && (
        <div className="signature-section">
          <div>Signature: {signature}</div>
          <button onClick={() => navigator.clipboard.writeText(signature)}>
            Copy Signature
          </button>
        </div>
      )}
    </div>
  );
}

function BatchSignatureValidator() {
  const [verificationResults, setResults] = useState([]);
  const [selectedFiles, setFiles] = useState([]);

  const handleVerifyBatch = async () => {
    const verifyData = await Promise.all(
      selectedFiles.map(async (file) => {
        const data = JSON.parse(await file.text());
        return {
          templateId: data.metadata.templateId,
          name: data.metadata.name,
          version: data.metadata.latestVersion,
          changes: data.changes,
          signature: data.signature
        };
      })
    );

    const result = await contract.batchVerifySignatures(
      verifyData.map(d => d.templateId),
      verifyData.map(d => d.name),
      verifyData.map(d => d.version),
      verifyData.map(d => d.changes),
      verifyData.map(d => d.signature)
    );

    setResults(result.isValid.map((valid, i) => ({
      name: verifyData[i].name,
      signer: result.signers[i],
      valid,
      timestamp: Date.now()
    })));
  };

  return (
    <div className="batch-validator">
      <input
        type="file"
        multiple
        onChange={e => setFiles([...e.target.files])}
        accept=".signed.json"
      />
      
      <button onClick={handleVerifyBatch} disabled={!selectedFiles.length}>
        Verify {selectedFiles.length} Signatures
      </button>

      {verificationResults.length > 0 && (
        <div className="results-grid">
          {verificationResults.map((result, i) => (
            <div key={i} className={`result ${result.valid ? 'valid' : 'invalid'}`}>
              <div>{result.name}</div>
              <div>{result.valid ? 'Valid' : 'Invalid'}</div>
              <div>{shortenAddress(result.signer)}</div>
              <div>{new Date(result.timestamp).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TemplateExporter; 