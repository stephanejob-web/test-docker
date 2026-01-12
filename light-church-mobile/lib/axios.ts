/**
 * Axios client configuration
 */

import axios from 'axios';
import { API_CONFIG } from '@/constants/config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request/Response interceptors configurés via useAxiosInterceptor hook
// pour avoir accès au ToastContext. Voir hooks/useAxiosInterceptor.ts

export default api;
