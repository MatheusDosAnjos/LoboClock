import { TimerStrategy, TimerConfigParam } from './TimerStrategy';

export class TournamentStrategy implements TimerStrategy {
  static readonly name = 'Torneio';
  static readonly description =
    'Controle de tempo em fases - típico de torneios profissionais';

  // Main state
  private times: number[] = [0, 0];
  private currentPlayer: number = 0;
  private movesMade: number[] = [0, 0];
  private currentPhase: number[] = [1, 1]; // 1, 2, or 3
  private justChangedPhase: boolean[] = [false, false];

  // Configuration
  initialTimeMs: number = 0; // This is required by TimerStrategy

  // Phase 1 settings
  private phase1Moves: number;
  private phase1TimeMs: number;
  private phase1IncrementMs: number;

  // Phase 2 settings
  private phase2Moves: number;
  private phase2TimeMs: number;
  private phase2IncrementMs: number;

  // Phase 3 settings (remainder of the game)
  private phase3TimeMs: number;
  private phase3IncrementMs: number;

  // Optional delay applied to all phases
  private delayMs: number;

  constructor(
    phase1Minutes: number = 90,
    phase1Moves: number = 40,
    phase1IncrementSeconds: number = 0,
    phase2Minutes: number = 30,
    phase2Moves: number = 20,
    phase2IncrementSeconds: number = 0,
    phase3Minutes: number = 15,
    phase3IncrementSeconds: number = 30,
  ) {
    // Convert all time values to milliseconds
    this.phase1TimeMs = phase1Minutes * 60 * 1000;
    this.phase1Moves = phase1Moves;
    this.phase1IncrementMs = phase1IncrementSeconds * 1000;

    this.phase2TimeMs = phase2Minutes * 60 * 1000;
    this.phase2Moves = phase2Moves;
    this.phase2IncrementMs = phase2IncrementSeconds * 1000;

    this.phase3TimeMs = phase3Minutes * 60 * 1000;
    this.phase3IncrementMs = phase3IncrementSeconds * 1000;

    this.initialTimeMs = this.phase1TimeMs;

    this.reset();
  }

  getRemainingTime(playerId: number): number {
    return this.times[playerId];
  }

  setRemainingTime(playerId: number, timeMs: number): void {
    this.times[playerId] = timeMs;
  }

  switchPlayer(): void {
    const previousPlayer = this.currentPlayer;

    // Apply delay compensation logic if applicable
    // This would be similar to Bronstein delay logic if delayMs > 0

    // Apply increment based on the current phase
    if (this.currentPhase[previousPlayer] === 1) {
      this.times[previousPlayer] += this.phase1IncrementMs;
    } else if (this.currentPhase[previousPlayer] === 2) {
      this.times[previousPlayer] += this.phase2IncrementMs;
    } else {
      this.times[previousPlayer] += this.phase3IncrementMs;
    }

    // Increment moves and check for phase changes
    this.movesMade[previousPlayer]++;

    // Check if we need to transition to the next phase
    this.checkPhaseTransition(previousPlayer);

    // Switch active player
    this.currentPlayer = 1 - this.currentPlayer;

    // Reset phase change flag
    this.justChangedPhase[previousPlayer] = false;
  }

  checkPhaseTransition(playerId: number): void {
    // Check for phase 1 to phase 2 transition
    if (
      this.currentPhase[playerId] === 1 &&
      this.movesMade[playerId] >= this.phase1Moves
    ) {
      this.currentPhase[playerId] = 2;
      this.times[playerId] += this.phase2TimeMs;
      this.justChangedPhase[playerId] = true;
    }
    // Check for phase 2 to phase 3 transition
    else if (
      this.currentPhase[playerId] === 2 &&
      this.movesMade[playerId] >= this.phase1Moves + this.phase2Moves
    ) {
      this.currentPhase[playerId] = 3;
      this.times[playerId] += this.phase3TimeMs;
      this.justChangedPhase[playerId] = true;
    }
  }

  isGameOver(): boolean {
    return this.times[0] <= 0 || this.times[1] <= 0;
  }

  reset(): void {
    this.times = [this.phase1TimeMs, this.phase1TimeMs];
    this.movesMade = [0, 0];
    this.currentPhase = [1, 1];
    this.justChangedPhase = [false, false];
    this.currentPlayer = 0;
  }

  getConfigParams(): TimerConfigParam[] {
    return [
      {
        name: 'phase1Minutes',
        type: 'number',
        label: 'Tempo fase 1 (min)',
        defaultValue: 90,
        minValue: 1,
        maxValue: 180,
      },
      {
        name: 'phase1Moves',
        type: 'number',
        label: 'Movimentos fase 1',
        defaultValue: 40,
        minValue: 1,
        maxValue: 100,
      },
      {
        name: 'phase1IncrementSeconds',
        type: 'number',
        label: 'Incremento fase 1 (s)',
        defaultValue: 0,
        minValue: 0,
        maxValue: 60,
      },
      {
        name: 'phase2Minutes',
        type: 'number',
        label: 'Tempo fase 2 (min)',
        defaultValue: 30,
        minValue: 0,
        maxValue: 180,
      },
      {
        name: 'phase2Moves',
        type: 'number',
        label: 'Movimentos fase 2',
        defaultValue: 20,
        minValue: 0,
        maxValue: 100,
      },
      {
        name: 'phase2IncrementSeconds',
        type: 'number',
        label: 'Incremento fase 2 (s)',
        defaultValue: 0,
        minValue: 0,
        maxValue: 60,
      },
      {
        name: 'phase3Minutes',
        type: 'number',
        label: 'Tempo fase 3 (min)',
        defaultValue: 15,
        minValue: 0,
        maxValue: 180,
      },
      {
        name: 'phase3IncrementSeconds',
        type: 'number',
        label: 'Incremento fase 3 (s)',
        defaultValue: 30,
        minValue: 0,
        maxValue: 60,
      },
    ];
  }

  getTournamentStatus(playerId: number): {
    currentPhase: number;
    movesMade: number;
    nextPhaseAt: number | null;
    justChangedPhase: boolean;
  } {
    const nextPhaseAt =
      this.currentPhase[playerId] === 1
        ? this.phase1Moves
        : this.currentPhase[playerId] === 2
          ? this.phase1Moves + this.phase2Moves
          : null;

    return {
      currentPhase: this.currentPhase[playerId],
      movesMade: this.movesMade[playerId],
      nextPhaseAt,
      justChangedPhase: this.justChangedPhase[playerId],
    };
  }
}
