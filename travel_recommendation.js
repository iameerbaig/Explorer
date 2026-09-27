// Task 6: Fetch travel recommendation data from the JSON "API"
let travelData = null;

fetch("travel_recommendation_api.json")
  .then((response) => response.json())
  .then((data) => {
    travelData = data;
    console.log("Travel recommendation data loaded:", data);
  })
  .catch((error) => {
    console.log("Could not load travel recommendation data:", error);
  });

// Maps a country name to an IANA time zone for the Task 10 bonus feature.
const COUNTRY_TIME_ZONES = {
  Australia: "Australia/Sydney",
  Japan: "Asia/Tokyo",
  Brazil: "America/Sao_Paulo",
};

function getCountryLocalTime(countryName) {
  const timeZone = COUNTRY_TIME_ZONES[countryName];
  if (!timeZone) return null;

  const options = {
    timeZone,
    hour12: true,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  return new Date().toLocaleTimeString("en-US", options);
}

// Task 7: Normalize and interpret the user's search keyword
function getSearchCategory(rawKeyword) {
  const keyword = rawKeyword.trim().toLowerCase();

  if (!keyword) return { type: "empty" };
  if (keyword.includes("beach")) return { type: "beaches" };
  if (keyword.includes("temple")) return { type: "temples" };
  if (keyword.includes("countr")) return { type: "countries" };

  const matchedCountry = travelData
    ? travelData.countries.find((country) =>
        country.name.toLowerCase().includes(keyword)
      )
    : null;

  if (matchedCountry) return { type: "single-country", country: matchedCountry };

  return { type: "none" };
}

// Task 8: Build the list of recommendation cards for a given search category
function buildResultItems(category) {
  if (!travelData) return [];

  switch (category.type) {
    case "beaches":
      return travelData.beaches.map((item) => ({ ...item }));

    case "temples":
      return travelData.temples.map((item) => ({ ...item }));

    case "countries":
      return travelData.countries.flatMap((country) =>
        country.cities.map((city) => ({ ...city, countryName: country.name }))
      );

    case "single-country":
      return category.country.cities.map((city) => ({
        ...city,
        countryName: category.country.name,
      }));

    default:
      return [];
  }
}

function createResultCard(item) {
  const card = document.createElement("div");
  card.className = "result-card";

  const img = document.createElement("img");
  img.src = item.imageUrl;
  img.alt = item.name;

  const body = document.createElement("div");
  body.className = "result-card-body";

  const title = document.createElement("h3");
  title.textContent = item.name;

  const description = document.createElement("p");
  description.textContent = item.description;

  body.appendChild(title);
  body.appendChild(description);

  if (item.countryName) {
    const localTime = getCountryLocalTime(item.countryName);
    if (localTime) {
      const timeEl = document.createElement("div");
      timeEl.className = "result-card-time";
      timeEl.textContent = `Local time in ${item.countryName}: ${localTime}`;
      body.appendChild(timeEl);
    }
  }

  const bookBtn = document.createElement("button");
  bookBtn.type = "button";
  bookBtn.className = "btn btn-accent";
  bookBtn.textContent = "Book Now";

  body.appendChild(bookBtn);
  card.appendChild(img);
  card.appendChild(body);

  return card;
}

function renderResults(items, message) {
  const grid = document.getElementById("resultsGrid");
  const messageEl = document.getElementById("resultsMessage");

  grid.innerHTML = "";

  if (message) {
    messageEl.textContent = message;
    messageEl.style.display = "block";
  } else {
    messageEl.style.display = "none";
  }

  items.forEach((item) => {
    grid.appendChild(createResultCard(item));
  });
}

// Task 7 & 8: Runs only when the user clicks the Search button
function handleSearch() {
  const input = document.getElementById("searchInput");
  const category = getSearchCategory(input.value);

  if (category.type === "empty") {
    renderResults([], 'Please enter a keyword like "beach", "temple", or "country".');
    return;
  }

  if (category.type === "none") {
    renderResults([], `No recommendations found for "${input.value}". Try "beach", "temple", or "country".`);
    return;
  }

  const items = buildResultItems(category);
  renderResults(items, null);
}

// Task 9: Clear the search input and any displayed results
function clearResults() {
  const input = document.getElementById("searchInput");
  input.value = "";
  renderResults([], "Try searching for \"beach\", \"temple\", or \"country\" to see recommendations.");
}

document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchBtn");
  const clearBtn = document.getElementById("clearBtn");
  const searchInput = document.getElementById("searchInput");
  const bookNowBtn = document.getElementById("bookNowBtn");

  if (searchBtn) searchBtn.addEventListener("click", handleSearch);
  if (clearBtn) clearBtn.addEventListener("click", clearResults);

  if (searchInput) {
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") handleSearch();
    });
  }

  if (bookNowBtn) {
    bookNowBtn.addEventListener("click", (event) => {
      event.preventDefault();
      document.querySelector(".results-section").scrollIntoView({ behavior: "smooth" });
    });
  }
});
