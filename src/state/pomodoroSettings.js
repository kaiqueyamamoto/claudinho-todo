const STORAGE_KEY = 'pomodoro-settings';

const defaultSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesUntilLongBreak: 4,
};

export function getPomodoroSettings() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
}

export function updatePomodoroSetting(name, value) {
  const current = getPomodoroSettings();
  const next = { ...current, [name]: value };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
