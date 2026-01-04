async function searchMedia() {
  const name = document.getElementById("movieName").value.trim();
  const type = document.getElementById("typeSelect").value;
  const resultDiv = document.getElementById("result");
  const player = document.getElementById("player");

  if (!name) {
    resultDiv.innerHTML = "Please enter a title.";
    player.style.display = "none";
    return;
  }

  const apiKey = "c2e53bd7"; // your OMDb API key
  const url = `https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(name)}&type=${type}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === "True") {
      resultDiv.innerHTML = `
        <strong>Title:</strong> ${data.Title}<br/>
        <strong>IMDb ID:</strong> ${data.imdbID}<br/>
        <strong>Year:</strong> ${data.Year}<br/>
        <strong>Type:</strong> ${data.Type}
      `;

      const imdbID = data.imdbID;
      const embedURL = type === "movie"
        ? `https://vidsrc.to/embed/movie/${imdbID}`
        : `https://vidsrc.to/embed/tv/${imdbID}`;

      player.src = embedURL;
      player.style.display = 'block';
    } else {
      resultDiv.innerHTML = "Title not found!";
      player.style.display = "none";
    }
  } catch (error) {
    resultDiv.innerHTML = "Error fetching data. Please try again.";
    player.style.display = "none";
  }
}

// Attach click handler without inline onclick
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('searchBtn');
  if (btn) btn.addEventListener('click', searchMedia);
});