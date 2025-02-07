class MutationProbabilityModel:
    def __init__(self, market_analyzer):
        self.analyzer = market_analyzer
        self.base_rate = 0.15
        
    def calculate_rate(self, current_gene):
        volatility = self.analyzer.get_volatility()
        liquidity = self.analyzer.get_liquidity()
        
        # Dynamic rate adjustment
        adjusted_rate = self.base_rate * (1 + volatility ** 2)
        if liquidity < 0.3:
            adjusted_rate *= 1.5
        elif liquidity > 0.7:
            adjusted_rate *= 0.8
            
        # Gene stability factor
        stability = 1 - abs(current_gene['burn_rate'] - 5) / 5
        return min(adjusted_rate * stability, 0.5) 