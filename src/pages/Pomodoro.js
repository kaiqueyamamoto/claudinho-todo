import { getPomodoroSettings, updatePomodoroSetting } from '../state/pomodoroSettings.js';
import { createNav } from './shared.js';

const PHASE_LABEL = {
  focus: 'Foco',
  shortBreak: 'Pausa curta',
  longBreak: 'Pausa longa',
};

let timerId = null;
let phase = 'focus';
let running = false;
let completedFocusCycles = 0;
let secondsLeft = 0;

function toSeconds(minutes) {
  return minutes * 60;
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function getPhaseSeconds(settings) {
  if (phase === 'focus') return toSeconds(settings.focusMinutes);
  if (phase === 'shortBreak') return toSeconds(settings.shortBreakMinutes);
  return toSeconds(settings.longBreakMinutes);
}

function stopTimer() {
  running = false;
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function handleCycleEnd(settings, rerender) {
  const previous = phase;
  let next = 'focus';

  if (previous === 'focus') {
    completedFocusCycles += 1;
    next =
      completedFocusCycles % settings.cyclesUntilLongBreak === 0
        ? 'longBreak'
        : 'shortBreak';
  }

  phase = next;
  secondsLeft = getPhaseSeconds(settings);
  stopTimer();
  window.alert(`Ciclo finalizado! Próxima etapa: ${PHASE_LABEL[next]}.`);
  rerender();
}

function startTimer(settings, rerender) {
  if (running) return;
  running = true;

  timerId = window.setInterval(() => {
    if (secondsLeft <= 1) {
      secondsLeft = 0;
      handleCycleEnd(settings, rerender);
      return;
    }

    secondsLeft -= 1;
    rerender();
  }, 1000);
}

export function renderPomodoroPage(container) {
  const settings = getPomodoroSettings();
  if (secondsLeft === 0) {
    secondsLeft = getPhaseSeconds(settings);
  }

  container.innerHTML = '';
  const page = document.createElement('main');
  page.className = 'page';
  page.append(createNav('/pomodoro'));

  const timerCard = document.createElement('section');
  timerCard.className = 'card';
  timerCard.innerHTML = `
    <h1>Pomodoro</h1>
    <p>Etapa atual: ${PHASE_LABEL[phase]}</p>
    <p class="clock">${formatTime(secondsLeft)}</p>
    <div class="row">
      <button class="button" type="button">${running ? 'Pausar' : 'Iniciar'}</button>
      <button class="button ghost" type="button">Reiniciar</button>
    </div>
  `;

  const [toggleBtn, resetBtn] = timerCard.querySelectorAll('button');
  toggleBtn.addEventListener('click', () => {
    if (running) {
      stopTimer();
      renderPomodoroPage(container);
      return;
    }
    startTimer(getPomodoroSettings(), () => renderPomodoroPage(container));
    renderPomodoroPage(container);
  });

  resetBtn.addEventListener('click', () => {
    stopTimer();
    phase = 'focus';
    completedFocusCycles = 0;
    secondsLeft = toSeconds(getPomodoroSettings().focusMinutes);
    renderPomodoroPage(container);
  });

  const settingsCard = document.createElement('section');
  settingsCard.className = 'card';
  settingsCard.innerHTML = `
    <h2>Configurações</h2>
    <div class="settings-grid">
      <label>Foco (min)
        <input min="1" name="focusMinutes" type="number" value="${settings.focusMinutes}" />
      </label>
      <label>Pausa curta (min)
        <input min="1" name="shortBreakMinutes" type="number" value="${settings.shortBreakMinutes}" />
      </label>
      <label>Pausa longa (min)
        <input min="1" name="longBreakMinutes" type="number" value="${settings.longBreakMinutes}" />
      </label>
      <label>Ciclos até pausa longa
        <input min="1" name="cyclesUntilLongBreak" type="number" value="${settings.cyclesUntilLongBreak}" />
      </label>
    </div>
  `;

  settingsCard.querySelectorAll('input').forEach((input) => {
    input.addEventListener('change', (event) => {
      const { name, value } = event.target;
      const parsed = Number(value);
      if (!parsed || parsed < 1) {
        renderPomodoroPage(container);
        return;
      }
      updatePomodoroSetting(name, parsed);
      if (!running) {
        secondsLeft = getPhaseSeconds(getPomodoroSettings());
      }
      renderPomodoroPage(container);
    });
  });

  page.append(timerCard, settingsCard);
  container.append(page);
}
