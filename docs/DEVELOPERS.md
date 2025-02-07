# EVOLVE Protocol Developer Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Smart Contract Integration](#smart-contract-integration)
3. [AI Engine Integration](#ai-engine-integration)
4. [Frontend Development](#frontend-development)
5. [Testing Guide](#testing-guide)

## Getting Started

### Prerequisites
- Node.js v16+
- Python 3.8+
- Solidity ^0.8.0
- Anchor Framework
- React/TypeScript

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/evolve-protocol.git

# Install dependencies
npm install
pip install -r requirements.txt

# Setup environment
cp .env.example .env
```

### Project Structure
```
evolve-protocol/
├── contracts/          # Smart contracts
├── programs/          # Solana programs
├── ai_oracle/         # AI mutation engine
├── components/        # React components
├── hooks/            # Custom React hooks
├── tests/            # Test suites
└── docs/             # Documentation
```

## Smart Contract Integration

### Core Contracts

#### DarwinMeme Contract
The main contract handling token evolution mechanics.

```solidity
interface IDarwinMeme {
    function proposeMutations(
        string[] calldata symbols,
        uint256[] calldata rates,
        string[] calldata dnaHashes
    ) external;
    
    function voteForMutation(uint256 proposalId) external;
    function applyMutation() external;
}
```

### Key Functions

#### Proposing Mutations
```solidity
function proposeMutations(
    string[] calldata symbols,
    uint256[] calldata rates,
    string[] calldata dnaHashes
) external {
    // Implementation details
}
```

Parameters:
- `symbols`: New token symbols
- `rates`: New burn rates
- `dnaHashes`: IPFS hashes for visual DNA

#### Voting
```solidity
function voteForMutation(uint256 proposalId) external {
    // Implementation details
}
```

### Events
```solidity
event MutationProposed(uint256 proposalId);
event MutationApplied(uint256 mutationId);
event EnvironmentUpdated(uint256 pressure, uint256 complexity);
```

## AI Engine Integration

### Setting Up the AI Engine

```python
from evolve.ai_oracle import EvolutionEngine

engine = EvolutionEngine()
engine.initialize_models()
```

### Generating Mutations

```python
# Generate mutation proposals
mutations = engine.generate_mutations()

# Analyze market sentiment
sentiment = engine.analyze_market_sentiment(social_data)

# Generate visual DNA
visual_dna = engine.generate_visual_mutation(sentiment, trend)
```

### Configuration

```python
# AI Engine Configuration
config = {
    'sentiment_threshold': 0.7,
    'mutation_rate': 0.1,
    'visual_complexity': 0.8
}

engine.configure(config)
```

## Frontend Development

### Component Structure

```typescript
// DNA Visualization Component
interface DNAProps {
    currentDNA: {
        virality: number;
        adoptionRate: number;
        mutationIntensity: number;
    };
    onMutation?: (newDNA: any) => void;
}

const DNAStrand: React.FC<DNAProps> = ({ currentDNA, onMutation }) => {
    // Implementation
};
```

### Hooks Usage

```typescript
// Evolution Hook
const useEvolution = () => {
    const [mutations, setMutations] = useState([]);
    const [currentDNA, setCurrentDNA] = useState(null);
    
    // Implementation
    
    return { mutations, currentDNA };
};
```

### State Management

```typescript
interface EvolutionState {
    mutations: Mutation[];
    currentDNA: DNA;
    proposals: Proposal[];
    environment: Environment;
}

// Redux/Context setup
```

## Testing Guide

### Smart Contract Tests

```typescript
describe("DarwinMeme", () => {
    it("should propose mutations", async () => {
        // Test implementation
    });
    
    it("should handle voting", async () => {
        // Test implementation
    });
    
    it("should apply mutations", async () => {
        // Test implementation
    });
});
```

### AI Engine Tests

```python
def test_mutation_generation():
    engine = EvolutionEngine()
    mutations = engine.generate_mutations()
    assert len(mutations) == 3
    assert all(m['burn_rate'] >= 1 and m['burn_rate'] <= 10 for m in mutations)

def test_sentiment_analysis():
    engine = EvolutionEngine()
    sentiment = engine.analyze_market_sentiment(mock_data)
    assert 'basic_sentiment' in sentiment
    assert 'market_trend' in sentiment
```

### Frontend Tests

```typescript
describe('DNAStrand', () => {
    it('renders correctly', () => {
        const { getByTestId } = render(<DNAStrand currentDNA={mockDNA} />);
        expect(getByTestId('dna-strand')).toBeInTheDocument();
    });
    
    it('handles mutations', async () => {
        // Test implementation
    });
});
```

## Deployment

### Smart Contract Deployment

```bash
# Deploy to testnet
npx hardhat deploy --network testnet

# Deploy to mainnet
npx hardhat deploy --network mainnet
```

### AI Engine Deployment

```bash
# Deploy AI service
docker build -t evolve-ai .
docker run -d -p 8080:8080 evolve-ai
```

### Frontend Deployment

```bash
# Build frontend
npm run build

# Deploy to hosting
npm run deploy
```

## Security Considerations

### Smart Contract Security
- Always use the latest Solidity version
- Implement proper access controls
- Use SafeMath for calculations
- Include emergency pause functionality

### AI Engine Security
- Validate all inputs
- Implement rate limiting
- Secure API endpoints
- Monitor resource usage

### Frontend Security
- Sanitize all inputs
- Implement proper authentication
- Use secure dependencies
- Regular security audits

## Contributing

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Submit pull request

### Code Style
- Follow Solidity style guide
- Use TypeScript for frontend
- Document all functions
- Write comprehensive tests

## Support
- Discord: [Join our server](https://discord.gg/evolve)
- Documentation: [Full docs](https://docs.evolveprotocol.org)
- GitHub Issues: [Report bugs](https://github.com/your-org/evolve-protocol/issues) 