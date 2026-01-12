/**
 * Geocoding Service with Automatic Failover
 *
 * Uses 2 APIs:
 * 1. data.gouv.fr (French Government API) - Primary
 * 2. Nominatim (OpenStreetMap) - Fallback
 */

interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

interface AddressSuggestion {
  label: string;
  city: string;
  postcode: string;
  coordinates: [number, number]; // [longitude, latitude]
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    house_number?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
  };
}

/**
 * data.gouv.fr API response types
 */
interface DataGouvFeature {
  properties: {
    label: string;
    city?: string;
    postcode?: string;
  };
  geometry: {
    coordinates: [number, number]; // [longitude, latitude]
  };
}

interface DataGouvResponse {
  features: DataGouvFeature[];
}

/**
 * Helper: Fetch with timeout (React Native compatible)
 */
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * API 1: data.gouv.fr (Primary - France only, fast)
 */
const searchAddressesWithDataGouv = async (query: string): Promise<AddressSuggestion[]> => {
  try {
    const response = await fetchWithTimeout(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`,
      {},
      5000 // 5s timeout
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json() as DataGouvResponse;

    if (!data?.features || !Array.isArray(data.features)) {
      return [];
    }

    return data.features.map((feature) => ({
      label: feature.properties.label,
      city: feature.properties.city || '',
      postcode: feature.properties.postcode || '',
      coordinates: feature.geometry.coordinates, // [lng, lat]
    }));
  } catch (error) {
    // data.gouv.fr unavailable, will try fallback
    return [];
  }
};

/**
 * API 2: Nominatim (Fallback - International, free)
 */
const searchAddressesWithNominatim = async (query: string): Promise<AddressSuggestion[]> => {
  try {
    const response = await fetchWithTimeout(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'LightChurch/1.0' // Nominatim requires User-Agent
        }
      },
      5000 // 5s timeout
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: NominatimResult[] = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item) => ({
      label: item.display_name,
      city: item.address?.city || item.address?.town || item.address?.village || '',
      postcode: item.address?.postcode || '',
      coordinates: [parseFloat(item.lon), parseFloat(item.lat)], // [lng, lat]
    }));
  } catch (error) {
    // Nominatim unavailable
    return [];
  }
};

/**
 * Search addresses with automatic fallback
 * 1. Try data.gouv.fr (fast for France)
 * 2. If it fails, try Nominatim (international)
 * 3. Return empty array if both fail
 */
export const searchAddresses = async (query: string): Promise<AddressSuggestion[]> => {
  if (!query || query.length < 3) {
    return [];
  }

  // Try primary API
  const dataGouvResults = await searchAddressesWithDataGouv(query);
  if (dataGouvResults.length > 0) {
    return dataGouvResults;
  }

  // Try fallback API
  const nominatimResults = await searchAddressesWithNominatim(query);
  if (nominatimResults.length > 0) {
    return nominatimResults;
  }

  // All APIs failed
  return [];
};

/**
 * Geocode a single address with fallback
 */
export const geocodeAddress = async (address: string): Promise<GeoCoordinates | null> => {
  if (!address || address.trim().length === 0) {
    return null;
  }

  const results = await searchAddresses(address);
  if (results.length === 0) {
    return null;
  }

  const firstResult = results[0];
  return {
    latitude: firstResult.coordinates[1],
    longitude: firstResult.coordinates[0],
  };
};
