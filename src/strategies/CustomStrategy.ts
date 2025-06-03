import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimerStrategy, TimerConfigParam } from './TimerStrategy';
import { minutesToMs } from '../utils/timeFormatter';

type OvertimeType = 'none' | 'same' | 'custom';

type OvertimeConfig = {
  initialMinutes: number;
  incrementSeconds: number;
  extraSeconds: number;
  accumulate: boolean;
  transferMainTime: boolean;
};

export class CustomStrategy extends TimerStrategy {
  static readonly name = 'Personalizado';
  static readonly description =
    'Cronômetro personalizável com tempo principal, incremento, tempo extra por jogada e múltiplos overtimes opcionais, cada um com sua própria configuração.';

  incrementMs: number;
  baseExtraMs: number;
  accumulateExtra: boolean;
  transferMainTime: boolean;
  overtimeMode: OvertimeType;

  overtimeConfigs: OvertimeConfig[] = [];

  // state
  extraTimes = [0, 0];
  leftoverExtra = [0, 0];
  inOvertime = [false, false];
  overtimeIndex = [0, 0];
  currentPlayer = 0;
  turnStartMainTime = 0;

  constructor(
    initialMinutes: number,
    incrementSeconds: number,
    extraSeconds: number,
    accumulate: boolean,
    transferMainTime: boolean,
    overtimeMode: OvertimeType,
    numOvertimes: number,
    ...overtimeConfigsFlat: any[]
  ) {
    super(minutesToMs(initialMinutes));
    this.incrementMs = incrementSeconds * 1_000;
    this.baseExtraMs = extraSeconds * 1_000;
    this.accumulateExtra = accumulate;
    this.transferMainTime = transferMainTime;

    this.overtimeMode = overtimeMode;

    this.overtimeConfigs = [];
    if (overtimeMode === 'custom' && numOvertimes > 0) {
      for (let i = 0; i < numOvertimes; i++) {
        const base = i * 5;
        this.overtimeConfigs.push({
          initialMinutes: overtimeConfigsFlat[base],
          incrementSeconds: overtimeConfigsFlat[base + 1],
          extraSeconds: overtimeConfigsFlat[base + 2],
          accumulate: overtimeConfigsFlat[base + 3],
          transferMainTime: overtimeConfigsFlat[base + 4],
        });
      }
    } else if (overtimeMode === 'same' && numOvertimes > 0) {
      this.overtimeConfigs = Array(numOvertimes).fill({
        initialMinutes,
        incrementSeconds,
        extraSeconds,
        accumulate,
        transferMainTime,
      });
    }

    this.reset();
  }

  getRemainingTime(playerId: number): number {
    // If this player has main time, return that
    if (this.times[playerId] > 0) {
      return this.times[playerId];
    }

    // If player has no main time, calculate their proper extra time
    // For non-active player, we need to make sure to show the correct next-turn time
    if (playerId !== this.currentPlayer) {
      // Return what their extra time will be when it's their turn again
      if (this.inOvertime[playerId]) {
        const idx = this.overtimeIndex[playerId];
        const cfg = this.overtimeConfigs[idx] || this.overtimeConfigs[0];
        return (cfg?.extraSeconds ?? 0) * 1000 + this.leftoverExtra[playerId];
      } else {
        return this.baseExtraMs + this.leftoverExtra[playerId];
      }
    }

    // For current active player, return their current extra time
    return this.extraTimes[playerId];
  }

  setRemainingTime(playerId: number, timeMs: number): void {
    // Player has main time - update main time
    if (this.times[playerId] > 0) {
      this.times[playerId] = timeMs;
      // When main time runs out, transition to extra time
      if (timeMs <= 0) {
        this.times[playerId] = 0;
        // Set up the extra time - use the appropriate base extra time
        this.extraTimes[playerId] = this.inOvertime[playerId]
          ? this.getCurrentOvertimeConfig(playerId).extraSeconds * 1000
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
      this.overtimeConfigs.length > 0
    ) {
      this.startOvertime(playerId);
    }
    // Se já está em overtime e acabou, passa para o próximo overtime se houver
    else if (
      timeMs <= 0 &&
      this.inOvertime[playerId] &&
      this.overtimeIndex[playerId] < this.overtimeConfigs.length - 1
    ) {
      this.overtimeIndex[playerId]++;
      this.applyOvertimeConfig(playerId);
    }
  }

  startOvertime(playerId: number): void {
    this.inOvertime[playerId] = true;
    this.overtimeIndex[playerId] = 0;
    this.applyOvertimeConfig(playerId);
  }

  applyOvertimeConfig(playerId: number): void {
    const cfg = this.getCurrentOvertimeConfig(playerId);
    this.times[playerId] = (cfg.initialMinutes ?? 5) * 60_000;
    this.extraTimes[playerId] = (cfg.extraSeconds ?? 0) * 1000;
    this.leftoverExtra[playerId] = 0;
    // Reset turn start time tracking for overtime
    if (playerId === this.currentPlayer) {
      this.turnStartMainTime = this.times[playerId];
    }
  }

  getCurrentOvertimeConfig(playerId: number): OvertimeConfig {
    return (
      this.overtimeConfigs[this.overtimeIndex[playerId]] ||
      this.overtimeConfigs[0] || {
        initialMinutes: 5,
        incrementSeconds: 0,
        extraSeconds: 0,
        accumulate: false,
      }
    );
  }

  switchPlayer(): void {
    const p = this.currentPlayer;
    const np = 1 - p;

    // Calculate actual time spent from main time reduction (more accurate)
    let actualTimeSpent = 0;
    if (this.turnStartMainTime > 0 && this.times[p] >= 0) {
      actualTimeSpent = Math.max(0, this.turnStartMainTime - this.times[p]);
    }

    // 1) stash leftover extra time based on accumulate setting
    const extraLeft = this.extraTimes[p];

    const inOT = this.inOvertime[p];
    const otCfg = inOT ? this.getCurrentOvertimeConfig(p) : null;
    // Use different accumulation rules based on whether player is in overtime
    if (inOT) {
      this.leftoverExtra[p] = otCfg?.accumulate ? extraLeft : 0;
    } else {
      this.leftoverExtra[p] = this.accumulateExtra ? extraLeft : 0;
    }

    // 2) figure out if main was still >0 when we switched
    const hadMain = this.times[p] > 0 || this.turnStartMainTime > 0;

    // 3) apply increment only if main was still running
    if (hadMain && this.times[p] > 0) {
      if (!inOT && this.incrementMs > 0) {
        this.times[p] += this.incrementMs;
      } else if (inOT && otCfg && otCfg.incrementSeconds > 0) {
        this.times[p] += otCfg.incrementSeconds * 1000;
      }
    }

    // 4) Transfer time feature - only applies to main time
    if (actualTimeSpent > 0 && hadMain) {
      const shouldTransfer = inOT
        ? otCfg?.transferMainTime
        : this.transferMainTime;

      if (shouldTransfer) {
        // Only transfer if the other player still has main time
        if (this.times[np] > 0) {
          this.times[np] += actualTimeSpent;
        }
      }
    }

    // 5) reset next player's extra clock
    if (this.inOvertime[np]) {
      const nextCfg = this.getCurrentOvertimeConfig(np);
      this.extraTimes[np] =
        (nextCfg.extraSeconds ?? 0) * 1000 + this.leftoverExtra[np];
    } else {
      this.extraTimes[np] = this.baseExtraMs + this.leftoverExtra[np];
    }

    // 6) flip active player and record turn start time
    this.currentPlayer = np;
    this.turnStartMainTime = this.times[np]; // Track main time at start of new turn
  }

  isGameOver(): number | null {
    const isPlayerOutOfTime = (playerId: number): boolean => {
      const noMainTime = this.times[playerId] <= 0;
      const noExtraTime = this.extraTimes[playerId] <= 0;

      const overtimeExhausted =
        this.inOvertime[playerId] &&
        this.overtimeIndex[playerId] >= this.overtimeConfigs.length - 1;

      const noOvertimeAvailable =
        !this.inOvertime[playerId] && this.overtimeConfigs.length === 0;

      return (
        noMainTime && noExtraTime && (overtimeExhausted || noOvertimeAvailable)
      );
    };

    if (isPlayerOutOfTime(0)) return 1;
    if (isPlayerOutOfTime(1)) return 0;

    return null;
  }

  reset(): void {
    this.times = [this.initialTimeMs, this.initialTimeMs];
    this.extraTimes = [this.baseExtraMs, this.baseExtraMs];
    this.leftoverExtra = [0, 0];
    this.inOvertime = [false, false];
    this.overtimeIndex = [0, 0];
    this.currentPlayer = 0;
    this.turnStartMainTime = this.initialTimeMs;
  }

  getConfigParams(): TimerConfigParam[] {
    const params: TimerConfigParam[] = [
      {
        name: 'initialMinutes',
        type: 'number',
        label: 'Tempo inicial (min)',
        defaultValue: 0,
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
        label: 'Transferir tempo gasto',
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
        name: 'numOvertimes',
        type: 'number',
        label: 'Quantidade de overtimes',
        defaultValue: 1,
        minValue: 1,
        maxValue: 10,
        condition: { param: 'overtimeMode', value: 'custom' },
      },
    ];

    for (let i = 0; i < 10; i++) {
      const idx = i + 1;
      params.push(
        {
          name: `ot${idx}InitialMinutes`,
          type: 'number',
          label: `OT${idx}: Tempo inicial (min)`,
          defaultValue: 0,
          minValue: 0,
          maxValue: 180,
          condition: { param: 'overtimeMode', value: 'custom' },
        },
        {
          name: `ot${idx}IncrementSeconds`,
          type: 'number',
          label: `OT${idx}: Incremento (s)`,
          defaultValue: 0,
          minValue: 0,
          maxValue: 60,
          condition: { param: 'overtimeMode', value: 'custom' },
        },
        {
          name: `ot${idx}ExtraSeconds`,
          type: 'number',
          label: `OT${idx}: Tempo extra por jogada (s)`,
          defaultValue: 0,
          minValue: 0,
          maxValue: 60,
          condition: { param: 'overtimeMode', value: 'custom' },
        },
        {
          name: `ot${idx}Accumulate`,
          type: 'select',
          label: `OT${idx}: Acumular tempo extra`,
          defaultValue: false,
          options: [
            { label: 'Não', value: false },
            { label: 'Sim', value: true },
          ],
          condition: { param: 'overtimeMode', value: 'custom' },
        },
        {
          name: `ot${idx}TransferMainTime`,
          type: 'select',
          label: `OT${idx}: Transferir tempo gasto`,
          defaultValue: false,
          options: [
            { label: 'Não', value: false },
            { label: 'Sim', value: true },
          ],
          condition: { param: 'overtimeMode', value: 'custom' },
        },
      );
    }

    return params;
  }

  renderStatus(playerId: number): React.ReactNode {
    const inOvertime = this.inOvertime[playerId];
    const hasMainTime = this.times[playerId] > 0;
    const hasExtraTime = this.extraTimes[playerId] > 0;

    const statusMessages = [];

    if (inOvertime) {
      statusMessages.push(
        `OVERTIME ${this.overtimeIndex[playerId] + 1}/${this.overtimeConfigs.length}`,
      );
    }

    if (hasMainTime) {
      statusMessages.push('Tempo principal');
    } else if (hasExtraTime) {
      statusMessages.push('Tempo extra por jogada');
    }

    if (statusMessages.length === 0) return null;

    const textElements = statusMessages.map((message, index) =>
      React.createElement(
        Text,
        { key: index, style: styles.statusText },
        message,
      ),
    );

    return React.createElement(
      View,
      { style: styles.statusContainer },
      ...textElements,
    );
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
