import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';
export const SOCKET_URL = API_URL.replace(/\/api\/?$/, '') || window.location.origin;

export const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  try {
    const rawToken = localStorage.getItem('shopez_token');
    if (rawToken) {
      const token = JSON.parse(rawToken);
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    const rawToken = localStorage.getItem('shopez_token');
    if (rawToken) config.headers.Authorization = `Bearer ${rawToken}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('shopez_token');
      localStorage.removeItem('shopez_user');
    }
    if (err.code === 'ECONNABORTED' && err.message.includes('timeout')) {
      err.isTimeout = true;
    }
    return Promise.reject(err);
  }
);

const KEYS = {
  USERS: 'shopez_users',
  USER: 'shopez_user',
  TOKEN: 'shopez_token',
  ORDERS: 'shopez_orders_v6',
  PRODUCTS: 'shopez_products_v6',
  ADMIN: 'shopez_admin',
  BANNERS: 'shopez_banners_v6',
  HERO_CONFIG: 'shopez_hero_config_v1',
};

const KEYS_ADMINS = 'shopez_admins';
const VALID_BANNER_TYPES = new Set(['image', 'products']);
const FALLBACK_ADMIN_EMAIL = 'admin@shopez.local';

const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

const getItem = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};

const setItem = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const currency = (value) => Number(value || 0).toFixed(0);

const imageCatalog = {
  headphones: '/images/products/headphones.jpg',
  watch: '/images/products/watch.jpg',
  backpack: '/images/products/backpack.jpg',
  sneakers: '/images/products/sneakers.jpg',
  organizer: '/images/products/organizer.jpg',
  charger: '/images/products/charger.jpg',
  speaker: '/images/products/speaker.jpg',
  lamp: '/images/products/lamp.jpg',
  wallet: '/images/products/wallet.jpg',
  keyboard: '/images/products/keyboard.jpg',
  bottle: '/images/products/bottle.jpg',
  chair: '/images/products/chair.jpg',
  sunglasses: '/images/products/sunglasses.jpg',
  jacket: '/images/products/jacket.jpg',
  dress: '/images/products/dress.jpg',
  perfume: '/images/products/perfume.jpg',
  handbag: '/images/products/handbag.jpg',
  boots: '/images/products/boots.jpg',
  scarf: '/images/products/scarf.jpg',
  hat: '/images/products/hat.jpg',
};

const DEFAULT_PRODUCTS = [
  { id: 1001, name: 'Noise-Cancelling Headphones', category: 'Electronics', price: 6999, salePrice: 5499, description: 'Wireless over-ear headphones with active noise cancellation and all-day comfort.', image: imageCatalog.headphones, rating: 4.6, reviews: 128, reviewList: [], inStock: true, badge: 'Best Seller', createdAt: '2026-04-01T10:00:00.000Z', createdBy: FALLBACK_ADMIN_EMAIL },
  { id: 1002, name: 'Smart Fitness Watch', category: 'Electronics', price: 4999, description: 'Track workouts, sleep, heart rate, and daily activity with a bright AMOLED display.', image: imageCatalog.watch, rating: 4.4, reviews: 89, reviewList: [], inStock: true, badge: 'Popular', createdAt: '2026-04-02T10:00:00.000Z', createdBy: FALLBACK_ADMIN_EMAIL },
  { id: 1003, name: 'Minimal Leather Backpack', category: 'Lifestyle', price: 3299, description: 'A sleek everyday backpack with a laptop sleeve, clean silhouette, and premium finish.', image: imageCatalog.backpack, rating: 4.3, reviews: 64, reviewList: [], inStock: true, badge: 'New', createdAt: '2026-04-03T10:00:00.000Z', createdBy: FALLBACK_ADMIN_EMAIL },
  { id: 1004, name: 'Running Sneakers', category: 'Footwear', price: 3799, salePrice: 2999, description: 'Lightweight performance sneakers designed for grip, cushioning, and daily miles.', image: imageCatalog.sneakers, rating: 4.5, reviews: 156, reviewList: [], inStock: true, badge: 'Sale', createdAt: '2026-04-04T10:00:00.000Z', createdBy: FALLBACK_ADMIN_EMAIL },
  { id: 1005, name: 'Desk Organizer Set', category: 'Accessories', price: 1499, description: 'A modular organizer set to clean up cables, stationery, and your work surface.', image: imageCatalog.organizer, rating: 4.1, reviews: 42, reviewList: [], inStock: true, badge: 'Popular', createdAt: '2026-04-05T10:00:00.000Z', createdBy: FALLBACK_ADMIN_EMAIL },
  { id: 1006, name: 'Wireless Charging Pad', category: 'Electronics', price: 1399, description: 'Fast wireless charging pad with non-slip surface and slim desk-friendly design.', image: imageCatalog.charger, rating: 4.2, reviews: 53, reviewList: [], inStock: true, createdAt: '2026-04-06T10:00:00.000Z', createdBy: FALLBACK_ADMIN_EMAIL },
  { id: 1007, name: 'Portable Bluetooth Speaker', category: 'Electronics', price: 2599, salePrice: 2199, description: 'Portable speaker with deep bass, fast charging, and splash resistance.', image: imageCatalog.speaker, rating: 4.5, reviews: 77, reviewList: [], inStock: true, badge: 'Trending', createdAt: '2026-04-07T10:00:00.000Z', createdBy: FALLBACK_ADMIN_EMAIL },
  { id: 1008, name: 'Ambient Table Lamp', category: 'Lifestyle', price: 1899, description: 'Soft ambient lamp with three brightness modes and a clean matte finish.', image: imageCatalog.lamp, rating: 4.0, reviews: 31, reviewList: [], inStock: true, createdAt: '2026-04-08T10:00:00.000Z', createdBy: FALLBACK_ADMIN_EMAIL },
  { id: 1009, name: 'Slim Card Wallet', category: 'Accessories', price: 1199, description: 'Compact wallet with quick-access card slot and smooth stitched edges.', image: imageCatalog.wallet, rating: 4.1, reviews: 25, reviewList: [], inStock: true, createdAt: '2026-04-09T10:00:00.000Z', createdBy: FALLBACK_ADMIN_EMAIL },
  { id: 1010, name: 'Mechanical Keyboard', category: 'Electronics', price: 4599, description: 'Tactile mechanical keyboard with compact layout and warm white backlight.', image: imageCatalog.keyboard, rating: 4.7, reviews: 110, reviewList: [], inStock: true, badge: 'Best Seller', createdAt: '2026-04-10T10:00:00.000Z', createdBy: FALLBACK_ADMIN_EMAIL },
  { id: 1011, name: 'Insulated Steel Bottle', category: 'Accessories', price: 999, description: 'Vacuum insulated bottle that keeps drinks cold or hot for hours.', image: imageCatalog.bottle, rating: 4.3, reviews: 58, reviewList: [], inStock: true, createdAt: '2026-04-11T10:00:00.000Z', createdBy: FALLBACK_ADMIN_EMAIL },
  { id: 1012, name: 'Ergo Office Chair', category: 'Lifestyle', price: 8999, salePrice: 7999, description: 'Supportive chair with breathable mesh, headrest, and adjustable lumbar support.', image: imageCatalog.chair, rating: 4.6, reviews: 67, reviewList: [], inStock: true, badge: 'Top Rated', createdAt: '2026-04-12T10:00:00.000Z', createdBy: FALLBACK_ADMIN_EMAIL },
  { id: 1013, name: 'Classic Aviator Sunglasses', category: 'Fashion', price: 2499, salePrice: 1999, description: 'Timeless aviator sunglasses with UV400 protection and a lightweight metal frame.', image: imageCatalog.sunglasses, rating: 4.8, reviews: 215, reviewList: [], inStock: true, badge: 'Trending', createdAt: '2026-04-13T10:00:00.000Z', createdBy: FALLBACK_ADMIN_EMAIL },
  { id: 1014, name: 'Vintage Leather Jacket', category: 'Fashion', price: 12999, salePrice: 9999, description: 'Premium genuine leather jacket with a vintage finish and comfortable fit.', image: imageCatalog.jacket, rating: 4.9, reviews: 84, reviewList: [], inStock: true, badge: 'Best Seller', createdAt: '2026-04-14T10:00:00.000Z', createdBy: FALLBACK_ADMIN_EMAIL },
  { id: 1015, name: 'Summer Floral Dress', category: 'Fashion', price: 3499, description: 'Lightweight and breezy floral dress perfect for summer outings and beach walks.', image: imageCatalog.dress, rating: 4.5, reviews: 142, reviewList: [], inStock: true, createdAt: '2026-04-15T10:00:00.000Z', createdBy: FALLBACK_ADMIN_EMAIL },
  { id: 1016, name: 'Signature Eau de Parfum', category: 'Fashion', price: 4599, description: 'A captivating signature fragrance with notes of vanilla, amber, and musk.', image: imageCatalog.perfume, rating: 4.7, reviews: 310, reviewList: [], inStock: true, badge: 'Popular', createdAt: '2026-04-16T10:00:00.000Z', createdBy: FALLBACK_ADMIN_EMAIL },
  { id: 1017, name: 'Luxury Leather Handbag', category: 'Fashion', price: 8999, salePrice: 7499, description: 'Elegant and spacious luxury leather handbag with gold-tone hardware.', image: imageCatalog.handbag, rating: 4.6, reviews: 92, reviewList: [], inStock: true, badge: 'Sale', createdAt: '2026-04-17T10:00:00.000Z', createdBy: FALLBACK_ADMIN_EMAIL },
  { id: 1018, name: 'Suede Ankle Boots', category: 'Fashion', price: 5499, description: 'Stylish suede ankle boots with a comfortable block heel and side zipper.', image: imageCatalog.boots, rating: 4.4, reviews: 118, reviewList: [], inStock: true, createdAt: '2026-04-18T10:00:00.000Z', createdBy: FALLBACK_ADMIN_EMAIL },
  { id: 1019, name: 'Cashmere Winter Scarf', category: 'Fashion', price: 1899, description: 'Incredibly soft cashmere scarf to keep you warm and stylish during winter.', image: imageCatalog.scarf, rating: 4.8, reviews: 204, reviewList: [], inStock: true, createdAt: '2026-04-19T10:00:00.000Z', createdBy: FALLBACK_ADMIN_EMAIL },
  { id: 1020, name: 'Wide Brim Fedora Hat', category: 'Fashion', price: 2199, salePrice: 1799, description: 'Classic wide brim fedora hat made from premium wool felt for a timeless look.', image: imageCatalog.hat, rating: 4.5, reviews: 76, reviewList: [], inStock: true, badge: 'New', createdAt: '2026-04-20T10:00:00.000Z', createdBy: FALLBACK_ADMIN_EMAIL },
];

const DEFAULT_BANNERS = [
  {
    id: 2001,
    type: 'image',
    title: 'Summer Tech Deals',
    image: '/images/banners/summer-tech.jpg',
    link: '/',
    productIds: [],
    size: 'full-width',
  },
  {
    id: 2002,
    type: 'image',
    title: 'Desk Setup Refresh',
    image: '/images/banners/desk-setup.jpg',
    link: '/',
    productIds: [],
    size: 'default',
  },
  {
    id: 2004,
    type: 'image',
    title: 'Fashion Week Sale',
    image: '/images/banners/fashion-week.jpg',
    link: '/',
    productIds: [],
    size: 'full-width',
  },
  {
    id: 2005,
    type: 'image',
    title: 'Accessories Collection',
    image: '/images/banners/accessories-sale.jpg',
    link: '/',
    productIds: [],
    size: 'default',
  },
];

const normalizePrice = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const normalizeProduct = (product, index = 0) => {
  if (!product || typeof product !== 'object') return null;
  const name = String(product.name || '').trim();
  const category = String(product.category || '').trim() || 'Other';
  const price = normalizePrice(product.price);
  if (!name || price === null) return null;

  const salePrice = normalizePrice(product.salePrice);
  const rating = Number(product.rating);
  const reviews = Number(product.reviews);
  const createdAt = product.createdAt || new Date().toISOString();

  return {
    ...product,
    id: product.id ?? Date.now() + index,
    name,
    category,
    description: String(product.description || '').trim(),
    price,
    salePrice: salePrice !== null && salePrice < price ? salePrice : null,
    image: typeof product.image === 'string' && product.image.trim()
      ? product.image
      : '/images/products/headphones.jpg',
    rating: Number.isFinite(rating) && rating >= 0 ? rating : 0,
    reviews: Number.isFinite(reviews) && reviews >= 0 ? reviews : 0,
    reviewList: Array.isArray(product.reviewList) ? product.reviewList : [],
    inStock: product.inStock !== false,
    badge: product.badge ? String(product.badge).trim() : '',
    createdAt,
    createdBy: product.createdBy || FALLBACK_ADMIN_EMAIL,
  };
};

const normalizeBanner = (banner, validProductIds, index = 0) => {
  if (!banner || typeof banner !== 'object') return null;
  const type = VALID_BANNER_TYPES.has(banner.type) ? banner.type : 'image';
  const title = String(banner.title || '').trim() || (type === 'products' ? 'Featured Products' : 'ShopEZ Banner');
  const productIds = Array.isArray(banner.productIds)
    ? banner.productIds.map((id) => Number(id)).filter((id) => validProductIds.has(id))
    : [];

  if (type === 'products' && productIds.length === 0) return null;

  const image = type === 'image'
    ? (typeof banner.image === 'string' && banner.image.trim()
      ? banner.image
      : '/images/banners/summer-tech.jpg')
    : '';

  return {
    ...banner,
    id: banner.id ?? Date.now() + index,
    type,
    title,
    image,
    link: String(banner.link || '/').trim() || '/',
    productIds,
    size: banner.size === 'full-width' ? 'full-width' : 'default',
    scale: banner.scale ? Number(banner.scale) : 100,
  };
};

const sanitizeProducts = (products) => {
  if (!Array.isArray(products)) return [];
  return products
    .map((product, index) => normalizeProduct(product, index))
    .filter(Boolean);
};

const sanitizeBanners = (banners, products) => {
  if (!Array.isArray(banners)) return [];
  const validProductIds = new Set(products.map((product) => Number(product.id)));
  return banners
    .map((banner, index) => normalizeBanner(banner, validProductIds, index))
    .filter(Boolean);
};

const ensureSeedData = () => {
  let products = sanitizeProducts(getItem(KEYS.PRODUCTS));
  if (products.length === 0) {
    products = sanitizeProducts(DEFAULT_PRODUCTS);
  }
  setItem(KEYS.PRODUCTS, products);

  let banners = sanitizeBanners(getItem(KEYS.BANNERS), products);
  if (banners.length === 0) {
    banners = sanitizeBanners(DEFAULT_BANNERS, products);
  }
  setItem(KEYS.BANNERS, banners);

  return { products, banners };
};

ensureSeedData();

const normalizeRegistrationError = (message) => {
  const lowered = String(message || '').toLowerCase();
  if (lowered.includes('already') && (lowered.includes('registered') || lowered.includes('exist'))) {
    return 'Account already exists. Please sign in.';
  }
  return message;
};

export const registerUser = async ({ name, email, password, phone }) => {
  try {
    const res = await axiosInstance.post('/auth/register', { name, email, password, phone });
    return {
      success: true,
      message: res.data.message,
      otpPreview: res.data.otpPreview || '',
      deliveryMode: res.data.deliveryMode || 'email',
    };
  } catch (err) {
    let errorMsg = 'Registration failed';
    if (err.isTimeout) errorMsg = 'Request timed out.';
    else if (err.response?.data?.message) errorMsg = normalizeRegistrationError(err.response.data.message);
    else if (err.message === 'Network Error') errorMsg = 'Backend server is offline. Please start it.';
    return { success: false, error: errorMsg };
  }
};

export const loginUser = async ({ email, password }) => {
  try {
    const res = await axiosInstance.post('/auth/login', { email, password });
    const { token, _id, name, phone, role } = res.data;
    const safeUser = { id: _id, name, email, phone, role };
    setItem(KEYS.USER, safeUser);
    setItem(KEYS.TOKEN, token);
    return { success: true, user: safeUser, token };
  } catch (err) {
    let errorMsg = 'Login failed';
    if (err.isTimeout) errorMsg = 'Request timed out.';
    else if (err.response?.data?.message) errorMsg = err.response.data.message;
    else if (err.message === 'Network Error') errorMsg = 'Backend server is offline. Please start it.';
    return { success: false, error: errorMsg };
  }
};

export const getCurrentUser = () => getItem(KEYS.USER);

export const logoutUser = () => {
  localStorage.removeItem(KEYS.USER);
  localStorage.removeItem(KEYS.TOKEN);
};

export const verifyOtp = async ({ email, otp, phoneOtp }) => {
  try {
    const res = await axiosInstance.post('/auth/verify-otp', { email, otp, phoneOtp });
    const { token, _id, name, phone, role } = res.data;
    const safeUser = { id: _id, name, email, phone, role };
    setItem(KEYS.USER, safeUser);
    setItem(KEYS.TOKEN, token);
    return { success: true, user: safeUser, token };
  } catch (err) {
    let errorMsg = 'OTP verification failed';
    if (err.isTimeout) errorMsg = 'Request timed out.';
    else if (err.response?.data?.message) errorMsg = err.response.data.message;
    else if (err.message === 'Network Error') errorMsg = 'Backend server is offline. Please start it.';
    return { success: false, error: errorMsg };
  }
};

export const resendOtp = async ({ email }) => {
  try {
    const res = await axiosInstance.post('/auth/resend-otp', { email });
    return {
      success: true,
      message: res.data.message,
      otpPreview: res.data.otpPreview || '',
      deliveryMode: res.data.deliveryMode || 'email',
    };
  } catch (err) {
    let errorMsg = 'Failed to resend OTP';
    if (err.isTimeout) errorMsg = 'Request timed out.';
    else if (err.response?.data?.message) errorMsg = err.response.data.message;
    else if (err.message === 'Network Error') errorMsg = 'Backend server is offline. Please start it.';
    return { success: false, error: errorMsg };
  }
};

export const updateUserProfile = async (data) => {
  try {
    const res = await axiosInstance.put('/auth/profile', data);
    const { token, _id, name, email, phone, role } = res.data;
    const safeUser = { id: _id, name, email, phone, role };
    setItem(KEYS.USER, safeUser);
    setItem(KEYS.TOKEN, token);
    return { success: true, user: safeUser, token, message: res.data.message };
  } catch (err) {
    return { success: false, error: err.response?.data?.message || 'Failed to update profile' };
  }
};

export const deleteUserProfile = async () => {
  try {
    const res = await axiosInstance.delete('/auth/profile');
    return { success: true, message: res.data.message };
  } catch (err) {
    return { success: false, error: err.response?.data?.message || 'Failed to delete account' };
  }
};

export const forgotPassword = async (email) => {
  try {
    const res = await axiosInstance.post('/auth/forgot-password', { email });
    return {
      success: true,
      message: res.data.message,
      otpPreview: res.data.otpPreview || '',
      deliveryMode: res.data.deliveryMode || 'email',
    };
  } catch (err) {
    let errorMsg = 'Failed to send reset code';
    if (err.isTimeout) errorMsg = 'Request timed out. Email server taking too long.';
    else if (err.response?.data?.message) errorMsg = err.response.data.message;
    else if (err.message === 'Network Error') errorMsg = 'Backend server is offline. Please start it.';
    return { success: false, error: errorMsg };
  }
};

export const resetPassword = async (data) => {
  try {
    const res = await axiosInstance.post('/auth/reset-password', data);
    return { success: true, message: res.data.message };
  } catch (err) {
    return { success: false, error: err.response?.data?.message || 'Failed to reset password' };
  }
};

export const getUsers = async () => {
  await delay(300);
  return getItem(KEYS.USERS) || [];
};

export const registerAdmin = async ({ name, email, password }) => {
  await delay();
  const admins = getItem(KEYS_ADMINS) || [];
  if (admins.find((admin) => admin.email === email)) {
    return { success: false, error: 'An admin with this email already exists.' };
  }
  const admin = { id: Date.now(), name, email, password, role: 'admin', createdAt: new Date().toISOString() };
  setItem(KEYS_ADMINS, [...admins, admin]);
  const safeAdmin = { id: admin.id, name: admin.name, email: admin.email, role: 'admin' };
  setItem(KEYS.ADMIN, safeAdmin);
  return { success: true, admin: safeAdmin };
};

export const loginAdmin = async ({ email, password }) => {
  await delay();
  const admins = getItem(KEYS_ADMINS) || [];
  if (email === 'admin0000@gmail.com' && password === 'admin@0000') {
    const adminData = { id: 1, name: 'Master Admin', email: 'admin0000@gmail.com', role: 'admin' };
    setItem(KEYS.ADMIN, adminData);
    return { success: true, admin: adminData };
  }
  const adminUser = admins.find((admin) => admin.email === email && admin.password === password);
  if (adminUser) {
    const safeAdmin = { id: adminUser.id, name: adminUser.name, email: adminUser.email, role: 'admin' };
    setItem(KEYS.ADMIN, safeAdmin);
    return { success: true, admin: safeAdmin };
  }
  return { success: false, error: 'Invalid admin credentials.' };
};

export const getCurrentAdmin = () => getItem(KEYS.ADMIN);

export const logoutAdmin = () => {
  localStorage.removeItem(KEYS.ADMIN);
};

export const updateAdminDetails = async (id, data) => {
  await delay();
  const admins = getItem(KEYS_ADMINS) || [];
  const updatedAdmins = admins.map((admin) => (admin.id === id ? { ...admin, ...data } : admin));
  setItem(KEYS_ADMINS, updatedAdmins);
  const currentAdmin = getItem(KEYS.ADMIN);
  if (currentAdmin && currentAdmin.id === id) {
    const updatedCurrent = { ...currentAdmin, ...data };
    setItem(KEYS.ADMIN, updatedCurrent);
    return { success: true, admin: updatedCurrent };
  }
  if (currentAdmin && currentAdmin.id === 1 && id === 1) {
    const updatedCurrent = { ...currentAdmin, ...data };
    setItem(KEYS.ADMIN, updatedCurrent);
    return { success: true, admin: updatedCurrent };
  }
  return { success: false, error: 'Admin not found.' };
};

export const getProducts = async () => {
  await delay(300);
  return ensureSeedData().products;
};

export const addProduct = async (productData) => {
  await delay();
  const currentProducts = ensureSeedData().products;
  const createdBy = productData.createdBy || getCurrentAdmin()?.email || FALLBACK_ADMIN_EMAIL;
  const newProduct = normalizeProduct(
    {
      ...productData,
      id: Date.now(),
      createdBy,
      reviews: 0,
      reviewList: [],
      rating: 0,
      createdAt: new Date().toISOString(),
    },
    currentProducts.length
  );
  setItem(KEYS.PRODUCTS, [newProduct, ...currentProducts]);
  return newProduct;
};

export const deleteProduct = async (id) => {
  await delay(250);
  const products = ensureSeedData().products.filter((product) => product.id !== id);
  setItem(KEYS.PRODUCTS, products);
  const banners = sanitizeBanners(getItem(KEYS.BANNERS), products);
  setItem(KEYS.BANNERS, banners);
  return { success: true };
};

export const updateProduct = async (id, data) => {
  await delay();
  const products = ensureSeedData().products;
  const target = products.find((product) => product.id === id);
  if (!target) return null;
  const updatedProduct = normalizeProduct({ ...target, ...data, id: target.id });
  const updatedProducts = products.map((product) => (product.id === id ? updatedProduct : product));
  setItem(KEYS.PRODUCTS, updatedProducts);
  const banners = sanitizeBanners(getItem(KEYS.BANNERS), updatedProducts);
  setItem(KEYS.BANNERS, banners);
  return updatedProduct;
};

export const addReview = async (productId, reviewData) => {
  await delay();
  const products = ensureSeedData().products;
  const productIndex = products.findIndex((product) => product.id === productId);
  if (productIndex === -1) return { success: false, error: 'Product not found' };
  const product = products[productIndex];
  const newReview = { id: Date.now(), ...reviewData, createdAt: new Date().toISOString() };
  const updatedReviewList = [...(product.reviewList || []), newReview];
  const totalRating = updatedReviewList.reduce((sum, review) => sum + review.rating, 0);
  const updatedProduct = normalizeProduct({
    ...product,
    reviewList: updatedReviewList,
    reviews: updatedReviewList.length,
    rating: parseFloat((totalRating / updatedReviewList.length).toFixed(1)),
  });
  products[productIndex] = updatedProduct;
  setItem(KEYS.PRODUCTS, products);
  return { success: true, product: updatedProduct };
};

export const deleteReview = async (reviewId, productId) => {
  try {
    const products = ensureSeedData().products;
    const productIndex = products.findIndex((product) => product.id === productId);
    if (productIndex === -1) return { success: false, error: 'Product not found' };
    const product = products[productIndex];
    const reviewToDelete = (product.reviewList || []).find((review) => review.id === reviewId);
    if (!reviewToDelete) return { success: false, error: 'Review not found' };
    const currentUser = getItem(KEYS.USER);
    const admin = getItem(KEYS.ADMIN);
    const isOwner = currentUser && currentUser.id === reviewToDelete.userId;
    const isAdmin = admin || (currentUser && currentUser.role === 'admin');
    if (!isOwner && !isAdmin) {
      return { success: false, error: 'Not authorized to delete this review' };
    }
    const updatedReviewList = (product.reviewList || []).filter((review) => review.id !== reviewId);
    const rating = updatedReviewList.length > 0
      ? parseFloat((updatedReviewList.reduce((sum, review) => sum + review.rating, 0) / updatedReviewList.length).toFixed(1))
      : 0;
    const updatedProduct = normalizeProduct({
      ...product,
      reviewList: updatedReviewList,
      reviews: updatedReviewList.length,
      rating,
    });
    products[productIndex] = updatedProduct;
    setItem(KEYS.PRODUCTS, products);
    return { success: true, product: updatedProduct };
  } catch {
    return { success: false, error: 'Failed to delete review' };
  }
};

export const createOrder = async ({ userId, items, total, address, paymentMethod, paymentId }) => {
  try {
    const res = await axiosInstance.post('/orders', {
      userId,
      products: items.map(i => ({ productId: i.id || i._id, name: i.name, qty: i.qty, price: i.price, createdBy: i.createdBy || 'admin0000@gmail.com' })),
      totalAmount: total,
      address: { ...address, name: address.fullName || address.name || 'Guest' },
      paymentMethod,
      paymentId
    });
    return { success: true, order: { ...res.data, id: res.data._id, items: res.data.products, total: res.data.totalAmount, date: res.data.createdAt } };
  } catch (err) {
    return { success: false, error: err.response?.data?.message || 'Failed to place order' };
  }
};

export const getOrders = async (userId) => {
  if (!userId) return [];
  try {
    const res = await axiosInstance.get(`/orders/user/${userId}`);
    return res.data.map(o => ({ ...o, id: o._id, total: o.totalAmount, items: o.products }));
  } catch {
    return [];
  }
};

export const getAllOrders = async () => {
  try {
    const res = await axiosInstance.get('/orders');
    return res.data.map(o => ({ ...o, id: o._id, total: o.totalAmount, date: o.createdAt, items: o.products }));
  } catch {
    return [];
  }
};

export const updateOrderStatus = async (orderId, status, deliveryDetails = null) => {
  try {
    await axiosInstance.patch(`/orders/${orderId}/status`, { status, deliveryDetails });
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update order status' };
  }
};

export const cancelUserOrder = async (orderId) => {
  try {
    await axiosInstance.patch(`/orders/${orderId}/cancel`);
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to cancel order' };
  }
};

export const getHeroConfig = async () => {
  await delay(200);
  const data = getItem(KEYS.HERO_CONFIG);
  if (!data) {
    return {
      title1: 'Shop Smart, Shop ',
      titleAccent: 'Easy',
      subtitle: 'Discover premium products curated just for you, from electronics to lifestyle essentials.',
      eyebrow: 'New arrivals every week',
      images: [],
      color: '#ffffff',
      fontFamily: 'var(--font)',
      scale: 100
    };
  }
  return data;
};

export const updateHeroConfig = async (config) => {
  await delay();
  setItem(KEYS.HERO_CONFIG, config);
  window.dispatchEvent(new Event('heroConfigUpdated'));
  return { success: true };
};

export const getBanners = async () => {
  await delay(250);
  return ensureSeedData().banners;
};

export const addBanner = async (bannerData) => {
  await delay();
  const { products, banners } = ensureSeedData();
  const validBanner = normalizeBanner({ ...bannerData, id: Date.now() }, new Set(products.map((product) => Number(product.id))), banners.length);
  if (!validBanner) {
    return { success: false, error: 'Banner is missing required data.' };
  }
  const updated = [...banners, validBanner];
  setItem(KEYS.BANNERS, updated);
  return { success: true, banner: validBanner };
};

export const deleteBanner = async (id) => {
  await delay();
  const banners = ensureSeedData().banners.filter((banner) => banner.id !== id);
  setItem(KEYS.BANNERS, banners);
  return { success: true };
};

export const updateBanner = async (id, data) => {
  await delay();
  const { products, banners } = ensureSeedData();
  const validProductIds = new Set(products.map((product) => Number(product.id)));
  const updated = banners
    .map((banner) => (banner.id === id ? normalizeBanner({ ...banner, ...data }, validProductIds) : banner))
    .filter(Boolean);
  setItem(KEYS.BANNERS, updated);
  return { success: true };
};

export const formatPrice = (value) => `₹${currency(value)}`;
