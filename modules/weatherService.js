import { OPEN_METEO_API_URL, weatherCodeMap } from "../utils/constants.js";
import { fetchWithRetry } from "../utils/fetchWithRetry.js";

export async function getWeather(lat, lng) {
  const url = `${OPEN_METEO_API_URL}?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=relativehumidity_2m&timezone=auto`;
  try {
    const response = await fetchWithRetry(url);
    const data = await response.json();

    const weather = data.current_weather;
    const condition = weatherCodeMap[weather.weathercode] || "Unknown";
    const humidity = data.hourly.relativehumidity_2m?.[0] ?? "-";

    return {
      temperature: weather.temperature,
      humidity,
      condition,
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null;
  }
}