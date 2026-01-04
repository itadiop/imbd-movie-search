document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('searchForm');
  const resultMsg = document.getElementById('result');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = document.getElementById('movieName').value.trim();
    if (!q) {
      if (resultMsg) resultMsg.textContent = 'Please enter a title.';
      return;
    }
    // Save last search to sessionStorage so results page can restore state
    try { sessionStorage.setItem('lastSearch', JSON.stringify({ q, page: 1 })); } catch (err) { /* ignore */ }
    window.location.href = `results.html?q=${encodeURIComponent(q)}`;
  });
});