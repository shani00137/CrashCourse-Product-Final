const CART_KEY = "mds_client_cart";

function getCart() {
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(item => item && Number(item.courseId) > 0)
      : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  return items;
}

function addToCart(items, course) {
  if (items.some(item => item.courseId === course.courseId)) return items;
  return saveCart([...items, course]);
}

function removeFromCart(items, courseId) {
  return saveCart(items.filter(item => item.courseId !== courseId));
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  return [];
}

function cartTotal(items) {
  return items.reduce((total, item) => total + (Number(item.saleRate) || 0), 0);
}

function formatPrice(value) {
  const amount = Number(value) || 0;
  if (amount <= 0) return "Free";
  const hasDecimals = Math.round(amount * 100) % 100 !== 0;
  const [whole, decimal] = amount.toFixed(hasDecimals ? 2 : 0).split(".");
  const withSeparators = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$${withSeparators}${decimal ? `.${decimal}` : ""}`;
}

export {
  addToCart,
  cartTotal,
  clearCart,
  formatPrice,
  getCart,
  removeFromCart,
  saveCart
};
