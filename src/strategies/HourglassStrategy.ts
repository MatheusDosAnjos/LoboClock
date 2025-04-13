import { TimerStrategy, TimerConfigParam } from './TimerStrategy';

export class HourglassStrategy implements TimerStrategy {
  static readonly name = 'Hourglass';
  static readonly description =
    "When one player's clock is running, the other player's clock increases";

  private times: number[] = [0, 0]; // Player 1 and 2 remaining time (ms)
  private currentPlayer: number = 0;
  initialTimeMs: number;
  private lastUpdateTime: number = 0;

  constructor(initialTimeMinutes: number = 3) {
    this.initialTimeMs = initialTimeMinutes * 60 * 1000;
    this.reset();
  }

  getRemainingTime(playerId: number): number {
    return this.times[playerId];
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

  isGameOver(): boolean {
    return this.times[0] <= 0 || this.times[1] <= 0;
  }

  reset(): void {
    this.times = [this.initialTimeMs, this.initialTimeMs];
    this.currentPlayer = 0;
  }

  getConfigParams(): TimerConfigParam[] {
    return [
      {
        name: 'initialTimeMinutes',
        type: 'number',
        label: 'Initial Time (minutes)',
        defaultValue: 3,
        minValue: 1,
        maxValue: 30,
      },
    ];
  }
}
