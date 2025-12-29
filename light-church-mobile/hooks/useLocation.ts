/**
 * Hook for user geolocation
 */

import { useState, useEffect } from 'react';
import { getCurrentLocation } from '@/services/locationService';
import type { UserLocation } from '@/types';

export function useLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchLocation = async () => {
      try {
        setLoading(true);
        setError(null);
        const userLocation = await getCurrentLocation();

        if (mounted) {
          if (userLocation) {
            setLocation(userLocation);
          } else {
            setError('Permission de localisation refusée');
          }
        }
      } catch (err) {
        if (mounted) {
          setError('Erreur lors de la récupération de la position');
          console.error(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchLocation();

    return () => {
      mounted = false;
    };
  }, []);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const userLocation = await getCurrentLocation();
      if (userLocation) {
        setLocation(userLocation);
      } else {
        setError('Permission de localisation refusée');
      }
    } catch (err) {
      setError('Erreur lors de la récupération de la position');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    location,
    loading,
    error,
    refetch,
  };
}
