
import { useState, useEffect, useRef } from 'react';
import { MapPin, Search } from 'lucide-react';
import { Input, Label } from './ui';

interface AddressSuggestion {
    label: string;
    city: string;
    postcode: string;
    name: string;
    street: string;
    housenumber?: string;
    coordinates: [number, number]; // [longitude, latitude]
}

interface AddressData {
    street_number: string;
    street_name: string;
    postal_code: string;
    city: string;
    latitude: number;
    longitude: number;
    full_address: string;
}

interface AddressAutocompleteProps {
    onAddressSelect: (address: AddressData) => void;
    defaultValue?: string;
    error?: string;
}

export default function AddressAutocomplete({
    onAddressSelect,
    defaultValue = '',
    error
}: AddressAutocompleteProps) {
    const [query, setQuery] = useState(defaultValue);
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Fermer la liste quand on clique en dehors
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Recherche avec l'API du gouvernement français
    useEffect(() => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
                );
                const data = await response.json();

                const formattedSuggestions: AddressSuggestion[] = data.features.map((feature: any) => ({
                    label: feature.properties.label,
                    city: feature.properties.city,
                    postcode: feature.properties.postcode,
                    name: feature.properties.name,
                    street: feature.properties.street || feature.properties.name,
                    housenumber: feature.properties.housenumber,
                    coordinates: feature.geometry.coordinates, // [lng, lat]
                }));

                setSuggestions(formattedSuggestions);
                setIsOpen(true);
            } catch (error) {
                console.error('Erreur API adresse:', error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        }, 300); // Debounce 300ms

        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSelectAddress = (suggestion: AddressSuggestion) => {
        const addressData: AddressData = {
            street_number: suggestion.housenumber || '',
            street_name: suggestion.street,
            postal_code: suggestion.postcode,
            city: suggestion.city,
            longitude: suggestion.coordinates[0],
            latitude: suggestion.coordinates[1],
            full_address: suggestion.label,
        };

        setQuery(suggestion.label);
        setIsOpen(false);
        onAddressSelect(addressData);
    };

    return (
        <div ref={wrapperRef} className="relative space-y-2">
            <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Rechercher une adresse <span className="text-red-400">*</span>
            </Label>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ex: 10 Rue de la Paix, Paris"
                    className={`pl-10 ${error ? 'border-red-500' : ''}`}
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                )}
            </div>

            {/* Liste des suggestions */}
            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-background border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleSelectAddress(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-gray-800 last:border-b-0 focus:outline-none focus:bg-white/10"
                        >
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {suggestion.label}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {suggestion.city} • {suggestion.postcode}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Message si aucun résultat */}
            {isOpen && !isLoading && query.length >= 3 && suggestions.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-background border border-gray-700 rounded-md shadow-lg p-4 text-center">
                    <p className="text-sm text-gray-400">Aucune adresse trouvée</p>
                    <p className="text-xs text-gray-500 mt-1">Vérifiez l'orthographe ou essayez une autre adresse</p>
                </div>
            )}

            {error && (
                <p className="text-sm text-red-400 flex items-center gap-1.5">
                    {error}
                </p>
            )}

            <p className="text-xs text-gray-500">
                💡 Tapez au moins 3 caractères pour rechercher une adresse française
            </p>
        </div>
    );
}
