import random
import re

class RecombinationSimulator:
    def __init__(self, gene_pool):
        self.gene_pool = gene_pool
        self.scenarios = []
        
    def generate_scenario(self, generations=5):
        current_genes = random.choice(self.gene_pool)
        history = []
        
        for _ in range(generations):
            # Select two parents
            parents = random.sample(self.gene_pool, 2)
            # Crossover
            new_genes = {
                'burn_rate': (parents[0]['burn_rate'] + parents[1]['burn_rate']) / 2,
                'symbol': self._combine_symbols(parents[0]['symbol'], parents[1]['symbol'])
            }
            # Mutate
            new_genes = self._apply_mutations(new_genes)
            history.append(new_genes)
            current_genes = new_genes
            
        return history
    
    def _combine_symbols(self, sym1, sym2):
        # Extract version numbers
        v1 = int(re.search(r'\d+', sym1).group())
        v2 = int(re.search(r'\d+', sym2).group())
        return f"EvoV{(v1 + v2)//2}_{sym1.split('_')[-1][:3]}{sym2.split('_')[-1][-3:]}" 