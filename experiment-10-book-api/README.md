# Lab Experiment 10: Book API Explorer (jQuery AJAX & JSON)

## 📌 Experiment Overview
This practical demonstrates asynchronous client-side API communication using **jQuery's `$.ajax()`** method to fetch, parse, and dynamically render book records from an online RESTful API without triggering a full page refresh.

## 🛠️ Technical Specifications
- **Library:** jQuery 3.7.1
- **Method:** `$.ajax({ method: "GET", dataType: "json", ... })`
- **Live Endpoint:** `https://openlibrary.org/search.json?q={query}&limit=12` (replacing the hypothetical endpoint `https://api.example.com/books`)
- **JSON Fields Parsed:**
  - `title`: Book Title
  - `author_name`: Array of authors
  - `first_publish_year`: First publication year
  - `cover_i`: Book cover identifier for Open Library Covers API
  - `edition_count`: Number of available editions
- **Fail-safe Fallback:** Integrated local curated book collection ensuring uninterrupted performance even during offline evaluation or network timeouts.

## 🚀 Running the Practical
Double-click `run_app.bat` or open `index.html` directly in any web browser.
