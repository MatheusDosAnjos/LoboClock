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
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { GameController } from '../controllers/GameController';
import { formatTime } from '../utils/timeFormatter';

const { height, width } = Dimensions.get('window');

const COLORS = {
  background: '#f4f4f0',
  playerClockBackground: '#ffffff',
  playerClockActiveBackground: '#e8f5e9',
  textPrimary: '#212121',
  textSecondary: '#757575',
  primaryAction: '#4CAF50',
  accentOrange: '#FFA500',
  accentPurple: '#8A2BE2',
  controlsBackground: '#333333',
  controlButtonText: '#ffffff',
  activeIndicatorColor: '#4CAF50',
  borderColor: '#B0BEC5',
  shadowColor: '#000000',
  pausedPromptBackground: 'rgba(0, 0, 0, 0.35)',
  pausedPromptText: '#FFFFFF',
  startPromptPlayer2Bg: `${'#FFA500'}B3`,
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

    gameController.onGameOver((winner: number) => {
      const winnerText = winner === 0 ? 'Jogador 1' : 'Jogador 2';

      Alert.alert('Fim de jogo', `Vencedor: ${winnerText}`, [
        { text: 'Novo jogo', onPress: handleReset },
        {
          text: 'Menu principal',
          onPress: () => navigation.navigate('MainMenu'),
        },
      ]);
    });

    return () => gameController.pause();
  }, []);

  const handlePlayerPress = (playerTapped: number) => {
    if (!gameStarted) {
      // Only Player 2 (index 1) can initiate the game.
      if (playerTapped === 1) {
        gameController.start();
        setIsPaused(false);
        setGameStarted(true);
      }
      return;
    }

    if (isPaused) {
      // If paused, the *opposing* player needs to tap to start/resume the current player's turn.
      if (playerTapped !== currentPlayer) {
        gameController.start();
        setIsPaused(false);
      }
      return;
    }

    if (playerTapped === currentPlayer) {
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
    if (!gameStarted) return;

    gameController.pause();
    setIsPaused(true);

    Alert.alert(
      'Reiniciar',
      'Tem certeza que deseja reiniciar? O jogo atual será perdido.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar',
          style: 'destructive',
          onPress: () => {
            gameController.reset();
            setTimes([
              gameController.getCurrentStrategy().getRemainingTime(0),
              gameController.getCurrentStrategy().getRemainingTime(1),
            ]);
            setMoveCounts(gameController.getMoveCount());

            setCurrentPlayer(0);
            setIsPaused(true);
            setGameStarted(false);
          },
        },
      ],
    );
  };

  const handleChangeTimer = () => {
    gameController.pause();
    setIsPaused(true);

    Alert.alert(
      'Trocar relógio',
      'Tem certeza que deseja mudar o tipo de relógio? O jogo atual será perdido.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Trocar relógio',
          style: 'destructive',
          onPress: () => navigation.navigate('TimerSelection' as never),
        },
      ],
    );
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
      isPaused && gameStarted
        ? COLORS.textSecondary
        : gameStarted && !isPaused && currentPlayer === playerIndex
          ? COLORS.textPrimary
          : COLORS.textSecondary,
  });

  const getPlayerLabelStyle = (playerIndex: number) => ({
    ...styles.playerLabel,
    color:
      isPaused && gameStarted
        ? COLORS.textSecondary
        : gameStarted && !isPaused && currentPlayer === playerIndex
          ? COLORS.textPrimary
          : COLORS.textSecondary,
    fontWeight: gameStarted && currentPlayer === playerIndex ? 'bold' : '600',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        {/* Player 2 (Top - Index 1) */}
        <TouchableOpacity
          style={[
            styles.playerClock,
            gameStarted && currentPlayer === 1 && styles.activeClock,
          ]}
          onPress={() => handlePlayerPress(1)}
          activeOpacity={0.85}
        >
          {!gameStarted && (
            <View style={styles.startPromptPlayer2Container}>
              <MaterialCommunityIcons
                name="gesture-tap"
                size={width * 0.08}
                color={COLORS.controlButtonText}
              />
              <Text style={styles.startPromptPlayer2Text}>
                Toque para iniciar
              </Text>
            </View>
          )}
          {gameStarted && isPaused && currentPlayer === 0 && (
            <View
              style={[
                styles.pausedPromptContainer,
                styles.pausedPromptPlayer2Transform,
              ]}
            >
              <MaterialCommunityIcons
                name="gesture-tap"
                size={width * 0.08}
                color={COLORS.pausedPromptText}
              />
              <Text style={styles.pausedPromptText}>
                Toque para vez do Jogador 1
              </Text>
            </View>
          )}
          <View style={styles.playerInfoContainerRotated}>
            <Text style={getTimeTextStyle(1)}>{formatTime(times[1])}</Text>
            <View style={styles.playerDetails}>
              <Text style={getPlayerLabelStyle(1)}>Jogador 2</Text>
              <Text style={styles.moveCountText}>Jogadas: {moveCounts[1]}</Text>
            </View>
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
            style={[styles.controlButton, styles.pausePlayButton]}
            onPress={handlePauseToggle}
          >
            <MaterialCommunityIcons
              name={isPaused ? 'play' : 'pause'}
              size={width * 0.09}
              color={COLORS.controlButtonText}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.changeTimerButton]}
            onPress={handleChangeTimer}
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
            gameStarted && currentPlayer === 0 && styles.activeClock,
          ]}
          onPress={() => handlePlayerPress(0)}
          activeOpacity={0.85}
        >
          {gameStarted &&
            isPaused &&
            currentPlayer === 1 && ( // P2's turn is paused, P1 needs to tap
              <View style={styles.pausedPromptContainer}>
                <MaterialCommunityIcons
                  name="gesture-tap"
                  size={width * 0.08}
                  color={COLORS.pausedPromptText}
                />
                <Text style={styles.pausedPromptText}>
                  Toque para vez do Jogador 2
                </Text>
              </View>
            )}
          <View style={styles.playerInfoContainer}>
            <Text style={getTimeTextStyle(0)}>{formatTime(times[0])}</Text>
            <View style={styles.playerDetails}>
              <Text style={getPlayerLabelStyle(0)}>Jogador 1</Text>
              <Text style={styles.moveCountText}>Jogadas: {moveCounts[0]}</Text>
            </View>
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
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.borderColor,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    overflow: 'hidden',
  },
  activeClock: {
    backgroundColor: COLORS.playerClockActiveBackground,
    borderColor: COLORS.activeIndicatorColor,
    borderWidth: 4,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  playerInfoContainer: {
    alignItems: 'center',
    position: 'relative',
    flex: 1,
    justifyContent: 'center',
  },
  playerInfoContainerRotated: {
    alignItems: 'center',
    transform: [{ rotate: '180deg' }],
    position: 'relative',
    flex: 1,
    justifyContent: 'center',
  },
  timeText: {
    fontSize: width * 0.18,
    fontWeight: 'bold',
  },
  playerDetails: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  playerLabel: {
    fontSize: width * 0.05,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  moveCountText: {
    fontSize: width * 0.04,
    color: COLORS.textSecondary,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.controlsBackground,
    paddingVertical: 10,
    paddingHorizontal: 8,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 7,
  },
  controlButton: {
    flex: 1,
    marginHorizontal: width * 0.012,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.06,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  pausePlayButton: {
    backgroundColor: COLORS.primaryAction,
  },
  resetButton: {
    backgroundColor: COLORS.accentOrange,
  },
  changeTimerButton: {
    backgroundColor: COLORS.accentPurple,
  },
  controlButtonText: {
    color: COLORS.controlButtonText,
    fontSize: width * 0.032,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  startPromptPlayer2Container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.startPromptPlayer2Bg,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    padding: 10,
    zIndex: 10,
    transform: [{ rotate: '180deg' }],
  },
  startPromptPlayer2Text: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: COLORS.controlButtonText,
    marginTop: 8,
    textAlign: 'center',
  },
  pausedPromptContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.pausedPromptBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    padding: 10,
    zIndex: 11,
  },
  pausedPromptText: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: COLORS.pausedPromptText,
    marginTop: 8,
    textAlign: 'center',
  },
  pausedPromptPlayer2Transform: {
    transform: [{ rotate: '180deg' }],
  },
});

export default GameScreen;
