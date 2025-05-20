import { TimerStrategy, TimerConfigParam } from './TimerStrategy';

type OvertimeType = 'none' | 'same' | 'custom';

export class CustomStrategy implements TimerStrategy {
  static readonly name = 'Personalizado Avançado';
  static readonly description =
    'Main time + increment + per move extra (accumulable) + optional overtime';

  initialTimeMs: number;
  incrementMs: number; // per move
  baseExtraMs: number; // per‐move clock
  accumulateExtra: boolean;
  overtimeType: OvertimeType;
  otInitialMs: number;
  otIncrementMs: number;
  otBaseExtraMs: number;
  otAccumulateExtra: boolean;

  // state
  mainTimes = [0, 0];
  extraTimes = [0, 0];
  leftoverExtra = [0, 0];
  inOvertime = [false, false];
  otTimes = [0, 0];
  currentPlayer = 0;

  constructor(
    initialMinutes: number = 0,
    incrementSeconds: number = 0,
    extraSeconds: number = 0,
    accumulate: boolean = false,
    overtimeType: OvertimeType = 'none',
    otInitialMinutes: number = 0,
    otIncrementSeconds: number = 0,
    otExtraSeconds: number = 0,
    otAccumulate: boolean = false,
  ) {
    // this.initialTimeMs = initialMinutes * 60_000;
    this.initialTimeMs = 0.2 * 60_000;
    this.incrementMs = incrementSeconds * 1_000;
    this.baseExtraMs = extraSeconds * 1_000;
    this.accumulateExtra = accumulate;

    this.overtimeType = overtimeType;

    if (overtimeType === 'none') {
      this.otInitialMs = 0;
      this.otIncrementMs = 0;
      this.otBaseExtraMs = 0;
      this.otAccumulateExtra = false;
    } else if (overtimeType === 'same') {
      this.otInitialMs = this.initialTimeMs;
      this.otIncrementMs = this.incrementMs;
      this.otBaseExtraMs = this.baseExtraMs;
      this.otAccumulateExtra = this.accumulateExtra;
    } else {
      this.otInitialMs = otInitialMinutes * 60_000;
      this.otIncrementMs = otIncrementSeconds * 1_000;
      this.otBaseExtraMs = otExtraSeconds * 1_000;
      this.otAccumulateExtra = otAccumulate;
    }

    this.reset();
  }

  getRemainingTime(playerId: number): number {
    // Handle overtime case first
    if (this.inOvertime[playerId]) {
      return this.otTimes[playerId];
    }

    // If this player has main time, return that
    if (this.mainTimes[playerId] > 0) {
      return this.mainTimes[playerId];
    }

    // If player has no main time, calculate their proper extra time
    // For non-active player, we need to make sure to show the correct next-turn time
    if (playerId !== this.currentPlayer) {
      // Return what their extra time will be when it's their turn again
      return this.baseExtraMs + this.leftoverExtra[playerId];
    }

    // For current active player, return their current extra time
    return this.extraTimes[playerId];
  }

  setRemainingTime(playerId: number, timeMs: number): void {
    // Already in overtime - just update overtime time
    if (this.inOvertime[playerId]) {
      this.otTimes[playerId] = timeMs;
      // Check if overtime has expired
      if (timeMs <= 0) {
        this.otTimes[playerId] = 0;
      }
      return;
    }

    // Player has main time - update main time
    if (this.mainTimes[playerId] > 0) {
      this.mainTimes[playerId] = timeMs;
      // When main time runs out, ALWAYS transition to extra time first
      if (timeMs <= 0) {
        this.mainTimes[playerId] = 0;
        // Set up the extra time regardless of overtime settings
        this.extraTimes[playerId] =
          this.baseExtraMs + this.leftoverExtra[playerId];
      }
      return;
    }

    // No main time left, using extra time
    this.extraTimes[playerId] = timeMs;

    // If extra time has run out, consider transitioning to overtime
    if (timeMs <= 0) {
      this.extraTimes[playerId] = 0;
      // Only enter overtime if it's enabled (not 'none')
      if (this.overtimeType !== 'none') {
        this.inOvertime[playerId] = true;
        // Initialize overtime timers
        const init =
          this.overtimeType === 'same' ? this.initialTimeMs : this.otInitialMs;
        this.otTimes[playerId] = init;
      }
    }
  }

  switchPlayer(): void {
    const p = this.currentPlayer;
    // 1) stash leftover extra
    const extraLeft = this.extraTimes[p];
    this.leftoverExtra[p] = this.accumulateExtra ? extraLeft : 0;

    // 2) figure out if main was still >0 when we switched
    const hadMain = this.mainTimes[p] > 0;

    // 3) apply increment only if main was still running
    if (this.incrementMs > 0 && hadMain && !this.inOvertime[p]) {
      this.mainTimes[p] += this.incrementMs;
    }
    //   —or if you’re in overtime, apply OT increment logic
    else if (this.incrementMs > 0 && this.inOvertime[p]) {
      const inc =
        this.overtimeType === 'same' ? this.incrementMs : this.otIncrementMs;
      this.otTimes[p] += inc;
    }

    // 4) reset next player's extra clock
    const np = 1 - p;
    this.extraTimes[np] = this.baseExtraMs + this.leftoverExtra[np];

    // 5) flip active player
    this.currentPlayer = np;
  }

  isGameOver(): boolean {
    // game over if both main & extra are zero and no overtime, or overtime expired
    for (let i = 0; i < 2; i++) {
      if (!this.inOvertime[i]) {
        if (this.mainTimes[i] <= 0 && this.extraTimes[i] <= 0) return true;
      } else {
        if (this.otTimes[i] <= 0) return true;
      }
    }
    return false;
  }

  reset(): void {
    this.mainTimes = [this.initialTimeMs, this.initialTimeMs];
    this.extraTimes = [this.baseExtraMs, this.baseExtraMs];
    this.leftoverExtra = [0, 0];
    this.inOvertime = [false, false];
    this.otTimes = [this.otInitialMs, this.otInitialMs];

    this.currentPlayer = 0;
  }

  getConfigParams(): TimerConfigParam[] {
    return [
      {
        name: 'initialMinutes',
        type: 'number',
        label: 'Main (min)',
        defaultValue: 0,
        minValue: 0,
      },
      {
        name: 'incrementSeconds',
        type: 'number',
        label: 'Increment (s)',
        defaultValue: 0,
        minValue: 0,
      },
      {
        name: 'extraSeconds',
        type: 'number',
        label: 'Extra per move (s)',
        defaultValue: 0,
        minValue: 0,
      },
      {
        name: 'accumulate',
        type: 'select',
        label: 'Accumulate extra',
        defaultValue: false,
        options: [
          { label: 'Off', value: false },
          { label: 'On', value: true },
        ],
      },
      {
        name: 'overtimeType',
        type: 'select',
        label: 'Overtime (0=none,1=same,2=custom)',
        defaultValue: 0,
        options: [
          { label: 'Desligado', value: 'none' },
          { label: 'Igual principal', value: 'same' },
          { label: 'Customizado', value: 'custom' },
        ],
      },
      {
        name: 'otInitialMinutes',
        type: 'number',
        label: 'OT Main (min)',
        defaultValue: 0,
        minValue: 0,
      },
      {
        name: 'otIncrementSec',
        type: 'number',
        label: 'OT Increment (s)',
        defaultValue: 0,
        minValue: 0,
      },
      {
        name: 'otExtraSec',
        type: 'number',
        label: 'OT Extra (s)',
        defaultValue: 0,
        minValue: 0,
      },
      {
        name: 'otAccumulate',
        type: 'select',
        label: 'OT Accumulate extra',
        defaultValue: false,
        options: [
          { label: 'Off', value: false },
          { label: 'On', value: true },
        ],
      },
    ];
  }
}
