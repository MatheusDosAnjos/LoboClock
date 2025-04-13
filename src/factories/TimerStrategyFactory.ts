import { TimerStrategy } from '../strategies/TimerStrategy';
import { ClassicalStrategy } from '../strategies/ClassicalStrategy';
import { IncrementStrategy } from '../strategies/IncrementStrategy';
import { BronsteinDelayStrategy } from '../strategies/BronsteinDelayStrategy';
import { HourglassStrategy } from '../strategies/HourglassStrategy';
import { ByoYomiStrategy } from '../strategies/ByoYomiStrategy';
import { CanadianOvertimeStrategy } from '../strategies/CanadianOvertimeStrategy';

export enum TimerType {
  CLASSICAL = 'classical',
  INCREMENT = 'increment',
  BRONSTEIN = 'bronstein',
  HOURGLASS = 'hourglass',
  BYO_YOMI = 'byoYomi',
  CANADIAN = 'canadian',
}

export class TimerStrategyFactory {
  static createStrategy(
    type: TimerType,
    config?: Record<string, any>,
  ): TimerStrategy {
    switch (type) {
      case TimerType.CLASSICAL:
        return new ClassicalStrategy(config?.initialTimeMinutes);

      case TimerType.INCREMENT:
        return new IncrementStrategy(
          config?.initialTimeMinutes,
          config?.incrementSeconds,
        );

      case TimerType.BRONSTEIN:
        return new BronsteinDelayStrategy(
          config?.initialTimeMinutes,
          config?.delaySeconds,
        );

      case TimerType.HOURGLASS:
        return new HourglassStrategy(config?.initialTimeMinutes);

      case TimerType.BYO_YOMI:
        return new ByoYomiStrategy(
          config?.initialTimeMinutes,
          config?.byoYomiPeriodSeconds,
          config?.numPeriods,
        );

      case TimerType.CANADIAN:
        return new CanadianOvertimeStrategy(
          config?.initialTimeMinutes,
          config?.overtimeMinutes,
          config?.movesRequired,
        );

      default:
        return new ClassicalStrategy();
    }
  }

  static getAllStrategies(): {
    type: TimerType;
    name: string;
    description: string;
  }[] {
    return [
      {
        type: TimerType.CLASSICAL,
        name: 'Classical',
        description: 'Simple countdown timer',
      },
      {
        type: TimerType.INCREMENT,
        name: 'Increment',
        description: 'Time added after each move',
      },
      {
        type: TimerType.BRONSTEIN,
        name: 'Bronstein Delay',
        description: 'Time used for a move is added back up to maximum delay',
      },
      {
        type: TimerType.HOURGLASS,
        name: 'Hourglass',
        description: "Your opponent's time increases as yours decreases",
      },
      {
        type: TimerType.BYO_YOMI,
        name: 'Byo-Yomi',
        description: 'Fixed time periods for each move after main time expires',
      },
      {
        type: TimerType.CANADIAN,
        name: 'Canadian Overtime',
        description: 'Complete specified moves within overtime period',
      },
    ];
  }
}
