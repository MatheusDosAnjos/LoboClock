import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // https://withfra.me/react-native-vector-icons/directory
import { useRoute, useNavigation } from '@react-navigation/native';
import { GameController } from '../controllers/GameController';
import { formatTime } from '../utils/timeFormatter';

const { height, width } = Dimensions.get('window');

const COLORS = {
  background: '#f4f4f0', // Light beige background from LoboClock design
  playerClockBackground: '#ffffff', // White for player clock areas
  playerClockActiveBackground: '#e8f5e9', // Very light green for active player (subtle)
  textPrimary: '#212121', // Darker text for better contrast
  textSecondary: '#757575', // Lighter text for secondary info
  primaryAction: '#4CAF50', // Main green from LoboClock logo (e.g., Start/Pause)
  accentOrange: '#FFA500', // Orange as requested (e.g., Reset)
  accentPurple: '#8A2BE2', // Purple from LoboClock logo (e.g., Change Timer)
  controlsBackground: '#333333', // Dark background for controls
  controlButtonText: '#ffffff',
  activeIndicatorColor: '#4CAF50', // Green for the animated side indicator (now used for active clock border)
  borderColor: '#B0BEC5', // Light grey for INACTIVE borders (NEW - or use a more subtle color from palette)
  shadowColor: '#000000', // Black for shadows
  specialStatusTextPlayer1: '#FFA500', // Example: Orange for player 1 special status
  specialStatusTextPlayer2: '#8A2BE2', // Example: Purple for player 2 special status
};

const GameScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { strategyType, config } = route.params as {
    strategyType: any;
    config: any;
  };

  const [gameController] = useState(
    () => new GameController(strategyType, config),
  );
  const [times, setTimes] = useState<number[]>([0, 0]);
  const [moveCounts, setMoveCounts] = useState<number[]>([0, 0]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

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
      if (!gameStarted) setGameStarted(true);
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

  const getTimeTextStyle = (playerIndex: number) => ({
    ...styles.timeText,
    color:
      gameStarted && !isPaused && currentPlayer === playerIndex
        ? COLORS.textPrimary
        : COLORS.textSecondary,
  });

  const getPlayerLabelStyle = (playerIndex: number) => ({
    ...styles.playerLabel,
    color:
      gameStarted && !isPaused && currentPlayer === playerIndex
        ? COLORS.textPrimary
        : COLORS.textSecondary,
    fontWeight:
      gameStarted && !isPaused && currentPlayer === playerIndex
        ? 'bold'
        : '600',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        {/* Player 2 (Top - Index 1) */}
        <TouchableOpacity
          style={[
            styles.playerClock,
            currentPlayer === 1 &&
              !isPaused &&
              gameStarted &&
              styles.activeClock,
          ]}
          onPress={() => handlePlayerPress(1)}
          activeOpacity={0.85}
        >
          <View style={styles.playerInfoContainerRotated}>
            <Text style={getTimeTextStyle(1)}>{formatTime(times[1])}</Text>
            <Text style={getPlayerLabelStyle(1)}>Jogador 2</Text>
            <Text style={styles.moveCountText}>Jogadas: {moveCounts[1]}</Text>
            {renderSpecialStatus(1)}
          </View>
        </TouchableOpacity>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, styles.resetButton]}
            onPress={handleReset}
          >
            <MaterialCommunityIcons
              name="restart"
              size={width * 0.08}
              color={COLORS.controlButtonText}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.pausePlayButton,
              styles.pausePlayButtonContent,
            ]}
            onPress={handlePauseToggle}
          >
            <MaterialCommunityIcons
              name={isPaused ? 'play' : 'pause'}
              size={width * 0.08}
              color={COLORS.controlButtonText}
            />
            <Text style={styles.controlButtonText}>
              {isPaused ? (gameStarted ? 'Continuar' : 'Iniciar') : 'Pausar'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.changeTimerButton]}
            onPress={() => navigation.navigate('TimerSelection' as never)}
          >
            <MaterialCommunityIcons
              name="clock-edit-outline"
              size={width * 0.08}
              color={COLORS.controlButtonText}
            />
          </TouchableOpacity>
        </View>

        {/* Player 1 (Bottom - Index 0) */}
        <TouchableOpacity
          style={[
            styles.playerClock,
            currentPlayer === 0 &&
              !isPaused &&
              gameStarted &&
              styles.activeClock,
          ]}
          onPress={() => handlePlayerPress(0)}
          activeOpacity={0.85}
        >
          <View style={styles.playerInfoContainer}>
            <Text style={getTimeTextStyle(0)}>{formatTime(times[0])}</Text>
            <Text style={getPlayerLabelStyle(0)}>Jogador 1</Text>
            <Text style={styles.moveCountText}>Jogadas: {moveCounts[0]}</Text>
            {renderSpecialStatus(0)}
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  playerClock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.playerClockBackground,
    marginHorizontal: width * 0.05,
    marginVertical: width * 0.03,
    borderRadius: 20, // Softer corners
    padding: 20,
    borderWidth: 2, // Default border width for inactive clocks
    borderColor: COLORS.borderColor, // Default border color for inactive clocks
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  activeClock: {
    backgroundColor: COLORS.playerClockActiveBackground, // Subtle background change
    borderColor: COLORS.activeIndicatorColor, // Use the main green for active border
    borderWidth: 4, // Thicker border for active clock
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  playerInfoContainer: {
    alignItems: 'center',
  },
  playerInfoContainerRotated: {
    alignItems: 'center',
    transform: [{ rotate: '180deg' }],
  },
  // activeIndicator: { ... } // No longer needed
  timeText: {
    fontSize: width * 0.18, // Maintained original larger size
    fontWeight: 'bold',
    color: COLORS.textPrimary, // Using reverted color
    marginBottom: 3,
  },
  playerLabel: {
    fontSize: width * 0.05, // Adjusted for balance
    fontWeight: '600',
    color: COLORS.textSecondary, // Using reverted color
    marginTop: 5,
  },
  moveCountText: {
    fontSize: width * 0.04,
    color: COLORS.textSecondary, // Using reverted color
    marginTop: 5,
  },
  specialStatusTextPlayer1: {
    // Example style, customize as needed
    fontSize: width * 0.035,
    color: COLORS.specialStatusTextPlayer1,
    fontWeight: '500',
    marginTop: 6,
  },
  specialStatusTextPlayer2: {
    // Example style, customize as needed
    fontSize: width * 0.035,
    color: COLORS.specialStatusTextPlayer2,
    fontWeight: '500',
    marginTop: 6,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.controlsBackground, // Reverted color
    paddingVertical: 12, // Slightly reduced padding
    paddingHorizontal: 8,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 7,
  },
  controlButton: {
    flex: 1,
    marginHorizontal: width * 0.012, // Slightly reduced margin
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 15, // Standardized button radius
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 55, // Good touch target
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  pausePlayButton: {
    backgroundColor: COLORS.primaryAction, // Reverted: Pause/Play is Green
  },
  pausePlayButtonContent: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pausePlayIcon: {
    color: COLORS.controlButtonText,
    fontSize: width * 0.055, // Slightly larger icon
    fontWeight: 'bold',
    marginBottom: 1,
  },
  resetButton: {
    backgroundColor: COLORS.accentOrange, // Reverted: Reset is Orange
  },
  changeTimerButton: {
    backgroundColor: COLORS.accentPurple, // Reverted: Change Timer is Purple
  },
  controlButtonText: {
    color: COLORS.controlButtonText,
    fontSize: width * 0.032, // Slightly smaller for icon accommodation
    fontWeight: '600', // Consistent weight
    textAlign: 'center',
    marginTop: 2, // Space if icon is present
  },
});

export default GameScreen;
