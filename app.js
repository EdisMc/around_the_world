import { loadUsers, refreshUsers } from "./modules/userService.js";
import { renderUsers, refreshWeather } from "./modules/uiRenderer.js";
import { AUTO_REFRESH_INTERVAL_MS, USERS_CACHE_KEY } from "./constants.js";
import { getFromCache } from "./utils/cache.js";

async function init() {
  try {
    const users = await loadUsers();
    renderUsers(users);
  } catch (error) {
    console.error("Error loading users:", error);
  }
}

async function tryRefreshWeather() {
  try {
    const cached = getFromCache(USERS_CACHE_KEY);
    if (cached?.users) {
      await refreshWeather(cached.users);
    }
  } catch (error) {
    console.error("Error refreshing weather:", error);
  }
}

document.getElementById("newUsersBtn").addEventListener("click", async () => {
  try {
    const users = await refreshUsers();
    renderUsers(users);
  } catch (error) {
    console.error("Error refreshing users:", error);
  }
});

document.getElementById("refreshBtn").addEventListener("click", tryRefreshWeather);

init().then(() => {
  setInterval(tryRefreshWeather, AUTO_REFRESH_INTERVAL_MS);
});