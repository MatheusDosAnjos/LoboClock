import { TimerStrategy, TimerConfigParam } from './TimerStrategy';
import { minutesToMs } from '../utils/timeFormatter';

export class HourglassStrategy extends TimerStrategy {
  static readonly name = 'Ampulheta';
  static readonly description =
    'Quando o relógio de um jogador está diminuindo, o relógio do outro jogador aumenta';

  private currentPlayer: number = 0;

  constructor(initialTimeMin: number) {
    super(minutesToMs(initialTimeMin));
  }

  setRemainingTime(playerId: number, timeMs: number): void {
    // Track how much time was reduced
    const timeDiff = this.times[playerId] - timeMs;

    if (timeDiff > 0 && playerId === this.currentPlayer) {
      // Decrease active player's time
      this.times[playerId] = timeMs;

      // Increase opponent's time by the same amount
      const opponentId = 1 - playerId;
      this.times[opponentId] += timeDiff;
    } else {
      // Direct set (for reset or initialization)
      this.times[playerId] = timeMs;
    }
  }

  switchPlayer(): void {
    this.currentPlayer = 1 - this.currentPlayer; // Toggle between 0 and 1
  }

  reset(): void {
    this.times = [this.initialTimeMs, this.initialTimeMs];
    this.currentPlayer = 0;
  }

  getConfigParams(): TimerConfigParam[] {
    return [
      {
        name: 'initialTimeMin',
        type: 'number',
        label: 'Tempo inicial (min)',
        defaultValue: 3,
        minValue: 1,
        maxValue: 30,
      },
    ];
  }
}
