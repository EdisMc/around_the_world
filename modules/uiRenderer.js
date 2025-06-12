import { getCoordinates } from "./geoService.js";
import { getWeather } from "./weatherService.js";
import { CACHE_KEY, WEATHER_REFRESH_DELAY_MS } from "../utils/constants.js";

export function renderUsers(users) {
  const container = document.getElementById("userContainer");
  container.innerHTML = "";

  users.forEach(user => {
    const card = document.createElement("div");
    card.className = "user-card";

    const img = document.createElement("img");
    img.src = user.picture.large;
    img.alt = `${user.name.first} ${user.name.last}`;

    const name = document.createElement("h3");
    name.textContent = `${user.name.first} ${user.name.last}`;

    const location = document.createElement("p");
    location.textContent = `${user.location.city}, ${user.location.country}`;

    const weatherDiv = document.createElement("div");
    weatherDiv.className = "weather-info";
    weatherDiv.innerHTML = `
      <p>Temperature: ${user.weatherInfo.temperature}°C</p>
      <p>Humidity: ${user.weatherInfo.humidity}%</p>
      <p>Condition: ${user.weatherInfo.condition}</p>
    `;

    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(location);
    card.appendChild(weatherDiv);

    container.appendChild(card);
  });
}

export async function refreshWeather(users) {
  const cards = document.querySelectorAll(".user-card");

  cards.forEach(card => {
    const weatherInfo = card.querySelector(".weather-info");
    if (weatherInfo) {
      weatherInfo.innerText = "Refreshing...";
    }
  });

  await new Promise(resolve => setTimeout(resolve, WEATHER_REFRESH_DELAY_MS));

  const weatherPromises = users.map(async (user, i) => {
    const coordinates = await getCoordinates(user.location.city, user.location.country);
    const weather = coordinates && await getWeather(coordinates.lat, coordinates.lng);

    const card = cards[i];
    const weatherInfo = card.querySelector(".weather-info");

    if (weather) {
      weatherInfo.innerHTML = `
        <p>Temperature: ${weather.temperature}°C</p>
        <p>Humidity: ${weather.humidity}%</p>
        <p>Condition: ${weather.condition}</p>
      `;
      user.weatherInfo = weather;
    } else {
      weatherInfo.innerText = "Weather unavailable";
    }
  });

  await Promise.all(weatherPromises);

  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      timestamp: Date.now(),
      users: users,
    })
  );
}