export interface TimerStrategy {
  name: string;
  description: string;
  initialTimeMs: number;
  
  // Core methods
  getRemainingTime(playerId: number): number;
  setRemainingTime(playerId: number, timeMs: number): void; // New method
  switchPlayer(): void;
  isGameOver(): boolean;
  reset(): void;
  
  // Configuration methods
  getConfigParams(): TimerConfigParam[];
  setConfigParam(paramName: string, value: any): void;
}

export interface TimerConfigParam {
  name: string;
  type: 'number' | 'boolean';
  label: string;
  defaultValue: any;
  minValue?: number;
  maxValue?: number;
}