import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function RevocationPanel() {
  const [signatures, setSignatures] = useState([]);
  const [revokeHash, setRevokeHash] = useState('');

  useEffect(() => {
    const loadSignatures = async () => {
      const filter = contract.filters.SignatureRevoked();
      const events = await contract.queryFilter(filter);
      setSignatures(events.map(e => ({
        hash: e.args.sigHash,
        revokedBy: e.args.revokedBy,
        timestamp: new Date(e.args.timestamp * 1000)
      })));
    };
    loadSignatures();
  }, []);

  const handleRevoke = async () => {
    const hashBytes = ethers.utils.arrayify(revokeHash);
    await contract.revokeSignature(hashBytes);
  };

  return (
    <div className="revocation-panel">
      <div className="revoke-form">
        <input
          placeholder="Signature Hash"
          value={revokeHash}
          onChange={e => setRevokeHash(e.target.value)}
        />
        <button onClick={handleRevoke}>Revoke Signature</button>
      </div>

      <div className="revoked-list">
        <h3>Revoked Signatures</h3>
        {signatures.map((sig, i) => (
          <div key={i} className="revoked-item">
            <div>Hash: {sig.hash}</div>
            <div>Revoked By: {shortenAddress(sig.revokedBy)}</div>
            <div>Date: {sig.timestamp.toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RevocationPanel; 