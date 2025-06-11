import { loadUsers, getCurrentUsers } from "./modules/userService.js";
import { renderUsers, refreshWeather } from "./modules/uiRenderer.js";

let users = [];

async function loadAndRenderUsers(forceRefresh = false) {
  users = await loadUsers(forceRefresh);
  renderUsers(users);
}

document.getElementById("newUsersBtn").addEventListener("click", async () => {
  await loadAndRenderUsers(true);
});

document.getElementById("refreshBtn").addEventListener("click", async () => {
  const users = getCurrentUsers();
  await refreshWeather(users);
});

loadAndRenderUsers();