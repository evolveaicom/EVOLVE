class DarwinianScorer:
    def __init__(self):
        self.mutation_success_rates = {}
    
    def calculate_fitness(self, mutation_id, market_data):
        """
        Calculate Darwin Score based on:
        - Adoption rate (24h holders)
        - Trading velocity
        - Social sentiment
        - Meme virality score
        """
        score = (
            market_data['holder_growth'] * 0.4 +
            market_data['trade_velocity'] * 0.3 +
            market_data['sentiment'] * 0.2 +
            market_data['meme_shares'] * 0.1
        )
        
        # Apply evolutionary pressure curve
        return 1 / (1 + math.exp(-0.5*(score-5)))
    
    def update_success_rate(self, mutation_id, score):
        # Store success rate for genetic inheritance
        self.mutation_success_rates[mutation_id] = score 

class EnhancedScorer(DarwinianScorer):
    def calculate_environment_pressure(self, market_cap, eth_price):
        """计算市场环境压力系数"""
        pressure = 0
        if market_cap > 1e9:  # 高市值压力
            pressure += 0.3
        if eth_price < 2500:  # ETH价格下跌压力
            pressure += 0.2
        return min(pressure, 0.5)

    def calculate_fitness(self, mutation_id, market_data):
        score = super().calculate_fitness(mutation_id, market_data)
        
        # 添加环境压力调整
        env_pressure = self.calculate_environment_pressure(
            market_data['market_cap'],
            market_data['eth_price']
        )
        return score * (1 - env_pressure)

    def update_success_rate(self, mutation_id, score):
        # Store success rate for genetic inheritance
        self.mutation_success_rates[mutation_id] = score 