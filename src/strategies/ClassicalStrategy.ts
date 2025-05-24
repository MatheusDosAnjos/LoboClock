import { TimerStrategy, TimerConfigParam } from './TimerStrategy';
import { minutesToMs } from '../utils/timeFormatter';

export class ClassicalStrategy extends TimerStrategy {
  static readonly name = 'Clássico';
  static readonly description =
    'Cronômetro simples com contagem regressiva sem tempo adicional';

  constructor(initialTimeMin: number) {
    super(minutesToMs(initialTimeMin));
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
