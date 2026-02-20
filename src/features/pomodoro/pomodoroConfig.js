const MINUTES_LIMITS = {
  min: 1,
  max: 120,
};

const CYCLE_LIMITS = {
  min: 1,
  max: 12,
};

export const DEFAULT_POMODORO_CONFIG = Object.freeze({
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  cyclesBeforeLongBreak: 4,
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toSafeInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function validatePomodoroConfig(input = {}) {
  return {
    focusDuration: clamp(
      toSafeInt(input.focusDuration, DEFAULT_POMODORO_CONFIG.focusDuration),
      MINUTES_LIMITS.min,
      MINUTES_LIMITS.max
    ),
    shortBreakDuration: clamp(
      toSafeInt(input.shortBreakDuration, DEFAULT_POMODORO_CONFIG.shortBreakDuration),
      MINUTES_LIMITS.min,
      MINUTES_LIMITS.max
    ),
    longBreakDuration: clamp(
      toSafeInt(input.longBreakDuration, DEFAULT_POMODORO_CONFIG.longBreakDuration),
      MINUTES_LIMITS.min,
      MINUTES_LIMITS.max
    ),
    cyclesBeforeLongBreak: clamp(
      toSafeInt(input.cyclesBeforeLongBreak, DEFAULT_POMODORO_CONFIG.cyclesBeforeLongBreak),
      CYCLE_LIMITS.min,
      CYCLE_LIMITS.max
    ),
  };
}
