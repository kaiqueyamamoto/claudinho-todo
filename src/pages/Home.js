import { createNav } from './shared.js';

export function renderHomePage(container) {
  container.innerHTML = '';

  const page = document.createElement('main');
  page.className = 'page';
  page.append(createNav('/'));

  const card = document.createElement('section');
  card.className = 'card';
  card.innerHTML = `
    <h1>Claudinho Todo</h1>
    <p>Base inicial do frontend criada com navegação entre Home e Pomodoro.</p>
    <a class="button" href="#/pomodoro">Ir para o Pomodoro</a>
  `;

  page.append(card);
  container.append(page);
}
