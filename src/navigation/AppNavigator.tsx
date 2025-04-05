import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import MainMenuScreen from '../screens/MainMenuScreen';
import TimerSelectionScreen from '../screens/TimerSelectionScreen';
import GameScreen from '../screens/GameScreen';
import HelpScreen from '../screens/HelpScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainMenu">
        <Stack.Screen 
          name="MainMenu" 
          component={MainMenuScreen} 
          options={{ title: 'Chess Clock' }}
        />
        <Stack.Screen 
          name="TimerSelection" 
          component={TimerSelectionScreen} 
          options={{ title: 'Choose Timer' }}
        />
        <Stack.Screen 
          name="Game" 
          component={GameScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Help" 
          component={HelpScreen} 
          options={{ title: 'Help' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}