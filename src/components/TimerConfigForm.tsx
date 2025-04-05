import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { TimerStrategy } from '../strategies/TimerStrategy';

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
  onValidationChange
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
      const value = config[param.name];
      
      if (value === undefined || value === null || value === '') {
        newErrors[param.name] = `${param.label} is required`;
        isValid = false;
        return;
      }
      
      if (param.type === 'number') {
        const numValue = Number(value);
        
        if (isNaN(numValue)) {
          newErrors[param.name] = `${param.label} must be a valid number`;
          isValid = false;
        } else if (param.minValue !== undefined && numValue < param.minValue) {
          newErrors[param.name] = `Minimum value is ${param.minValue}`;
          isValid = false;
        } else if (param.maxValue !== undefined && numValue > param.maxValue) {
          newErrors[param.name] = `Maximum value is ${param.maxValue}`;
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
  
  return (
    <View style={styles.container}>
      {params.map((param) => {
        const hasError = !!errors[param.name];
        
        return (
          <View key={param.name} style={styles.paramContainer}>
            <Text style={styles.paramLabel}>{param.label}</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  hasError && styles.inputError
                ]}
                value={
                  config[param.name] !== undefined && config[param.name] !== null
                    ? config[param.name].toString()
                    : ''
                }
                placeholder={param.defaultValue.toString()}
                onChangeText={(text) => {
                  // Allow empty text for editing
                  if (text === '') {
                    onChange(param.name, '');
                    return;
                  }
                  
                  // Convert to appropriate type
                  let value;
                  if (param.type === 'number') {
                    // Parse number but don't convert to default if invalid
                    value = isNaN(parseInt(text, 10)) ? text : parseInt(text, 10);
                  } else {
                    value = text;
                  }
                  
                  onChange(param.name, value);
                }}
                keyboardType={param.type === 'number' ? 'numeric' : 'default'}
              />
              
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
  }
});