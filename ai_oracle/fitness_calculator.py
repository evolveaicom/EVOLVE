class AdaptiveFitnessCalculator:
    def __init__(self, market_analyzer):
        self.market = market_analyzer
        self.base_weights = {
            'liquidity': 0.3,
            'volatility': 0.25,
            'social_score': 0.2,
            'holder_growth': 0.15,
            'burn_rate': 0.1
        }
        
    def calculate(self, gene):
        # Get real-time market data
        market_state = self.market.current_state()
        
        # Adjust weights dynamically
        adjusted_weights = self._adapt_weights(market_state)
        
        # Calculate fitness score
        score = sum(
            gene[factor] * adjusted_weights[factor]
            for factor in adjusted_weights
        )
        
        return score * self._environmental_factor(market_state)
    
    def _adapt_weights(self, market):
        # Increase volatility weight in bear markets
        if market['trend'] == 'bearish':
            return {
                **self.base_weights,
                'volatility': 0.4,
                'liquidity': 0.2
            }
        return self.base_weights
    
    def _environmental_factor(self, market):
        # Apply pressure from market conditions
        return 1 - (market['pressure_index'] / 100) 