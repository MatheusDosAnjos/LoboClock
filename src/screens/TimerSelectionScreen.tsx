import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  LayoutAnimation, 
  Platform,
  UIManager,
  InteractionManager
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
  const scrollViewRef = useRef(null);
  const itemMeasurements = useRef({});
  
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
    setIsConfigValid(true); // Default values are valid
    
    // Wait for animations to complete before scrolling
    InteractionManager.runAfterInteractions(() => {
      // Use a setTimeout to ensure the expanded component has been fully rendered
      setTimeout(() => {
        if (scrollViewRef.current && itemMeasurements.current[type]) {
          scrollViewRef.current.scrollTo({
            y: itemMeasurements.current[type],
            animated: true
          });
        }
      }, 300);
    });
  };
  
  const handleItemLayout = (type, y) => {
    itemMeasurements.current[type] = y;
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
      <View 
        key={strategy.type} 
        style={styles.strategyItemContainer}
        onLayout={(event) => {
          const { y } = event.nativeEvent.layout;
          handleItemLayout(strategy.type, y);
        }}
      >
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
              <Text style={styles.startButtonText}>Começar</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecione o tipo de timer</Text>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.strategyList}
        showsVerticalScrollIndicator={true}
      >
        {strategies.map(renderStrategyItem)}
        
        <View style={{ height: 100 }} />
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
  },
  startButtonDisabled: {
    backgroundColor: '#a0cfff', // lighter blue
    opacity: 0.7,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default TimerSelectionScreen;