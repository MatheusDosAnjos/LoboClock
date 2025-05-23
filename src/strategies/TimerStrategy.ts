export abstract class TimerStrategy {
  static readonly name: string;
  static readonly description: string;

  initialTimeMs: number = 0;

  abstract getRemainingTime(playerId: number): number;
  abstract setRemainingTime(playerId: number, timeMs: number): void;
  abstract switchPlayer(): void;
  abstract isGameOver(): boolean;
  abstract reset(): void;
  abstract getConfigParams(): TimerConfigParam[];

  renderStatus?(playerId: number): React.ReactNode;
}

export interface TimerConfigParam {
  name: string;
  type: 'number' | 'select';
  label: string;
  defaultValue: any;
  minValue?: number;
  maxValue?: number;
  options?: { label: string; value: any }[];
  condition?: { param: string; value: any };
}
