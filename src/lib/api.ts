import { supabase } from '@/integrations/supabase/client';

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
  };
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error || 'Request failed' };
    }

    return { data: result.data };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { error: message };
  }
}

// Tours API
export const toursApi = {
  getAll: (params?: { featured?: boolean; active?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.featured) query.append('featured', 'true');
    if (params?.active) query.append('active', 'true');
    return apiRequest(`api-tours?${query}`);
  },
  getById: (id: string) => apiRequest(`api-tours?id=${id}`),
  create: (data: Record<string, unknown>) => 
    apiRequest('api-tours', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => 
    apiRequest('api-tours', { method: 'PUT', body: JSON.stringify({ id, ...data }) }),
  delete: (id: string) => 
    apiRequest('api-tours', { method: 'DELETE', body: JSON.stringify({ id }) }),
};

// Deals API
export const dealsApi = {
  getAll: (params?: { active?: boolean; popup?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.active) query.append('active', 'true');
    if (params?.popup) query.append('popup', 'true');
    return apiRequest(`api-deals?${query}`);
  },
  getById: (id: string) => apiRequest(`api-deals?id=${id}`),
  create: (data: Record<string, unknown>) => 
    apiRequest('api-deals', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => 
    apiRequest('api-deals', { method: 'PUT', body: JSON.stringify({ id, ...data }) }),
  delete: (id: string) => 
    apiRequest('api-deals', { method: 'DELETE', body: JSON.stringify({ id }) }),
};

// Bookings API
export const bookingsApi = {
  getAll: (params?: { status?: string; userId?: string; includeDeleted?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.userId) query.append('user_id', params.userId);
    if (params?.includeDeleted) query.append('include_deleted', 'true');
    return apiRequest(`api-bookings?${query}`);
  },
  getById: (id: string) => apiRequest(`api-bookings?id=${id}`),
  update: (id: string, data: Record<string, unknown>) => 
    apiRequest('api-bookings', { method: 'PUT', body: JSON.stringify({ id, ...data }) }),
  delete: (id: string) => 
    apiRequest('api-bookings', { method: 'DELETE', body: JSON.stringify({ id }) }),
  bulkUpdate: (ids: string[], data: Record<string, unknown>) =>
    apiRequest('api-bookings', { method: 'PUT', body: JSON.stringify({ ids, ...data, bulk: true }) }),
  bulkDelete: (ids: string[]) =>
    apiRequest('api-bookings', { method: 'DELETE', body: JSON.stringify({ ids, bulk: true }) }),
  restore: (id: string) =>
    apiRequest('api-bookings', { method: 'PUT', body: JSON.stringify({ id, restore: true }) }),
};

// Destinations API
export const destinationsApi = {
  getAll: (params?: { featured?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.featured) query.append('featured', 'true');
    return apiRequest(`api-destinations?${query}`);
  },
  getById: (id: string) => apiRequest(`api-destinations?id=${id}`),
  create: (data: Record<string, unknown>) => 
    apiRequest('api-destinations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => 
    apiRequest('api-destinations', { method: 'PUT', body: JSON.stringify({ id, ...data }) }),
  delete: (id: string) => 
    apiRequest('api-destinations', { method: 'DELETE', body: JSON.stringify({ id }) }),
};

// Vehicles API
export const vehiclesApi = {
  getAll: (params?: { available?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.available) query.append('available', 'true');
    return apiRequest(`api-vehicles?${query}`);
  },
  getById: (id: string) => apiRequest(`api-vehicles?id=${id}`),
  create: (data: Record<string, unknown>) => 
    apiRequest('api-vehicles', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => 
    apiRequest('api-vehicles', { method: 'PUT', body: JSON.stringify({ id, ...data }) }),
  delete: (id: string) => 
    apiRequest('api-vehicles', { method: 'DELETE', body: JSON.stringify({ id }) }),
};

// Stats API (Admin only)
export const statsApi = {
  getDashboard: () => apiRequest('api-stats'),
};

// Users API (Admin only)
export const usersApi = {
  getAll: () => apiRequest('api-stats?type=users'),
};

// Activity Logs API
export const activityLogsApi = {
  getAll: () => apiRequest('api-stats?type=activity'),
  log: (data: { action: string; entity_type: string; entity_id?: string; details?: Record<string, unknown> }) =>
    apiRequest('api-stats', { method: 'POST', body: JSON.stringify({ type: 'activity', ...data }) }),
};
