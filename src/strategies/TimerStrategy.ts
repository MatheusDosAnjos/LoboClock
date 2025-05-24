import React from 'react';

export interface ITimerStrategy {
  getRemainingTime(playerId: number): number;
  setRemainingTime(playerId: number, timeMs: number): void;
  switchPlayer?(): void;
  isGameOver(): boolean;
  reset(): void;
  getConfigParams(): TimerConfigParam[];
  renderStatus?(playerId: number): React.ReactNode;
}

export abstract class TimerStrategy implements ITimerStrategy {
  static readonly name: string;
  static readonly description: string;

  protected initialTimeMs: number = 0;
  protected times: number[] = [0, 0];

  constructor(initialTimeMs: number) {
    this.initialTimeMs = initialTimeMs;
    this.reset();
  }

  abstract getConfigParams(): TimerConfigParam[];

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
