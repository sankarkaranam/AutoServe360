import axios from 'axios';

// export const API_BASE =
//   process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1';

// export const api = axios.create({ baseURL: API_BASE });

// api.interceptors.request.use((config) => {
//   const token =
//     typeof window !== 'undefined' ? localStorage.getItem('as360_token') : null;
//   const tenant =
//     typeof window !== 'undefined' ? localStorage.getItem('as360_tenant') : null;
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   if (tenant) config.headers['X-Tenant-ID'] = tenant;
//   return config;
// });


export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('as360_token') : null;
  const tenant = typeof window !== 'undefined' ? localStorage.getItem('as360_tenant') : 'dealer-001';
  const h = new Headers();
  h.set('Content-Type', 'application/json');
  h.set('X-Tenant-ID', tenant || 'dealer-001');
  if (token) h.set('Authorization', `Bearer ${token}`);
  return h;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { ...(init?.headers || {}), ...Object.fromEntries(authHeaders().entries()) },
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText);
      throw new Error(msg || `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`API Error: ${error.message}`);
    } else {
      console.error('API Error: An unknown error occurred');
    }
    throw error;
  }
}
