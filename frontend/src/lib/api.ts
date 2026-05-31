const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tripfamily-api.onrender.com';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/he/auth';
    }
    throw new Error(data.error || data.message || 'API request failed');
  }
  // Unwrap { data: ... } envelope if present
  if (data && typeof data === 'object' && 'data' in data) {
    return data.data as T;
  }
  return data as T;
}

// Auth
export const auth = {
  register: (email: string, password: string, name: string) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  login: (email: string, password: string) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  getMe: (token?: string) => apiFetch('/auth/me', {}, token),
};

// Families
export const families = {
  my: (token?: string) => apiFetch('/families/my', {}, token),
  create: (name: string, destinations: string[], startDate?: string, endDate?: string, token?: string) =>
    apiFetch('/families', { method: 'POST', body: JSON.stringify({ name, destinations, startDate, endDate }) }, token),
  join: (inviteCode: string, token?: string) =>
    apiFetch('/families/join', { method: 'POST', body: JSON.stringify({ inviteCode }) }, token),
  get: (id: string, token?: string) => apiFetch(`/families/${id}`, {}, token),
  update: (id: string, data: Record<string, unknown>, token?: string) =>
    apiFetch(`/families/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
  delete: (id: string, token?: string) =>
    apiFetch(`/families/${id}`, { method: 'DELETE' }, token),
};

// Flights
export const flights = {
  create: (data: Record<string, unknown>, token?: string) =>
    apiFetch('/flights', { method: 'POST', body: JSON.stringify(data) }, token),
  list: (familyId: string, token?: string) => apiFetch(`/flights?familyId=${familyId}`, {}, token),
  get: (id: string, token?: string) => apiFetch(`/flights/${id}`, {}, token),
  update: (id: string, data: Record<string, unknown>, token?: string) =>
    apiFetch(`/flights/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),
  delete: (id: string, token?: string) => apiFetch(`/flights/${id}`, { method: 'DELETE' }, token),
};

// Hotels
export const hotels = {
  create: (data: Record<string, unknown>, token?: string) =>
    apiFetch('/hotels', { method: 'POST', body: JSON.stringify(data) }, token),
  list: (familyId: string, token?: string) => apiFetch(`/hotels?familyId=${familyId}`, {}, token),
  get: (id: string, token?: string) => apiFetch(`/hotels/${id}`, {}, token),
  update: (id: string, data: Record<string, unknown>, token?: string) =>
    apiFetch(`/hotels/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),
  delete: (id: string, token?: string) => apiFetch(`/hotels/${id}`, { method: 'DELETE' }, token),
};

// Attractions
export const attractions = {
  create: (data: Record<string, unknown>, token?: string) =>
    apiFetch('/attractions', { method: 'POST', body: JSON.stringify(data) }, token),
  list: (familyId: string, token?: string) => apiFetch(`/attractions?familyId=${familyId}`, {}, token),
  get: (id: string, token?: string) => apiFetch(`/attractions/${id}`, {}, token),
  update: (id: string, data: Record<string, unknown>, token?: string) =>
    apiFetch(`/attractions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),
  delete: (id: string, token?: string) => apiFetch(`/attractions/${id}`, { method: 'DELETE' }, token),
};

// Budget
export const budget = {
  create: (data: Record<string, unknown>, token?: string) =>
    apiFetch('/budget', { method: 'POST', body: JSON.stringify(data) }, token),
  list: (familyId: string, category?: string, token?: string) =>
    apiFetch(`/budget?familyId=${familyId}${category ? `&category=${category}` : ''}`, {}, token),
  get: (id: string, token?: string) => apiFetch(`/budget/${id}`, {}, token),
  update: (id: string, data: Record<string, unknown>, token?: string) =>
    apiFetch(`/budget/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),
  delete: (id: string, token?: string) => apiFetch(`/budget/${id}`, { method: 'DELETE' }, token),
};

// Timeline
export const timeline = {
  get: (familyId: string, token?: string) => apiFetch(`/timeline?familyId=${familyId}`, {}, token),
};
