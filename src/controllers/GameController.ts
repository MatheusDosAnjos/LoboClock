import { TimerStrategy } from '../strategies/TimerStrategy';
import { TimerStrategyFactory, TimerType } from '../factories/TimerStrategyFactory';

export class GameController {
  private strategy: TimerStrategy;
  private isRunning: boolean = false;
  private intervalId: any = null;
  private gameOverCallback: () => void = () => {};
  private timeUpdateCallback: (times: number[]) => void = () => {};
  private activePlayer: number = 0; // Track the active player explicitly
  
  constructor(strategyType: TimerType = TimerType.CLASSICAL, config?: Record<string, any>) {
    this.strategy = TimerStrategyFactory.createStrategy(strategyType, config);
  }
  
  setStrategy(strategyType: TimerType, config?: Record<string, any>): void {
    this.pause();
    this.strategy = TimerStrategyFactory.createStrategy(strategyType, config);
    this.activePlayer = 0; // Reset active player
    this.timeUpdateCallback([
      this.strategy.getRemainingTime(0),
      this.strategy.getRemainingTime(1)
    ]);
  }
  
  start(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.intervalId = setInterval(() => this.update(), 100);
    }
  }
  
  pause(): void {
    if (this.isRunning) {
      this.isRunning = false;
      clearInterval(this.intervalId);
    }
  }
  
  reset(): void {
    this.pause();
    this.strategy.reset();
    this.activePlayer = 0; // Reset active player
    this.timeUpdateCallback([
      this.strategy.getRemainingTime(0),
      this.strategy.getRemainingTime(1)
    ]);
  }
  
  switchPlayer(): void {
    if (this.isRunning) {
      this.strategy.switchPlayer();
      this.activePlayer = 1 - this.activePlayer; // Toggle active player
    }
  }
  
  private update(): void {
    // Use explicitly tracked active player
    this.strategy.tick(this.activePlayer);
    
    // Notify about time updates
    this.timeUpdateCallback([
      this.strategy.getRemainingTime(0),
      this.strategy.getRemainingTime(1)
    ]);
    
    // Check for game over
    if (this.strategy.isGameOver()) {
      this.pause();
      this.gameOverCallback();
    }
  }
  
  getCurrentPlayer(): number {
    return this.activePlayer;
  }
  
  onTimeUpdate(callback: (times: number[]) => void): void {
    this.timeUpdateCallback = callback;
  }
  
  onGameOver(callback: () => void): void {
    this.gameOverCallback = callback;
  }
  
  getCurrentStrategy(): TimerStrategy {
    return this.strategy;
  }
}