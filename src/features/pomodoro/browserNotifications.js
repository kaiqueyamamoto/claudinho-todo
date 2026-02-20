import { POMODORO_STATES } from './pomodoroTypes.js';

export async function requestPomodoroNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  return Notification.requestPermission();
}

export function notifyPomodoroPhaseChange(nextPhase) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  if (nextPhase === POMODORO_STATES.SHORT_BREAK || nextPhase === POMODORO_STATES.LONG_BREAK) {
    new Notification('Hora da pausa!', {
      body: nextPhase === POMODORO_STATES.LONG_BREAK ? 'Pausa longa iniciada.' : 'Pausa curta iniciada.',
    });
    return true;
  }

  if (nextPhase === POMODORO_STATES.FOCUS) {
    new Notification('De volta ao foco!', {
      body: 'Novo ciclo de foco iniciado.',
    });
    return true;
  }

  return false;
}
