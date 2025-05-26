import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimerStrategy, TimerConfigParam } from './TimerStrategy';
import { minutesToMs } from '../utils/timeFormatter';

type OvertimeType = 'none' | 'same' | 'custom';

export class CustomStrategy extends TimerStrategy {
  static readonly name = 'Personalizado';
  static readonly description =
    'Cronômetro personalizável com tempo principal, incremento, tempo extra por jogada e configurações opcionais de overtime para maior flexibilidade.';

  incrementMs: number;
  baseExtraMs: number;
  accumulateExtra: boolean;
  transferMainTime: boolean;
  overtimeMode: OvertimeType;
  otInitialMs: number;
  otIncrementMs: number;
  otBaseExtraMs: number;
  otAccumulateExtra: boolean;
  otTransferMainTime: boolean;

  // state
  extraTimes = [0, 0];
  leftoverExtra = [0, 0];
  inOvertime = [false, false];
  currentPlayer = 0;
  turnStartMainTime = 0;

  constructor(
    initialMinutes: number = 5,
    incrementSeconds: number = 0,
    extraSeconds: number = 0,
    accumulate: boolean = false,
    transferMainTime: boolean = false,
    overtimeMode: OvertimeType = 'none',
    otInitialMinutes: number = 0,
    otIncrementSeconds: number = 0,
    otExtraSeconds: number = 0,
    otAccumulate: boolean = false,
    otTransferMainTime: boolean = false,
  ) {
    super(minutesToMs(initialMinutes));
    this.incrementMs = incrementSeconds * 1_000;
    this.baseExtraMs = extraSeconds * 1_000;
    this.accumulateExtra = accumulate;
    this.transferMainTime = transferMainTime;

    this.overtimeMode = overtimeMode;

    if (overtimeMode === 'none') {
      this.otInitialMs = 0;
      this.otIncrementMs = 0;
      this.otBaseExtraMs = 0;
      this.otAccumulateExtra = false;
      this.otTransferMainTime = false;
    } else if (overtimeMode === 'same') {
      this.otInitialMs = this.initialTimeMs;
      this.otIncrementMs = this.incrementMs;
      this.otBaseExtraMs = this.baseExtraMs;
      this.otAccumulateExtra = this.accumulateExtra;
      this.otTransferMainTime = this.transferMainTime;
    } else {
      this.otInitialMs = otInitialMinutes * 60_000;
      this.otIncrementMs = otIncrementSeconds * 1_000;
      this.otBaseExtraMs = otExtraSeconds * 1_000;
      this.otAccumulateExtra = otAccumulate;
      this.otTransferMainTime = otTransferMainTime;
    }

    this.reset();
  }

  getRemainingTime(playerId: number): [number, boolean] {
    // If this player has main time, return that
    if (this.times[playerId][0] > 0) {
      return this.times[playerId];
    }

    // If player has no main time, calculate their proper extra time
    // For non-active player, we need to make sure to show the correct next-turn time
    if (playerId !== this.currentPlayer) {
      // Return what their extra time will be when it's their turn again
      if (this.inOvertime[playerId]) {
        return [this.otBaseExtraMs + this.leftoverExtra[playerId], false];
      } else {
        return [this.baseExtraMs + this.leftoverExtra[playerId], false];
      }
    }

    // For current active player, return their current extra time
    return [this.extraTimes[playerId], false];
  }

  setRemainingTime(playerId: number, timeMs: number): void {
    // Player has main time - update main time
    if (this.times[playerId][0] > 0) {
      this.times[playerId][0] = timeMs;
      // When main time runs out, transition to extra time
      if (timeMs <= 0) {
        this.times[playerId][0] = 0;
        // Set up the extra time - use the appropriate base extra time
        this.extraTimes[playerId] = this.inOvertime[playerId]
          ? this.otBaseExtraMs
          : this.baseExtraMs;
      }
      return;
    }

    // No main time left, using extra time
    this.extraTimes[playerId] = timeMs;

    // If extra time runs out and we have overtime enabled, transition to overtime
    if (
      timeMs <= 0 &&
      !this.inOvertime[playerId] &&
      this.overtimeMode !== 'none'
    ) {
      this.startOvertime(playerId);
    }
  }

  startOvertime(playerId: number): void {
    this.inOvertime[playerId] = true;
    this.times[playerId][0] = this.otInitialMs;
    this.extraTimes[playerId] = this.otBaseExtraMs;
    this.leftoverExtra[playerId] = 0;
    // Reset turn start time tracking for overtime
    if (playerId === this.currentPlayer) {
      this.turnStartMainTime = this.times[playerId][0];
    }
  }

  switchPlayer(): void {
    const p = this.currentPlayer;
    const np = 1 - p;

    // Calculate actual time spent from main time reduction (more accurate)
    let actualTimeSpent = 0;
    if (this.turnStartMainTime > 0 && this.times[p][0] >= 0) {
      actualTimeSpent = Math.max(0, this.turnStartMainTime - this.times[p][0]);
    }

    // 1) stash leftover extra time based on accumulate setting
    const extraLeft = this.extraTimes[p];

    // Use different accumulation rules based on whether player is in overtime
    if (this.inOvertime[p]) {
      this.leftoverExtra[p] = this.otAccumulateExtra ? extraLeft : 0;
    } else {
      this.leftoverExtra[p] = this.accumulateExtra ? extraLeft : 0;
    }

    // 2) figure out if main was still >0 when we switched
    const hadMain = this.times[p][0] > 0 || this.turnStartMainTime > 0;

    // 3) apply increment only if main was still running
    if (hadMain && this.times[p][0] > 0) {
      if (this.incrementMs > 0 && !this.inOvertime[p]) {
        this.times[p][0] += this.incrementMs;
      } else if (this.otIncrementMs > 0 && this.inOvertime[p]) {
        this.times[p][0] += this.otIncrementMs;
      }
    }

    // 4) Transfer time feature - only applies to main time
    if (actualTimeSpent > 0 && hadMain) {
      const shouldTransfer = this.inOvertime[p]
        ? this.otTransferMainTime
        : this.transferMainTime;

      if (shouldTransfer) {
        // Only transfer if the other player still has main time
        if (this.times[np][0] > 0) {
          this.times[np][0] += actualTimeSpent;
        }
      }
    }

    // 5) reset next player's extra clock
    if (this.inOvertime[np]) {
      this.extraTimes[np] = this.otBaseExtraMs + this.leftoverExtra[np];
    } else {
      this.extraTimes[np] = this.baseExtraMs + this.leftoverExtra[np];
    }

    // 6) flip active player and record turn start time
    this.currentPlayer = np;
    this.turnStartMainTime = this.times[np][0]; // Track main time at start of new turn
  }

  isGameOver(): boolean {
    // Game is over if a player has no main time AND no extra time
    // And not eligible for overtime or already in overtime
    return (
      (this.times[0][0] <= 0 &&
        this.extraTimes[0] <= 0 &&
        (this.inOvertime[0] || this.overtimeMode === 'none')) ||
      (this.times[1][0] <= 0 &&
        this.extraTimes[1] <= 0 &&
        (this.inOvertime[1] || this.overtimeMode === 'none'))
    );
  }

  reset(): void {
    this.times = [[this.initialTimeMs, false], [this.initialTimeMs, false]];
    this.extraTimes = [this.baseExtraMs, this.baseExtraMs];
    this.leftoverExtra = [0, 0];
    this.inOvertime = [false, false];
    this.currentPlayer = 0;
    this.turnStartMainTime = this.initialTimeMs; // Initialize turn start main time
  }

  getConfigParams(): TimerConfigParam[] {
    return [
      {
        name: 'initialMinutes',
        type: 'number',
        label: 'Tempo inicial (min)',
        defaultValue: 5,
        minValue: 0,
        maxValue: 180,
      },
      {
        name: 'incrementSeconds',
        type: 'number',
        label: 'Incremento (s)',
        defaultValue: 0,
        minValue: 0,
        maxValue: 60,
      },
      {
        name: 'extraSeconds',
        type: 'number',
        label: 'Tempo extra por jogada (s)',
        defaultValue: 0,
        minValue: 0,
        maxValue: 60,
      },
      {
        name: 'accumulate',
        type: 'select',
        label: 'Acumular tempo extra',
        defaultValue: false,
        options: [
          { label: 'Não', value: false },
          { label: 'Sim', value: true },
        ],
      },
      {
        name: 'transferMainTime',
        type: 'select',
        label: 'Transferir tempo gasto (tempo principal)',
        defaultValue: false,
        options: [
          { label: 'Não', value: false },
          { label: 'Sim', value: true },
        ],
      },
      {
        name: 'overtimeMode',
        type: 'select',
        label: 'Overtime',
        defaultValue: 'none',
        options: [
          { label: 'Desligado', value: 'none' },
          { label: 'Mesmas configurações', value: 'same' },
          { label: 'Personalizado', value: 'custom' },
        ],
      },
      {
        name: 'otInitialMinutes',
        type: 'number',
        label: 'Tempo inicial OT (min)',
        defaultValue: 5,
        minValue: 0,
        maxValue: 180,
        condition: { param: 'overtimeMode', value: 'custom' },
      },
      {
        name: 'otIncrementSeconds',
        type: 'number',
        label: 'Incremento OT (s)',
        defaultValue: 0,
        minValue: 0,
        maxValue: 60,
        condition: { param: 'overtimeMode', value: 'custom' },
      },
      {
        name: 'otExtraSeconds',
        type: 'number',
        label: 'Tempo extra por jogada OT (s)',
        defaultValue: 0,
        minValue: 0,
        maxValue: 60,
        condition: { param: 'overtimeMode', value: 'custom' },
      },
      {
        name: 'otAccumulate',
        type: 'select',
        label: 'Acumular tempo extra OT',
        defaultValue: false,
        options: [
          { label: 'Não', value: false },
          { label: 'Sim', value: true },
        ],
        condition: { param: 'overtimeMode', value: 'custom' },
      },
      {
        name: 'otTransferMainTime',
        type: 'select',
        label: 'Transferir tempo gasto (overtime)',
        defaultValue: false,
        options: [
          { label: 'Não', value: false },
          { label: 'Sim', value: true },
        ],
        condition: { param: 'overtimeMode', value: 'custom' },
      },
    ];
  }

  renderStatus(playerId: number): React.ReactNode {
    if (this.inOvertime[playerId]) {
      return React.createElement(
        View,
        { style: styles.statusContainer },
        React.createElement(Text, { style: styles.statusText }, 'EM OVERTIME'),
      );
    }
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

// PERSONALIZADO: OPÇÃO PARA PASSAR TEMPO GASTO PARA UM JOGADOR PARA O OUTRO
// QUANTIDADE DE OVERTIME PERSONALIZADO
