// src/infrastructure/http/axios-client.ts
import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import { LocalTokenStorage } from '../storage/local-token-storage';

export const httpClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request: adjuntar token de acceso
httpClient.interceptors.request.use(
  (config) => {
    const token = LocalTokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Response: refresco automático de token (401)
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es 401 y no hemos intentado reintentar la solicitud
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Si ya está refrescando el token, encolar la solicitud
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return httpClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = LocalTokenStorage.getRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        LocalTokenStorage.clearTokens();
        return Promise.reject(error);
      }

      try {
        // Petición limpia para refrescar token
        const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        LocalTokenStorage.setAccessToken(newAccessToken);

        httpClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return httpClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        LocalTokenStorage.clearTokens();
        // Redirigir o propagar el error de sesión expirada
        window.dispatchEvent(new Event('auth-session-expired'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
