document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const container = document.getElementById('detailsContainer');
  const apiKey = 'c2e53bd7';

  if (!id) {
    container.innerHTML = '<p>No ID provided.</p>';
    return;
  }

  container.innerHTML = '<p>Loading details...</p>';

  try {
    const res = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${id}&plot=full`);
    const data = await res.json();

    if (data.Response === 'True') {
      const poster = data.Poster && data.Poster !== 'N/A' ? `<img src="${data.Poster}" alt="${data.Title}">` : `<div class="no-poster">No image</div>`;
      container.innerHTML = `
        <div class="details">
          <div class="poster">
          ${poster}
          <button class="button" id="playBtn" href="#">Play</button>
          </div>
          <div class="meta">
            <h2>${data.Title} (${data.Year})</h2>
            <p><strong>Genre:</strong> ${data.Genre}</p>
            <p><strong>Director:</strong> ${data.Director}</p>
            <p><strong>Actors:</strong> ${data.Actors}</p>
            <p><strong>Runtime:</strong> ${data.Runtime}</p>
            <p><strong>Plot:</strong> ${data.Plot}</p>
            <p><strong>IMDb Rating:</strong> ${data.imdbRating}</p>
          </div>
        </div>
      `;

      // Attach play button handler (redirect to player page)
      const playBtn = document.getElementById('playBtn');
      if (playBtn) {
        playBtn.addEventListener('click', (e) => {
          e.preventDefault();
          // OMDb type: movie/series
          const type = (data.Type || 'movie').toLowerCase();
          window.location.href = `player.html?id=${encodeURIComponent(id)}&type=${encodeURIComponent(type)}`;
        });
      }
    } else {
      container.innerHTML = `<p>Details not found for ID ${id}.</p>`;
    }
  } catch (err) {
    container.innerHTML = '<p>Error fetching details. Please try again later.</p>';
  }
    

  // Back button to results page — prefer history.back() so search state is restored
  const backBtn = document.getElementById('backToResultsBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (document.referrer && document.referrer.includes('results.html')) {
        history.back();
        return;
      }
      if (history.length > 1) {
        history.back();
        return;
      }
      // Fallback: restore from sessionStorage
      try {
        const last = JSON.parse(sessionStorage.getItem('lastSearch') || 'null');
        if (last && last.q) {
          window.location.href = `results.html?q=${encodeURIComponent(last.q)}&page=${last.page||1}`;
          return;
        }
      } catch (e) { /* ignore */ }
      window.location.href = 'results.html';
    });
  }
});