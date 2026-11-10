// ===== Bazaaro — Cart Logic (shared) =====
// Cart is stored in localStorage as: { "<productId>": quantity, ... }

function getCart() {
  try {
    return JSON.parse(localStorage.getItem("bazaaro_cart")) || {};
  } catch (e) {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem("bazaaro_cart", JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, qty = 1) {
  const cart = getCart();
  cart[productId] = (cart[productId] || 0) + qty;
  saveCart(cart);
}

function setCartQty(productId, qty) {
  const cart = getCart();
  if (qty <= 0) {
    delete cart[productId];
  } else {
    cart[productId] = qty;
  }
  saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart();
  delete cart[productId];
  saveCart(cart);
}

function getCartItemCount() {
  const cart = getCart();
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = getCartItemCount();
}

// Run on every page load
document.addEventListener("DOMContentLoaded", updateCartBadge);
