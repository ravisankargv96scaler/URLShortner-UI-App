import { UrlMappingDTO, ClickEventDTO } from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function getAuthHeader() {
  const token = localStorage.getItem('token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await response.json();
      errorMsg = data.message || errorMsg;
    } catch {
      errorMsg = response.statusText;
    }
    throw new Error(errorMsg);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

export const api = {
  login: async (data: any) => {
    const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const text = await response.text();
    let resData = text ? JSON.parse(text) : {};
    
    let token = resData.token || resData.jwt || resData.accessToken;
    if (!token) {
      const authHeader = response.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (token) {
      localStorage.setItem('token', token);
    }
    localStorage.setItem('username', data.username);
    return resData;
  },

  register: async (data: any) => {
    return fetchApi('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getUrls: async (): Promise<UrlMappingDTO[]> => {
    return fetchApi('/api/v1/urls', { method: 'GET' });
  },

  createUrl: async (originalUrl: string): Promise<UrlMappingDTO> => {
    return fetchApi('/api/v1/urls/shorten', {
      method: 'POST',
      body: JSON.stringify({ originalUrl }),
    });
  },

  updateUrl: async (shortUrl: string, originalUrl: string): Promise<UrlMappingDTO> => {
    return fetchApi(`/api/v1/urls/${shortUrl}`, {
      method: 'PUT',
      body: JSON.stringify({ originalUrl }),
    });
  },

  deleteUrl: async (shortUrl: string) => {
    return fetchApi(`/api/v1/urls/${shortUrl}`, {
      method: 'DELETE',
    });
  },

  getUrlAnalytics: async (shortUrl: string, startDate: string, endDate: string): Promise<ClickEventDTO[]> => {
    const params = new URLSearchParams({ startDate, endDate });
    return fetchApi(`/api/v1/urls/${shortUrl}/analytics?${params.toString()}`, {
      method: 'GET',
    });
  },

  getTotalClicks: async (startDate: string, endDate: string): Promise<Record<string, number>> => {
    const params = new URLSearchParams({ startDate, endDate });
    return fetchApi(`/api/v1/urls/total-clicks?${params.toString()}`, {
      method: 'GET',
    });
  },
  
  getTotalClicksByDateTime: async (startDateTime: string, endDateTime: string): Promise<Record<string, number>> => {
    const params = new URLSearchParams({ startDateTime, endDateTime });
    return fetchApi(`/api/v1/urls/total-clicks-by-datetime?${params.toString()}`, {
      method: 'GET',
    });
  }
};
