import { TimerStrategy, TimerConfigParam } from './TimerStrategy';

export class ClassicalStrategy implements TimerStrategy {
  name = "Classical";
  description = "Simple countdown timer with no additional time";
  
  private times: number[] = [0, 0]; // Player 1 and 2 remaining time (ms)
  private currentPlayer: number = 0;
  initialTimeMs: number;
  
  constructor(initialTimeMinutes: number = 5) {
    this.initialTimeMs = initialTimeMinutes * 60 * 1000;
    this.reset();
  }
  
  tick(playerId: number): void {
    if (playerId === this.currentPlayer && this.times[playerId] > 0) {
      this.times[playerId] -= 100; // Decrease by 100ms
    }
  }
  
  switchPlayer(): void {
    this.currentPlayer = 1 - this.currentPlayer; // Toggle between 0 and 1
  }
  
  getRemainingTime(playerId: number): number {
    return this.times[playerId];
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
        name: "initialTimeMinutes",
        type: "number",
        label: "Initial Time (minutes)",
        defaultValue: 5,
        minValue: 1,
        maxValue: 180
      }
    ];
  }
  
  setConfigParam(paramName: string, value: any): void {
    if (paramName === "initialTimeMinutes") {
      this.initialTimeMs = value * 60 * 1000;
      this.reset();
    }
  }
}