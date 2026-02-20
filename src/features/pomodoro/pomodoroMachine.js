import { POMODORO_STATES } from './pomodoroTypes.js';

function toSeconds(minutes) {
  return minutes * 60;
}

function durationForState(state, config) {
  if (state === POMODORO_STATES.FOCUS) {
    return toSeconds(config.focusDuration);
  }

  if (state === POMODORO_STATES.SHORT_BREAK) {
    return toSeconds(config.shortBreakDuration);
  }

  if (state === POMODORO_STATES.LONG_BREAK) {
    return toSeconds(config.longBreakDuration);
  }

  return 0;
}

export function createInitialPomodoroSnapshot(config) {
  return {
    phase: POMODORO_STATES.IDLE,
    remainingSeconds: toSeconds(config.focusDuration),
    isRunning: false,
    completedFocusSessions: 0,
  };
}

export function startPomodoroSession(config) {
  return {
    phase: POMODORO_STATES.FOCUS,
    remainingSeconds: durationForState(POMODORO_STATES.FOCUS, config),
    isRunning: true,
    completedFocusSessions: 0,
  };
}

export function transitionPomodoroPhase(snapshot, config) {
  const { phase, completedFocusSessions } = snapshot;

  if (phase === POMODORO_STATES.FOCUS) {
    const nextCompleted = completedFocusSessions + 1;
    const shouldLongBreak = nextCompleted % config.cyclesBeforeLongBreak === 0;
    const nextPhase = shouldLongBreak ? POMODORO_STATES.LONG_BREAK : POMODORO_STATES.SHORT_BREAK;

    return {
      phase: nextPhase,
      remainingSeconds: durationForState(nextPhase, config),
      isRunning: true,
      completedFocusSessions: nextCompleted,
    };
  }

  if (phase === POMODORO_STATES.SHORT_BREAK || phase === POMODORO_STATES.LONG_BREAK) {
    return {
      phase: POMODORO_STATES.FOCUS,
      remainingSeconds: durationForState(POMODORO_STATES.FOCUS, config),
      isRunning: true,
      completedFocusSessions,
    };
  }

  return {
    phase: POMODORO_STATES.FINISHED,
    remainingSeconds: 0,
    isRunning: false,
    completedFocusSessions,
  };
}
