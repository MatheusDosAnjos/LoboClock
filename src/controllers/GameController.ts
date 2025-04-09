import { TimerStrategy } from '../strategies/TimerStrategy';
import { TimerStrategyFactory, TimerType } from '../factories/TimerStrategyFactory';

export class GameController {
  private strategy: TimerStrategy;
  private isRunning: boolean = false;
  private startTimestamp: number = 0;
  private animationFrameId: number | null = null;
  private gameOverCallback: () => void = () => {};
  private timeUpdateCallback: (times: number[]) => void = () => {};
  private activePlayer: number = 0;
  
  constructor(strategyType: TimerType = TimerType.CLASSICAL, config?: Record<string, any>) {
    this.strategy = TimerStrategyFactory.createStrategy(strategyType, config);
  }
  
  start(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.startTimestamp = Date.now();
      this.scheduleUpdate();
    }
  }
  
  pause(): void {
    if (this.isRunning) {
      // Calculate elapsed time and update the active player's remaining time
      this.updatePlayerTime();
      this.isRunning = false;
      
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }
  }
  
  reset(): void {
    this.pause();
    this.strategy.reset();
    this.activePlayer = 0;
    this.notifyTimeUpdate();
  }
  
  switchPlayer(): void {
    if (this.isRunning) {
      // Calculate and update the current player's time before switching
      this.updatePlayerTime();
      
      // Switch player in the strategy
      this.strategy.switchPlayer();
      this.activePlayer = 1 - this.activePlayer;
      
      // Reset the timestamp for the new player
      this.startTimestamp = Date.now();
    }
  }
  
  private scheduleUpdate(): void {
    const updateFrame = () => {
      if (this.isRunning) {
        this.updatePlayerTime(false); // Update time without storing it
        this.notifyTimeUpdate();
        
        // Check for game over
        if (this.strategy.isGameOver()) {
          this.pause();
          this.gameOverCallback();
          return;
        }
        
        this.animationFrameId = requestAnimationFrame(updateFrame);
      }
    };
    
    this.animationFrameId = requestAnimationFrame(updateFrame);
  }
  
  private updatePlayerTime(storeTime: boolean = true): void {
    if (!this.isRunning) return;
    
    const currentTime = Date.now();
    const elapsedMs = currentTime - this.startTimestamp;
    
    if (elapsedMs > 0) {
      // Calculate the new remaining time
      const currentRemaining = this.strategy.getRemainingTime(this.activePlayer);
      const newRemaining = Math.max(0, currentRemaining - elapsedMs);
      
      // Update the strategy with the new time
      this.strategy.setRemainingTime(this.activePlayer, newRemaining);
      
      // Reset the start timestamp if we're continuing to run the clock
      if (!storeTime) {
        this.startTimestamp = currentTime;
      }
    }
  }
  
  private notifyTimeUpdate(): void {
    this.timeUpdateCallback([
      this.strategy.getRemainingTime(0),
      this.strategy.getRemainingTime(1)
    ]);
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