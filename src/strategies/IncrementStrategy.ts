import { TimerStrategy, TimerConfigParam } from './TimerStrategy';
import { minutesToMs, secondsToMs } from '../utils/timeFormatter';

export class IncrementStrategy extends TimerStrategy {
  static readonly name = 'Incremento (Fischer)';
  static readonly description =
    'Após cada movimento, uma quantidade fixa de tempo é adicionada ao relógio do jogador';

  private currentPlayer: number = 0;
  private incrementMs: number;

  constructor(initialTimeMin: number, incrementSec: number) {
    super(minutesToMs(initialTimeMin));
    this.incrementMs = secondsToMs(incrementSec);
    this.reset();
  }

  switchPlayer(): void {
    // Add increment to the player who just made a move
    this.times[this.currentPlayer] += this.incrementMs;
    this.currentPlayer = 1 - this.currentPlayer; // Toggle between 0 and 1
  }

  reset(): void {
    this.times = [this.initialTimeMs, this.initialTimeMs];
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
        maxValue: 180,
      },
      {
        name: 'incrementSec',
        type: 'number',
        label: 'Incremento (s)',
        defaultValue: 2,
        minValue: 0,
        maxValue: 60,
      },
    ];
  }
}
