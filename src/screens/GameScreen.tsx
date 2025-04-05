import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { GameController } from '../controllers/GameController';
import { formatTime } from '../utils/timeFormatter';

const GameScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { strategyType, config } = route.params;
  
  const [gameController] = useState(() => new GameController(strategyType, config));
  const [times, setTimes] = useState<number[]>([0, 0]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  
  useEffect(() => {
    // Get initial times from the game controller
    const initialTimes = [
      gameController.getCurrentStrategy().getRemainingTime(0),
      gameController.getCurrentStrategy().getRemainingTime(1)
    ];

    setTimes(initialTimes);
    
    gameController.onTimeUpdate((newTimes) => {
      setTimes(newTimes);
    });
    
    gameController.onGameOver(() => {
      const winner = times[0] <= 0 ? 'Player 2' : 'Player 1';
      Alert.alert(
        'Game Over',
        `${winner} wins!`,
        [
          { text: 'New Game', onPress: handleReset },
          { text: 'Main Menu', onPress: () => navigation.navigate('MainMenu') }
        ]
      );
    });
    
    return () => {
      gameController.pause();
    };
  }, []);
  
  const handlePlayerPress = (player: number) => {
    if (isPaused) {
      gameController.start();
      setIsPaused(false);
      return;
    }
    
    if (player === currentPlayer) {
      gameController.switchPlayer();
      setCurrentPlayer(1 - currentPlayer);
    }
  };
  
  const handlePauseToggle = () => {
    if (isPaused) {
      gameController.start();
    } else {
      gameController.pause();
    }
    setIsPaused(!isPaused);
  };
  
  const handleReset = () => {
    gameController.reset();
    setCurrentPlayer(0);
    setIsPaused(true);
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.playerClock, 
          styles.player2Clock,
          currentPlayer === 1 && !isPaused && styles.activeClock
        ]}
        onPress={() => handlePlayerPress(1)}
        activeOpacity={0.8}
      >
        <Text style={styles.timeText}>{formatTime(times[1])}</Text>
        <Text style={styles.playerLabel}>Player 2</Text>
      </TouchableOpacity>
      
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={handlePauseToggle}>
          <Text style={styles.controlText}>
            {isPaused ? 'Start' : 'Pause'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={handleReset}>
          <Text style={styles.controlText}>Reset</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={() => navigation.navigate('TimerSelection')}
        >
          <Text style={styles.controlText}>Change Timer</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.playerClock, 
          styles.player1Clock,
          currentPlayer === 0 && !isPaused && styles.activeClock
        ]}
        onPress={() => handlePlayerPress(0)}
        activeOpacity={0.8}
      >
        <Text style={styles.playerLabel}>Player 1</Text>
        <Text style={styles.timeText}>{formatTime(times[0])}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  playerClock: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  player2Clock: {
    transform: [{ rotate: '180deg' }],
  },
  player1Clock: {
  },
  activeClock: {
    backgroundColor: '#d4edda',
  },
  timeText: {
    fontSize: 60,
    fontWeight: 'bold',
  },
  playerLabel: {
    fontSize: 20,
    marginTop: 10,
  },
  controls: {
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  controlButton: {
    padding: 10,
  },
  controlText: {
    color: 'white',
    fontSize: 16,
  }
});

export default GameScreen;