import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

import { RootStackParamList } from '../navigation/AppNavigator';

type MainMenuNavigationProp = StackNavigationProp<RootStackParamList, 'MainMenu'>;

const MainMenuScreen = () => {
  const navigation = useNavigation<MainMenuNavigationProp>();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chess Clock</Text>
      <View style={styles.buttonContainer}>
        <Button 
          title="Play" 
          onPress={() => navigation.navigate('TimerSelection')} 
        />
        
        <Button 
          title="Help" 
          onPress={() => navigation.navigate('Help')} 
        />
        
        <Button 
          title="Settings" 
          onPress={() => navigation.navigate('Settings')} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '80%',
    height: 200,
    justifyContent: 'space-between',
  }
});

export default MainMenuScreen;