// ===== Bazaaro — Product Data =====
// Shared across index, products, product-detail, and cart pages.

const PRODUCTS = [
  { id: 1, name: "Wireless Bluetooth Earbuds", category: "Electronics", price: 1499, mrp: 2999, rating: 4.3, image: "https://picsum.photos/seed/earbuds/400/400", desc: "True wireless earbuds with 24-hour battery backup, deep bass, and touch controls." },
  { id: 2, name: "Smart Fitness Band", category: "Electronics", price: 1899, mrp: 2499, rating: 4.1, image: "https://picsum.photos/seed/fitband/400/400", desc: "Track your steps, heart rate, and sleep with this lightweight smart band." },
  { id: 3, name: "Men's Cotton Casual Shirt", category: "Fashion", price: 799, mrp: 1499, rating: 4.0, image: "https://picsum.photos/seed/shirt/400/400", desc: "Breathable 100% cotton shirt, perfect for everyday casual wear." },
  { id: 4, name: "Women's Ethnic Kurti", category: "Fashion", price: 599, mrp: 1199, rating: 4.4, image: "https://picsum.photos/seed/kurti/400/400", desc: "Printed rayon kurti with a comfortable fit, ideal for daily and festive wear." },
  { id: 5, name: "Non-Stick Cookware Set", category: "Home & Kitchen", price: 1299, mrp: 2199, rating: 4.2, image: "https://picsum.photos/seed/cookware/400/400", desc: "5-piece non-stick cookware set, easy to clean and safe for all stovetops." },
  { id: 6, name: "LED Desk Lamp", category: "Home & Kitchen", price: 499, mrp: 899, rating: 4.5, image: "https://picsum.photos/seed/lamp/400/400", desc: "Adjustable brightness LED lamp with USB charging port, ideal for study and work." },
  { id: 7, name: "Running Shoes", category: "Footwear", price: 1699, mrp: 2999, rating: 4.3, image: "https://picsum.photos/seed/shoes/400/400", desc: "Lightweight running shoes with cushioned sole for all-day comfort." },
  { id: 8, name: "Leather Wallet", category: "Fashion", price: 399, mrp: 799, rating: 4.0, image: "https://picsum.photos/seed/wallet/400/400", desc: "Genuine leather wallet with multiple card slots and coin pocket." },
  { id: 9, name: "Bluetooth Party Speaker", category: "Electronics", price: 2299, mrp: 3499, rating: 4.4, image: "https://picsum.photos/seed/speaker/400/400", desc: "Powerful bass speaker with RGB lights, 12-hour playback, and IPX5 water resistance." },
  { id: 10, name: "Kids Storybook Set", category: "Books", price: 349, mrp: 599, rating: 4.6, image: "https://picsum.photos/seed/books/400/400", desc: "Set of 5 illustrated storybooks for children aged 4-9 years." },
  { id: 11, name: "Yoga Mat", category: "Sports", price: 599, mrp: 999, rating: 4.2, image: "https://picsum.photos/seed/yogamat/400/400", desc: "Anti-slip 6mm yoga mat, lightweight and easy to carry." },
  { id: 12, name: "Stainless Steel Water Bottle", category: "Home & Kitchen", price: 349, mrp: 599, rating: 4.5, image: "https://picsum.photos/seed/bottle/400/400", desc: "Double-wall insulated bottle keeps drinks cold for 24 hours, hot for 12 hours." },
];

const CATEGORIES = ["Electronics", "Fashion", "Home & Kitchen", "Footwear", "Books", "Sports"];

function getProductById(id) {
  return PRODUCTS.find(p => p.id === Number(id));
}

function formatPrice(n) {
  return "₹" + n.toLocaleString("en-IN");
}

function discountPercent(price, mrp) {
  return Math.round(((mrp - price) / mrp) * 100);
}
