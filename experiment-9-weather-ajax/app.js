'use strict';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const clearBtn = document.getElementById('clear-btn');
const weatherForm = document.getElementById('weather-form');
const weatherResult = document.getElementById('weather-result');
const chipButtons = document.querySelectorAll('.chip');

// Weather condition icons mapper based on condition text
function getWeatherEmoji(conditionText) {
  const text = (conditionText || '').toLowerCase();
  if (text.includes('thunder') || text.includes('storm')) return '⛈️';
  if (text.includes('snow') || text.includes('ice') || text.includes('blizzard')) return '❄️';
  if (text.includes('rain') || text.includes('drizzle') || text.includes('shower')) return '🌧️';
  if (text.includes('cloud') || text.includes('overcast')) return '⛅';
  if (text.includes('fog') || text.includes('mist')) return '🌫️';
  if (text.includes('clear') || text.includes('sunny')) return '☀️';
  return '🌤️';
}

// Convert WMO weather code to readable string
function decodeWmoCode(code) {
  const wmoMap = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snowfall',
    73: 'Moderate snowfall',
    75: 'Heavy snowfall',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  return wmoMap[code] || 'Partly Cloudy';
}

/**
 * Renders the loading indicator into the DOM (PRD US-2 & 7.4)
 */
function renderLoading() {
  weatherResult.innerHTML = 
    '<div class="loading-box" role="status">' +
      '<div class="spinner" aria-hidden="true"></div>' +
      '<p class="loading-text">Fetching live weather data...</p>' +
    '</div>';
}

/**
 * Renders user-friendly error messages (PRD US-3 & 7.5)
 */
function renderError(message, details) {
  const subText = details || 'Please check the spelling or your internet connection and try again.';
  weatherResult.innerHTML = 
    '<div class="error-box" role="alert">' +
      '<div class="error-icon">⚠️</div>' +
      '<div class="error-content">' +
        '<div class="error-title">' + escapeHtml(message) + '</div>' +
        '<div class="error-desc">' + escapeHtml(subText) + '</div>' +
      '</div>' +
    '</div>';
}

/**
 * Renders the weather data matching PRD specifications (PRD US-4, US-5, Section 7.4)
 */
function renderWeather(data) {
  const icon = getWeatherEmoji(data.condition);
  const unitSymbol = (data.unit === 'celsius' || !data.unit) ? '°C' : '°F';
  const displayTemp = Math.round(data.temperature);

  weatherResult.innerHTML = 
    '<div class="weather-card">' +
      '<div class="weather-header">' +
        '<div class="city-info">' +
          '<h2>' + escapeHtml(data.city) + '</h2>' +
          '<span class="country-tag">' + escapeHtml(data.country || 'Current Weather') + '</span>' +
        '</div>' +
        '<div class="weather-visual">' +
          '<span class="weather-icon-large" role="img" aria-label="' + escapeHtml(data.condition) + '">' + icon + '</span>' +
        '</div>' +
      '</div>' +

      '<div class="weather-main">' +
        '<div class="temp-display">' +
          displayTemp + '<span class="temp-unit">' + unitSymbol + '</span>' +
        '</div>' +
        '<div class="condition-text">' + escapeHtml(data.condition) + '</div>' +
      '</div>' +

      '<div class="weather-metrics-grid">' +
        '<div class="metric-card">' +
          '<div class="metric-icon">💧</div>' +
          '<div class="metric-info">' +
            '<span class="metric-label">Humidity</span>' +
            '<span class="metric-value">' + data.humidity + '%</span>' +
          '</div>' +
        '</div>' +

        '<div class="metric-card">' +
          '<div class="metric-icon">💨</div>' +
          '<div class="metric-info">' +
            '<span class="metric-label">Wind Speed</span>' +
            '<span class="metric-value">' + data.windSpeed + ' km/h</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

// Utility to escape HTML and prevent XSS injection
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Core AJAX Fetch Function
 * Uses fetch() API with async/await, AbortController for 10s timeout,
 * and handles live API querying via Open-Meteo.
 * Complies strictly with PRD Section 7.3:
 * {
 *   "city": "Puducherry",
 *   "temperature": 30.5,
 *   "condition": "Partly Cloudy",
 *   "humidity": 78,
 *   "windSpeed": 12.4,
 *   "unit": "celsius"
 * }
 */
async function getWeather(city) {
  const cleanCity = (city || '').trim();
  if (!cleanCity) {
    renderError('Empty Search', 'Please enter a city name to search.');
    return;
  }

  // Show loading spinner (PRD Section 7.4)
  renderLoading();
  if (searchBtn) searchBtn.disabled = true;

  // Set up 10-second timeout controller (PRD Section 7.5)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 10000);

  try {
    // Step 1: Geocode city name to lat/long using Open-Meteo Geocoding API
    const geoUrl = 'https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(cleanCity) + '&count=1&language=en&format=json';
    
    const geoResponse = await fetch(geoUrl, { signal: controller.signal });
    
    if (!geoResponse.ok) {
      throw new Error('Geocoding service returned status ' + geoResponse.status);
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      clearTimeout(timeoutId);
      renderError('City not found', 'City not found. Please check the spelling and try again.');
      return;
    }

    const place = geoData.results[0];
    const latitude = place.latitude;
    const longitude = place.longitude;
    const resolvedCity = place.name;
    const country = place.country;

    // Step 2: Fetch current weather details (temperature, humidity, windspeed, weathercode)
    const weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=' + latitude + '&longitude=' + longitude + '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto';

    const weatherResponse = await fetch(weatherUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!weatherResponse.ok) {
      throw new Error(weatherResponse.status === 404 ? 'City not found' : 'Weather service error');
    }

    const weatherJson = await weatherResponse.json();

    // Map response to the expected PRD JSON Schema (Section 7.3)
    const weatherData = {
      city: resolvedCity,
      country: country,
      temperature: weatherJson.current.temperature_2m,
      condition: decodeWmoCode(weatherJson.current.weather_code),
      humidity: weatherJson.current.relative_humidity_2m,
      windSpeed: weatherJson.current.wind_speed_10m,
      unit: 'celsius'
    };

    console.log('[Lab 9 AJAX] Weather JSON Received:', weatherData);
    renderWeather(weatherData);

  } catch (err) {
    clearTimeout(timeoutId);
    console.error('[Lab 9 AJAX Error]:', err);

    if (err.name === 'AbortError') {
      renderError('Request Timeout', 'The weather service took longer than 10 seconds to respond. Please try again.');
    } else if (!navigator.onLine) {
      renderError('Network Failure', 'You are currently offline. Please check your internet connection.');
    } else {
      renderError('Weather Service Error', err.message || 'Unable to fetch weather data at this moment.');
    }
  } finally {
    if (searchBtn) searchBtn.disabled = false;
  }
}

// Event Listeners
if (weatherForm) {
  weatherForm.addEventListener('submit', (e) => {
    e.preventDefault();
    getWeather(cityInput.value);
  });
}

if (searchBtn) {
  searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    getWeather(cityInput.value);
  });
}

// Clear input button toggle
if (cityInput) {
  cityInput.addEventListener('input', () => {
    if (clearBtn) {
      clearBtn.style.display = cityInput.value ? 'block' : 'none';
    }
  });

  cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      getWeather(cityInput.value);
    }
  });
}

if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    cityInput.value = '';
    clearBtn.style.display = 'none';
    cityInput.focus();
  });
}

// Quick selection chip buttons
chipButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const city = btn.getAttribute('data-city');
    if (cityInput) {
      cityInput.value = city;
      if (clearBtn) clearBtn.style.display = 'block';
    }
    getWeather(city);
  });
});

// Default initial load: Fetch Puducherry as featured in PRD
window.addEventListener('DOMContentLoaded', () => {
  getWeather('Puducherry');
});
