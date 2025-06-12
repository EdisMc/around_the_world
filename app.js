import { loadUsers, loadNewUsers, getCurrentUsers } from "./modules/userService.js";
import { renderUsers, refreshWeather } from "./modules/uiRenderer.js";
import { AUTO_REFRESH_INTERVAL_MS } from "./utils/constants.js";

let users = [];

async function init() {
  try {
    users = await loadUsers();
    renderUsers(users);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

document.getElementById("newUsersBtn").addEventListener("click", async () => {
  try {
    users = await loadNewUsers();
    renderUsers(users);
  } catch (error) {
    console.error("Error fetching new users:", error);
  }
});

document.getElementById("refreshBtn").addEventListener("click", async () => {
  try {
    const currentUsers = getCurrentUsers();
    await refreshWeather(currentUsers);
  } catch (error) {
    console.error("Error refreshing weather:", error);
  }
});

init().then(() => {
  setInterval(async () => {
    try {
      const currentUsers = getCurrentUsers();
      await refreshWeather(currentUsers);
    } catch (error) {
      console.error("Error auto-refreshing weather:", error);
    }
  }, AUTO_REFRESH_INTERVAL_MS);
});