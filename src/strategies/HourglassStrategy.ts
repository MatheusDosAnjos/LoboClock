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
    const timeDiff = this.times[playerId][0] - timeMs;

    if (timeDiff > 0 && playerId === this.currentPlayer) {
      // Decrease active player's time
      this.times[playerId][0] = timeMs;
      this.times[playerId][1] = false; // Set creasing flag

      // Increase opponent's time by the same amount
      const opponentId = 1 - playerId;
      this.times[opponentId][0] += timeDiff;
      this.times[opponentId][1] = true;

      console.log("jogador", playerId, "reduziu para", timeMs, "ms, jogador", opponentId, "aumentou para", this.times[opponentId], "ms");
    } else {
      // Direct set (for reset or initialization)
      this.times[playerId][0] = timeMs;
    }
  }

  switchPlayer(): void {
    this.currentPlayer = 1 - this.currentPlayer; // Toggle between 0 and 1
  }

  reset(): void {
    this.times = [[this.initialTimeMs, false], [this.initialTimeMs, false]];
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
