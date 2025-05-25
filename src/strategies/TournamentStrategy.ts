import { TimerStrategy, TimerConfigParam } from './TimerStrategy';
import { minutesToMs, secondsToMs } from '../utils/timeFormatter';

export class TournamentStrategy extends TimerStrategy {
  static readonly name = 'Torneio';
  static readonly description =
    'Controle de tempo em fases - típico de torneios profissionais';

  // Main state
  private currentPlayer: number = 0;
  private movesMade: number[] = [0, 0];
  private currentPhase: number[] = [1, 1]; // 1, 2, or 3
  private justChangedPhase: boolean[] = [false, false];

  // Phase 1 settings
  private phase1Moves: number;
  private phase1IncrementMs: number;

  // Phase 2 settings
  private phase2Moves: number;
  private phase2TimeMs: number;
  private phase2IncrementMs: number;

  // Phase 3 settings (remainder of the game)
  private phase3TimeMs: number;
  private phase3IncrementMs: number;

  constructor(
    phase1Min: number,
    phase1Moves: number,
    phase1IncrementSec: number,
    phase2Min: number,
    phase2Moves: number,
    phase2IncrementSec: number,
    phase3Min: number,
    phase3IncrementSec: number,
  ) {
    super(minutesToMs(phase1Min));
    this.phase1Moves = phase1Moves;
    this.phase1IncrementMs = secondsToMs(phase1IncrementSec);

    this.phase2TimeMs = minutesToMs(phase2Min);
    this.phase2Moves = phase2Moves;
    this.phase2IncrementMs = secondsToMs(phase2IncrementSec);

    this.phase3TimeMs = minutesToMs(phase3Min);
    this.phase3IncrementMs = secondsToMs(phase3IncrementSec);

    this.reset();
  }

  switchPlayer(): void {
    const previousPlayer = this.currentPlayer;

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

  reset(): void {
    this.times = [this.initialTimeMs, this.initialTimeMs];
    this.movesMade = [0, 0];
    this.currentPhase = [1, 1];
    this.justChangedPhase = [false, false];
    this.currentPlayer = 0;
  }

  getConfigParams(): TimerConfigParam[] {
    return [
      {
        name: 'phase1Min',
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
        name: 'phase1IncrementSec',
        type: 'number',
        label: 'Incremento fase 1 (s)',
        defaultValue: 0,
        minValue: 0,
        maxValue: 60,
      },
      {
        name: 'phase2Min',
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
        name: 'phase2IncrementSec',
        type: 'number',
        label: 'Incremento fase 2 (s)',
        defaultValue: 0,
        minValue: 0,
        maxValue: 60,
      },
      {
        name: 'phase3Min',
        type: 'number',
        label: 'Tempo fase 3 (min)',
        defaultValue: 15,
        minValue: 0,
        maxValue: 180,
      },
      {
        name: 'phase3IncrementSec',
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
