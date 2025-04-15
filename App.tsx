import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Permitir scroll no body
      const resetStyle = document.getElementById('expo-reset');
      if (resetStyle) {
        const updatedCSS = resetStyle.innerHTML.replace(
          /body\s*{\s*overflow:\s*hidden;/,
          'body { overflow: auto;'
        );
        resetStyle.innerHTML = updatedCSS;
      }
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
