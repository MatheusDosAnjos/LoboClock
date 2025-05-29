import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, NavigationProp } from '@react-navigation/native';
import { GameController } from '../controllers/GameController';
import { formatTime } from '../utils/timeFormatter';
import { TimerType } from '../factories/TimerStrategyFactory';

const { height } = Dimensions.get('window');

const GameScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp<Record<string, undefined>>>();
  const { strategyType, config, playerNames } = route.params as {
    strategyType?: TimerType;
    config?: any;
    playerNames?: [string, string];
  };

  const [gameController] = useState(() => new GameController(strategyType as TimerType, config));
  const [times, setTimes] = useState<[number, boolean][]>([[0, false],[0, false]]);
  const [moveCounts, setMoveCounts] = useState<number[]>([0, 0]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [animValue] = useState(new Animated.Value(0));
  const [loserIndex, setLoserIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [byoYomiStatus, setByoYomiStatus] = useState([
    { inByoYomi: false, periodsRemaining: 0 },
    { inByoYomi: false, periodsRemaining: 0 },
  ]);
  const [canadianStatus, setCanadianStatus] = useState([
    { inOvertime: false, movesMade: 0, movesRequired: 0 },
    { inOvertime: false, movesMade: 0, movesRequired: 0 },
  ]);

  const playerLabels = playerNames ?? ['Jogador 1', 'Jogador 2'];

  // Initialize timers and listeners
  useEffect(() => {
    setTimes([
      gameController.getCurrentStrategy().getRemainingTime(0),
      gameController.getCurrentStrategy().getRemainingTime(1),
    ]);
    setMoveCounts(gameController.getMoveCount());

    gameController.onTimeUpdate(newTimes => setTimes(newTimes));
    gameController.onMoveCountUpdate(newMoves => setMoveCounts(newMoves));

    gameController.onGameOver(() => {
      // Pegue os tempos mais recentes diretamente do controller
      const updatedTimes = [
        gameController.getCurrentStrategy().getRemainingTime(0),
        gameController.getCurrentStrategy().getRemainingTime(1),
      ];
      let loser = null;

      if (gameController.getCurrentStrategy().isGameOver()) {
        // Verifica qual jogador perdeu pelo tempo
        if (updatedTimes[0][0] <= 0) loser = 0;
        else if (updatedTimes[1][0] <= 0) loser = 1;
      }
      setLoserIndex(loser);
    });

    return () => gameController.pause();
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const updateSpecialStatuses = () => {
    const strategy = gameController.getCurrentStrategy();

    if (strategy.constructor.name === 'ByoYomiStrategy') {
      const byoYomiStrategy = strategy as any;
      if (byoYomiStrategy.getByoYomiStatus) {
        setByoYomiStatus([
          byoYomiStrategy.getByoYomiStatus(0),
          byoYomiStrategy.getByoYomiStatus(1),
        ]);
      }
    }

    if (strategy.constructor.name === 'CanadianOvertimeStrategy') {
      const canadianStrategy = strategy as any;
      if (canadianStrategy.getOvertimeStatus) {
        setCanadianStatus([
          canadianStrategy.getOvertimeStatus(0),
          canadianStrategy.getOvertimeStatus(1),
        ]);
      }
    }
  };

  // Animate the active indicator
  useEffect(() => {
    Animated.timing(animValue, {
      toValue: currentPlayer,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentPlayer]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        handlePlayerPress(currentPlayer);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, currentPlayer, gameStarted]); // Dependências corretas

  const handlePlayerPress = (player: number) => {
    console.log(loserIndex)
    if (loserIndex !== null) return; // Não faz nada se o jogo já acabou

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
    updateSpecialStatuses();
    setCurrentPlayer(0);
    setIsPaused(true);
    setGameStarted(false);
    setLoserIndex(null); // Limpa o destaque vermelho ao resetar
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const renderSpecialStatus = (player: number) => {
    const strategy = gameController.getCurrentStrategy();

    // First check for custom render function in strategy
    if (typeof (strategy as any).renderStatus === 'function') {
      return (strategy as any).renderStatus(player);
    }

    // Fallback to specific strategy rendering
    if (strategy.constructor.name === 'ByoYomiStrategy') {
      const status = byoYomiStatus[player];
      if (status.inByoYomi) {
        return (
          <Text style={styles.statusText}>
            Byo-Yomi: {status.periodsRemaining} período{status.periodsRemaining !== 1 ? 's' : ''} restante{status.periodsRemaining !== 1 ? 's' : ''}
          </Text>
        );
      }
    }

    if (strategy.constructor.name === 'CanadianOvertimeStrategy') {
      const status = canadianStatus[player];
      if (status.inOvertime) {
        return (
          <Text style={styles.statusText}>
            Jogadas: {status.movesMade}/{status.movesRequired}
          </Text>
        );
      }
    }
    return null;
  };

  const activeIndicator = gameStarted && Platform.OS !== 'web' && (
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

  const renderPlayerClock = (player: number) => {
    const isCurrent = currentPlayer === player && !isPaused;
    const isPlayer2 = player === 1;
    const isCreasing = times[player][1];
    const isLoser = loserIndex === player;

    return (
      <TouchableOpacity
        style={[
          styles.playerClock,
          isPlayer2 ? styles.player2Clock : styles.player1Clock,
          isCurrent && styles.activeClock,
          isLoser && styles.loserClock, // Adiciona o fundo vermelho se for o perdedor
        ]}
        onPress={() => handlePlayerPress(player)}
        activeOpacity={0.8}
        disabled={loserIndex!==null} // Opcional: desabilita clique após o fim do jogo
      >
        <View
          style={[
            styles.playerInfoContainer,
            Platform.OS !== 'web' && isPlayer2 && { transform: [{ rotate: '180deg' }] },
          ]}
        >
          <Text style={styles.timeText}>{formatTime(times[player][0], isCreasing)}</Text>
          <Text style={styles.playerLabel}>Player {player + 1}</Text>
          <Text style={styles.moveCountText}>Moves: {moveCounts[player]}</Text>
          {renderSpecialStatus(player)}
        </View>
      </TouchableOpacity>
    );  
  };

  const renderControls = () => (
    <View style={Platform.OS === 'web' ? styles.webControls : styles.mobileControls}>
      <TouchableOpacity style={styles.controlButton} onPress={handlePauseToggle}>
        <Text style={styles.controlText}>{isPaused ? 'Start' : 'Pause'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.controlButton} onPress={handleReset}>
        <Text style={styles.controlText}>Reset</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.controlButton} onPress={() => navigation.navigate('TimerSelection')}>
        <Text style={styles.controlText}>Change Timer</Text>
      </TouchableOpacity>
    </View>
  );

  const fullscreenButton = Platform.OS === 'web' && (
    <TouchableOpacity 
      style={styles.fullscreenButton}
      onPress={toggleFullscreen}
    >
      <Text style={styles.fullscreenIcon}>
        {isFullscreen ? '⊝' : '⤢'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {activeIndicator}
      <View
        style={[
          styles.clockContainer,
          Platform.OS === 'web' ? styles.webClockContainer : styles.mobileClockContainer,
        ]}
      >
        {Platform.OS === 'web' ? (
          <>
            {renderPlayerClock(0)}
            {renderControls()}
            {renderPlayerClock(1)}
          </>
        ) : (
          <>
            {renderPlayerClock(1)}
            <View style={styles.mobileControls}>
              <TouchableOpacity style={styles.controlButton} onPress={handlePauseToggle}>
                <Text style={styles.controlText}>{isPaused ? 'Iniciar' : 'Pausar'}</Text>
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
            {renderPlayerClock(0)}
          </>
        )}
      </View>
      {fullscreenButton}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  clockContainer: {
    flex: 1,
  },
  mobileClockContainer: {
    flexDirection: 'column',
  },
  webClockContainer: {
    flexDirection: 'row',
  },
  playerClock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    minHeight: height / 2,
  },
  player1Clock: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  player2Clock: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
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
    fontSize: 272,
    fontWeight: 'bold',
    color: '#333',
  },
  playerLabel: {
    fontSize: 68,
    fontWeight: '600',
    color: '#555',
  },
  moveCountText: {
    fontSize: 54,
    marginTop: 5,
    color: '#777',
  },
  mobileControls: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  webControls: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#333',
    height: '100%'
  },
  controlButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: '#007bff', // Blue buttons
    borderRadius: 8, // More rounded corners
    marginVertical: Platform.OS === 'web' ? 15 : 0, // More vertical margin for web
    marginHorizontal: Platform.OS === 'web' ? 0 : 5, // Horizontal margin for mobile
    minWidth: Platform.OS === 'web' ? 150 : 'auto', // Ensure web buttons have good width
    alignItems: 'center', // Center text in button
  },
  controlText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '500',
  },
  statusText: {
    marginTop: 5,
    fontSize: 14,
    color: '#333',
  },
  loserClock: {
    backgroundColor: '#ff2400',
  },
  fullscreenButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  fullscreenIcon: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default GameScreen;
