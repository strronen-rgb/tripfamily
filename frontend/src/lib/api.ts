const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'API request failed');
  return data;
}

// ── Auth ────────────────────────────────────────────────────────────────────
export const auth = {
  register: (email: string, password: string, name: string) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  login: (email: string, password: string) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  getMe: () => apiFetch('/auth/me'),
};

// ── Families ────────────────────────────────────────────────────────────────
export const families = {
  create: (name: string, destinations: string[], startDate?: string, endDate?: string) =>
    apiFetch('/families', { method: 'POST', body: JSON.stringify({ name, destinations, startDate, endDate }) }),
  join: (inviteCode: string) =>
    apiFetch('/families/join', { method: 'POST', body: JSON.stringify({ inviteCode }) }),
  get: (id: string) => apiFetch(`/families/${id}`),
};

// ── Flights ─────────────────────────────────────────────────────────────────
export const flights = {
  create: (data: {
    familyId: string; airline: string; flightNumber: string;
    departure: string; arrival: string; departureTime: string; arrivalTime: string;
    terminal?: string; gate?: string;
  }) => apiFetch('/flights', { method: 'POST', body: JSON.stringify(data) }),
  list: (familyId: string) => apiFetch(`/flights?familyId=${familyId}`),
  get: (id: string) => apiFetch(`/flights/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    apiFetch(`/flights/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/flights/${id}`, { method: 'DELETE' }),
};

// ── Hotels ──────────────────────────────────────────────────────────────────
export const hotels = {
  create: (data: {
    familyId: string; name: string; address?: string;
    checkIn: string; checkOut: string; bookingRef?: string;
    price?: number; currency?: string;
  }) => apiFetch('/hotels', { method: 'POST', body: JSON.stringify(data) }),
  list: (familyId: string) => apiFetch(`/hotels?familyId=${familyId}`),
  get: (id: string) => apiFetch(`/hotels/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    apiFetch(`/hotels/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/hotels/${id}`, { method: 'DELETE' }),
};

// ── Attractions ─────────────────────────────────────────────────────────────
export const attractions = {
  create: (data: {
    familyId: string; name: string; type: string; location?: string;
    visitDate?: string; ticketPrice?: number; bookingRef?: string; notes?: string;
  }) => apiFetch('/attractions', { method: 'POST', body: JSON.stringify(data) }),
  list: (familyId: string) => apiFetch(`/attractions?familyId=${familyId}`),
  get: (id: string) => apiFetch(`/attractions/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    apiFetch(`/attractions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/attractions/${id}`, { method: 'DELETE' }),
};

// ── Budget / Expenses ──────────────────────────────────────────────────────
export const budget = {
  create: (data: {
    familyId: string; category: string; amount: number; currency?: string;
    description?: string; receiptUrl?: string; paidBy?: string;
  }) => apiFetch('/budget', { method: 'POST', body: JSON.stringify(data) }),
  list: (familyId: string, category?: string) =>
    apiFetch(`/budget?familyId=${familyId}${category ? `&category=${category}` : ''}`),
  get: (id: string) => apiFetch(`/budget/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    apiFetch(`/budget/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/budget/${id}`, { method: 'DELETE' }),
};

// ── Timeline ────────────────────────────────────────────────────────────────
export const timeline = {
  get: (familyId: string) => apiFetch(`/timeline?familyId=${familyId}`),
};
