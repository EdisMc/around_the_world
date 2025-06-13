export const RANDOM_USER_API_URL = "https://randomuser.me/api/?results=5";
export const OPENCAGE_API_URL = "https://api.opencagedata.com/geocode/v1/json";
export const OPEN_METEO_API_URL = "https://api.open-meteo.com/v1/forecast";
export const OPENCAGE_API_KEY = "af4f4b565d4f44edbd8e22fdd711d6cc";

export const USERS_CACHE_KEY = "cachedUsers";
export const CACHE_EXPIRY_MS = 60 * 60 * 1000;
export const AUTO_REFRESH_INTERVAL_MS = 30 * 60 * 1000;

export const weatherCodeMap = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Slight showers",
  81: "Moderate showers",
  82: "Violent showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};