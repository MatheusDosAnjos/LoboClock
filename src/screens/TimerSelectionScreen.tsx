import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  InteractionManager,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  TimerStrategyFactory,
  TimerType,
} from '../factories/TimerStrategyFactory';
import { TimerConfigForm } from '../components/TimerConfigForm';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- DESIGN SYSTEM COLORS (for consistency) ---
const COLORS = {
  background: '#f4f4f0',
  card: '#ffffff',
  textPrimary: '#333333',
  textSecondary: '#666666',
  primaryAction: '#4CAF50', // Green from Logo
  primaryActionDisabled: '#a5d6a7', // Lighter Green
  accent: '#8A2BE2', // Purple from Logo
};
// ---------------------------------------------

const TimerSelectionScreen = () => {
  const navigation = useNavigation();
  const strategies = TimerStrategyFactory.getAllStrategies();
  const [selectedStrategy, setSelectedStrategy] = useState<TimerType | null>(
    null,
  );
  const [config, setConfig] = useState<Record<string, any>>({});
  const [isConfigValid, setIsConfigValid] = useState<boolean>(false);
  const scrollViewRef = useRef(null);
  const itemMeasurements = useRef({});

  const handleStrategySelect = (type: TimerType) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // If selecting the same strategy, toggle it off
    if (selectedStrategy === type) {
      setSelectedStrategy(null);
      setIsConfigValid(false);
      return;
    }

    const strategy = TimerStrategyFactory.createStrategy(type);
    setSelectedStrategy(type);
    const initialConfig = {};
    strategy.getConfigParams().forEach(param => {
      initialConfig[param.name] = param.defaultValue;
    });
    setConfig(initialConfig);
    setIsConfigValid(true);
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        if (scrollViewRef.current && itemMeasurements.current[type]) {
          scrollViewRef.current.scrollTo({
            y: itemMeasurements.current[type],
            animated: true,
          });
        }
      }, 200);
    });
  };

  const handleItemLayout = (type, y) => {
    itemMeasurements.current[type] = y;
  };

  const handleConfigChange = (name: string, value: any) => {
    setConfig({ ...config, [name]: value });
  };

  const handleConfigValidation = (isValid: boolean) => {
    setIsConfigValid(isValid);
  };

  const handleStartGame = () => {
    const finalConfig = { ...config };
    if (selectedStrategy) {
      const strategy = TimerStrategyFactory.createStrategy(selectedStrategy);
      strategy.getConfigParams().forEach(param => {
        if (
          finalConfig[param.name] === '' ||
          finalConfig[param.name] === undefined
        ) {
          finalConfig[param.name] = param.defaultValue;
        }
      });
    }
    navigation.navigate('Game', {
      strategyType: selectedStrategy,
      config: finalConfig,
    });
  };

  const renderStrategyItem = strategy => {
    const isSelected = selectedStrategy === strategy.type;

    return (
      <View
        key={strategy.type}
        style={[
          styles.strategyItemContainer,
          isSelected && styles.selectedStrategy,
        ]}
        onLayout={event => {
          const { y } = event.nativeEvent.layout;
          handleItemLayout(strategy.type, y);
        }}
      >
        <TouchableOpacity
          style={styles.strategyItemTouchable}
          onPress={() => handleStrategySelect(strategy.type)}
        >
          <Text style={styles.strategyName}>{strategy.name}</Text>
          <Text style={styles.strategyDesc}>{strategy.description}</Text>
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.configContainer}>
            <TimerConfigForm
              strategy={TimerStrategyFactory.createStrategy(strategy.type)}
              config={config}
              onChange={handleConfigChange}
              onValidationChange={handleConfigValidation}
            />
            <TouchableOpacity
              style={[
                styles.startButton,
                !isConfigValid && styles.startButtonDisabled,
              ]}
              onPress={handleStartGame}
              disabled={!isConfigValid}
            >
              <Text style={styles.startButtonText}>Começar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {strategies.map(renderStrategyItem)}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  strategyItemContainer: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedStrategy: {
    borderColor: COLORS.primaryAction,
  },
  strategyItemTouchable: {
    padding: 20,
    borderRadius: 12,
  },
  strategyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  strategyDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  configContainer: {
    padding: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  startButton: {
    backgroundColor: COLORS.primaryAction,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  startButtonDisabled: {
    backgroundColor: COLORS.primaryActionDisabled,
    opacity: 0.8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TimerSelectionScreen;
