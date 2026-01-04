document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const type = (params.get('type') || '').toLowerCase();
  const infoDiv = document.getElementById('info');
  const player = document.getElementById('player');
  const apiKey = 'c2e53bd7';

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

  if (!id) {
    infoDiv.textContent = 'No ID provided.';
    return;
  }

  try {
    const res = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${id}&plot=short`);
    const data = await res.json();

    if (data.Response === 'True') {
      infoDiv.innerHTML = `<h2>${data.Title} (${data.Year})</h2>`;
    } else {
      infoDiv.textContent = 'Details not found.';
    }
  } catch (err) {
    infoDiv.textContent = 'Error fetching details.';
  }

  // Try multiple embed sources sequentially with a timeout
  const sources = [
    'vidsrc.to',
    'vidsrc-embed.ru',
    'vidsrc-embed.su',
    'vidsrcme.su',
    'vsrc.su'
  ];
  
  async function trySources() {
    let loaded = false;

    for (let i = 0; i < sources.length; i++) {
      const domain = sources[i];
      const src = `https://${domain}/embed/${type === 'movie' ? 'movie' : 'tv'}/${id}`;

      infoDiv.textContent = `Attempting: ${domain} (${i + 1}/${sources.length})...`;

      const ok = await new Promise(resolve => {
        let settled = false;
        const onLoad = () => {
          if (settled) return; settled = true;
          player.removeEventListener('load', onLoad);
          clearTimeout(timeout);
          resolve(true);
        };
        const timeout = setTimeout(() => {
          if (settled) return; settled = true;
          player.removeEventListener('load', onLoad);
          resolve(false);
        }, 4000);

        player.addEventListener('load', onLoad);
        // Start loading
        player.src = src;
      });

      if (ok) {
        loaded = true;
        break;
      }
      // If not ok, try next source
    }

    if (loaded) {
      infoDiv.textContent = '';
      player.style.display = 'block';
    } else {
      infoDiv.textContent = 'Failed to load player from all sources.';
      player.style.display = 'none';
    }
  }

  trySources();
});
