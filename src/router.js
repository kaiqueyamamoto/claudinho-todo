import { renderHomePage } from './pages/Home.js';
import { renderPomodoroPage } from './pages/Pomodoro.js';

function getPath() {
  return window.location.hash.replace('#', '') || '/';
}

export function renderRoute() {
  const app = document.getElementById('app');
  const path = getPath();

  if (path === '/pomodoro') {
    renderPomodoroPage(app);
    return;
  }

  renderHomePage(app);
}
