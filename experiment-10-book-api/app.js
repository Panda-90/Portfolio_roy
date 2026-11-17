/**
 * Lab Experiment #10: Book API Explorer
 * Asynchronous Data Retrieval using jQuery $.ajax() and JSON Parsing
 */

$(document).ready(function () {
  // DOM Cache
  const $loadBooksBtn = $('#loadBooksBtn');
  const $bookQuery = $('#bookQuery');
  const $clearBtn = $('#clearBtn');
  const $endpointUrl = $('#endpointUrl');
  const $statusIndicator = $('#statusIndicator');
  const $statusMessage = $('#statusMessage');
  const $resultStats = $('#resultStats');
  const $booksDisplayArea = $('#booksDisplayArea');
  const $chips = $('.chip');

  // Realistic fallback books dataset for offline/fail-safe guarantee
  const fallbackBooks = [
    {
      title: "Clean Code: A Handbook of Agile Software Craftsmanship",
      author_name: ["Robert C. Martin"],
      first_publish_year: 2008,
      edition_count: 14,
      cover_url: "https://covers.openlibrary.org/b/id/12539704-M.jpg",
      key: "/works/OL15843128W"
    },
    {
      title: "JavaScript: The Good Parts",
      author_name: ["Douglas Crockford"],
      first_publish_year: 2008,
      edition_count: 8,
      cover_url: "https://covers.openlibrary.org/b/id/9245523-M.jpg",
      key: "/works/OL9486352W"
    },
    {
      title: "Eloquent JavaScript: A Modern Introduction to Programming",
      author_name: ["Marijn Haverbeke"],
      first_publish_year: 2011,
      edition_count: 12,
      cover_url: "https://covers.openlibrary.org/b/id/8091016-M.jpg",
      key: "/works/OL16801931W"
    },
    {
      title: "Introduction to Algorithms (CLRS)",
      author_name: ["Thomas H. Cormen", "Charles E. Leiserson", "Ronald L. Rivest"],
      first_publish_year: 1990,
      edition_count: 22,
      cover_url: "https://covers.openlibrary.org/b/id/8243685-M.jpg",
      key: "/works/OL27479W"
    },
    {
      title: "Python Crash Course",
      author_name: ["Eric Matthes"],
      first_publish_year: 2015,
      edition_count: 9,
      cover_url: "https://covers.openlibrary.org/b/id/8739161-M.jpg",
      key: "/works/OL17351607W"
    },
    {
      title: "Design Patterns: Elements of Reusable Object-Oriented Software",
      author_name: ["Erich Gamma", "Richard Helm", "Ralph Johnson", "John Vlissides"],
      first_publish_year: 1994,
      edition_count: 18,
      cover_url: "https://covers.openlibrary.org/b/id/10574223-M.jpg",
      key: "/works/OL102749W"
    },
    {
      title: "The Pragmatic Programmer: Your Journey to Mastery",
      author_name: ["Andrew Hunt", "David Thomas"],
      first_publish_year: 1999,
      edition_count: 15,
      cover_url: "https://covers.openlibrary.org/b/id/8231996-M.jpg",
      key: "/works/OL102758W"
    },
    {
      title: "You Don't Know JS: Scope & Closures",
      author_name: ["Kyle Simpson"],
      first_publish_year: 2014,
      edition_count: 6,
      cover_url: "https://covers.openlibrary.org/b/id/7943564-M.jpg",
      key: "/works/OL17079237W"
    }
  ];

  // -------------------------------------------------------------
  // Event Listeners
  // -------------------------------------------------------------

  // 1. Primary "Load Books" button click event
  $loadBooksBtn.on('click', function () {
    const query = $bookQuery.val().trim() || 'programming';
    fetchBooksViaJQuery(query);
  });

  // 2. Press Enter in search input
  $bookQuery.on('keypress', function (e) {
    if (e.which === 13) {
      $loadBooksBtn.trigger('click');
    }
  });

  // 3. Search query input handler for clear button visibility
  $bookQuery.on('input', function () {
    const val = $(this).val();
    $clearBtn.toggle(Boolean(val));
  });

  // 4. Clear search button
  $clearBtn.on('click', function () {
    $bookQuery.val('').focus();
    $(this).hide();
  });

  // 5. Quick topic chips
  $chips.on('click', function () {
    $chips.removeClass('active');
    $(this).addClass('active');
    const topic = $(this).data('query');
    $bookQuery.val(topic);
    $clearBtn.show();
    fetchBooksViaJQuery(topic);
  });

  // -------------------------------------------------------------
  // jQuery AJAX Function: fetchBooksViaJQuery
  // -------------------------------------------------------------
  /**
   * Performs an asynchronous GET request using jQuery's $.ajax() method
   * to retrieve a list of books from an active API endpoint (Open Library API).
   * Parses the JSON response and dynamically renders the titles, authors, and metadata.
   */
  function fetchBooksViaJQuery(searchQuery) {
    // Actual API endpoint replacing the hypothetical "https://api.example.com/books"
    const apiEndpoint = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=12`;
    $endpointUrl.text(apiEndpoint);

    const startTime = performance.now();

    // jQuery $.ajax request
    $.ajax({
      url: apiEndpoint,
      method: "GET",
      dataType: "json",
      timeout: 10000, // 10 second timeout

      beforeSend: function () {
        // UI Loading State
        $loadBooksBtn.addClass('loading')
          .html('<i class="fa-solid fa-spinner"></i> <span>Loading Books...</span>');
        
        $statusIndicator.removeClass('ready success error').addClass('loading');
        $statusMessage.html(`Sending jQuery <code>$.ajax()</code> GET request to API...`);
        $resultStats.text('');

        // Render skeleton / spinner inside results area
        $booksDisplayArea.html(`
          <div class="empty-state">
            <div class="empty-icon"><i class="fa-solid fa-spinner fa-spin"></i></div>
            <h3>Fetching Books from API...</h3>
            <p>jQuery is parsing the asynchronous JSON payload for query: <strong>"${escapeHtml(searchQuery)}"</strong></p>
          </div>
        `);
      },

      success: function (data) {
        const elapsed = Math.round(performance.now() - startTime);

        // Check if data docs exist
        if (data && data.docs && data.docs.length > 0) {
          $statusIndicator.removeClass('loading error').addClass('success');
          $statusMessage.html(`Successfully fetched <strong>${data.docs.length} books</strong> via <code>$.ajax()</code>`);
          $resultStats.html(`HTTP 200 OK &bull; ${elapsed}ms &bull; ${data.numFound.toLocaleString()} total matches`);

          renderBooks(data.docs);
        } else {
          showEmptyResults(searchQuery);
        }
      },

      error: function (xhr, status, error) {
        const elapsed = Math.round(performance.now() - startTime);
        console.warn(`jQuery $.ajax failed (${status}: ${error}). Loading local verified book dataset...`);

        $statusIndicator.removeClass('loading').addClass('ready');
        $statusMessage.html(`Network API timeout/block &bull; Loaded <strong>${fallbackBooks.length} curated books</strong>`);
        $resultStats.html(`Offline Fallback &bull; ${elapsed}ms`);

        // Filter fallback by search query if applicable
        const filtered = fallbackBooks.filter(b => 
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          b.author_name.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        renderBooks(filtered.length > 0 ? filtered : fallbackBooks, true);
      },

      complete: function () {
        // Restore button state
        $loadBooksBtn.removeClass('loading')
          .html('<i class="fa-solid fa-book-open"></i> <span>Load Books</span>');
      }
    });
  }

  // -------------------------------------------------------------
  // Render Books Function
  // -------------------------------------------------------------
  function renderBooks(booksList, isFallback = false) {
    let html = `<div class="books-grid">`;

    $.each(booksList, function (index, book) {
      const title = book.title || "Untitled Book";
      
      // Extract author names array
      let authors = "Unknown Author";
      if (book.author_name && Array.isArray(book.author_name)) {
        authors = book.author_name.slice(0, 2).join(", ");
        if (book.author_name.length > 2) authors += " et al.";
      }

      // Year and Editions
      const year = book.first_publish_year || "Classic";
      const editions = book.edition_count ? `${book.edition_count} editions` : "1 edition";
      
      // Book Cover resolution
      let coverImgSrc = "";
      if (book.cover_url) {
        coverImgSrc = book.cover_url;
      } else if (book.cover_i) {
        coverImgSrc = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
      }

      const openLibraryWorkUrl = book.key 
        ? `https://openlibrary.org${book.key}`
        : `https://openlibrary.org/search?q=${encodeURIComponent(title)}`;

      html += `
        <article class="book-card" data-index="${index}">
          <div class="cover-wrapper">
            ${coverImgSrc ? `
              <img 
                src="${coverImgSrc}" 
                alt="${escapeHtml(title)} cover" 
                class="cover-img" 
                loading="lazy"
                onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'cover-placeholder\\'><i class=\\'fa-solid fa-book\\'></i><span>No Cover Image</span></div>';"
              />
            ` : `
              <div class="cover-placeholder">
                <i class="fa-solid fa-book"></i>
                <span>No Cover Image</span>
              </div>
            `}
            <span class="year-pill">${year}</span>
          </div>

          <div class="book-info">
            <h3 class="book-title" title="${escapeHtml(title)}">${escapeHtml(title)}</h3>
            <p class="book-author" title="${escapeHtml(authors)}">
              <i class="fa-solid fa-user-pen"></i> ${escapeHtml(authors)}
            </p>

            <div class="book-meta">
              <span class="editions"><i class="fa-solid fa-layer-group"></i> ${editions}</span>
              <a href="${openLibraryWorkUrl}" target="_blank" rel="noopener noreferrer" class="view-book-btn">
                <span>View Book</span> <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
            </div>
          </div>
        </article>
      `;
    });

    html += `</div>`;
    $booksDisplayArea.html(html);
  }

  function showEmptyResults(query) {
    $statusIndicator.removeClass('loading').addClass('ready');
    $statusMessage.text(`No books found for "${query}".`);
    $resultStats.text('0 results');

    $booksDisplayArea.html(`
      <div class="empty-state">
        <div class="empty-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <h3>No Books Found</h3>
        <p>No results matched your search query <strong>"${escapeHtml(query)}"</strong>. Try searching for "JavaScript", "Python", or "Algorithms".</p>
      </div>
    `);
  }

  function escapeHtml(text) {
    if (!text) return "";
    return $('<div>').text(text).html();
  }

  // Initial auto-load for instant portfolio impression
  fetchBooksViaJQuery('programming');
});
