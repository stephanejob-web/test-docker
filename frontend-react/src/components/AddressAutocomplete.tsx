import { useState, useEffect, useRef } from 'react';
import {
    TextField,
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    CircularProgress,
    InputAdornment
} from '@mui/material';
import {
    LocationOn as LocationOnIcon,
    Search as SearchIcon
} from '@mui/icons-material';

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
        <Box ref={wrapperRef} sx={{ position: 'relative' }}>
            <TextField
                fullWidth
                label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        Rechercher une adresse
                        <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Typography>
                    </Box>
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: 10 Rue de la Paix, Paris"
                error={!!error}
                helperText={error || "💡 Tapez au moins 3 caractères pour rechercher une adresse française"}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                    ),
                    endAdornment: isLoading ? (
                        <InputAdornment position="end">
                            <CircularProgress size={20} />
                        </InputAdornment>
                    ) : null,
                }}
            />

            {/* Liste des suggestions */}
            {isOpen && suggestions.length > 0 && (
                <Paper
                    elevation={8}
                    sx={{
                        position: 'absolute',
                        zIndex: 1300,
                        width: '100%',
                        mt: 0.5,
                        maxHeight: 300,
                        overflow: 'auto'
                    }}
                >
                    <List disablePadding>
                        {suggestions.map((suggestion, index) => (
                            <ListItem key={`${suggestion.label}-${suggestion.postcode}-${index}`} disablePadding>
                                <ListItemButton onClick={() => handleSelectAddress(suggestion)}>
                                    <LocationOnIcon sx={{ mr: 2, color: 'primary.main' }} />
                                    <ListItemText
                                        primary={suggestion.label}
                                        secondary={`${suggestion.city} • ${suggestion.postcode}`}
                                        primaryTypographyProps={{ variant: 'body2' }}
                                        secondaryTypographyProps={{ variant: 'caption' }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}

            {/* Message si aucun résultat */}
            {isOpen && !isLoading && query.length >= 3 && suggestions.length === 0 && (
                <Paper
                    elevation={8}
                    sx={{
                        position: 'absolute',
                        zIndex: 1300,
                        width: '100%',
                        mt: 0.5,
                        p: 2,
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        Aucune adresse trouvée
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                        Vérifiez l'orthographe ou essayez une autre adresse
                    </Typography>
                </Paper>
            )}
        </Box>
    );
}
