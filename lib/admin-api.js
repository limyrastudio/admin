const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}
export function setToken(t) {
  if (typeof window !== 'undefined') localStorage.setItem('admin_token', t);
}
export function clearToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }
}
export function getUser() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('admin_user') || 'null'); } catch { return null; }
}

async function req(method, path, body) {
  const token = getToken();
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  if (res.status === 401) {
    clearToken();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.error || `Error ${res.status}`);
  }
  return res.json();
}

export const aGet = (path) => req('GET', path);
export const aPost = (path, body) => req('POST', path, body);
export const aPut = (path, body) => req('PUT', path, body);
export const aDelete = (path) => req('DELETE', path);

export async function aUpload(file) {
  const token = getToken();
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/api/admin/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) throw new Error('Yükleme başarısız');
  return res.json();
}

export async function adminLogin(email, password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Geçersiz e-posta veya şifre');
  const data = await res.json();
  setToken(data.token);
  if (typeof window !== 'undefined')
    localStorage.setItem('admin_user', JSON.stringify({ name: data.name, email: data.email }));
  return data;
}
