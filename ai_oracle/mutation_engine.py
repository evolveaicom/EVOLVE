class MutationProbabilityEngine:
    def __init__(self, market_feed):
        self.feed = market_feed
        self.BASE_RATE = 0.15
        
    def calculate_mutation_probability(self, current_state):
        # Get real-time market indicators
        volatility = self.feed.get_volatility()
        liquidity = self.feed.get_liquidity_index()
        
        # Calculate dynamic probability
        probability = self.BASE_RATE * (1 + volatility**2)
        
        # Apply liquidity modifier
        if liquidity < 0.3:
            probability *= 1.5
        elif liquidity > 0.7:
            probability *= 0.8
            
        # Ensure probability cap
        return min(probability, 0.5) 