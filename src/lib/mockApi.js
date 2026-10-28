/**
 * Mock API - the whole frontend runs against this until the Spring Boot
 * backend exists. Every function here has the same signature and return
 * shape as the real HTTP call in src/lib/api.js, so switching over is a
 * one-line change in .env (VITE_USE_MOCK_API=false).
 */
import {
  RESTAURANTS,
  CATEGORIES,
  BANNERS,
  COUPONS,
  AREAS,
  ORDER_STATUSES,
} from '../data/catalog';
import { getItem, setItem, STORAGE_KEYS } from './storage';
import { uid, orderNumber } from './id';
import { calculateBill, couponIsUsable } from './pricing';

/* ---------------------------------------------------------------- */
/* infrastructure                                                    */
/* ---------------------------------------------------------------- */
const MIN_LATENCY = 160;
const MAX_LATENCY = 420;
const wait = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms ?? MIN_LATENCY + Math.random() * (MAX_LATENCY - MIN_LATENCY)),
  );

export class MockError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'MockError';
    this.status = status;
  }
}

const encode = (value) => btoa(unescape(encodeURIComponent(`myfood::${value}`)));

/* Demo orders move through the delivery stages quickly so the tracking
   screen can actually be seen working. A real backend replaces this with
   rider events. */
const STAGE_INTERVAL_MS = 20000;

/* ---------------------------------------------------------------- */
/* users                                                             */
/* ---------------------------------------------------------------- */
const DEMO_USER = {
  id: 'usr_demo',
  name: 'Demo User',
  email: 'demo@myfood.app',
  phone: '9876543210',
  passwordHash: encode('demo1234'),
  createdAt: new Date('2026-01-12T09:00:00Z').toISOString(),
  addresses: [
    {
      id: 'adr_demo',
      label: 'Home',
      line1: '12/4, Second Main Road',
      line2: 'Near Anna Nagar Tower Park',
      area: 'Anna Nagar',
      city: 'Chennai',
      pincode: '600040',
      phone: '9876543210',
      isDefault: true,
    },
  ],
};

const readUsers = () => {
  const users = getItem(STORAGE_KEYS.users, null);
  if (!Array.isArray(users) || users.length === 0) {
    setItem(STORAGE_KEYS.users, [DEMO_USER]);
    return [DEMO_USER];
  }
  return users;
};

const writeUsers = (users) => setItem(STORAGE_KEYS.users, users);

const publicUser = ({ passwordHash, ...rest }) => rest;

const findUserByToken = (token) => {
  if (!token || !token.startsWith('mock.')) throw new MockError('Please sign in again.', 401);
  const [, userId] = token.split('.');
  const user = readUsers().find((candidate) => candidate.id === userId);
  if (!user) throw new MockError('Session expired. Please sign in again.', 401);
  return user;
};

const requireUser = (token) => findUserByToken(token);

/* ---------------------------------------------------------------- */
/* catalogue                                                         */
/* ---------------------------------------------------------------- */
export async function getCategories() {
  await wait(120);
  return CATEGORIES;
}

export async function getBanners() {
  await wait(120);
  return BANNERS;
}

export async function getCoupons() {
  await wait(120);
  return COUPONS;
}

export async function getAreas() {
  await wait(80);
  return AREAS;
}

const matchesSearch = (restaurant, term) => {
  if (!term) return true;
  const needle = term.trim().toLowerCase();
  if (!needle) return true;
  const haystacks = [
    restaurant.name,
    ...restaurant.cuisines,
    restaurant.area,
    ...restaurant.menu.map((item) => item.name),
  ];
  return haystacks.some((value) => value.toLowerCase().includes(needle));
};

export async function getRestaurants(params = {}) {
  await wait();
  const {
    search = '',
    cuisines = [],
    area = '',
    vegOnly = false,
    maxPrice = null,
    minRating = 0,
    hasOffer = false,
    sort = 'relevance',
    page = 1,
    pageSize = 9,
  } = params;

  let items = RESTAURANTS.filter((restaurant) => {
    if (!matchesSearch(restaurant, search)) return false;
    if (cuisines.length && !cuisines.some((cuisine) => restaurant.cuisines.includes(cuisine))) {
      return false;
    }
    if (area && restaurant.area !== area) return false;
    if (vegOnly && !restaurant.menu.some((item) => item.isVeg)) return false;
    if (maxPrice != null && restaurant.priceForOne > maxPrice) return false;
    if (minRating && restaurant.rating < minRating) return false;
    if (hasOffer && !restaurant.offer) return false;
    return true;
  });

  const sorters = {
    relevance: (a, b) => Number(b.isPromoted) - Number(a.isPromoted) || b.rating - a.rating,
    rating: (a, b) => b.rating - a.rating,
    delivery: (a, b) => a.deliveryTimeMin - b.deliveryTimeMin,
    'price-low': (a, b) => a.priceForOne - b.priceForOne,
    'price-high': (a, b) => b.priceForOne - a.priceForOne,
  };
  items = [...items].sort(sorters[sort] || sorters.relevance);

  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);

  return {
    items: paged,
    total: items.length,
    page,
    pageSize,
    hasMore: start + paged.length < items.length,
  };
}

export async function getRestaurant(id) {
  await wait();
  const restaurant = RESTAURANTS.find((candidate) => candidate.id === id);
  if (!restaurant) throw new MockError('Restaurant not found.', 404);
  return restaurant;
}

export async function getFeaturedRestaurants(limit = 6) {
  await wait(200);
  return [...RESTAURANTS]
    .sort((a, b) => Number(b.isPromoted) - Number(a.isPromoted) || b.rating - a.rating)
    .slice(0, limit);
}

export async function validateCoupon(code, subtotal) {
  await wait(220);
  const coupon = COUPONS.find((candidate) => candidate.code === code.trim().toUpperCase());
  if (!coupon) throw new MockError('That coupon code is not valid.', 404);
  if (!couponIsUsable(coupon, subtotal)) {
    throw new MockError(`Add items worth ${coupon.minOrder - subtotal} more to use this coupon.`, 422);
  }
  return coupon;
}

/* ---------------------------------------------------------------- */
/* auth                                                              */
/* ---------------------------------------------------------------- */
export async function login({ email, password }) {
  await wait();
  const user = readUsers().find(
    (candidate) => candidate.email.toLowerCase() === String(email).trim().toLowerCase(),
  );
  if (!user || user.passwordHash !== encode(password)) {
    throw new MockError('Incorrect email or password.', 401);
  }
  return { token: `mock.${user.id}.${Date.now()}`, user: publicUser(user) };
}

export async function signup({ name, email, phone, password }) {
  await wait();
  const users = readUsers();
  const exists = users.some(
    (candidate) => candidate.email.toLowerCase() === String(email).trim().toLowerCase(),
  );
  if (exists) throw new MockError('An account with this email already exists.', 409);

  const user = {
    id: uid('usr'),
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    phone: String(phone).trim(),
    passwordHash: encode(password),
    createdAt: new Date().toISOString(),
    addresses: [],
  };
  writeUsers([...users, user]);
  return { token: `mock.${user.id}.${Date.now()}`, user: publicUser(user) };
}

export async function forgotPassword({ email }) {
  await wait();
  const exists = readUsers().some(
    (candidate) => candidate.email.toLowerCase() === String(email).trim().toLowerCase(),
  );
  // Never reveal whether an account exists.
  return {
    message: exists
      ? 'If an account exists for this email, a reset link is on its way.'
      : 'If an account exists for this email, a reset link is on its way.',
  };
}

export async function me(token) {
  await wait(120);
  return publicUser(requireUser(token));
}

export async function updateProfile(token, patch) {
  await wait();
  const user = requireUser(token);
  const users = readUsers().map((candidate) =>
    candidate.id === user.id ? { ...candidate, ...patch } : candidate,
  );
  writeUsers(users);
  return publicUser(users.find((candidate) => candidate.id === user.id));
}

export async function changePassword(token, { currentPassword, newPassword }) {
  await wait();
  const user = requireUser(token);
  if (user.passwordHash !== encode(currentPassword)) {
    throw new MockError('Your current password is not correct.', 401);
  }
  const users = readUsers().map((candidate) =>
    candidate.id === user.id ? { ...candidate, passwordHash: encode(newPassword) } : candidate,
  );
  writeUsers(users);
  return { message: 'Password updated.' };
}

/* ---------------------------------------------------------------- */
/* addresses                                                         */
/* ---------------------------------------------------------------- */
export async function saveAddress(token, address) {
  await wait();
  const user = requireUser(token);
  const users = readUsers();
  const target = users.find((candidate) => candidate.id === user.id);
  let addresses = [...(target.addresses || [])];

  if (address.id) {
    addresses = addresses.map((existing) =>
      existing.id === address.id ? { ...existing, ...address } : existing,
    );
  } else {
    const created = { ...address, id: uid('adr') };
    addresses = addresses.length === 0 ? [{ ...created, isDefault: true }] : [...addresses, created];
  }

  if (address.isDefault) {
    addresses = addresses.map((existing) => ({
      ...existing,
      isDefault: existing.id === (address.id || addresses[addresses.length - 1].id),
    }));
  }

  const updated = { ...target, addresses };
  writeUsers(users.map((candidate) => (candidate.id === user.id ? updated : candidate)));
  return publicUser(updated);
}

export async function deleteAddress(token, addressId) {
  await wait();
  const user = requireUser(token);
  const users = readUsers();
  const target = users.find((candidate) => candidate.id === user.id);
  let addresses = (target.addresses || []).filter((address) => address.id !== addressId);
  if (addresses.length && !addresses.some((address) => address.isDefault)) {
    addresses = addresses.map((address, index) => ({ ...address, isDefault: index === 0 }));
  }
  const updated = { ...target, addresses };
  writeUsers(users.map((candidate) => (candidate.id === user.id ? updated : candidate)));
  return publicUser(updated);
}

/* ---------------------------------------------------------------- */
/* orders                                                            */
/* ---------------------------------------------------------------- */
const ordersKey = (userId) => `${STORAGE_KEYS.orders}:${userId}`;
const readOrders = (userId) => getItem(ordersKey(userId), []);
const writeOrders = (userId, orders) => setItem(ordersKey(userId), orders);

const buildTimeline = (placedAt, stageInterval = STAGE_INTERVAL_MS) =>
  ORDER_STATUSES.map((status, index) => ({
    status: status.id,
    label: status.label,
    description: status.description,
    at: new Date(placedAt + index * stageInterval).toISOString(),
  }));

/** Status derived from the timeline - the client never fakes progress. */
export const statusFromTimeline = (order) => {
  if (!order) return 'placed';
  if (order.cancelledAt) return 'cancelled';
  const now = Date.now();
  const reached = [...order.timeline]
    .filter((entry) => new Date(entry.at).getTime() <= now)
    .pop();
  return reached ? reached.status : order.timeline[0].status;
};

export async function placeOrder(token, payload) {
  await wait(700);
  const user = requireUser(token);
  const restaurant = RESTAURANTS.find((candidate) => candidate.id === payload.restaurantId);
  if (!restaurant) throw new MockError('Restaurant is no longer available.', 404);
  if (!payload.items?.length) throw new MockError('Your cart is empty.', 422);

  // Re-price from the catalogue - the client total is only a hint.
  const items = payload.items.map((line) => {
    const menuItem = restaurant.menu.find((candidate) => candidate.id === line.itemId);
    if (!menuItem) throw new MockError(`"${line.name}" is no longer on the menu.`, 422);
    return {
      itemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      qty: Math.max(1, Number(line.qty) || 1),
      isVeg: menuItem.isVeg,
      image: menuItem.image,
    };
  });

  const subtotal = items.reduce((sum, line) => sum + line.price * line.qty, 0);
  const coupon = payload.couponCode
    ? COUPONS.find((candidate) => candidate.code === payload.couponCode) || null
    : null;
  const bill = calculateBill({
    subtotal,
    coupon,
    itemCount: items.reduce((sum, line) => sum + line.qty, 0),
  });

  const placedAt = Date.now();
  const order = {
    id: uid('ord'),
    orderNumber: orderNumber(),
    userId: user.id,
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    restaurantImage: restaurant.image,
    restaurantArea: restaurant.area,
    items,
    bill,
    couponCode: coupon?.code || null,
    address: payload.address,
    paymentMethod: payload.paymentMethod,
    placedAt: new Date(placedAt).toISOString(),
    estimatedDeliveryAt: new Date(placedAt + STAGE_INTERVAL_MS * 4).toISOString(),
    deliveryTimeMin: restaurant.deliveryTimeMin,
    timeline: buildTimeline(placedAt),
    cancelledAt: null,
  };

  writeOrders(user.id, [order, ...readOrders(user.id)]);
  return order;
}

export async function getOrders(token) {
  await wait();
  const user = requireUser(token);
  return readOrders(user.id).map((order) => ({
    ...order,
    status: statusFromTimeline(order),
  }));
}

export async function getOrder(token, orderId) {
  await wait(200);
  const user = requireUser(token);
  const order = readOrders(user.id).find((candidate) => candidate.id === orderId);
  if (!order) throw new MockError('Order not found.', 404);
  return { ...order, status: statusFromTimeline(order) };
}

export async function cancelOrder(token, orderId, reason = 'Changed my mind') {
  await wait();
  const user = requireUser(token);
  const orders = readOrders(user.id);
  const order = orders.find((candidate) => candidate.id === orderId);
  if (!order) throw new MockError('Order not found.', 404);

  const status = statusFromTimeline(order);
  if (!['placed', 'confirmed'].includes(status)) {
    throw new MockError('This order can no longer be cancelled.', 409);
  }

  const cancelled = {
    ...order,
    cancelledAt: new Date().toISOString(),
    cancelReason: reason,
    status: 'cancelled',
  };
  writeOrders(user.id, orders.map((candidate) => (candidate.id === orderId ? cancelled : candidate)));
  return cancelled;
}
