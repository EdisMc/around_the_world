import { RANDOM_USER_API_URL, CACHE_KEY, CACHE_EXPIRY_MS, USER_COUNT } from "../utils/constants.js";
import { getCoordinates } from "./geoService.js";
import { getWeather } from "./weatherService.js";

let currentUsers = [];

export async function loadNewUsers() {
  try {
    const response = await fetch(`${RANDOM_USER_API_URL}?results=${USER_COUNT}`);
    if (!response.ok) throw new Error("Failed to fetch users");
    const data = await response.json();
    const users = data.results;

    for (const user of users) {
      const coordinates = await getCoordinates(user.location.city, user.location.country);

      let weatherInfo = {
        temperature: "-",
        humidity: "-",
        condition: "Unknown",
      };

      if (coordinates) {
        const weather = await getWeather(coordinates.lat, coordinates.lng);
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
        timestamp: Date.now(),
        users,
      })
    );

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function loadUsers() {
  const cached = localStorage.getItem(CACHE_KEY);
  const now = Date.now();

  if (cached) {
    const { timestamp, users } = JSON.parse(cached);
    if (now - timestamp < CACHE_EXPIRY_MS) {
      console.log("Loaded users from localStorage");
      currentUsers = users;
      return users;
    }
  }

  return await loadNewUsers();
}

export function getCurrentUsers() {
  return currentUsers;
}