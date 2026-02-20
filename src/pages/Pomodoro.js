import {
  DEFAULT_POMODORO_CONFIG,
  validatePomodoroConfig,
} from '../features/pomodoro/pomodoroConfig.js';
import {
  notifyPomodoroPhaseChange,
  requestPomodoroNotificationPermission,
} from '../features/pomodoro/browserNotifications.js';
import { createPomodoroTimer } from '../features/pomodoro/usePomodoroTimer.js';
import { getPomodoroStateLabel, POMODORO_STATES } from '../features/pomodoro/pomodoroTypes.js';

const POMODORO_STORAGE_KEY = 'pomodoro-config';

function formatSeconds(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function loadConfig() {
  const raw = localStorage.getItem(POMODORO_STORAGE_KEY);
  if (!raw) {
    return { ...DEFAULT_POMODORO_CONFIG };
  }

  try {
    return validatePomodoroConfig(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_POMODORO_CONFIG };
  }
}

function saveConfig(config) {
  localStorage.setItem(POMODORO_STORAGE_KEY, JSON.stringify(config));
}

function playFallbackBeep() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  const audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 880;
  gainNode.gain.value = 0.1;

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.15);
}

export function initPomodoroPage() {
  const counter = document.getElementById('pomodoro-counter');
  const currentState = document.getElementById('pomodoro-state');
  const cycleCounter = document.getElementById('pomodoro-cycle');
  const warning = document.getElementById('pomodoro-notification-warning');
  const form = document.getElementById('pomodoro-config-form');

  const startBtn = document.getElementById('pomodoro-start');
  const pauseBtn = document.getElementById('pomodoro-pause');
  const resumeBtn = document.getElementById('pomodoro-resume');
  const resetBtn = document.getElementById('pomodoro-reset');
  const notifyBtn = document.getElementById('pomodoro-enable-notifications');

  let config = loadConfig();

  const timer = createPomodoroTimer(config, {
    onTick: render,
    onPhaseChange: ({ phase }) => {
      const notified = notifyPomodoroPhaseChange(phase);
      if (!notified && phase !== POMODORO_STATES.FINISHED) {
        warning.classList.remove('d-none');
        playFallbackBeep();
      }
    },
  });

  function syncFormValues() {
    form.focusDuration.value = config.focusDuration;
    form.shortBreakDuration.value = config.shortBreakDuration;
    form.longBreakDuration.value = config.longBreakDuration;
    form.cyclesBeforeLongBreak.value = config.cyclesBeforeLongBreak;
  }

  function render(snapshot = timer.getSnapshot()) {
    counter.textContent = formatSeconds(snapshot.remainingSeconds);
    currentState.textContent = getPomodoroStateLabel(snapshot.phase);

    const cycleProgress = snapshot.completedFocusSessions % config.cyclesBeforeLongBreak;
    cycleCounter.textContent = `${cycleProgress}/${config.cyclesBeforeLongBreak}`;

    const isActive = snapshot.phase !== POMODORO_STATES.IDLE && snapshot.phase !== POMODORO_STATES.FINISHED;
    pauseBtn.disabled = !snapshot.isRunning;
    resumeBtn.disabled = snapshot.isRunning || !isActive;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    config = validatePomodoroConfig({
      focusDuration: form.focusDuration.value,
      shortBreakDuration: form.shortBreakDuration.value,
      longBreakDuration: form.longBreakDuration.value,
      cyclesBeforeLongBreak: form.cyclesBeforeLongBreak.value,
    });

    saveConfig(config);
    timer.updateConfig(config);
    syncFormValues();
  });

  startBtn.addEventListener('click', () => timer.start());
  pauseBtn.addEventListener('click', () => timer.pause());
  resumeBtn.addEventListener('click', () => timer.resume());
  resetBtn.addEventListener('click', () => timer.reset());

  notifyBtn.addEventListener('click', async () => {
    const permission = await requestPomodoroNotificationPermission();
    if (permission === 'granted') {
      warning.classList.add('d-none');
    } else {
      warning.classList.remove('d-none');
    }
  });

  warning.classList.toggle('d-none', !('Notification' in window) || Notification.permission === 'granted');
  syncFormValues();
  render();
}
