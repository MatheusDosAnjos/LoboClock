import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TimerConfigParam, TimerStrategy } from '../strategies/TimerStrategy';

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
  }, [config]);

  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    params.forEach(param => {
      if (
        param.condition &&
        config[param.condition.param] !== param.condition.value
      ) {
        return;
      }

      const value = config[param.name];

      if (value === undefined || value === null || value === '') {
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
          newErrors[param.name] = `Valor mínimo é: ${param.minValue}`;
          isValid = false;
        } else if (param.maxValue !== undefined && numValue > param.maxValue) {
          newErrors[param.name] = `Valor máximo é: ${param.maxValue}`;
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

  const shouldShowParam = (param: TimerConfigParam) => {
    if (!param.condition) return true;

    return config[param.condition.param] === param.condition.value;
  };

  return (
    <View style={styles.container}>
      {params.map(param => {
        if (!shouldShowParam(param)) return null;

        const hasError = !!errors[param.name];

        return (
          <View key={param.name} style={styles.paramContainer}>
            <Text style={styles.paramLabel}>{param.label}</Text>

            <View style={styles.inputContainer}>
              {param.type === 'select' && param.options ? (
                <Picker
                  selectedValue={config[param.name]}
                  onValueChange={value => onChange(param.name, value)}
                  style={styles.picker}
                >
                  {param.options.map(opt => (
                    <Picker.Item
                      key={opt.value.toString()}
                      label={opt.label}
                      value={opt.value}
                    />
                  ))}
                </Picker>
              ) : (
                <TextInput
                  style={[styles.input, hasError && styles.inputError]}
                  value={
                    config[param.name] !== undefined &&
                    config[param.name] !== null
                      ? config[param.name].toString()
                      : ''
                  }
                  placeholder={param.defaultValue.toString()}
                  onChangeText={text => {
                    if (text === '') {
                      onChange(param.name, '');
                      return;
                    }
                    let value;
                    if (param.type === 'number') {
                      value = isNaN(parseInt(text, 10))
                        ? text
                        : parseInt(text, 10);
                    } else {
                      value = text;
                    }

                    onChange(param.name, value);
                  }}
                  keyboardType={param.type === 'number' ? 'numeric' : 'default'}
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
    marginBottom: 15,
  },
  paramContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  paramLabel: {
    fontSize: 16,
    flex: 1,
    paddingTop: 10,
  },
  inputContainer: {
    width: 120,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ff3b30',
    backgroundColor: '#fff8f8',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
  },
  picker: {
    height: Platform.select({ ios: 200, android: 50 }),
    width: '100%',
  },
});
