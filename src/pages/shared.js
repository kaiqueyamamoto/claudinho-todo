export function createNav(currentPath) {
  const nav = document.createElement('nav');
  nav.className = 'nav-shell';

  const home = document.createElement('a');
  home.href = '#/';
  home.textContent = 'Home';
  if (currentPath === '/') home.classList.add('active');

  const pomodoro = document.createElement('a');
  pomodoro.href = '#/pomodoro';
  pomodoro.textContent = 'Pomodoro';
  if (currentPath === '/pomodoro') pomodoro.classList.add('active');

  nav.append(home, pomodoro);
  return nav;
}
