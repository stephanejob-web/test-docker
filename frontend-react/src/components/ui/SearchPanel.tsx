import React, { useState, useEffect, useRef } from 'react';
import { Paper, InputBase, IconButton, Divider, Box, Chip, Stack, List, ListItemButton, ListItemText, CircularProgress } from '@mui/material';
import { Search, CalendarMonth, Church, List as ListIcon, LocationOn, Clear } from '@mui/icons-material';
import { searchCities } from '../../services/geoService';

interface SearchPanelProps {
    onSearch: (query: string) => void;
    onFilterChange: (filters: { churches: boolean; events: boolean }) => void;
    onToggleList: () => void;
    onLocationSelect?: (lat: number, lng: number, label: string) => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ onSearch, onFilterChange, onToggleList, onLocationSelect }) => {
    const [query, setQuery] = useState('');
    const [showChurches, setShowChurches] = useState(true);
    const [showEvents, setShowEvents] = useState(true);

    // Autocomplete State
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close autocomplete on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsAutocompleteOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // City Search Effect
    useEffect(() => {
        if (query.length < 3) {
            setSuggestions([]);
            setIsAutocompleteOpen(false);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsLoading(true);
            try {
                const results = await searchCities(query);
                setSuggestions(results);
                setIsAutocompleteOpen(results.length > 0);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleToggleChurches = () => {
        const newState = !showChurches;
        setShowChurches(newState);
        onFilterChange({ churches: newState, events: showEvents });
    };

    const handleToggleEvents = () => {
        const newState = !showEvents;
        setShowEvents(newState);
        onFilterChange({ churches: showChurches, events: newState });
    };

    const handleSelectLocation = (suggestion: any) => {
        setQuery(suggestion.label); // Optional: keep full text or clear
        setIsAutocompleteOpen(false);
        if (onLocationSelect) {
            onLocationSelect(suggestion.latitude, suggestion.longitude, suggestion.label);
        }
    };

    return (
        <Box
            ref={wrapperRef}
            sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                width: { xs: 'calc(100% - 32px)', sm: 360 },
            }}
        >
            {/* Search Bar */}
            <Paper
                component="form"
                sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    position: 'relative'
                }}
                onSubmit={(e) => { e.preventDefault(); onSearch(query); setIsAutocompleteOpen(false); }}
            >
                <Search sx={{ ml: 1, color: '#5F6368' }} />
                <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder="Rechercher une ville..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (suggestions.length > 0) setIsAutocompleteOpen(true); }}
                />

                {isLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}

                {query && (
                    <IconButton size="small" onClick={() => { setQuery(''); setSuggestions([]); }} sx={{ p: '10px' }}>
                        <Clear />
                    </IconButton>
                )}

                <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                {/* List Toggle Button */}
                <IconButton
                    color="primary"
                    sx={{ p: '10px' }}
                    aria-label="toggle list"
                    onClick={onToggleList}
                >
                    <ListIcon />
                </IconButton>
            </Paper>

            {/* Autocomplete Dropdown */}
            {isAutocompleteOpen && suggestions.length > 0 && (
                <Paper
                    sx={{
                        mt: 0.5,
                        maxHeight: 300,
                        overflow: 'auto',
                        borderRadius: 2,
                        boxShadow: 3
                    }}
                >
                    <List disablePadding>
                        {suggestions.map((suggestion, index) => (
                            <ListItemButton
                                key={index}
                                onClick={() => handleSelectLocation(suggestion)}
                                divider={index < suggestions.length - 1}
                            >
                                <LocationOn sx={{ mr: 2, color: 'text.secondary' }} />
                                <ListItemText
                                    primary={suggestion.label}
                                    secondary={suggestion.context}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </Paper>
            )}

            {/* Filter Chips */}
            <Stack direction="row" spacing={1}>
                <Chip
                    icon={<Church />}
                    label="Églises"
                    clickable
                    color={showChurches ? 'primary' : 'default'}
                    variant={showChurches ? 'filled' : 'filled'}
                    onClick={handleToggleChurches}
                    sx={{
                        backgroundColor: showChurches ? '#4285F4' : '#FFFFFF',
                        color: showChurches ? '#FFFFFF' : '#3C4043',
                        fontWeight: 500,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                        '&:hover': {
                            backgroundColor: showChurches ? '#3367D6' : '#F8F9FA',
                        }
                    }}
                />
                <Chip
                    icon={<CalendarMonth />}
                    label="Événements"
                    clickable
                    color={showEvents ? 'secondary' : 'default'}
                    onClick={handleToggleEvents}
                    sx={{
                        backgroundColor: showEvents ? '#EA4335' : '#FFFFFF',
                        color: showEvents ? '#FFFFFF' : '#3C4043',
                        fontWeight: 500,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                        '&:hover': {
                            backgroundColor: showEvents ? '#C5221F' : '#F8F9FA',
                        }
                    }}
                />
            </Stack>
        </Box>
    );
};

export default SearchPanel;
