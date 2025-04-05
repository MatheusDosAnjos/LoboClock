import { TimerStrategy, TimerConfigParam } from './TimerStrategy';

export class BronsteinDelayStrategy implements TimerStrategy {
  name = "Bronstein Delay";
  description = "Adds back the time used for a move, up to the maximum delay";
  
  private times: number[] = [0, 0]; // Player 1 and 2 remaining time (ms)
  private currentPlayer: number = 0;
  initialTimeMs: number;
  private delayMs: number;
  private moveStartTime: number = 0;
  
  constructor(initialTimeMinutes: number = 5, delaySeconds: number = 3) {
    this.initialTimeMs = initialTimeMinutes * 60 * 1000;
    this.delayMs = delaySeconds * 1000;
    this.reset();
  }
  
  tick(playerId: number): void {
    if (playerId === this.currentPlayer && this.times[playerId] > 0) {
      this.times[playerId] -= 100; // Decrease by 100ms
    }
  }
  
  switchPlayer(): void {
    // Calculate time spent on the move
    const timeSpent = this.moveStartTime - this.times[this.currentPlayer];
    
    // Add back delay (limited to the actual time spent or max delay)
    const timeToAdd = Math.min(timeSpent, this.delayMs);
    this.times[this.currentPlayer] += timeToAdd;
    
    // Switch player and store the new starting time
    this.currentPlayer = 1 - this.currentPlayer;
    this.moveStartTime = this.times[this.currentPlayer];
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
    this.moveStartTime = this.initialTimeMs;
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
      },
      {
        name: "delaySeconds",
        type: "number",
        label: "Delay (seconds)",
        defaultValue: 3,
        minValue: 0,
        maxValue: 60
      }
    ];
  }
  
  setConfigParam(paramName: string, value: any): void {
    if (paramName === "initialTimeMinutes") {
      this.initialTimeMs = value * 60 * 1000;
      this.reset();
    } else if (paramName === "delaySeconds") {
      this.delayMs = value * 1000;
    }
  }
}