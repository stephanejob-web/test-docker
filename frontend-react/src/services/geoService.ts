import axios from 'axios';

interface CitySuggestion {
    label: string;
    score: number;
    id: string;
    type: string;
    name: string;
    postcode: string;
    citycode: string;
    x: number;
    y: number;
    city: string;
    context: string;
    importance: number;
    street: string;
    latitude: number;
    longitude: number;
    label_short?: string;
}

interface GeoApiResponse {
    features: {
        type: string;
        geometry: {
            type: string;
            coordinates: [number, number];
        };
        properties: CitySuggestion;
    }[];
}

export const searchCities = async (query: string): Promise<CitySuggestion[]> => {
    if (!query || query.length < 3) return [];

    try {
        const response = await axios.get<GeoApiResponse>(`https://api-adresse.data.gouv.fr/search/`, {
            params: {
                q: query,
                type: 'municipality', // Limit to cities
                limit: 5,
                autocomplete: 1
            }
        });

        return response.data.features.map(feature => ({
            ...feature.properties,
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0],
            label: `${feature.properties.city} (${feature.properties.postcode})`
        }));
    } catch (error) {
        console.error('Error searching cities:', error);
        return [];
    }
};

export const geocodeAddress = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
    if (!address || address.trim().length === 0) return null;

    try {
        const response = await axios.get<GeoApiResponse>(`https://api-adresse.data.gouv.fr/search/`, {
            params: {
                q: address,
                limit: 1,
                autocomplete: 0
            }
        });

        const feature = response.data.features[0];
        if (!feature) return null;

        return {
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0]
        };
    } catch (error) {
        console.error('Error geocoding address:', error);
        return null;
    }
};
