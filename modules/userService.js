import { CACHE_KEY, CACHE_EXPIRY_MS } from "../utils/constants.js";
import { getCoordinates } from "./geoService.js";
import { getWeather } from "./weatherService.js";

let currentUsers = [];

export async function loadUsers(forceRefresh = false) {
  const cached = localStorage.getItem(CACHE_KEY);
  const now = Date.now();

  if (!forceRefresh && cached) {
    const { timestamp, users } = JSON.parse(cached);
    if (now - timestamp < CACHE_EXPIRY_MS) {
      console.log("Loaded users from localStorage");
      currentUsers = users;
      return users;
    }
  }

  try {
    const response = await fetch("https://randomuser.me/api/?results=5");
    if (!response.ok) throw new Error("Failed to fetch users");
    const data = await response.json();
    const users = data.results;

    for (const user of users) {
      const coords = await getCoordinates(
        user.location.city,
        user.location.country
      );

      let weatherInfo = {
        temperature: "-",
        humidity: "-",
        condition: "Unknown",
      };
      if (coords) {
        const weather = await getWeather(coords.lat, coords.lng);
        if (weather) {
          weatherInfo = weather;
        }
      }
      user.weatherInfo = weatherInfo;
    }

    currentUsers = users;

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: now,
        users,
      })
    );

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export function getCurrentUsers() {
  return currentUsers;
}