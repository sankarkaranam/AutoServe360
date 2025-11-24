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

function authHeaders(path?: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('as360_token') : null;
  let tenant = typeof window !== 'undefined' ? localStorage.getItem('as360_tenant') : null;

  const h = new Headers();
  h.set('Content-Type', 'application/json');

  // Don't send tenant ID for SaaS admin endpoints
  const isSaaSEndpoint = path?.includes('/saas/');

  if (!isSaaSEndpoint && tenant) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(tenant)) {
      h.set('X-Tenant-ID', tenant);
    }
  }

  if (token) h.set('Authorization', `Bearer ${token}`);
  return h;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { ...(init?.headers || {}), ...Object.fromEntries(authHeaders(path).entries()) },
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText);
      throw new Error(msg || `HTTP ${res.status}`);
    }
    if (res.status === 204) {
      return {} as T;
    }
    const text = await res.text();
    return text ? JSON.parse(text) : {} as T;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`API Error: ${error.message}`);
    } else {
      console.error('API Error: An unknown error occurred');
    }
    throw error;
  }
}
