# EVOLVE Protocol API Reference

## Overview
This document provides comprehensive documentation for the EVOLVE Protocol API, including smart contract interfaces, AI engine endpoints, and frontend integration guidelines.

## Smart Contract API

### Core Contract Methods

#### Evolution
```solidity
function proposeMutations(
    string[] calldata symbols,
    uint256[] calldata rates,
    string[] calldata dnaHashes
) external;

function voteForMutation(uint256 proposalId) external;
function applyMutation() external;
```

#### Governance
```solidity
function submitGovernanceProposal(
    uint256 newMinDuration,
    uint256 newQuorum,
    uint256 newDelay
) external;

function delegate(address delegatee) external;
```

### Events
```solidity
event MutationProposed(uint256 proposalId);
event MutationApplied(uint256 mutationId);
event EnvironmentUpdated(uint256 pressure, uint256 complexity);
```

## AI Engine API

### Mutation Generation
```python
def generate_mutations() -> List[Mutation]:
    """Generate mutation proposals based on market conditions"""
    pass

def analyze_market_sentiment(data: Dict) -> Dict:
    """Analyze market sentiment from social data"""
    pass
```

### Visual DNA Generation
```python
def generate_visual_mutation(
    sentiment: Dict,
    trend: str
) -> str:
    """Generate visual DNA representation"""
    pass
```

## Frontend Integration

### React Components
```typescript
interface DNAProps {
    currentDNA: {
        virality: number;
        adoptionRate: number;
        mutationIntensity: number;
    };
    onMutation?: (newDNA: any) => void;
}

const DNAStrand: React.FC<DNAProps>;
```

### Custom Hooks
```typescript
const useEvolution = () => {
    // Evolution state management
};

const useGovernance = () => {
    // Governance interaction
};
```

## WebSocket Events

### Evolution Updates
```javascript
socket.on('mutation:proposed', (data) => {
    // Handle new mutation proposal
});

socket.on('mutation:applied', (data) => {
    // Handle applied mutation
});
```

## Error Handling

### HTTP Status Codes
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

### Error Response Format
```json
{
    "error": {
        "code": "ERROR_CODE",
        "message": "Human readable message",
        "details": {}
    }
}
```

## Rate Limiting
- API calls are limited to 100 requests per minute per IP
- WebSocket connections are limited to 10 per IP
- Mutation proposals are limited to 3 per evolution cycle

## Security
- All endpoints require authentication
- Use API keys for server-to-server communication
- JWT tokens for user authentication
- CORS policies are enforced

## Versioning
Current API version: v1
API endpoint format: `/api/v1/{endpoint}` 