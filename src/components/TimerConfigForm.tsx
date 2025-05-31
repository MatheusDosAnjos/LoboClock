import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TimerStrategy } from '../strategies/TimerStrategy';

const COLORS = {
  background: '#f4f4f0',
  card: '#ffffff',
  textPrimary: '#333333',
  textSecondary: '#666666',
  primaryAction: '#4CAF50', // Green from Logo
  primaryActionDisabled: '#a5d6a7', // Lighter Green
  accent: '#8A2BE2', // Purple from Logo
  inputBorder: '#cccccc',
  inputBackground: '#ffffff',
  inputErrorBorder: '#ff3b30', // iOS system red for errors
  inputErrorBackground: '#fff0f0', // Lighter red for error background
  errorText: '#ff3b30',
  pickerBackground: '#f0f0f0', // A slightly different background for picker container
};

interface TimerConfigFormProps {
  strategy: TimerStrategy;
  config: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export const TimerConfigForm = ({
  strategy,
  config,
  onChange,
  onValidationChange,
}: TimerConfigFormProps) => {
  const params = strategy.getConfigParams();
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    validateAll();
  }, [config, strategy]);

  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    const currentParams = strategy.getConfigParams();

    currentParams.forEach(param => {
      if (
        param.condition &&
        config[param.condition.param] !== param.condition.value
      ) {
        return;
      }

      const value = config[param.name];

      if (
        value === undefined ||
        value === null ||
        String(value).trim() === ''
      ) {
        newErrors[param.name] = `${param.label} é obrigatório`;
        isValid = false;
        return;
      }

      if (param.type === 'number') {
        const numValue = Number(value);

        if (isNaN(numValue)) {
          newErrors[param.name] = `${param.label} precisa ser um número válido`;
          isValid = false;
        } else if (param.minValue !== undefined && numValue < param.minValue) {
          newErrors[param.name] = `Mínimo: ${param.minValue}`;
          isValid = false;
        } else if (param.maxValue !== undefined && numValue > param.maxValue) {
          newErrors[param.name] = `Máximo: ${param.maxValue}`;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    if (onValidationChange) {
      onValidationChange(isValid);
    }
    return isValid;
  };

  const shouldShowParam = (param: any) => {
    if (!param.condition) return true;
    return config[param.condition.param] === param.condition.value;
  };

  return (
    <View style={styles.container}>
      {params.map(param => {
        if (!shouldShowParam(param)) return null;

        const hasError = !!errors[param.name];
        const currentValue = config[param.name];

        return (
          <View key={param.name} style={styles.paramRow}>
            <Text style={styles.paramLabel}>{param.label}</Text>
            <View style={styles.inputWrapper}>
              {param.type === 'select' && param.options ? (
                <View
                  style={[
                    styles.pickerContainer,
                    hasError && styles.pickerContainerError,
                  ]}
                >
                  <Picker
                    selectedValue={currentValue}
                    onValueChange={itemValue => onChange(param.name, itemValue)}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                    mode="dropdown"
                  >
                    {param.options.map(opt => (
                      <Picker.Item
                        key={opt.value.toString()}
                        label={opt.label}
                        value={opt.value}
                      />
                    ))}
                  </Picker>
                </View>
              ) : (
                <TextInput
                  style={[styles.input, hasError && styles.inputError]}
                  value={
                    currentValue !== undefined && currentValue !== null
                      ? String(currentValue)
                      : ''
                  }
                  placeholder={
                    param.defaultValue !== undefined &&
                    param.defaultValue !== null
                      ? String(param.defaultValue)
                      : ''
                  }
                  placeholderTextColor={COLORS.textSecondary}
                  onChangeText={text => {
                    if (text === '' && param.type === 'number') {
                      onChange(param.name, '');
                      return;
                    }
                    let processedValue;
                    if (param.type === 'number') {
                      const num = parseFloat(text);
                      processedValue = isNaN(num) ? text : num;
                    } else {
                      processedValue = text;
                    }
                    onChange(param.name, processedValue);
                  }}
                  keyboardType={param.type === 'number' ? 'numeric' : 'default'}
                  textAlign="center"
                />
              )}
              {hasError && (
                <Text style={styles.errorText}>{errors[param.name]}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  paramRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  paramLabel: {
    fontSize: 15,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 10,
  },
  inputWrapper: {
    flex: Platform.OS === 'ios' ? 0.6 : 0.5,
    minWidth: 100,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.inputBackground,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontSize: 15,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  inputError: {
    borderColor: COLORS.inputErrorBorder,
    backgroundColor: COLORS.inputErrorBackground,
  },
  errorText: {
    color: COLORS.errorText,
    fontSize: 12,
    marginTop: 5,
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    backgroundColor: COLORS.inputBackground,
    overflow: 'hidden',
  },
  pickerContainerError: {
    borderColor: COLORS.inputErrorBorder,
    backgroundColor: COLORS.inputErrorBackground,
  },
  picker: {
    height: Platform.OS === 'ios' ? 120 : 50,
    width: '100%',
    color: COLORS.textPrimary,
  },
  pickerItem: {
    height: 120,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
});
