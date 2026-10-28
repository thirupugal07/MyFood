/**
 * The one place the frontend talks to "the server".
 *
 * While VITE_USE_MOCK_API is true (the default) every call is served by
 * src/lib/mockApi.js from localStorage, so the app is fully usable with no
 * backend. Flip it to false and point VITE_API_BASE_URL at the Spring Boot
 * service - the component code does not change at all.
 */
import * as mock from './mockApi';
import { getItem, removeItem, STORAGE_KEYS } from './storage';

export const USE_MOCK_API = String(import.meta.env.VITE_USE_MOCK_API ?? 'true') !== 'false';
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const getToken = () => getItem(STORAGE_KEYS.token, null);

async function http(path, { method = 'GET', body, signal } = {}) {
  const token = getToken();
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Cannot reach the server. Check your connection.', 0);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) removeItem(STORAGE_KEYS.token);
    throw new ApiError(
      payload?.message || `Something went wrong (${response.status}).`,
      response.status,
      payload,
    );
  }

  return payload;
}

const query = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      if (value.length === 0) return;
      search.set(key, value.join(','));
    } else {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

export const api = {
  /* catalogue */
  getCategories: () => (USE_MOCK_API ? mock.getCategories() : http('/categories')),
  getBanners: () => (USE_MOCK_API ? mock.getBanners() : http('/banners')),
  getCoupons: () => (USE_MOCK_API ? mock.getCoupons() : http('/coupons')),
  getAreas: () => (USE_MOCK_API ? mock.getAreas() : http('/areas')),

  getRestaurants: (params = {}) =>
    USE_MOCK_API ? mock.getRestaurants(params) : http(`/restaurants${query(params)}`),

  getRestaurant: (id) =>
    USE_MOCK_API ? mock.getRestaurant(id) : http(`/restaurants/${encodeURIComponent(id)}`),

  getFeaturedRestaurants: (limit = 6) =>
    USE_MOCK_API
      ? mock.getFeaturedRestaurants(limit)
      : http(`/restaurants/featured${query({ limit })}`),

  validateCoupon: (code, subtotal) =>
    USE_MOCK_API ? mock.validateCoupon(code, subtotal) : http('/coupons/validate', {
      method: 'POST',
      body: { code, subtotal },
    }),

  /* auth */
  login: (credentials) =>
    USE_MOCK_API ? mock.login(credentials) : http('/auth/login', { method: 'POST', body: credentials }),

  signup: (payload) =>
    USE_MOCK_API ? mock.signup(payload) : http('/auth/register', { method: 'POST', body: payload }),

  forgotPassword: (payload) =>
    USE_MOCK_API
      ? mock.forgotPassword(payload)
      : http('/auth/forgot-password', { method: 'POST', body: payload }),

  me: (token) => (USE_MOCK_API ? mock.me(token) : http('/auth/me')),

  updateProfile: (token, patch) =>
    USE_MOCK_API ? mock.updateProfile(token, patch) : http('/auth/profile', { method: 'PATCH', body: patch }),

  changePassword: (token, payload) =>
    USE_MOCK_API
      ? mock.changePassword(token, payload)
      : http('/auth/change-password', { method: 'POST', body: payload }),

  /* addresses */
  saveAddress: (token, address) =>
    USE_MOCK_API
      ? mock.saveAddress(token, address)
      : http(address.id ? `/addresses/${address.id}` : '/addresses', {
          method: address.id ? 'PUT' : 'POST',
          body: address,
        }),

  deleteAddress: (token, addressId) =>
    USE_MOCK_API
      ? mock.deleteAddress(token, addressId)
      : http(`/addresses/${addressId}`, { method: 'DELETE' }),

  /* orders */
  placeOrder: (token, payload) =>
    USE_MOCK_API ? mock.placeOrder(token, payload) : http('/orders', { method: 'POST', body: payload }),

  getOrders: (token) => (USE_MOCK_API ? mock.getOrders(token) : http('/orders')),

  getOrder: (token, orderId) =>
    USE_MOCK_API ? mock.getOrder(token, orderId) : http(`/orders/${orderId}`),

  cancelOrder: (token, orderId, reason) =>
    USE_MOCK_API
      ? mock.cancelOrder(token, orderId, reason)
      : http(`/orders/${orderId}/cancel`, { method: 'POST', body: { reason } }),
};

export { statusFromTimeline } from './mockApi';
export default api;
