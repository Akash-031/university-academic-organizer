// Base URL resolved dynamically from environment variables or relative fallback
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '') + '/api';

async function handle(res, fallbackMessage) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || fallbackMessage);
  }
  return data;
}

export async function registerApi({ name, email, password }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return handle(res, 'Failed to create account');
}

export async function loginApi({ email, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handle(res, 'Failed to log in');
}

export async function requestPasswordResetApi(email) {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handle(res, 'Unable to request a password reset');
}

export async function resetPasswordApi({ token, password, confirmPassword }) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password, confirmPassword }),
  });
  return handle(res, 'Unable to reset password');
}

export async function logoutApi() {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  return handle(res, 'Failed to log out');
}

export async function fetchCurrentUserApi() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    credentials: 'include',
  });
  if (res.status === 401) return { user: null };
  return handle(res, 'Failed to fetch current user');
}
