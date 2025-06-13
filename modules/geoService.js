import { OPENCAGE_API_URL, OPENCAGE_API_KEY } from "../constants.js";
import { fetchWithRetry } from "../utils/fetchWithRetry.js";

export async function getCoordinates(city, country) {
  const query = `${city}, ${country}`;
  const url = `${OPENCAGE_API_URL}?q=${encodeURIComponent(query)}&key=${OPENCAGE_API_KEY}&limit=1`;

  try {
    const response = await fetchWithRetry(url);
    const data = await response.json();

    if (data.results.length) {
      const { lat, lng } = data.results[0].geometry;
      return {
        lat , lng,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
}