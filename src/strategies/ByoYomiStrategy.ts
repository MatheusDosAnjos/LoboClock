import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimerStrategy, TimerConfigParam } from './TimerStrategy';
import { minutesToMs, secondsToMs } from '../utils/timeFormatter';

export class ByoYomiStrategy extends TimerStrategy {
  static readonly name = 'Byo-Yomi';
  static readonly description =
    'Após o tempo principal acabar, o jogador tem períodos fixos para cada jogada';

  private byoYomiTimes: number[] = [0, 0];
  private inByoYomi: boolean[] = [false, false];
  private periodsRemaining: number[] = [0, 0];
  private lastSwitchInByoYomi: boolean[] = [false, false];

  private currentPlayer: number = 0;
  private byoYomiPeriodMs: number;
  private numPeriods: number;

  constructor(
    initialTimeMin: number,
    periodTimeSec: number,
    numPeriods: number,
  ) {
    super(minutesToMs(initialTimeMin));
    this.byoYomiPeriodMs = secondsToMs(periodTimeSec);
    this.numPeriods = numPeriods;
    this.reset();
  }

  getRemainingTime(playerId: number): [number, boolean] {
    return this.inByoYomi[playerId]
      ? [this.byoYomiTimes[playerId], false]
      : this.times[playerId];
  }

  setRemainingTime(playerId: number, timeMs: number): void {
    if (!this.inByoYomi[playerId]) {
      // Player is using main time
      this.times[playerId][0] = timeMs;

      // Check if main time has expired and we need to enter byo-yomi
      if (this.times[playerId][0] <= 0) {
        this.times[playerId][0] = 0;
        this.inByoYomi[playerId] = true;
        this.periodsRemaining[playerId] = this.numPeriods;
        this.byoYomiTimes[playerId] = this.byoYomiPeriodMs;
        // Mark that this player just entered byo-yomi
        this.lastSwitchInByoYomi[playerId] = true;
      }
    } else {
      // Player is in byo-yomi
      this.byoYomiTimes[playerId] = timeMs;

      // Check if current period has expired
      if (this.byoYomiTimes[playerId] <= 0) {
        this.periodsRemaining[playerId]--;

        if (this.periodsRemaining[playerId] > 0) {
          // Start next period
          this.byoYomiTimes[playerId] = this.byoYomiPeriodMs;
        } else {
          // No more periods left - keep at zero
          this.byoYomiTimes[playerId] = 0;
        }
      }
    }
  }

  switchPlayer(): void {
    const previousPlayer = this.currentPlayer;

    // If current player was in byo-yomi, reset their period timer only if they still have periods
    if (
      this.inByoYomi[previousPlayer] &&
      this.periodsRemaining[previousPlayer] > 0
    ) {
      this.byoYomiTimes[previousPlayer] = this.byoYomiPeriodMs;
    }

    this.currentPlayer = 1 - this.currentPlayer; // Toggle between 0 and 1

    // Reset the tracking flag
    this.lastSwitchInByoYomi[previousPlayer] = false;
  }

  isGameOver(): boolean {
    // Game is over if either player has used all main time and all byo-yomi periods
    return (
      (this.inByoYomi[0] && this.periodsRemaining[0] <= 0) ||
      (this.inByoYomi[1] && this.periodsRemaining[1] <= 0)
    );
  }

  reset(): void {
    this.times = [[this.initialTimeMs, false], [this.initialTimeMs, false]];
    this.byoYomiTimes = [this.byoYomiPeriodMs, this.byoYomiPeriodMs];
    this.inByoYomi = [false, false];
    this.periodsRemaining = [this.numPeriods, this.numPeriods];
    this.lastSwitchInByoYomi = [false, false];
    this.currentPlayer = 0;
  }

  getConfigParams(): TimerConfigParam[] {
    return [
      {
        name: 'initialTimeMin',
        type: 'number',
        label: 'Tempo inicial (min)',
        defaultValue: 30,
        minValue: 1,
        maxValue: 180,
      },
      {
        name: 'periodTimeSec',
        type: 'number',
        label: 'Tempo do periodo (s)',
        defaultValue: 30,
        minValue: 5,
        maxValue: 60,
      },
      {
        name: 'numPeriods',
        type: 'number',
        label: 'Quantidade de periodos',
        defaultValue: 5,
        minValue: 1,
        maxValue: 10,
      },
    ];
  }

  renderStatus(playerId: number): React.ReactNode {
    const periodsRemaining = this.periodsRemaining[playerId];

    if (this.inByoYomi[playerId]) {
      return React.createElement(
        View,
        { style: styles.statusContainer },
        React.createElement(
          Text,
          { style: styles.statusText },
          `Byo-Yomi: ${periodsRemaining} período${periodsRemaining !== 1 ? 's' : ''} restante${periodsRemaining !== 1 ? 's' : ''}`,
        ),
      );
    }

    return null;
  }
}

const styles = StyleSheet.create({
  statusContainer: {
    marginTop: 10,
    padding: 5,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
  },
});
