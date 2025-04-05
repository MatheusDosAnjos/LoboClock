import { TimerStrategy } from '../strategies/TimerStrategy';
import { ClassicalStrategy } from '../strategies/ClassicalStrategy';
import { IncrementStrategy } from '../strategies/IncrementStrategy';
import { BronsteinDelayStrategy } from '../strategies/BronsteinDelayStrategy';
import { HourglassStrategy } from '../strategies/HourglassStrategy';

export enum TimerType {
  CLASSICAL = 'classical',
  INCREMENT = 'increment',
  BRONSTEIN = 'bronstein',
  HOURGLASS = 'hourglass',
  CUSTOM = 'custom'
}

export class TimerStrategyFactory {
  static createStrategy(type: TimerType, config?: Record<string, any>): TimerStrategy {
    switch (type) {
      case TimerType.CLASSICAL:
        return new ClassicalStrategy(config?.initialTimeMinutes);
      
      case TimerType.INCREMENT:
        return new IncrementStrategy(
          config?.initialTimeMinutes,
          config?.incrementSeconds
        );
      
      case TimerType.BRONSTEIN:
        return new BronsteinDelayStrategy(
          config?.initialTimeMinutes,
          config?.delaySeconds
        );
      
      case TimerType.HOURGLASS:
        return new HourglassStrategy(config?.initialTimeMinutes);
      
      case TimerType.CUSTOM:
        // This would need to be handled specially depending on the selected base type
        return this.createCustomStrategy(config);
      
      default:
        return new ClassicalStrategy();
    }
  }
  
  private static createCustomStrategy(config?: Record<string, any>): TimerStrategy {
    // Example implementation that creates a strategy based on the baseType
    const baseType = config?.baseType || TimerType.CLASSICAL;
    return this.createStrategy(baseType, config);
  }
  
  static getAllStrategies(): { type: TimerType, name: string, description: string }[] {
    return [
      { type: TimerType.CLASSICAL, name: "Classical", description: "Simple countdown timer" },
      { type: TimerType.INCREMENT, name: "Increment", description: "Time added after each move" },
      { type: TimerType.BRONSTEIN, name: "Bronstein Delay", description: "Time used for a move is added back up to maximum delay" },
      { type: TimerType.HOURGLASS, name: "Hourglass", description: "Your opponent's time increases as yours decreases" },
      { type: TimerType.CUSTOM, name: "Custom", description: "Customize your own timer settings" }
    ];
  }
}