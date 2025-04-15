import { TimerStrategy, TimerConfigParam } from './TimerStrategy';

export class CanadianOvertimeStrategy implements TimerStrategy {
  static readonly name = 'Canadian Overtime';
  static readonly description =
    'After main time, complete a specified number of moves within an overtime period';

  private mainTimes: number[] = [0, 0]; // Main time bank for each player
  private overtimeTimes: number[] = [0, 0]; // Overtime time remaining
  private inOvertime: boolean[] = [false, false]; // Whether each player is in overtime
  private movesMade: number[] = [0, 0]; // Moves made in current overtime period
  private justEnteredOvertime: boolean[] = [false, false]; // Track if player just entered overtime

  private currentPlayer: number = 0;
  initialTimeMs: number;
  private overtimeMs: number;
  private movesRequired: number;

  constructor(
    initialTimeMinutes: number,
    overtimeMinutes: number,
    movesRequired: number,
  ) {
    this.initialTimeMs = initialTimeMinutes * 60 * 1000;
    this.overtimeMs = overtimeMinutes * 60 * 1000;
    this.movesRequired = movesRequired;
    this.reset();
  }

  getRemainingTime(playerId: number): number {
    // Return overtime time if in overtime, otherwise main time
    return this.inOvertime[playerId]
      ? this.overtimeTimes[playerId]
      : this.mainTimes[playerId];
  }

  setRemainingTime(playerId: number, timeMs: number): void {
    if (!this.inOvertime[playerId]) {
      // Player is using main time
      this.mainTimes[playerId] = timeMs;

      // Check if main time has expired and we need to enter overtime
      if (this.mainTimes[playerId] <= 0) {
        this.mainTimes[playerId] = 0;
        this.inOvertime[playerId] = true;
        this.movesMade[playerId] = 0;
        this.overtimeTimes[playerId] = this.overtimeMs;
        this.justEnteredOvertime[playerId] = true;
      }
    } else {
      // Player is in overtime
      this.overtimeTimes[playerId] = timeMs;

      // Check if overtime has expired
      if (this.overtimeTimes[playerId] <= 0) {
        this.overtimeTimes[playerId] = 0;
        // Game is over, handled by isGameOver()
      }
    }
  }

  switchPlayer(): void {
    const previousPlayer = this.currentPlayer;

    // If in overtime, count this as a move made
    if (
      this.inOvertime[previousPlayer] &&
      this.overtimeTimes[previousPlayer] > 0
    ) {
      this.movesMade[previousPlayer]++;

      // Check if player has completed the required moves for this overtime period
      if (this.movesMade[previousPlayer] >= this.movesRequired) {
        // Reset for a new overtime period
        this.movesMade[previousPlayer] = 0;
        this.overtimeTimes[previousPlayer] = this.overtimeMs;
      }
    }

    // Switch player
    this.currentPlayer = 1 - this.currentPlayer;

    // Reset flag
    this.justEnteredOvertime[previousPlayer] = false;
  }

  isGameOver(): boolean {
    // Game is over if either player has used all main time and ran out of overtime
    return (
      (this.inOvertime[0] && this.overtimeTimes[0] <= 0) ||
      (this.inOvertime[1] && this.overtimeTimes[1] <= 0)
    );
  }

  reset(): void {
    this.mainTimes = [this.initialTimeMs, this.initialTimeMs];
    this.overtimeTimes = [this.overtimeMs, this.overtimeMs];
    this.inOvertime = [false, false];
    this.movesMade = [0, 0];
    this.justEnteredOvertime = [false, false];
    this.currentPlayer = 0;
  }

  getConfigParams(): TimerConfigParam[] {
    return [
      {
        name: 'initialTimeMinutes',
        type: 'number',
        label: 'Tempo inicial (min)',
        defaultValue: 25,
        minValue: 1,
        maxValue: 180,
      },
      {
        name: 'overtimeMinutes',
        type: 'number',
        label: 'Tempo extra (min)',
        defaultValue: 5,
        minValue: 1,
        maxValue: 30,
      },
      {
        name: 'movesRequired',
        type: 'number',
        label: 'Jogadas necessárias',
        defaultValue: 20,
        minValue: 5,
        maxValue: 50,
      },
    ];
  }

  // Additional methods to provide UI feedback
  getOvertimeStatus(playerId: number): {
    inOvertime: boolean;
    movesMade: number;
    movesRequired: number;
  } {
    return {
      inOvertime: this.inOvertime[playerId],
      movesMade: this.movesMade[playerId],
      movesRequired: this.movesRequired,
    };
  }
}
