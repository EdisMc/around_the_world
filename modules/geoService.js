import { OPENCAGE_API_KEY } from "../utils/constants.js";
import { fetchWithRetry } from "../utils/fetchWithRetry.js";

export async function getCoordinates(city, country) {
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city + ", " + country)}&key=${OPENCAGE_API_KEY}&limit=1`;

  try {
    const response = await fetchWithRetry(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return {
        lat: data.results[0].geometry.lat,
        lng: data.results[0].geometry.lng,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
}