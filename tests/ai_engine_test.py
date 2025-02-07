import unittest
import numpy as np
from unittest.mock import Mock, patch
from ai_oracle.main import EvolutionEngine
from ai_oracle.gene_optimizer import AdaptiveGeneOptimizer
from ai_oracle.mutation_model import MutationProbabilityModel

class TestEvolutionEngine(unittest.TestCase):
    def setUp(self):
        self.engine = EvolutionEngine()
        
    @patch('ai_oracle.main.load_huggingface_model')
    def test_initialization(self, mock_load_model):
        mock_model = Mock()
        mock_load_model.return_value = mock_model
        
        engine = EvolutionEngine()
        self.assertIsNotNone(engine.nlp_model)
        self.assertIsNotNone(engine.trend_analyzer)
        self.assertIsNotNone(engine.image_generator)
        
    def test_mutation_generation(self):
        mutations = self.engine.generate_mutations()
        
        self.assertEqual(len(mutations), 3)
        for mutation in mutations:
            self.assertIn('symbol', mutation)
            self.assertIn('burn_rate', mutation)
            self.assertIn('visual_dna', mutation)
            self.assertGreaterEqual(mutation['burn_rate'], 1)
            self.assertLessEqual(mutation['burn_rate'], 10)
            
    def test_market_sentiment_analysis(self):
        mock_data = {
            'text': ['Bullish on $EVOLVE', 'Great project', 'To the moon'],
            'media': ['image1.jpg', 'image2.jpg']
        }
        
        sentiment = self.engine.analyze_market_sentiment(mock_data)
        
        self.assertIn('basic_sentiment', sentiment)
        self.assertIn('market_trend', sentiment)
        self.assertIn('community_engagement', sentiment)
        self.assertIn('meme_virality', sentiment)
        self.assertIn('environmental_pressure', sentiment)
        
    def test_adaptive_burn_rate(self):
        sentiment = {
            'market_trend': 0.8,
            'community_engagement': 0.7,
            'meme_virality': 0.9,
            'environmental_pressure': 0.5
        }
        
        # Test aggressive trend
        burn_rate = self.engine.calculate_adaptive_burn_rate(sentiment, 'aggressive')
        self.assertGreaterEqual(burn_rate, 5)
        
        # Test defensive trend
        burn_rate = self.engine.calculate_adaptive_burn_rate(sentiment, 'defensive')
        self.assertLessEqual(burn_rate, 5)
        
    @patch('ai_oracle.main.query_gpt4')
    def test_symbol_generation(self, mock_gpt4):
        mock_gpt4.return_value = 'EvoV2Phoenix'
        
        symbol = self.engine.generate_evolved_symbol(
            {'basic_sentiment': 'positive'},
            'aggressive'
        )
        
        self.assertTrue(symbol.startswith('EvoV2'))
        self.assertLessEqual(len(symbol), 12)

class TestGeneOptimizer(unittest.TestCase):
    def setUp(self):
        self.market_analyzer = Mock()
        self.optimizer = AdaptiveGeneOptimizer(self.market_analyzer)
        
    def test_parameter_evolution(self):
        self.market_analyzer.get_volatility.return_value = 0.5
        self.market_analyzer.get_liquidity_ratio.return_value = 0.7
        
        params = self.optimizer.evolve_parameters({
            'burn_rate': 5,
            'mutation_rate': 0.1
        })
        
        self.assertIn('mutation_rate', params)
        self.assertIn('crossover_rate', params)
        self.assertIn('selection_pressure', params)
        
    def test_genetic_pool_maintenance(self):
        # Add 120 genes to test pool size management
        for i in range(120):
            self.optimizer.update_genetic_pool({
                'id': i,
                'burn_rate': i % 10,
                'mutation_rate': 0.1
            })
            
        self.assertLessEqual(len(self.optimizer.genetic_pool), 100)

class TestMutationModel(unittest.TestCase):
    def setUp(self):
        self.market_analyzer = Mock()
        self.model = MutationProbabilityModel(self.market_analyzer)
        
    def test_mutation_rate_calculation(self):
        self.market_analyzer.get_volatility.return_value = 0.8
        self.market_analyzer.get_liquidity.return_value = 0.4
        
        current_gene = {'burn_rate': 5}
        rate = self.model.calculate_rate(current_gene)
        
        self.assertGreaterEqual(rate, 0)
        self.assertLessEqual(rate, 0.5)
        
    def test_environmental_adaptation(self):
        # Test high volatility scenario
        self.market_analyzer.get_volatility.return_value = 0.9
        self.market_analyzer.get_liquidity.return_value = 0.2
        
        rate_volatile = self.model.calculate_rate({'burn_rate': 5})
        
        # Test low volatility scenario
        self.market_analyzer.get_volatility.return_value = 0.1
        self.market_analyzer.get_liquidity.return_value = 0.8
        
        rate_stable = self.model.calculate_rate({'burn_rate': 5})
        
        self.assertGreater(rate_volatile, rate_stable)

class TestIntegration(unittest.TestCase):
    def setUp(self):
        self.engine = EvolutionEngine()
        
    def test_complete_evolution_cycle(self):
        # Generate mutations
        mutations = self.engine.generate_mutations()
        self.assertEqual(len(mutations), 3)
        
        # Analyze market conditions
        sentiment = self.engine.analyze_market_sentiment({
            'text': ['Test data'],
            'media': ['test.jpg']
        })
        self.assertIsNotNone(sentiment)
        
        # Generate visual DNA
        visual_dna = self.engine.generate_visual_mutation(sentiment, 'balanced')
        self.assertIsNotNone(visual_dna)
        
        # Verify mutation properties
        for mutation in mutations:
            self.assertIsInstance(mutation['burn_rate'], (int, float))
            self.assertIsInstance(mutation['symbol'], str)
            self.assertIsInstance(mutation['visual_dna'], str)
            
    def test_error_handling(self):
        # Test invalid social data
        with self.assertRaises(ValueError):
            self.engine.analyze_market_sentiment(None)
            
        # Test invalid trend
        with self.assertRaises(ValueError):
            self.engine.generate_single_mutation({}, 'invalid_trend')
            
        # Test invalid burn rate
        with self.assertRaises(ValueError):
            self.engine.calculate_adaptive_burn_rate({}, 'invalid_trend')

if __name__ == '__main__':
    unittest.main() 