import { TimerStrategy } from '../strategies/TimerStrategy';
import { ClassicalStrategy } from '../strategies/ClassicalStrategy';
import { IncrementStrategy } from '../strategies/IncrementStrategy';
import { BronsteinDelayStrategy } from '../strategies/BronsteinDelayStrategy';
import { HourglassStrategy } from '../strategies/HourglassStrategy';
import { ByoYomiStrategy } from '../strategies/ByoYomiStrategy';
import { CanadianOvertimeStrategy } from '../strategies/CanadianOvertimeStrategy';
import { TournamentStrategy } from '../strategies/TournamentStrategy';
import { CustomStrategy } from '../strategies/CustomStrategy';

export enum TimerType {
  CLASSICAL = 'classical',
  INCREMENT = 'increment',
  BRONSTEIN = 'bronstein',
  HOURGLASS = 'hourglass',
  BYO_YOMI = 'byoYomi',
  CANADIAN = 'canadian',
  TOURNAMENT = 'tournament',
  CUSTOM = 'custom',
}

interface StrategyConstructor {
  new (...args: any[]): TimerStrategy;
  name: string;
  description: string;
}

const strategyMap: Record<TimerType, StrategyConstructor> = {
  [TimerType.CLASSICAL]: ClassicalStrategy,
  [TimerType.INCREMENT]: IncrementStrategy,
  [TimerType.BRONSTEIN]: BronsteinDelayStrategy,
  [TimerType.HOURGLASS]: HourglassStrategy,
  [TimerType.BYO_YOMI]: ByoYomiStrategy,
  [TimerType.CANADIAN]: CanadianOvertimeStrategy,
  [TimerType.TOURNAMENT]: TournamentStrategy,
  [TimerType.CUSTOM]: CustomStrategy,
};

export class TimerStrategyFactory {
  static createStrategy(
    type: TimerType,
    config?: Record<string, any>,
  ): TimerStrategy {
    const StrategyClass = strategyMap[type];

    if (!StrategyClass) {
      throw new Error(`Unsupported timer type: ${type}`);
    }

    return new StrategyClass(...(config ? Object.values(config) : []));
  }

  static getAllStrategies(): {
    type: TimerType;
    name: string;
    description: string;
  }[] {
    return Object.entries(strategyMap).map(([type, StrategyClass]) => ({
      type: type as TimerType,
      name: StrategyClass.name,
      description: StrategyClass.description,
    }));
  }
}
