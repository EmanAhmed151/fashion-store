
// --- NAVBAR -----
const bar = document.getElementById('bar');
const navbar = document.getElementById('navbar');
const close = document.getElementById('close');

bar?.addEventListener('click', () => navbar.classList.add('active'));
close?.addEventListener('click', () => navbar.classList.remove('active'));


// --- PRODUCT PAGE NAVIGATION ---
document.querySelectorAll(".pro").forEach(card => {
  card.onclick = () => {
    const id = card.dataset.id;
    if (id) window.location.href = `sproduct.html?id=${id}`;
    console.log("hello");

  };
});

// --- FETCH PRODUCT DETAILS -----
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

if (productId) {
  fetch("data/products.json")
    .then(res => res.json())
    .then(products => {
      const product = products.find(p => p.id == productId);
      if (!product) return;

      document.getElementById("brand").innerText = product.brand;
      document.getElementById("name").innerText = product.name;
      document.getElementById("price").innerText = `$${product.price}`;
      document.getElementById("desc").innerText = product.desc;
      document.getElementById("mainImg").src = product.image;

      const thumbs = document.querySelectorAll(".small-img");
      thumbs.forEach((img, i) => {
        img.src = product.thumbs[i];
        img.onclick = () => mainImg.src = img.src;
      });
    });
}


// -- CART SYSTEM ----
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// -------------------- TOAST & CART COUNT ANIMATION --
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => document.body.removeChild(toast), 500);
  }, 2000);
}

function animateCartCount() {
  const badge = document.querySelector(".cart-count");
  if (!badge) return;

  badge.classList.add("animate");
  setTimeout(() => badge.classList.remove("animate"), 300);
}

// ---- UPDATE CART COUNT --------------
function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll(".cart-count").forEach(badge => badge.textContent = count);
  animateCartCount();
}

document.addEventListener("DOMContentLoaded", updateCartCount);


// -- ADD TO CART FUNCTION --
function addToCart(product, fromDetails = false) {
  let size = "N/A";

  if (fromDetails) {
    const sizeSelect = document.getElementById("sizeSelect");
    if (sizeSelect && sizeSelect.value.toLowerCase() !== "select size") {
      size = sizeSelect.value;
    }
  } else {
    const sizes = ["S", "M", "L", "XL"];
    while (!sizes.includes(size)) {
      size = prompt(`Choose size for ${product.name}:\n${sizes.join(", ")}\nType exactly one from the list:`);
      if (size === null) {
        size = "N/A";
        break;
      }
    }
  }
  const qtyToAdd = product.qty || 1;
  const existing = cart.find(p => p.name === product.name && p.size === size);
  if (existing) {
    existing.qty += qtyToAdd;   
  } else {
    cart.push({ ...product, qty: qtyToAdd, size }); 
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  showToast(`Added ${product.name} (${size}) ✅`);
}

// -- ADD TO CART FROM PRODUCTS LIST --
document.querySelectorAll(".cart").forEach(btn => {
  btn.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();

    const productElement = btn.closest(".pro");
    const id = productElement.dataset.id;

    fetch("data/products.json")
      .then(res => res.json())
      .then(products => {
        const product = products.find(p => p.id == id);
        if (!product) return;

        addToCart(product); 
      });
  });
});


// -- CART PAGE RENDER --
const cartContainer = document.getElementById("cart-container");

if (cartContainer) {
  function renderCart() {
    cartContainer.innerHTML = "";

    if (cart.length === 0) {
      cartContainer.innerHTML = "<h4>Your cart is empty 🛒</h4>";
      updateTotal();
      return;
    }

    cart.forEach((item, index) => {
      cartContainer.innerHTML += `
        <div class="ca-details">
          <img src="${item.image}">
          <div>
            <h3>${item.name}</h3>
            <h2>$${item.price}</h2>
            <div class="Q-z">
              <div>
                <p>Size</p>
                <input type="text" value="${item.size}" readonly>
              </div>
              <div>
                <p>Qty</p>
                <input type="number" min="1" value="${item.qty}" data-index="${index}" class="qty-input">
              </div>
            </div>
            <button class="remove-btn" data-index="${index}">🗑 Remove</button>
          </div>
        </div>
      `;
    });

    activateCartInputs();
    updateTotal();
  }

  function updateTotal() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const delivery = cart.length > 0 ? 1.9 : 0;
    const total = subtotal + delivery;

    const su = document.querySelectorAll(".su p");
    if (su.length >= 6) {
      su[1].innerText = `$${subtotal.toFixed(2)}`;
      su[3].innerText = `$${delivery.toFixed(2)}`;
      su[5].innerText = `$${total.toFixed(2)}`;
    }
  }

  function activateCartInputs() {
    document.querySelectorAll(".qty-input").forEach(input => {
      input.addEventListener("input", () => {
        const i = input.dataset.index;
        cart[i].qty = parseInt(input.value) || 1;
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
        updateTotal();
      });
    });

    document.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = btn.dataset.index;
        cart.splice(i, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
        updateCartCount();
      });
    });
  }

  const clearBtn = document.getElementById("clear-cart");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      cart = [];
      localStorage.removeItem("cart");
      renderCart();
      updateCartCount();
    });
  }

  renderCart();
}

// ------- ADD TO CART FROM PRODUCT DETAILS PAGE --
const addBtn = document.getElementById("addCartBtn");

if (addBtn) {
  addBtn.addEventListener("click", () => {
    const product = {
      id: Date.now(),
      name: document.getElementById("name").innerText,
      price: parseFloat(document.getElementById("price").innerText.replace("$", "")),
      image: document.getElementById("mainImg").src,
      qty: parseInt(document.getElementById("qtyInput").value) || 1
    };

    addToCart(product, true); 
  });
}

document.querySelectorAll(".go-shop").forEach(btn => {
  btn.addEventListener("click", () => {
    window.location.href = "shop.html";
  });
});




