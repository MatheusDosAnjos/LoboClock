import { TimerStrategy, TimerConfigParam } from './TimerStrategy';

export class IncrementStrategy implements TimerStrategy {
  static readonly  name = 'Incremento (Fischer)';
  static readonly description =
    "Após cada movimento, uma quantidade fixa de tempo é adicionada ao relógio do jogador";

  private times: number[] = [0, 0]; // Player 1 and 2 remaining time (ms)
  private currentPlayer: number = 0;
  initialTimeMs: number;
  private incrementMs: number;

  constructor(initialTimeMinutes: number, incrementSeconds: number) {
    this.initialTimeMs = initialTimeMinutes * 60 * 1000;
    this.incrementMs = incrementSeconds * 1000;
    this.reset();
  }

  getRemainingTime(playerId: number): number {
    return this.times[playerId];
  }

  setRemainingTime(playerId: number, timeMs: number): void {
    this.times[playerId] = timeMs;
  }

  switchPlayer(): void {
    // Add increment to the player who just made a move
    this.times[this.currentPlayer] += this.incrementMs;
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
        label: 'Tempo inicial (min)',
        defaultValue: 3,
        minValue: 1,
        maxValue: 180,
      },
      {
        name: 'incrementSeconds',
        type: 'number',
        label: 'Incremento (s)',
        defaultValue: 2,
        minValue: 0,
        maxValue: 60,
      },
    ];
  }
}
