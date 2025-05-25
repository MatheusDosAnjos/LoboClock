import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimerStrategy, TimerConfigParam } from './TimerStrategy';
import { minutesToMs } from '../utils/timeFormatter';

export class CanadianOvertimeStrategy extends TimerStrategy {
  static readonly name = 'Canadian Overtime';
  static readonly description =
    'Após o fim do tempo principal, o jogador tem um tempo fixo para cada jogada durante o período extra.';

  private overtimeTimes: number[] = [0, 0];
  private inOvertime: boolean[] = [false, false];
  private movesMade: number[] = [0, 0];
  private justEnteredOvertime: boolean[] = [false, false];

  private currentPlayer: number = 0;
  private overtimeMs: number;
  private movesRequired: number;

  constructor(
    initialTimeMin: number,
    overtimeMin: number,
    movesRequired: number,
  ) {
    super(minutesToMs(initialTimeMin));
    this.overtimeMs = minutesToMs(overtimeMin);
    this.movesRequired = movesRequired;
    this.reset();
  }

  getRemainingTime(playerId: number): number {
    // Return overtime time if in overtime, otherwise main time
    return this.inOvertime[playerId]
      ? this.overtimeTimes[playerId]
      : this.times[playerId];
  }

  setRemainingTime(playerId: number, timeMs: number): void {
    if (!this.inOvertime[playerId]) {
      // Player is using main time
      this.times[playerId] = timeMs;

      // Check if main time has expired and we need to enter overtime
      if (this.times[playerId] <= 0) {
        this.times[playerId] = 0;
        this.inOvertime[playerId] = true;
        this.movesMade[playerId] = 0;
        this.overtimeTimes[playerId] = this.overtimeMs;
        this.justEnteredOvertime[playerId] = true;
      }
    } else {
      // Player is in overtime
      this.overtimeTimes[playerId] = timeMs;

      // Check if overtime has expired
      if (this.overtimeTimes[playerId] <= 0) {
        this.overtimeTimes[playerId] = 0;
        // Game is over, handled by isGameOver()
      }
    }
  }

  switchPlayer(): void {
    const previousPlayer = this.currentPlayer;

    // If in overtime, count this as a move made
    if (
      this.inOvertime[previousPlayer] &&
      this.overtimeTimes[previousPlayer] > 0
    ) {
      this.movesMade[previousPlayer]++;

      // Check if player has completed the required moves for this overtime period
      if (this.movesMade[previousPlayer] >= this.movesRequired) {
        // Reset for a new overtime period
        this.movesMade[previousPlayer] = 0;
        this.overtimeTimes[previousPlayer] = this.overtimeMs;
      }
    }

    // Switch player
    this.currentPlayer = 1 - this.currentPlayer;

    // Reset flag
    this.justEnteredOvertime[previousPlayer] = false;
  }

  isGameOver(): boolean {
    // Game is over if any player has entered overtime and their overtime time has run out
    return this.inOvertime.some(
      (inOT, playerId) => inOT && this.overtimeTimes[playerId] <= 0,
    );
  }

  reset(): void {
    this.times = [this.initialTimeMs, this.initialTimeMs];
    this.overtimeTimes = [this.overtimeMs, this.overtimeMs];
    this.inOvertime = [false, false];
    this.movesMade = [0, 0];
    this.justEnteredOvertime = [false, false];
    this.currentPlayer = 0;
  }

  getConfigParams(): TimerConfigParam[] {
    return [
      {
        name: 'initialTimeMin',
        type: 'number',
        label: 'Tempo inicial (min)',
        defaultValue: 25,
        minValue: 1,
        maxValue: 180,
      },
      {
        name: 'overtimeMin',
        type: 'number',
        label: 'Tempo extra (min)',
        defaultValue: 5,
        minValue: 1,
        maxValue: 30,
      },
      {
        name: 'movesRequired',
        type: 'number',
        label: 'Jogadas necessárias',
        defaultValue: 20,
        minValue: 5,
        maxValue: 50,
      },
    ];
  }

  renderStatus(playerId: number): React.ReactNode {
    if (this.inOvertime[playerId]) {
      return React.createElement(
        View,
        { style: styles.statusContainer },
        React.createElement(
          Text,
          { style: styles.statusText },
          `Jogadas: ${this.movesMade[playerId]}/${this.movesRequired}`,
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
