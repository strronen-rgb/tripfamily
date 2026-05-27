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

export const api = {
  register: (email: string, password: string, name: string) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  login: (email: string, password: string) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getMe: () => apiFetch('/auth/me'),
  createFamily: (name: string, destinations: string[]) =>
    apiFetch('/families', { method: 'POST', body: JSON.stringify({ name, destinations }) }),
  joinFamily: (inviteCode: string) =>
    apiFetch('/families/join', { method: 'POST', body: JSON.stringify({ inviteCode }) }),
  getFamily: (id: string) => apiFetch(`/families/${id}`),
};
