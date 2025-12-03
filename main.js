
document.addEventListener("DOMContentLoaded", () => {
  initDynamicFormatListings();
  initProductPageCart();
  initCartPage();
  updateGlobalCartCount();
});

//  A. Albums on format pages

function initDynamicFormatListings() {
  const path = window.location.pathname || "";
  const page = path.split("/").pop();

  let format = null;

  if (page === "vinyl.html") {
    format = "Vinyl";
  } else if (page === "cd.html") {
    format = "CD";
  } else if (page === "digital.html") {
    format = "Digital";
  }

  // Only run on those pages
  if (!format) return;

  // Grid where cards live: .listing-panel .card-grid-4
  const grid = document.querySelector(".listing-panel .card-grid-4");
  if (!grid) return;

  const albums = getStoredAlbumsForMain().filter(
    (album) => album.format === format
  );

  if (!albums.length) return;

  albums.forEach((album) => {
    const card = document.createElement("div");
    card.className = "record-card";

    // For now, clicking any dynamic card goes to generic product page
    card.addEventListener("click", () => {
      window.location.href = "product.html";
    });

    const priceValue = album.price || "";
    const priceText =
      priceValue && !String(priceValue).startsWith("$")
        ? `$${priceValue}`
        : priceValue;

    card.innerHTML = `
      <div class="record-cover">
        <img src="${album.cover || "img/placeholder.png"}"
             alt="${album.title} album cover" />
      </div>
      <div class="record-title">${album.title}</div>
      <div class="record-meta">${album.artist || ""}</div>
      <div class="record-footer">
        <span>${priceText}</span>
        <span>${album.format}</span>
      </div>
    `;

    grid.appendChild(card);
  });
}

function getStoredAlbumsForMain() {
  try {
    const raw = localStorage.getItem("albums");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Error reading albums from localStorage (albums)", err);
    return [];
  }
}

//  B. Product page → Add to Cart

function initProductPageCart() {
  const path = window.location.pathname || "";
  const page = path.split("/").pop();

  if (page !== "product.html") return;

  // Quantity controls
  const qtyContainer = document.querySelector(".qty-control");
  const qtyButtons = qtyContainer
    ? qtyContainer.querySelectorAll("button")
    : null;
  const qtySpan = qtyContainer
    ? qtyContainer.querySelector("span")
    : null;

  let quantity = qtySpan ? parseInt(qtySpan.textContent, 10) || 1 : 1;

  if (qtyButtons && qtyButtons.length === 2 && qtySpan) {
    const minusBtn = qtyButtons[0];
    const plusBtn = qtyButtons[1];

    minusBtn.addEventListener("click", () => {
      if (quantity > 1) {
        quantity -= 1;
        qtySpan.textContent = String(quantity);
      }
    });

    plusBtn.addEventListener("click", () => {
      quantity += 1;
      qtySpan.textContent = String(quantity);
    });
  }

  // Add to Cart button
  const addToCartBtn = document.querySelector(".buy-row .btn-primary");
  if (!addToCartBtn) return;

  addToCartBtn.addEventListener("click", () => {
    // Read product info from DOM
    const titleEl = document.querySelector(".album-info h3");
    const artistEl = document.querySelector(".album-artist");
    const priceEl = document.querySelector(".album-price");
    const formatSelect = document.getElementById("format-select");
    const coverImg = document.querySelector(".album-art-inner img");

    const title = titleEl ? titleEl.textContent.trim() : "Unknown Album";
    const artist = artistEl ? artistEl.textContent.trim() : "";
    const rawPrice = priceEl ? priceEl.textContent.trim() : "";
    const format = formatSelect ? formatSelect.value.trim() : "";
    const cover = coverImg ? coverImg.getAttribute("src") : "img/placeholder.png";

    // keep only digits & dot
    const price = rawPrice.replace(/[^\d.]/g, "");
    const qtyToAdd = quantity || 1;

    const cart = getCart();
    const newItem = {
      id: Date.now(), // unique id
      title,
      artist,
      format,
      price,
      qty: qtyToAdd,
      cover
    };

    cart.push(newItem);
    saveCart(cart);
    updateGlobalCartCount();

    alert("Item added to cart.");
  });
}

//  C. Cart page rendering + checkout

function initCartPage() {
  const path = window.location.pathname || "";
  const page = path.split("/").pop();

  if (page !== "cart.html") return;

  const rowsContainer = document.getElementById("cart-rows");
  if (rowsContainer) {
    // Delegated click handler for Remove buttons
    rowsContainer.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.classList.contains("cart-remove-btn")) return;

      const idStr = target.getAttribute("data-id");
      if (!idStr) return;

      const id = Number(idStr);
      const current = getCart();
      const next = current.filter((item) => item.id !== id);
      saveCart(next);
      renderCart();
    });
  }

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      const cart = getCart();
      if (!cart.length) {
        alert("Your cart is empty.");
        return;
      }

      let totalQty = 0;
      let totalPrice = 0;

      cart.forEach((item) => {
        const qty = item.qty || 1;
        totalQty += qty;
        const priceNum = parseFloat(item.price || "0");
        if (!isNaN(priceNum)) {
          totalPrice += priceNum * qty;
        }
      });

      // Clear cart
      saveCart([]);
      renderCart();
      updateGlobalCartCount();

      const priceText =
        totalPrice > 0 ? ` Total: $${totalPrice.toFixed(2)}` : "";

      alert(`Checkout successful! ${totalQty} item${totalQty > 1 ? "s" : ""} purchased.${priceText}`);
    });
  }

  renderCart();
}

function renderCart() {
  const cart = getCart();
  const rowsContainer = document.getElementById("cart-rows");
  const countEl = document.getElementById("cart-count");
  const headerEl = document.querySelector(".cart-header");

  if (!rowsContainer) return;

  rowsContainer.innerHTML = "";

  if (!cart.length) {
    if (headerEl) headerEl.style.display = "none";
    if (countEl) countEl.textContent = "0 items";

    const emptyMsg = document.createElement("p");
    emptyMsg.textContent = "Your cart is empty.";
    rowsContainer.appendChild(emptyMsg);

    updateGlobalCartCount();
    return;
  }

  if (headerEl) headerEl.style.display = "grid";

  let totalQty = 0;

  cart.forEach((item) => {
    totalQty += item.qty || 1;

    const row = document.createElement("div");
    row.className = "cart-row";

    row.innerHTML = `
      <div class="cart-cover">
        <img src="${item.cover || "img/placeholder.png"}" alt="${item.title}">
      </div>

      <div class="cart-artist">
        ${item.artist || ""}
      </div>

      <div class="cart-album">
        ${item.title || ""}
      </div>

      <div class="cart-qty">
        ${item.qty || 1}
      </div>

      <div class="cart-remove-wrapper">
        <button class="cart-remove-btn" data-id="${item.id}">Remove</button>
      </div>
    `;

    rowsContainer.appendChild(row);
  });

  if (countEl) {
    countEl.textContent = `${totalQty} item${totalQty > 1 ? "s" : ""}`;
  }

  updateGlobalCartCount();
}

//  D. Cart helpers

function getCart() {
  try {
    const raw = localStorage.getItem("cart");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Error reading cart from localStorage", err);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (err) {
    console.error("Error saving cart to localStorage", err);
  }
}

//  E. Navbar cart badge

function updateGlobalCartCount() {
  const cart = getCart();
  let totalQty = 0;
  cart.forEach((item) => {
    totalQty += item.qty || 1;
  });

  const navCartLink = document.querySelector('.nav-right a[href="cart.html"]');
  if (!navCartLink) return;

  let badge = navCartLink.querySelector(".cart-count-pill");
  if (!badge) {
    badge = document.createElement("span");
    badge.className = "cart-count-pill";
    navCartLink.appendChild(badge);
  }

  if (totalQty > 0) {
    badge.textContent = totalQty > 99 ? "99+" : String(totalQty);
    badge.style.display = "flex";
  } else {
    badge.style.display = "none";
  }
}
