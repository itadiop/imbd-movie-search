document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  let q = params.get('q') || '';
  let page = parseInt(params.get('page')) || 1;

  // Restore last search from sessionStorage if URL doesn't include query
  if (!q) {
    try {
      const last = JSON.parse(sessionStorage.getItem('lastSearch') || 'null');
      if (last && last.q) {
        q = last.q;
        page = last.page || 1;
        // update URL to reflect restored state without reloading
        history.replaceState(null, '', `?q=${encodeURIComponent(q)}&page=${page}`);
      }
    } catch (e) {
      // ignore JSON parse errors
    }
  }

  const info = document.getElementById('info');
  const resultsDiv = document.getElementById('results');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');

  const apiKey = 'c2e53bd7';

  async function loadPage(p) {
    info.textContent = `Searching for: "${q}" (page ${p})`;
    resultsDiv.innerHTML = '<p>Loading...</p>';

    try {
      const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(q)}&page=${p}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.Response === 'True') {
        const items = data.Search;
        resultsDiv.innerHTML = items.map(item => {
          const poster = item.Poster !== 'N/A' ? item.Poster : '';
          return `
            <a class="result-link" href="details.html?id=${item.imdbID}">
              <div class="result-item">
                ${poster ? `<img src="${poster}" alt="${item.Title}">` : `<div class="no-poster">No image</div>`}
                <div class="meta">
                  <strong>${item.Title}</strong> (${item.Year})<br>
                  <em>${item.Type}</em>
                </div>
              </div>
            </a>
          `;
        }).join('');

        const total = parseInt(data.totalResults, 10) || items.length;
        const totalPages = Math.ceil(total / 10);

        prevBtn.disabled = p <= 1;
        nextBtn.disabled = p >= totalPages;
        pageInfo.textContent = `${p} / ${totalPages}`;

        // Persist last search state
        try { sessionStorage.setItem('lastSearch', JSON.stringify({ q, page: p })); } catch (err) { /* ignore */ }
      } else {
        resultsDiv.innerHTML = `<p>No results found for "${q}".</p>`;
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        pageInfo.textContent = '';
        info.textContent = '';
      }
    } catch (err) {
      resultsDiv.innerHTML = '<p>Error fetching results. Please try again later.</p>';
    }
  }

  prevBtn.addEventListener('click', () => {
    if (page > 1) {
      page -= 1;
      history.replaceState(null, '', `?q=${encodeURIComponent(q)}&page=${page}`);
      try { sessionStorage.setItem('lastSearch', JSON.stringify({ q, page })); } catch (err) { /* ignore */ }
      loadPage(page);
    }
  });

  nextBtn.addEventListener('click', () => {
    page += 1;
    history.replaceState(null, '', `?q=${encodeURIComponent(q)}&page=${page}`);
    try { sessionStorage.setItem('lastSearch', JSON.stringify({ q, page })); } catch (err) { /* ignore */ }
    loadPage(page);
  });

  if (!q) {
    info.textContent = 'No search query provided.';
    resultsDiv.innerHTML = '';
    prevBtn.disabled = true;
    nextBtn.disabled = true;
  } else {
    loadPage(page);
  }

  // Back button to search page
  const backBtn = document.getElementById('backToSearchBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
});