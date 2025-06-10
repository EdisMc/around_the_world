const OPENCAGE_API_KEY = "af4f4b565d4f44edbd8e22fdd711d6cc";
const userContainer = document.getElementById("userContainer");
const CACHE_KEY = "cachedUsers";
const CACHE_EXPIRY_MS = 30 * 60 * 1000; 

const weatherCodeMap = {
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

async function fetchWithRetry(url, options = {}, retries = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Fetch attempt ${attempt} for ${url}`);
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      console.warn(`Attempt ${attempt} failed: ${error.message}`);
      if (attempt === retries) {
        throw error;
      }
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
}

async function getCoordinates(city, country) {
  const location = encodeURIComponent(`${city}, ${country}`);
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${location}&key=${OPENCAGE_API_KEY}`;

  try {
    const response = await fetchWithRetry(url, {}, 3, 1000);
    const data = await response.json();

    if (data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry;
      return { lat, lng };
    } else {
      console.warn(`No coordinates found for ${city}, ${country}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
}

async function getWeather(lat, lng) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=relativehumidity_2m&timezone=auto`;

  try {
    const response = await fetchWithRetry(url, {}, 3, 1000);
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

function renderUserCard(user) {
  const card = document.createElement("div");
  card.className = "user-card";

  const weather = user.weatherInfo || {
    temperature: "-",
    humidity: "-",
    condition: "Unknown",
  };

  card.innerHTML = `
    <img src="${user.picture.large}" alt="Profile photo">
    <h3>${user.name.first} ${user.name.last}</h3><br>
    <p>${user.location.city}, ${user.location.country}</p><br>
    <div class="weather-info">
      <p>Temperature: ${weather.temperature}°C</p>
      <p>Humidity: ${weather.humidity}%</p>
      <p>Condition: ${weather.condition}</p>
    </div>
  `;

  userContainer.appendChild(card);
}

async function loadUsers(forceRefresh = false) {
  const cached = localStorage.getItem(CACHE_KEY);
  const now = Date.now();

  if (!forceRefresh && cached) {
    const { timestamp, users } = JSON.parse(cached);
    if (now - timestamp < CACHE_EXPIRY_MS) {
      console.log("Loaded users from localStorage");
      currentUsers = users;
      userContainer.innerHTML = "";
      users.forEach(renderUserCard);
      return;
    }
  }

  userContainer.innerHTML = "Loading users...";
  try {
    const response = await fetch("https://randomuser.me/api/?results=5");
    const data = await response.json();
    const users = data.results;

    for (const user of users) {
      const coords = await getCoordinates(user.location.city, user.location.country);

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
        users: users,
      })
    );

    userContainer.innerHTML = "";
    users.forEach(renderUserCard);
  } catch (error) {
    userContainer.innerHTML = "Failed to load users.";
    console.error("Error fetching users:", error);
  }
}

async function refreshWeather() {
  const cards = document.querySelectorAll(".user-card");

  for (let i = 0; i < currentUsers.length; i++) {
    const user = currentUsers[i];
    const card = cards[i];
    const weatherInfo = card.querySelector(".weather-info");

    weatherInfo.innerText = "Refreshing...";

    setTimeout(async () => {
      const coords = await getCoordinates(user.location.city, user.location.country);
      const weather = coords ? await getWeather(coords.lat, coords.lng) : null;

      if (weather) {
        weatherInfo.innerHTML = `
          <p>Temperature: ${weather.temperature}°C</p>
          <p>Humidity: ${weather.humidity}%</p>
          <p>Condition: ${weather.condition}</p>
        `;

        user.weatherInfo = weather;

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            timestamp: Date.now(),
            users: currentUsers,
          })
        );
      } else {
        weatherInfo.innerText = "Weather unavailable";
      }
    }, 10000);
  }
}

loadUsers();

setInterval(refreshWeather, 30 * 60 * 1000);

document.getElementById("refreshBtn").addEventListener("click", refreshWeather);
document.getElementById("newUsersBtn").addEventListener("click", () => loadUsers(true));