import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    List,
    Divider,
    Stack,
    IconButton,
    Drawer,
    useMediaQuery,
    useTheme,
    Button,
    Chip,
    Skeleton,
    InputBase
} from '@mui/material';
import {
    Close as CloseIcon,
    Church as ChurchIcon,
    Place as PlaceIcon,
    InfoOutlined as InfoIcon,
    AccessTime as AccessTimeIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import useEventInterestWeb from '../../hooks/useEventInterestWeb';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Church, Event } from '../../types/publicMap';
import { formatDistance } from '../../services/publicMapService';

type SortType = 'distance' | 'date';

interface ResultsPanelProps {
    churches: Church[];
    events: Event[];
    loading: boolean;
    onChurchClick: (church: Church) => void;
    onEventClick: (event: Event) => void;
    onClose?: () => void;
    open?: boolean;
    isGeolocated?: boolean;
    isMobileView?: boolean;
}

/**
 * Helper function pour obtenir le temps relatif en français
 */
const getRelativeTime = (dateTimeString: string | null | undefined) => {
    if (!dateTimeString) return 'Date inconnue';
    try {
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) return 'Date invalide';
        return formatDistanceToNow(date, {
            addSuffix: true,
            locale: fr
        });
    } catch {
        return 'Date invalide';
    }
};

/**
 * Helper function pour calculer le temps restant jusqu'à la fin d'un événement
 * Retourne un objet avec le texte et les minutes totales restantes
 */
const getRemainingTime = (endDatetime: string | null | undefined): { text: string; totalMinutes: number } | null => {
    if (!endDatetime) return null;

    try {
        const end = new Date(endDatetime);
        const now = new Date();
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return null;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const totalMinutes = Math.floor(diff / (1000 * 60));

        let text = '';
        if (hours > 0) {
            text = `Fin dans ${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
        } else if (minutes > 0) {
            text = `Fin dans ${minutes} min`;
        } else {
            text = 'Se termine maintenant';
        }

        return { text, totalMinutes };
    } catch {
        return null;
    }
};

/**
 * Composant Card pour une église
 */
const ChurchCard: React.FC<{
    church: Church;
    onClick: () => void;
}> = React.memo(({ church, onClick }) => (
    <Box
        sx={{
            py: 2,
            px: 2,
            bgcolor: '#FFFFFF',
            '&:hover': {
                backgroundColor: '#F8F9FA'
            },
            transition: 'background-color 0.2s',
            cursor: 'pointer'
        }}
        onClick={onClick}
    >
        <Box sx={{ width: '100%' }}>
            {/* En-tête avec Icone Church Badge */}
            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 1.5 }}>
                <Paper
                    elevation={0}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 52,
                        borderRadius: 2,
                        border: '1px solid #DADCE0', // Consistent border
                        bgcolor: '#FFFFFF',
                        flexShrink: 0,
                        mt: 0.5
                    }}
                >
                    <ChurchIcon
                        sx={{
                            fontSize: 30, // Slightly larger for the badge
                            color: '#1A73E8'
                        }}
                    />
                </Paper>
                <Box sx={{ flex: 1 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: '1rem',
                            lineHeight: 1.4,
                            mb: 0.5,
                            color: '#202124',
                            fontWeight: 500
                        }}
                    >
                        {church.church_name}
                    </Typography>

                    {/* Pasteur */}
                    {church.pastor_name && (
                        <Typography
                            variant="body2"
                            sx={{ mb: 0.5, color: '#5F6368', fontSize: '0.875rem' }}
                        >
                            Pasteur: {church.pastor_name}
                        </Typography>
                    )}

                    {/* Ville et Code Postal */}
                    {(church.city || church.postal_code) && (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <PlaceIcon sx={{ fontSize: 16, color: '#5F6368' }} />
                            <Typography variant="body2" sx={{ color: '#5F6368', fontSize: '0.875rem' }}>
                                {church.city && church.postal_code
                                    ? `${church.city}, ${church.postal_code}`
                                    : church.city || church.postal_code
                                }
                            </Typography>
                        </Stack>
                    )}

                    {/* Distance */}
                    {church.distance_km !== null && (
                        <Typography
                            variant="body2"
                            sx={{
                                mt: 0.5,
                                color: '#1A73E8',
                                fontWeight: 500,
                                fontSize: '0.875rem'
                            }}
                        >
                            📍 {formatDistance(church.distance_km)}
                        </Typography>
                    )}
                </Box>
            </Stack>

            {/* Boutons d'action */}
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<InfoIcon />}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick();
                    }}
                    fullWidth
                    sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                        borderColor: '#DADCE0',
                        color: '#5F6368',
                        '&:hover': {
                            borderColor: '#DADCE0',
                            bgcolor: '#F8F9FA'
                        }
                    }}
                >
                    Voir plus
                </Button>
            </Stack>
        </Box>
    </Box>
));

ChurchCard.displayName = 'ChurchCard';

/**
 * Composant Card pour un événement
 */
const EventCard: React.FC<{
    event: Event;
    onClick: () => void;
}> = React.memo(({ event, onClick }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    // Hook web pour gérer la participation (optimistic + localStorage)
    const { isInterested, interestedCount: localInterestedCount, isPending, toggle } = useEventInterestWeb(event.id, false, event.interested_count);

    // Mettre à jour le temps chaque minute pour le décompte
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    const startDate = new Date(event.start_datetime);
    const endDate = event.end_datetime ? new Date(event.end_datetime) : null;

    // Calculer le statut de l'événement
    const isOngoing = endDate && currentTime >= startDate && currentTime <= endDate;
    const isUpcoming = currentTime < startDate;

    const day = startDate.getDate();
    const month = startDate.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase().replace('.', '');

    return (
        <Box
            sx={{
                py: 2,
                px: 2,
                bgcolor: '#FFFFFF',
                '&:hover': {
                    backgroundColor: '#F8F9FA'
                },
                transition: 'background-color 0.2s',
                cursor: 'pointer'
            }}
            onClick={onClick}
        >
            <Box sx={{ width: '100%' }}>
                {/* En-tête avec Date Badge et Titre */}
                <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 1.5 }}>
                    {/* Calendar Badge: Day on top, Month in Red below */}
                    <Paper
                        elevation={0}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 48,
                            height: 52,
                            borderRadius: 2,
                            border: '1px solid #DADCE0',
                            bgcolor: '#FFFFFF',
                            flexShrink: 0,
                            mt: 0.5
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                lineHeight: 1,
                                color: '#202124',
                                mb: 0.2
                            }}
                        >
                            {day}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                color: '#EA4335',
                                lineHeight: 1
                            }}
                        >
                            {month}
                        </Typography>
                    </Paper>
                    <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontSize: '1rem',
                                    lineHeight: 1.4,
                                    color: '#202124',
                                    fontWeight: 500
                                }}
                            >
                                {event.title}
                            </Typography>
                            {/* Badge de statut */}
                            {isOngoing ? (
                                <Chip
                                    label="En cours"
                                    size="small"
                                    sx={{
                                        bgcolor: '#FF9800',
                                        color: 'white',
                                        fontWeight: 500,
                                        fontSize: '0.7rem',
                                        height: 20
                                    }}
                                />
                            ) : isUpcoming ? (
                                <Chip
                                    label="À venir"
                                    size="small"
                                    sx={{
                                        bgcolor: '#E8F0FE',
                                        color: '#1A73E8',
                                        fontWeight: 500,
                                        fontSize: '0.7rem',
                                        height: 20
                                    }}
                                />
                            ) : null}
                        </Stack>

                        {/* Décompte temps réel pour événements EN COURS */}
                        {isOngoing && endDate && (() => {
                            const remaining = getRemainingTime(event.end_datetime);
                            if (!remaining) return null;

                            const isUrgent = remaining.totalMinutes <= 30;

                            return (
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.8,
                                        px: 1.5,
                                        py: 0.8,
                                        mb: 0.8,
                                        borderRadius: 1,
                                        bgcolor: isUrgent ? '#EA4335' : '#FF9800',
                                        color: 'white',
                                        fontWeight: 500,
                                        boxShadow: 'none'
                                    }}
                                >
                                    <AccessTimeIcon sx={{ fontSize: 18 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                                        {remaining.text}
                                    </Typography>
                                </Box>
                            );
                        })()}

                        {/* Temps relatif */}
                        <Typography
                            variant="body2"
                            sx={{
                                mb: 0.8,
                                mt: 0.5,
                                fontWeight: 500,
                                color: isOngoing ? '#FF9800' : '#1A73E8',
                                fontSize: '0.875rem'
                            }}
                        >
                            {getRelativeTime(event.start_datetime)}
                        </Typography>

                        {/* Date de début */}
                        <Typography
                            variant="body2"
                            sx={{ mb: 0.3, color: '#5F6368', fontSize: '0.875rem' }}
                        >
                            Début: {startDate.toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Typography>

                        {/* Date de fin */}
                        {endDate && (
                            <Typography
                                variant="body2"
                                sx={{ mb: 0.5, color: '#5F6368', fontSize: '0.875rem' }}
                            >
                                Fin: {endDate.toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Typography>
                        )}

                        {/* Ville et Code Postal */}
                        {(event.event_city || event.event_postal_code) && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <PlaceIcon sx={{ fontSize: 16, color: '#5F6368' }} />
                                <Typography variant="body2" sx={{ color: '#5F6368', fontSize: '0.875rem' }}>
                                    {event.event_city && event.event_postal_code
                                        ? `${event.event_city}, ${event.event_postal_code}`
                                        : event.event_city || event.event_postal_code
                                    }
                                </Typography>
                            </Stack>
                        )}

                        {/* Distance et compteur d'intéressés */}
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.5 }}>
                            {event.distance_km !== null && (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#EA4335',
                                        fontWeight: 500,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    📍 {formatDistance(event.distance_km)}
                                </Typography>
                            )}
                            {((localInterestedCount ?? event.interested_count) !== undefined && (localInterestedCount ?? event.interested_count)! > 0) && (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        color: '#1A73E8',
                                        fontWeight: 500,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    👥 {localInterestedCount ?? event.interested_count} {(localInterestedCount ?? event.interested_count) === 1 ? 'intéressé' : 'intéressés'}
                                </Typography>
                            )}
                        </Stack>
                    </Box>
                </Stack>

                {/* Boutons d'action */}
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<InfoIcon />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick();
                        }}
                        fullWidth
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                            borderColor: '#DADCE0',
                            color: '#5F6368',
                            '&:hover': {
                                borderColor: '#DADCE0',
                                bgcolor: '#F8F9FA'
                            }
                        }}
                    >
                        Voir plus
                    </Button>
                    {/* Participation web */}
                    <Button
                        variant={isInterested ? 'contained' : 'outlined'}
                        size="small"
                        startIcon={<CheckIcon />}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggle().catch((err) => {
                                console.error('Interest toggle failed', err);
                                // simple feedback
                                alert('Impossible de mettre à jour votre participation.');
                            });
                        }}
                        disabled={isPending}
                        fullWidth
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                            borderColor: isInterested ? undefined : '#DADCE0',
                            bgcolor: isInterested ? '#1A73E8' : undefined,
                            color: isInterested ? 'white' : undefined,
                            '&:hover': {
                                bgcolor: isInterested ? '#1765CC' : '#F8F9FA'
                            }
                        }}
                    >
                        {isPending ? '...' : (isInterested ? 'Ne plus participer' : 'Je participe')}
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
});

EventCard.displayName = 'EventCard';

/**
 * Panneau de résultats style Google Maps
 * Affiche la liste des églises et événements
 * Responsive: Panel sur desktop, Drawer sur mobile
 */
const ResultsPanel: React.FC<ResultsPanelProps> = React.memo(({
    churches,
    events,
    loading,
    onChurchClick,
    onEventClick,
    onClose,
    open = true
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // États pour la recherche et le tri
    const [searchQuery, setSearchQuery] = useState('');
    const [filterChurches, setFilterChurches] = useState(true);
    const [filterEvents, setFilterEvents] = useState(true);
    const [showMyParticipations, setShowMyParticipations] = useState(false);
    const [sortBy, setSortBy] = useState<SortType>('distance');

    // Taille fixe du panneau
    const panelWidth = 400; // Largeur fixe

    // Handlers pour les filtres/tri avec auto-ajustement
    const handleToggleChurches = useCallback(() => {
        setFilterChurches(prev => {
            const newValue = !prev;
            if (newValue && sortBy === 'date') {
                setSortBy('distance');
            }
            return newValue;
        });
    }, [sortBy]);

    const handleToggleEvents = useCallback(() => {
        setFilterEvents(prev => !prev);
    }, []);

    const handleSortChange = useCallback((newSortType: SortType) => {
        setSortBy(newSortType);
        if (newSortType === 'date') {
            setFilterChurches(false);
            setFilterEvents(true);
        }
    }, []);

    const toggleShowMyParticipations = useCallback(() => {
        setShowMyParticipations(prev => !prev);
        // when showing only participations, ensure events filter is active
        setFilterEvents(true);
        setFilterChurches(false);
    }, []);

    // Filtrer et trier les données
    const filteredAndSortedData = useMemo(() => {
        const items: Array<{ type: 'church' | 'event'; data: Church | Event }> = [];

        if (filterChurches) {
            churches.forEach(church => items.push({ type: 'church', data: church }));
        }

        if (filterEvents) {
            events.forEach(event => items.push({ type: 'event', data: event }));
        }

        // Filtrage par recherche
        let filteredItems = items;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filteredItems = items.filter(item => {
                if (item.type === 'church') {
                    const church = item.data as Church;
                    return (
                        church.church_name?.toLowerCase().includes(query) ||
                        church.denomination_name?.toLowerCase().includes(query) ||
                        church.city?.toLowerCase().includes(query) ||
                        church.pastor_name?.toLowerCase().includes(query)
                    );
                } else {
                    const event = item.data as Event;
                    return (
                        event.title?.toLowerCase().includes(query) ||
                        event.church_name?.toLowerCase().includes(query) ||
                        event.event_city?.toLowerCase().includes(query)
                    );
                }
            });
        }

        // Filtrer uniquement les participations locales si demandé
        if (showMyParticipations) {
            let local: Record<string, number> = {};
            try {
                const raw = localStorage.getItem('light_church:interested_events');
                if (raw) local = JSON.parse(raw) as Record<string, number>;
            } catch {
                local = {};
            }

            filteredItems = filteredItems.filter(item => item.type === 'event' && local[String(item.data.id)] !== undefined);
        }

        // Tri
        return filteredItems.sort((a, b) => {
            if (sortBy === 'distance') {
                const distA = a.data.distance_km ?? Infinity;
                const distB = b.data.distance_km ?? Infinity;
                return distA - distB;
            } else {
                // Tri par date uniquement pour les événements
                if (a.type === 'event' && b.type === 'event') {
                    const dateA = new Date((a.data as Event).created_at || 0).getTime();
                    const dateB = new Date((b.data as Event).created_at || 0).getTime();
                    return dateB - dateA;
                }
                // Les églises vont après les événements en tri par date
                return a.type === 'event' ? -1 : 1;
            }
        });
    }, [churches, events, filterChurches, filterEvents, searchQuery, sortBy]);

    // Calculer le total avant filtre de recherche
    const totalBeforeSearch = useMemo(() => {
        let count = 0;
        if (filterChurches) count += churches.length;
        if (filterEvents) count += events.length;
        return count;
    }, [churches.length, events.length, filterChurches, filterEvents]);

    const showSearchBar = totalBeforeSearch > 15;

    const content = (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#FFFFFF'
            }}
        >
            {/* En-tête */}
            <Box sx={{ p: 2, borderBottom: '1px solid #E8EAED' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 500, color: '#202124', fontSize: '1.125rem' }}>
                            {filteredAndSortedData.length} {filteredAndSortedData.length > 1 ? 'résultats' : 'résultat'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#5F6368' }}>
                            {filterChurches && filterEvents && 'Églises et événements'}
                            {filterChurches && !filterEvents && 'Églises uniquement'}
                            {!filterChurches && filterEvents && 'Événements uniquement'}
                            {!filterChurches && !filterEvents && 'Aucun filtre sélectionné'}
                        </Typography>
                    </Box>
                    {isMobile && onClose && (
                        <IconButton onClick={onClose} size="small" sx={{ color: '#5F6368' }}>
                            <CloseIcon />
                        </IconButton>
                    )}
                </Box>
            </Box>

            {/* Barre de recherche (si > 15 résultats) */}
            {showSearchBar && (
                <Box sx={{ p: 2, borderBottom: '1px solid #E8EAED' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            bgcolor: '#F8F9FA',
                            borderRadius: 1,
                            px: 2,
                            py: 1
                        }}
                    >
                        <SearchIcon sx={{ color: '#5F6368', fontSize: 20, mr: 1 }} />
                        <InputBase
                            placeholder="Filtrer les résultats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ flex: 1, fontSize: '0.875rem', color: '#202124' }}
                        />
                        {searchQuery && (
                            <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ p: 0.5 }}>
                                <ClearIcon sx={{ fontSize: 18, color: '#5F6368' }} />
                            </IconButton>
                        )}
                    </Box>
                    {searchQuery && (
                        <Typography variant="caption" sx={{ color: '#5F6368', mt: 1, display: 'block' }}>
                            {filteredAndSortedData.length} résultat{filteredAndSortedData.length > 1 ? 's' : ''} trouvé{filteredAndSortedData.length > 1 ? 's' : ''}
                        </Typography>
                    )}
                </Box>
            )}

            {/* Chips de filtres/tri - Google Maps style */}
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    bgcolor: '#FFFFFF',
                    zIndex: 10,
                    borderBottom: '1px solid #E8EAED',
                    overflowX: isMobile ? 'auto' : 'visible',
                    '&::-webkit-scrollbar': { display: 'none' },
                    scrollbarWidth: 'none'
                }}
            >
                <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    sx={{
                        px: 2,
                        py: 1.5,
                        minWidth: isMobile ? 'max-content' : 'auto',
                        flexWrap: isMobile ? 'nowrap' : 'wrap'
                    }}
                >
                    {/* Églises */}
                    <Chip
                        icon={filterChurches ? <CheckIcon sx={{ fontSize: 16 }} /> : undefined}
                        label={`Églises (${churches.length})`}
                        onClick={handleToggleChurches}
                        sx={{
                            bgcolor: filterChurches ? '#E8F0FE' : '#F1F3F4',
                            color: filterChurches ? '#1A73E8' : '#5F6368',
                            borderColor: filterChurches ? '#1A73E8' : '#DADCE0',
                            borderWidth: 1,
                            borderStyle: 'solid',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            '&:hover': { bgcolor: filterChurches ? '#D2E3FC' : '#E8EAED' }
                        }}
                    />

                    {/* Événements */}
                    <Chip
                        icon={filterEvents ? <CheckIcon sx={{ fontSize: 16 }} /> : undefined}
                        label={`Événements (${events.length})`}
                        onClick={handleToggleEvents}
                        sx={{
                            bgcolor: filterEvents ? '#FEE8E6' : '#F1F3F4',
                            color: filterEvents ? '#EA4335' : '#5F6368',
                            borderColor: filterEvents ? '#EA4335' : '#DADCE0',
                            borderWidth: 1,
                            borderStyle: 'solid',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            '&:hover': { bgcolor: filterEvents ? '#FDD7D3' : '#E8EAED' }
                        }}
                    />

                    {/* Divider */}
                    <Box sx={{ width: 1, height: 24, bgcolor: '#DADCE0', alignSelf: 'center', mx: 0.5 }} />

                    {/* Les plus proches */}
                    <Chip
                        icon={sortBy === 'distance' ? <CheckIcon sx={{ fontSize: 16 }} /> : undefined}
                        label="Les plus proches"
                        onClick={() => handleSortChange('distance')}
                        sx={{
                            bgcolor: sortBy === 'distance' ? '#E8F0FE' : '#F1F3F4',
                            color: sortBy === 'distance' ? '#1A73E8' : '#5F6368',
                            borderColor: sortBy === 'distance' ? '#1A73E8' : '#DADCE0',
                            borderWidth: 1,
                            borderStyle: 'solid',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            '&:hover': { bgcolor: sortBy === 'distance' ? '#D2E3FC' : '#E8EAED' }
                        }}
                    />

                    {/* Les plus récents */}
                    <Chip
                        icon={sortBy === 'date' ? <CheckIcon sx={{ fontSize: 16 }} /> : undefined}
                        label="Les plus récents"
                        onClick={() => handleSortChange('date')}
                        sx={{
                            bgcolor: sortBy === 'date' ? '#E8F0FE' : '#F1F3F4',
                            color: sortBy === 'date' ? '#1A73E8' : '#5F6368',
                            borderColor: sortBy === 'date' ? '#1A73E8' : '#DADCE0',
                            borderWidth: 1,
                            borderStyle: 'solid',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            '&:hover': { bgcolor: sortBy === 'date' ? '#D2E3FC' : '#E8EAED' }
                        }}
                    />
                </Stack>
            </Box>

            {/* Liste des résultats filtrés et triés */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {loading ? (
                    // Skeleton loaders
                    <Box sx={{ p: 2 }}>
                        {[1, 2, 3].map(i => (
                            <Box key={i} sx={{ mb: 2 }}>
                                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                            </Box>
                        ))}
                    </Box>
                ) : filteredAndSortedData.length === 0 ? (
                    // Aucun résultat
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        {searchQuery ? (
                            <>
                                {/* Mes participations */}
                                <Chip
                                    icon={showMyParticipations ? <CheckIcon sx={{ fontSize: 16 }} /> : undefined}
                                    label="Mes participations"
                                    onClick={toggleShowMyParticipations}
                                    sx={{
                                        bgcolor: showMyParticipations ? '#E8F0FE' : '#F1F3F4',
                                        color: showMyParticipations ? '#1A73E8' : '#5F6368',
                                        borderColor: showMyParticipations ? '#1A73E8' : '#DADCE0',
                                        borderWidth: 1,
                                        borderStyle: 'solid',
                                        fontWeight: 500,
                                        fontSize: '0.875rem',
                                        '&:hover': { bgcolor: showMyParticipations ? '#D2E3FC' : '#E8EAED' }
                                    }}
                                />
                                <SearchIcon sx={{ fontSize: 64, color: '#DADCE0', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: '#5F6368', fontWeight: 500, fontSize: '1rem', mb: 1 }}>
                                    Aucun résultat
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#80868B', fontSize: '0.875rem' }}>
                                    Aucun résultat ne correspond à "{searchQuery}"
                                </Typography>
                            </>
                        ) : !filterChurches && !filterEvents ? (
                            <>
                                <Typography variant="h6" sx={{ color: '#5F6368', fontWeight: 500, fontSize: '1rem', mb: 1 }}>
                                    Aucun filtre sélectionné
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#80868B', fontSize: '0.875rem' }}>
                                    Veuillez sélectionner au moins un filtre
                                </Typography>
                            </>
                        ) : (
                            <>
                                <Typography variant="h6" sx={{ color: '#5F6368', fontWeight: 500, fontSize: '1rem', mb: 1 }}>
                                    Aucun résultat
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#80868B', fontSize: '0.875rem' }}>
                                    Aucun résultat ne correspond à vos filtres
                                </Typography>
                            </>
                        )}
                    </Box>
                ) : (
                    // Liste combinée
                    <List disablePadding>
                        {filteredAndSortedData.map((item, index) => (
                            <React.Fragment key={`${item.type}-${item.data.id}`}>
                                {item.type === 'church' ? (
                                    <ChurchCard
                                        church={item.data as Church}
                                        onClick={() => onChurchClick(item.data as Church)}
                                    />
                                ) : (
                                    <EventCard
                                        event={item.data as Event}
                                        onClick={() => onEventClick(item.data as Event)}
                                    />
                                )}
                                {index < filteredAndSortedData.length - 1 && <Divider sx={{ borderColor: '#E8EAED' }} />}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Box>
        </Box>
    );

    // Sur mobile: Drawer en bas
    if (isMobile) {
        return (
            <Drawer
                anchor="bottom"
                open={open}
                onClose={onClose}
                sx={{
                    '& .MuiDrawer-paper': {
                        height: '90vh',
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        bgcolor: '#FFFFFF',
                        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)'
                    }
                }}
            >
                {/* Handle indicateur */}
                <Box
                    sx={{
                        position: 'sticky',
                        top: 0,
                        bgcolor: '#FFFFFF',
                        zIndex: 100,
                        pt: 2,
                        pb: 1,
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 4,
                            backgroundColor: '#DADCE0',
                            borderRadius: 2
                        }}
                    />
                </Box>
                {content}
            </Drawer>
        );
    }

    // Sur desktop: Panel fixe à gauche
    return (
        <Paper
            elevation={0}
            sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                bottom: 16,
                width: panelWidth,
                zIndex: 1000,
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E8EAED',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
        >
            {content}
        </Paper>
    );
});

ResultsPanel.displayName = 'ResultsPanel';

export default ResultsPanel;
