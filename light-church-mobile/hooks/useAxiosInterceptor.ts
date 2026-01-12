/**
 * Hook pour configurer les intercepteurs Axios avec le système de toast
 * Gestion intelligente des erreurs réseau avec throttling
 */

import { useEffect, useRef } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/contexts/ToastContext';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Throttle: permet d'afficher max 1 toast du même type toutes les X ms
const THROTTLE_DELAY = 5000; // 5 secondes
const lastToastTime = new Map<string, number>();

function canShowToast(errorType: string): boolean {
  const now = Date.now();
  const lastTime = lastToastTime.get(errorType) || 0;

  if (now - lastTime > THROTTLE_DELAY) {
    lastToastTime.set(errorType, now);
    return true;
  }

  return false;
}

export function useAxiosInterceptor() {
  const { showError, showWarning } = useToast();
  const requestInterceptorRef = useRef<number | null>(null);
  const responseInterceptorRef = useRef<number | null>(null);

  useEffect(() => {
    // Request interceptor
    requestInterceptorRef.current = api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    responseInterceptorRef.current = api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        handleAxiosError(error, showError, showWarning);
        return Promise.reject(error);
      }
    );

    // Cleanup: Eject interceptors when component unmounts
    return () => {
      if (requestInterceptorRef.current !== null) {
        api.interceptors.request.eject(requestInterceptorRef.current);
      }
      if (responseInterceptorRef.current !== null) {
        api.interceptors.response.eject(responseInterceptorRef.current);
      }
    };
  }, [showError, showWarning]);
}

/**
 * Toast action type (from ToastContext)
 */
interface ToastAction {
  label: string;
  onPress: () => void;
}

/**
 * Gestion intelligente des erreurs selon leur type avec throttling
 */
function handleAxiosError(
  error: AxiosError,
  showError: (message: string, action?: ToastAction) => void,
  showWarning: (message: string) => void
) {
  // 1. Erreurs réseau (pas de connexion, timeout)
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    // Throttle: affiche max 1 fois toutes les 5 secondes
    if (!canShowToast('network-error')) {
      return;
    }

    showError('Aucune connexion réseau', {
      label: 'Réessayer',
      onPress: () => {
        // Retry la dernière requête
        if (error.config) {
          api.request(error.config);
        }
      },
    });
    return;
  }

  // 2. Timeout
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    if (!canShowToast('timeout-error')) {
      return;
    }

    showError('Le serveur ne répond pas', {
      label: 'Réessayer',
      onPress: () => {
        if (error.config) {
          api.request(error.config);
        }
      },
    });
    return;
  }

  // 3. Erreurs serveur (500, 503, etc.)
  if (error.response) {
    const status = error.response.status;

    if (status >= 500) {
      if (!canShowToast('server-error')) {
        return;
      }

      // Type-safe extraction du message d'erreur
      const responseData = error.response.data as { message?: string } | undefined;
      const message = responseData?.message || 'Le serveur rencontre un problème';
      showError(message);
      return;
    }

    // 4. Erreurs client (400, 401, 403, 404) - PAS de toast automatique
    // Les composants doivent gérer ces erreurs eux-mêmes
    // Exception : 401 (non autorisé) si c'est un problème d'auth global
    if (status === 401) {
      // Seulement si ce n'est pas une route publique
      if (!error.config?.url?.includes('/public/')) {
        if (!canShowToast('auth-error')) {
          return;
        }
        showWarning('Session expirée');
      }
      return;
    }

    // 403, 404, 400, etc. → pas de toast, le composant gère
    return;
  }

  // 5. Autres erreurs inconnues
  console.error('Erreur inconnue:', error);
}
