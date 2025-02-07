class EvolutionaryPredictor:
    def __init__(self, blockchain_interface):
        self.blockchain = blockchain_interface
        self.lstm_model = load_keras_model('evolution_lstm.h5')
        
    def predict_next_mutation(self):
        # Fetch last 10 mutations data
        history = self.blockchain.get_mutation_history(10)
        
        # Prepare time-series data
        sequence = np.array([
            [m['burn_rate'], m['survival_rate'], m['pressure']] 
            for m in history
        ])
        
        # Predict next cycle parameters using LSTM
        prediction = self.lstm_model.predict(np.expand_dims(sequence, axis=0))
        
        return {
            'predicted_burn_rate': prediction[0][0],
            'predicted_survival': prediction[0][1],
            'mutation_trend': self._interpret_trend(prediction[0][2])
        }
    
    def _interpret_trend(self, trend_value):
        if trend_value > 0.7: return 'aggressive'
        if trend_value < 0.3: return 'defensive'
        return 'neutral' 