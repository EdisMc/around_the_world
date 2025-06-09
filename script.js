const OPENCAGE_API_KEY = "af4f4b565d4f44edbd8e22fdd711d6cc";

const userContainer = document.getElementById("userContainer");

async function loadUsers() {
  userContainer.innerHTML = "Loading users...";
  try {
    const response = await fetch("https://randomuser.me/api/?results=5");
    const data = await response.json();
    const users = data.results;

    userContainer.innerHTML = "";
    for (const user of users) {
      const coords = await getCoordinates(
        user.location.city,
        user.location.country
      );

      const card = document.createElement("div");
      card.className = "user-card";

      card.innerHTML = `
        <img src="${user.picture.large}" alt="Profile photo">
        <h3>${user.name.first} ${user.name.last}</h3>
        <p>${user.location.city}, ${user.location.country}</p>
        <p><strong>Lat:</strong> ${
          coords?.lat?.toFixed(2) ?? "?"
        }, <strong>Lng:</strong> ${coords?.lng?.toFixed(2) ?? "?"}</p>
    `;

      userContainer.appendChild(card);
    }
  } catch (error) {
    userContainer.innerHTML = "Failed to load users.";
    console.error("Error fetching users:", error);
  }
}

loadUsers();

async function getCoordinates(city, country) {
  const location = encodeURIComponent(`${city}, ${country}`);
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${location}&key=${OPENCAGE_API_KEY}`;

  try {
    const response = await fetch(url);
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