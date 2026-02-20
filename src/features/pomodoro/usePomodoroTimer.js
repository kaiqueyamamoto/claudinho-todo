import {
  createInitialPomodoroSnapshot,
  startPomodoroSession,
  transitionPomodoroPhase,
} from './pomodoroMachine.js';

export function createPomodoroTimer(config, listeners = {}) {
  const onTick = listeners.onTick ?? (() => {});
  const onPhaseChange = listeners.onPhaseChange ?? (() => {});

  let currentConfig = config;
  let snapshot = createInitialPomodoroSnapshot(config);
  let intervalId = null;

  function emit() {
    onTick({ ...snapshot });
  }

  function clearClock() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function tick() {
    if (!snapshot.isRunning) {
      return;
    }

    if (snapshot.remainingSeconds > 0) {
      snapshot = {
        ...snapshot,
        remainingSeconds: snapshot.remainingSeconds - 1,
      };
      emit();
    }

    if (snapshot.remainingSeconds === 0) {
      const previousPhase = snapshot.phase;
      snapshot = transitionPomodoroPhase(snapshot, currentConfig);
      onPhaseChange({ previousPhase, ...snapshot });
      emit();
    }
  }

  function ensureClock() {
    if (!intervalId) {
      intervalId = setInterval(tick, 1000);
    }
  }

  function start() {
    clearClock();
    snapshot = startPomodoroSession(currentConfig);
    emit();
    ensureClock();
  }

  function pause() {
    snapshot = {
      ...snapshot,
      isRunning: false,
    };
    clearClock();
    emit();
  }

  function resume() {
    if (snapshot.phase === 'idle' || snapshot.phase === 'finished') {
      start();
      return;
    }

    snapshot = {
      ...snapshot,
      isRunning: true,
    };
    emit();
    ensureClock();
  }

  function reset() {
    clearClock();
    snapshot = createInitialPomodoroSnapshot(currentConfig);
    emit();
  }

  function updateConfig(nextConfig) {
    currentConfig = nextConfig;
    const resetSnapshot = createInitialPomodoroSnapshot(currentConfig);
    snapshot = {
      ...resetSnapshot,
      completedFocusSessions: snapshot.completedFocusSessions,
    };
    emit();
  }

  function getSnapshot() {
    return { ...snapshot };
  }

  return {
    start,
    pause,
    resume,
    reset,
    updateConfig,
    getSnapshot,
  };
}
