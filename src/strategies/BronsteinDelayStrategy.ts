import { TimerStrategy, TimerConfigParam } from './TimerStrategy';

export class BronsteinDelayStrategy implements TimerStrategy {
  static readonly name = 'Bronstein Delay';
  static readonly description = 'Adds back the time used for a move, up to the maximum delay';

  private times: number[] = [0, 0]; // Player 1 and 2 remaining time (ms)
  private moveStartTimes: number[] = [0, 0]; // Time at start of player's move
  private currentPlayer: number = 0;
  initialTimeMs: number;
  private delayMs: number;
  private isFirstUpdate: boolean[] = [true, true]; // Track first update for each player

  constructor(initialTimeMinutes: number = 5, delaySeconds: number = 3) {
    this.initialTimeMs = initialTimeMinutes * 60 * 1000;
    this.delayMs = delaySeconds * 1000;
    this.reset();
  }

  getRemainingTime(playerId: number): number {
    return this.times[playerId];
  }

  setRemainingTime(playerId: number, timeMs: number): void {
    // Only track move start time for the active player
    if (playerId === this.currentPlayer && this.isFirstUpdate[playerId]) {
      // This is the first update for this player after a switch
      this.moveStartTimes[playerId] = timeMs;
      this.isFirstUpdate[playerId] = false;
    }

    // Always update the current time
    this.times[playerId] = timeMs;
  }

  switchPlayer(): void {
    // Calculate time spent on the move
    const previousPlayer = this.currentPlayer;
    const timeSpent =
      this.moveStartTimes[previousPlayer] - this.times[previousPlayer];

    // Add back delay (limited to actual time spent or max delay)
    if (timeSpent > 0) {
      const timeToAdd = Math.min(timeSpent, this.delayMs);
      this.times[previousPlayer] += timeToAdd;
    }

    // Switch to the next player
    this.currentPlayer = 1 - this.currentPlayer;

    // Reset the first update flag for the new current player
    this.isFirstUpdate[this.currentPlayer] = true;
  }

  isGameOver(): boolean {
    return this.times[0] <= 0 || this.times[1] <= 0;
  }

  reset(): void {
    this.times = [this.initialTimeMs, this.initialTimeMs];
    this.moveStartTimes = [this.initialTimeMs, this.initialTimeMs];
    this.isFirstUpdate = [true, true];
    this.currentPlayer = 0;
  }

  getConfigParams(): TimerConfigParam[] {
    return [
      {
        name: 'initialTimeMinutes',
        type: 'number',
        label: 'Initial Time (minutes)',
        defaultValue: 5,
        minValue: 1,
        maxValue: 180,
      },
      {
        name: 'delaySeconds',
        type: 'number',
        label: 'Delay (seconds)',
        defaultValue: 3,
        minValue: 0,
        maxValue: 60,
      },
    ];
  }
}
