# Lab Experiment No. 9: Fetch & Display Weather Data via AJAX/JSON

## 🎯 Aim
To develop a responsive web application that asynchronously fetches weather data in JSON format from an API using AJAX (etch() API with sync/await) and dynamically updates the Document Object Model (DOM) without requiring a full-page reload.

---

## 🛠️ Tech Stack & Concepts
- **HTML5**: Semantic markup, ARIA live region (ria-live=polite).
- **CSS3**: Modern glassmorphism UI, responsive CSS Grid and Flexbox, keyframe animations.
- **JavaScript (ES6+)**:
  - etch() API with sync/await
  - JSON Parsing (esponse.json())
  - Request timeout handling using AbortController (10 seconds timeout)
  - DOM Manipulation without page reload
  - Error handling (404 City not found, network offline, API downtime)

---

## 📋 JSON Schema (Complies with PRD Section 7.3)
`json
{
  city: Puducherry,
  country: India,
  temperature: 30.5,
  condition: Partly Cloudy,
  humidity: 78,
  windSpeed: 12.4,
  unit: celsius
}
`

---

## 🚀 How to Run the Application

### Option 1: Direct in Browser
Simply double-click or right-click index.html and choose **Open with Google Chrome / Edge / Firefox**.

### Option 2: Using Live Server (VS Code / Python / Node.js)
Open terminal in this directory:
`ash
# Using Python built-in server:
python -m http.server 5500

# Or using npx serve:
npx serve
`
Then navigate to http://localhost:5500.

---

## 🧪 Verification & Acceptance Criteria
- [x] **US-1**: User enters city name and fetches weather without page reload.
- [x] **US-2**: Smooth animated loading spinner is displayed during request.
- [x] **US-3**: Clean user-friendly error alerts shown when city is invalid or offline.
- [x] **US-4**: Temperature, weather condition, humidity, and wind speed dynamically updated.
- [x] **US-5**: Page never reloads; all changes are applied dynamically to <div id=weather-result>.
- [x] **Section 7.5**: AbortController handles 10-second request timeouts.
