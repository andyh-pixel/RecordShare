
document.addEventListener("DOMContentLoaded", () => {
  setupTracklist();
  setupPublishForm();
  renderYourRecordsFromStorage();
});

// --- Tracklist: "+ Add Another Track" ---

function setupTracklist() {
  const addTrackBtn = document.getElementById("add-track-btn");
  const tracklist = document.getElementById("tracklist");

  if (!addTrackBtn || !tracklist) return;

  let trackCount = tracklist.querySelectorAll(".track-row").length;

  addTrackBtn.addEventListener("click", () => {
    trackCount += 1;

    const row = document.createElement("div");
    row.className = "track-row";
    row.innerHTML = `
      <span class="track-label">Track ${trackCount}</span>
      <input class="form-input" type="text" placeholder="Song Name" />
      <input class="form-input track-file" type="file" accept=".mp3,audio/*" />
    `;

    tracklist.appendChild(row);
  });
}

// --- Publish form: save album to localStorage ---

function setupPublishForm() {
  const publishBtn = document.querySelector(
    ".dashboard-layout .panel .form-actions .btn-primary"
  );

  if (!publishBtn) return;

  publishBtn.addEventListener("click", () => {
    const titleInput = document.getElementById("album-title");
    const artistInput = document.getElementById("artist-name");
    const formatSelect = document.getElementById("format");
    const genreInput = document.getElementById("genre");
    const priceInput = document.getElementById("price");
    const stockInput = document.getElementById("stock");
    const descInput = document.getElementById("desc");

    const title = titleInput?.value.trim() || "";
    const artist = artistInput?.value.trim() || "";
    const format = formatSelect?.value.trim() || "";
    const genre = genreInput?.value.trim() || "";
    const price = priceInput?.value.trim() || "";
    const stock = stockInput?.value.trim() || "";
    const description = descInput?.value.trim() || "";

    if (!title || !artist || !format || !price) {
      alert("Please fill in Album Title, Artist Name, Format and Price.");
      return;
    }

    const album = {
      id: Date.now(),
      title,
      artist,
      format,       // "Vinyl" / "CD" / "Digital"
      genre,
      price,
      stock,
      description,
      cover: guessCoverPath(format)
    };

    const albums = getStoredAlbums();
    albums.push(album);
    localStorage.setItem("albums", JSON.stringify(albums));

    appendAlbumToYourRecords(album);

     if (titleInput) titleInput.value = "";
    if (artistInput) artistInput.value = "";
    if (genreInput) genreInput.value = "";
    if (priceInput) priceInput.value = "";
    if (stockInput) stockInput.value = "";
    if (descInput) descInput.value = "";

    alert("Record saved. It will appear on the matching format page.");
  });
}

// --- Shared localStorage helpers ---

function getStoredAlbums() {
  try {
    const raw = localStorage.getItem("albums");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Error reading albums from localStorage", err);
    return [];
  }
}

function guessCoverPath(format) {
  if (format === "Vinyl") return "img/placeholder-vinyl.png";
  if (format === "CD") return "img/placeholder-cd.png";
  if (format === "Digital") return "img/placeholder-digital.png";
  return "img/placeholder.png";
}


function renderYourRecordsFromStorage() {
  const albums = getStoredAlbums();
  if (!albums.length) return;

  albums.forEach((album) => appendAlbumToYourRecords(album));
}

function appendAlbumToYourRecords(album) {

  const panels = document.querySelectorAll(".dashboard-layout .panel");
  if (panels.length < 2) return;

  const yourRecordsPanel = panels[1];
  const list = yourRecordsPanel.querySelector(".admin-list");
  if (!list) return;

  const row = document.createElement("div");
  row.className = "admin-row";
  row.innerHTML = `
    <div class="admin-main">
      <span class="admin-title">${album.title}</span>
      <span class="admin-meta">${album.format}</span>
    </div>
    <div>
      <span class="badge badge-done">Published</span>
      <button class="btn-ghost btn-small" type="button">Edit</button>
    </div>
  `;

  list.appendChild(row);
}
