export const POMODORO_STATES = Object.freeze({
  IDLE: 'idle',
  FOCUS: 'focus',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
  FINISHED: 'finished',
});

export function isValidPomodoroState(state) {
  return Object.values(POMODORO_STATES).includes(state);
}

export function getPomodoroStateLabel(state) {
  const labels = {
    [POMODORO_STATES.IDLE]: 'Parado',
    [POMODORO_STATES.FOCUS]: 'Foco',
    [POMODORO_STATES.SHORT_BREAK]: 'Pausa curta',
    [POMODORO_STATES.LONG_BREAK]: 'Pausa longa',
    [POMODORO_STATES.FINISHED]: 'Finalizado',
  };

  return labels[state] ?? 'Desconhecido';
}
