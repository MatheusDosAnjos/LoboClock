import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import MainMenuScreen from '../screens/MainMenuScreen';
import TimerSelectionScreen from '../screens/TimerSelectionScreen';
import GameScreen from '../screens/GameScreen';
import AboutScreen from '../screens/AboutScreen';
import HelpScreen from '../screens/HelpScreen';

export type RootStackParamList = {
  MainMenu: undefined;
  TimerSelection: undefined;
  Game: undefined;
  About: undefined;
  Help: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainMenu">
        <Stack.Screen
          name="MainMenu"
          component={MainMenuScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TimerSelection"
          component={TimerSelectionScreen}
          options={{ title: 'Seleção de relógio' }}
        />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{ title: 'Sobre' }}
        />
        <Stack.Screen
          name="Help"
          component={HelpScreen}
          options={{ title: 'Ajuda' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
