const STORAGE_KEY = "activities";

const form = document.querySelector("#activity-form");
const todayList = document.querySelector("#today-list");
const longestList = document.querySelector("#longest-list");
const clearStorageButton = document.querySelector("#clear-storage");

function getActivities() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveActivities(activities) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString("pt-BR");
}

function durationInMinutes(startedAt, endedAt) {
  return Math.max(0, Math.round((new Date(endedAt) - new Date(startedAt)) / 60000));
}

function isToday(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function render() {
  const activities = getActivities();

  const todayActivities = activities
    .filter((activity) => isToday(activity.endedAt))
    .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt));

  todayList.innerHTML = "";
  if (!todayActivities.length) {
    todayList.innerHTML = "<li>Nenhuma atividade concluída hoje.</li>";
  } else {
    todayActivities.forEach((activity) => {
      const item = document.createElement("li");
      item.innerHTML = `
        <strong>${activity.title}</strong>
        <div class="meta">Início: ${formatDate(activity.startedAt)} | Fim: ${formatDate(activity.endedAt)}</div>
        <div class="meta">Duração: ${activity.durationMinutes} min</div>
      `;
      todayList.appendChild(item);
    });
  }

  const longestActivities = [...activities]
    .sort((a, b) => b.durationMinutes - a.durationMinutes)
    .slice(0, 5);

  longestList.innerHTML = "";
  if (!longestActivities.length) {
    longestList.innerHTML = "<li>Sem atividades registradas.</li>";
  } else {
    longestActivities.forEach((activity, index) => {
      const item = document.createElement("li");
      item.innerHTML = `
        <strong>#${index + 1} ${activity.title}</strong>
        <div class="meta">Duração: ${activity.durationMinutes} min</div>
        <div class="meta">Concluída em: ${formatDate(activity.endedAt)}</div>
      `;
      longestList.appendChild(item);
    });
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const title = formData.get("title")?.toString().trim();
  const startedAt = formData.get("startedAt")?.toString();
  const endedAt = formData.get("endedAt")?.toString();

  if (!title || !startedAt || !endedAt) {
    return;
  }

  const durationMinutes = durationInMinutes(startedAt, endedAt);
  const activities = getActivities();

  activities.push({
    id: crypto.randomUUID(),
    title,
    startedAt,
    endedAt,
    durationMinutes,
  });

  saveActivities(activities);
  form.reset();
  render();
});

clearStorageButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  render();
});

render();
