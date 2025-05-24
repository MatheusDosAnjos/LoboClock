import { TimerStrategy, TimerConfigParam } from './TimerStrategy';

export class ClassicalStrategy implements TimerStrategy {
  static readonly name = 'Clássico';
  static readonly description =
    'Cronômetro simples com contagem regressiva sem tempo adicional';

  initialTimeMs: number;
  private times: number[] = [0, 0];

  constructor(initialTimeMin: number) {
    this.initialTimeMs = initialTimeMin * 60_000;
    this.reset();
  }

  getRemainingTime(playerId: number): number {
    return this.times[playerId];
  }

  setRemainingTime(playerId: number, timeMs: number): void {
    this.times[playerId] = timeMs;
  }

  switchPlayer(): void {}

  isGameOver(): boolean {
    return this.times.some(time => time <= 0);
  }

  reset(): void {
    this.times = [this.initialTimeMs, this.initialTimeMs];
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
    ];
  }
}
