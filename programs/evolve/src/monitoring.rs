impl AnomalyDetection {
    pub fn check_parameter_spike(
        history: &ParameterHistory,
        current_value: u8
    ) -> Option<Alert> {
        let last_10_values = history.values.iter().rev().take(10);
        let average: u8 = last_10_values.sum::<u8>() / 10;
        
        if current_value > average * 2 {
            Some(Alert::new(
                AlertLevel::Critical,
                "Parameter value doubled compared to recent average"
            ))
        } else {
            None
        }
    }
} 