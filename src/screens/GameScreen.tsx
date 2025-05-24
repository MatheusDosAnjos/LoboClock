import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { GameController } from '../controllers/GameController';
import { formatTime } from '../utils/timeFormatter';

const { height } = Dimensions.get('window');

const GameScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { strategyType, config } = route.params;

  const [gameController] = useState(
    () => new GameController(strategyType, config),
  );
  const [times, setTimes] = useState<number[]>([0, 0]);
  const [moveCounts, setMoveCounts] = useState<number[]>([0, 0]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [animValue] = useState(new Animated.Value(0));

  // Initialize timers and listeners
  useEffect(() => {
    const initialTimes = [
      gameController.getCurrentStrategy().getRemainingTime(0),
      gameController.getCurrentStrategy().getRemainingTime(1),
    ];
    setTimes(initialTimes);
    setMoveCounts(gameController.getMoveCount());

    gameController.onTimeUpdate(newTimes => setTimes(newTimes));
    gameController.onMoveCountUpdate(newMoves => setMoveCounts(newMoves));

    gameController.onGameOver(() => {
      const winner = times[0] <= 0 ? 'Jogador 2' : 'Jogador 1';

      Alert.alert('Fim de jogo', `Vencedor: ${winner}`, [
        { text: 'Novo jogo', onPress: handleReset },
        {
          text: 'Menu principal',
          onPress: () => navigation.navigate('MainMenu'),
        },
      ]);
    });

    return () => gameController.pause();
  }, []);

  // Animate the active indicator
  useEffect(() => {
    Animated.timing(animValue, {
      toValue: currentPlayer,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentPlayer]);

  const handlePlayerPress = (player: number) => {
    if (!gameStarted) {
      gameController.start();
      setIsPaused(false);
      setGameStarted(true);
      return;
    }

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
      setIsPaused(false);
      if (!gameStarted) {
        setGameStarted(true); // Ensure gameStarted is set when first starting
      }
    } else {
      gameController.pause();
      setIsPaused(true);
    }
  };

  const handleReset = () => {
    gameController.reset();
    setTimes([
      gameController.getCurrentStrategy().getRemainingTime(0),
      gameController.getCurrentStrategy().getRemainingTime(1),
    ]);
    setMoveCounts(gameController.getMoveCount());

    setCurrentPlayer(0);
    setIsPaused(true);
    setGameStarted(false);
  };

  const renderSpecialStatus = (player: number) => {
    const strategy = gameController.getCurrentStrategy();
    if (typeof strategy.renderStatus === 'function') {
      return strategy.renderStatus(player);
    }
    return null;
  };

  const activeIndicator = gameStarted && (
    <Animated.View
      style={[
        styles.activeIndicator,
        {
          top: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [height / 2, 0],
          }),
        },
      ]}
    />
  );

  return (
    <View style={styles.container}>
      {activeIndicator}

      {/* Player 2 (Top) */}
      <TouchableOpacity
        style={[
          styles.playerClock,
          styles.player2Clock,
          currentPlayer === 1 && !isPaused && styles.activeClock,
        ]}
        onPress={() => handlePlayerPress(1)}
        activeOpacity={0.8}
      >
        <View style={styles.playerInfoContainer}>
          <Text style={styles.timeText}>{formatTime(times[1])}</Text>
          <Text style={styles.playerLabel}>Jogador 2</Text>
          <Text style={styles.moveCountText}>Jogadas: {moveCounts[1]}</Text>
          {renderSpecialStatus(1)}
        </View>
      </TouchableOpacity>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handlePauseToggle}
        >
          <Text style={styles.controlText}>
            {isPaused ? 'Iniciar' : 'Pausar'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={handleReset}>
          <Text style={styles.controlText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => navigation.navigate('TimerSelection')}
        >
          <Text style={styles.controlText}>Trocar timer</Text>
        </TouchableOpacity>
      </View>

      {/* Player 1 (Bottom) */}
      <TouchableOpacity
        style={[
          styles.playerClock,
          styles.player1Clock,
          currentPlayer === 0 && !isPaused && styles.activeClock,
        ]}
        onPress={() => handlePlayerPress(0)}
        activeOpacity={0.8}
      >
        <View style={styles.playerInfoContainer}>
          <Text style={styles.timeText}>{formatTime(times[0])}</Text>
          <Text style={styles.playerLabel}>Jogador 1</Text>
          <Text style={styles.moveCountText}>Jogadas: {moveCounts[0]}</Text>
          {renderSpecialStatus(0)}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  playerClock: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  player1Clock: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  player2Clock: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    transform: [{ rotate: '180deg' }],
  },
  activeClock: {
    backgroundColor: '#e6f2ff',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    width: 8,
    height: height / 2,
    backgroundColor: '#2196F3',
    zIndex: 10,
  },
  playerInfoContainer: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#333',
  },
  playerLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
  },
  moveCountText: {
    fontSize: 14,
    marginTop: 5,
    color: '#777',
  },
  controls: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  controlButton: {
    padding: 10,
    backgroundColor: '#555',
    borderRadius: 4,
  },
  controlText: {
    color: '#fff',
    fontSize: 16,
  },
  statusContainer: {
    marginTop: 10,
    padding: 5,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
  },
});

export default GameScreen;
