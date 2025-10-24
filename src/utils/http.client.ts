import axios from 'axios';
import { cookies } from 'next/headers';

/**
 * Create an axios instance
 */
const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 10000,
});

/**
 * Add a request interceptor
 */
http.interceptors.request.use(
  async (config) => {
    const cookieStore = await cookies();

    const xsrfToken = cookieStore.get('XSRF-TOKEN');
    const sessionId = cookieStore.get('SESSION-ID');

    if (!xsrfToken || !sessionId) {
      return config;
    }

    config.headers['x-csrf-token'] = xsrfToken.value;
    config.headers['Cookie'] =
      `SESSION-ID=${sessionId.value}; XSRF-TOKEN=${xsrfToken.value}; ${config.headers['Cookie'] || ''}`;

    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Add a response interceptor
 */
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ECONNRESET' && !error.config.__isRetry) {
      error.config.__isRetry = true;
      return http.request(error.config);
    }
    return Promise.reject(error);
  },
);

export default http;
