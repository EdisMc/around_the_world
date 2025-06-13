import { RANDOM_USER_API_URL, USERS_CACHE_KEY, CACHE_EXPIRY_MS } from "../constants.js";
import { getCoordinates } from "./geoService.js";
import { getWeather } from "./weatherService.js";
import { saveToCache, getFromCache } from "../utils/cache.js";

export async function loadUsers() {
  const cached = getFromCache(USERS_CACHE_KEY);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_EXPIRY_MS) {
    console.log("Loaded users from cache.");
    return cached.users;
  }

  return await fetchAndCacheUsers();
}

export async function refreshUsers() {
  return await fetchAndCacheUsers();
}

async function fetchAndCacheUsers() {
  const response = await fetch(`${RANDOM_USER_API_URL}`);
  if (!response.ok) throw new Error("Failed to fetch users!");

  const data = await response.json();
  const users = data.results;

  for (const user of users) {
    const coordinates = await getCoordinates(user.location.city, user.location.country);
    let weatherInfo = { temperature: "-", humidity: "-", condition: "Unknown" };

    if (coordinates) {
      const weather = await getWeather(coordinates.lat, coordinates.lng);
      if (weather) weatherInfo = weather;
    }

    user.weatherInfo = weatherInfo;
  }

  saveToCache(USERS_CACHE_KEY, { timestamp: Date.now(), users });
  return users;
}