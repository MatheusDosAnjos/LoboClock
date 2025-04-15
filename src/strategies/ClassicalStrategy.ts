import { TimerStrategy, TimerConfigParam } from './TimerStrategy';

export class ClassicalStrategy implements TimerStrategy {
  static readonly name = 'Clássico';
  static readonly description = 'Cronômetro simples com contagem regressiva sem tempo adicional';

  private times: number[] = [0, 0]; // Player 1 and 2 remaining time (ms)
  private currentPlayer: number = 0;
  initialTimeMs: number;

  constructor(initialTimeMinutes: number) {
    this.initialTimeMs = initialTimeMinutes * 60 * 1000;
    this.reset();
  }

  getRemainingTime(playerId: number): number {
    return this.times[playerId];
  }

  setRemainingTime(playerId: number, timeMs: number): void {
    this.times[playerId] = timeMs;
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
        label: 'Tempo inicial (min)',
        defaultValue: 5,
        minValue: 1,
        maxValue: 180,
      },
    ];
  }
}
