import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  LayoutAnimation, 
  Platform,
  UIManager 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TimerStrategyFactory, TimerType } from '../factories/TimerStrategyFactory';
import { TimerConfigForm } from '../components/TimerConfigForm';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const TimerSelectionScreen = () => {
  const navigation = useNavigation();
  const strategies = TimerStrategyFactory.getAllStrategies();
  const [selectedStrategy, setSelectedStrategy] = useState<TimerType | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [isConfigValid, setIsConfigValid] = useState<boolean>(false);
  
  const handleStrategySelect = (type: TimerType) => {
    // Configure animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    // If selecting the same strategy, toggle it off
    if (selectedStrategy === type) {
      setSelectedStrategy(null);
      setIsConfigValid(false);
      return;
    }
    
    const strategy = TimerStrategyFactory.createStrategy(type);
    setSelectedStrategy(type);
    
    // Initialize config with default values
    const initialConfig = {};
    strategy.getConfigParams().forEach(param => {
      initialConfig[param.name] = param.defaultValue;
    });
    setConfig(initialConfig);
    setIsConfigValid(true);
  };
  
  const handleConfigChange = (name: string, value: any) => {
    setConfig({...config, [name]: value});
  };
  
  const handleConfigValidation = (isValid: boolean) => {
    setIsConfigValid(isValid);
  };
  
  const handleStartGame = () => {
    // Convert any empty string values to defaults before starting
    const finalConfig = {...config};
    if (selectedStrategy) {
      const strategy = TimerStrategyFactory.createStrategy(selectedStrategy);
      strategy.getConfigParams().forEach(param => {
        if (finalConfig[param.name] === '' || finalConfig[param.name] === undefined) {
          finalConfig[param.name] = param.defaultValue;
        }
      });
    }
    
    navigation.navigate('Game', {
      strategyType: selectedStrategy,
      config: finalConfig
    });
  };
  
  const renderStrategyItem = (strategy) => {
    const isSelected = selectedStrategy === strategy.type;
    
    return (
      <View key={strategy.type} style={styles.strategyItemContainer}>
        <TouchableOpacity 
          style={[
            styles.strategyItem,
            isSelected && styles.selectedStrategy
          ]}
          onPress={() => handleStrategySelect(strategy.type)}
        >
          <Text style={styles.strategyName}>{strategy.name}</Text>
          <Text style={styles.strategyDesc}>{strategy.description}</Text>
        </TouchableOpacity>
        
        {isSelected && (
          <Animated.View style={styles.configContainer}>
            <Text style={styles.configTitle}>Configure Timer</Text>
            <TimerConfigForm 
              strategy={TimerStrategyFactory.createStrategy(strategy.type)}
              config={config}
              onChange={handleConfigChange}
              onValidationChange={handleConfigValidation}
            />
            
            <TouchableOpacity 
              style={[
                styles.startButton,
                !isConfigValid && styles.startButtonDisabled
              ]}
              onPress={handleStartGame}
              disabled={!isConfigValid}
            >
              <Text style={styles.startButtonText}>Start Game</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Timer Type</Text>
      
      <ScrollView 
        style={styles.strategyList}
        showsVerticalScrollIndicator={true}
      >
        {strategies.map(renderStrategyItem)}
        
        {/* Add extra space at the bottom for better scrolling */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  strategyList: {
    flex: 1,
  },
  strategyItemContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  strategyItem: {
    padding: 16,
    borderRadius: 8,
  },
  selectedStrategy: {
    backgroundColor: '#e6f0ff',
    borderBottomWidth: 1,
    borderBottomColor: '#cde0ff',
  },
  strategyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  strategyDesc: {
    fontSize: 14,
    color: '#666',
  },
  configContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  configTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#444',
  },
  startButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 16,
  },
  startButtonDisabled: {
    backgroundColor: '#a0cfff',
    opacity: 0.7,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default TimerSelectionScreen;