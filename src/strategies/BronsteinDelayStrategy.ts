import { TimerStrategy, TimerConfigParam } from './TimerStrategy';
import { minutesToMs, secondsToMs } from '../utils/timeFormatter';

export class BronsteinDelayStrategy extends TimerStrategy {
  static readonly name = 'Atraso Bronstein';
  static readonly description =
    'Adiciona de volta o tempo usado para um movimento, até o atraso máximo';

  private moveStartTimes: number[] = [0, 0];
  private currentPlayer: number = 0;
  private delayMs: number;
  private isFirstUpdate: boolean[] = [true, true];

  constructor(initialTimeMin: number, delaySec: number) {
    super(minutesToMs(initialTimeMin));
    this.delayMs = secondsToMs(delaySec);
    this.reset();
  }

  setRemainingTime(playerId: number, timeMs: number): void {
    // Only track move start time for the active player
    if (playerId === this.currentPlayer && this.isFirstUpdate[playerId]) {
      // This is the first update for this player after a switch
      this.moveStartTimes[playerId] = timeMs;
      this.isFirstUpdate[playerId] = false;
    }

    // Always update the current time
    this.times[playerId][0] = timeMs;
  }

  switchPlayer(): void {
    // Calculate time spent on the move
    const previousPlayer = this.currentPlayer;
    const timeSpent =
      this.moveStartTimes[previousPlayer] - this.times[previousPlayer][0];

    // Add back delay (limited to actual time spent or max delay)
    if (timeSpent > 0) {
      const timeToAdd = Math.min(timeSpent, this.delayMs);
      this.times[previousPlayer][0] += timeToAdd;
    }

    // Switch to the next player
    this.currentPlayer = 1 - this.currentPlayer;

    // Reset the first update flag for the new current player
    this.isFirstUpdate[this.currentPlayer] = true;
  }

  reset(): void {
    this.times = [[this.initialTimeMs,false], [this.initialTimeMs,false]];
    this.moveStartTimes = [this.initialTimeMs, this.initialTimeMs];
    this.isFirstUpdate = [true, true];
    this.currentPlayer = 0;
  }

  getConfigParams(): TimerConfigParam[] {
    return [
      {
        name: 'initialTimeMin',
        type: 'number',
        label: 'Tempo inicial (min)',
        defaultValue: 5,
        minValue: 1,
        maxValue: 180,
      },
      {
        name: 'delaySec',
        type: 'number',
        label: 'Atraso (s)',
        defaultValue: 3,
        minValue: 0,
        maxValue: 60,
      },
    ];
  }
}
