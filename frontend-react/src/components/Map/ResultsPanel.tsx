import React, { useState, useEffect } from 'react';
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
    Chip
} from '@mui/material';
import {
    Close as CloseIcon,
    Church as ChurchIcon,
    Event as EventIcon,
    Place as PlaceIcon,
    Directions as DirectionsIcon,
    InfoOutlined as InfoIcon,
    AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Church, Event } from '../../types/publicMap';
import { formatDistance } from '../../services/publicMapService';

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
            '&:hover': {
                backgroundColor: 'action.hover'
            },
            transition: 'background-color 0.2s'
        }}
    >
        <Box sx={{ width: '100%' }}>
            {/* En-tête avec icône et nom */}
            <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.5 }}>
                <ChurchIcon
                    color="primary"
                    sx={{
                        mt: 0.5,
                        fontSize: 28
                    }}
                />
                <Box sx={{ flex: 1 }}>
                    <Typography
                        variant="h6"
                        fontWeight={600}
                        sx={{
                            fontSize: '1.1rem',
                            lineHeight: 1.3,
                            mb: 0.5
                        }}
                    >
                        {church.church_name}
                    </Typography>

                    {/* Pasteur */}
                    {church.pastor_name && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                        >
                            Pasteur: {church.pastor_name}
                        </Typography>
                    )}

                    {/* Ville et Code Postal */}
                    {(church.city || church.postal_code) && (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <PlaceIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
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
                            color="primary.main"
                            fontWeight={600}
                            sx={{ mt: 0.5 }}
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
                    onClick={onClick}
                    sx={{
                        flex: 1,
                        textTransform: 'none',
                        fontWeight: 600
                    }}
                >
                    Voir plus
                </Button>
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${church.latitude},${church.longitude}`,
                            '_blank'
                        );
                    }}
                    sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: 'primary.dark'
                        }
                    }}
                >
                    <DirectionsIcon />
                </IconButton>
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

    return (
        <Box
            sx={{
                py: 2,
                px: 2,
                '&:hover': {
                    backgroundColor: 'action.hover'
                },
                transition: 'background-color 0.2s'
            }}
        >
            <Box sx={{ width: '100%' }}>
                {/* En-tête avec icône et titre */}
                <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.5 }}>
                    <EventIcon
                        color="secondary"
                        sx={{
                            mt: 0.5,
                            fontSize: 28
                        }}
                    />
                    <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                sx={{
                                    fontSize: '1.1rem',
                                    lineHeight: 1.3
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
                                        bgcolor: 'orange',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '0.7rem'
                                    }}
                                />
                            ) : isUpcoming ? (
                                <Chip
                                    label="À venir"
                                    color="info"
                                    size="small"
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: '0.7rem'
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
                                        borderRadius: 2,
                                        bgcolor: isUrgent ? 'error.main' : 'warning.main',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        boxShadow: isUrgent ? '0 0 15px rgba(244, 67, 54, 0.5)' : '0 0 15px rgba(255, 152, 0, 0.5)',
                                        animation: 'pulse 2s ease-in-out infinite',
                                        '@keyframes pulse': {
                                            '0%, 100%': {
                                                transform: 'scale(1)',
                                                opacity: 1
                                            },
                                            '50%': {
                                                transform: 'scale(1.05)',
                                                opacity: 0.9
                                            }
                                        }
                                    }}
                                >
                                    <AccessTimeIcon sx={{ fontSize: 20 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
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
                                fontWeight: 700,
                                color: isOngoing ? 'orange' : 'primary.main',
                                fontSize: '0.9rem'
                            }}
                        >
                            {getRelativeTime(event.start_datetime)}
                        </Typography>

                        {/* Date de début */}
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.3 }}
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
                                color="text.secondary"
                                sx={{ mb: 0.5 }}
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
                                <PlaceIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {event.event_city && event.event_postal_code
                                        ? `${event.event_city}, ${event.event_postal_code}`
                                        : event.event_city || event.event_postal_code
                                    }
                                </Typography>
                            </Stack>
                        )}

                        {/* Distance */}
                        {event.distance_km !== null && (
                            <Typography
                                variant="body2"
                                color="secondary.main"
                                fontWeight={600}
                                sx={{ mt: 0.5 }}
                            >
                                📍 {formatDistance(event.distance_km)}
                            </Typography>
                        )}
                    </Box>
                </Stack>

                {/* Boutons d'action */}
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        color="secondary"
                        startIcon={<InfoIcon />}
                        onClick={onClick}
                        sx={{
                            flex: 1,
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        Voir plus
                    </Button>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                                `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`,
                                '_blank'
                            );
                        }}
                        sx={{
                            backgroundColor: 'secondary.main',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'secondary.dark'
                            }
                        }}
                    >
                        <DirectionsIcon />
                    </IconButton>
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
    open = true,
    isGeolocated = false,
    isMobileView = false
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const totalResults = churches.length + events.length;

    const content = (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'background.paper'
            }}
        >
            {/* En-tête */}
            <Box
                sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: 'divider'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: isGeolocated ? 1 : 0
                    }}
                >
                    <Typography variant="h6" fontWeight={600}>
                        Résultats ({totalResults})
                    </Typography>
                    {isMobile && onClose && (
                        <IconButton onClick={onClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    )}
                </Box>
                {/* Indicateur de tri par distance */}
                {isGeolocated && totalResults > 0 && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                        }}
                    >
                        <PlaceIcon
                            sx={{
                                fontSize: 16,
                                color: 'primary.main'
                            }}
                        />
                        <Typography
                            variant="caption"
                            color="primary.main"
                            fontWeight={600}
                        >
                            {isMobileView
                                ? 'Dans un rayon de 15km autour de vous'
                                : 'Triés par distance (du plus proche au plus éloigné)'
                            }
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Liste des résultats */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {loading ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            Chargement...
                        </Typography>
                    </Box>
                ) : totalResults === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            Aucun résultat dans cette zone
                        </Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {/* Section Églises */}
                        {churches.length > 0 && (
                            <>
                                <Box sx={{ p: 2, backgroundColor: 'action.hover' }}>
                                    <Typography variant="overline" fontWeight={700} color="primary">
                                        Églises ({churches.length})
                                    </Typography>
                                </Box>
                                {churches.map((church, index) => (
                                    <React.Fragment key={church.id}>
                                        <ChurchCard
                                            church={church}
                                            onClick={() => onChurchClick(church)}
                                        />
                                        {index < churches.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </>
                        )}

                        {/* Séparateur entre églises et événements */}
                        {churches.length > 0 && events.length > 0 && (
                            <Divider sx={{ my: 2 }} />
                        )}

                        {/* Section Événements */}
                        {events.length > 0 && (
                            <>
                                <Box sx={{ p: 2, backgroundColor: 'action.hover' }}>
                                    <Typography variant="overline" fontWeight={700} color="secondary">
                                        Événements ({events.length})
                                    </Typography>
                                </Box>
                                {events.map((event, index) => (
                                    <React.Fragment key={event.id}>
                                        <EventCard
                                            event={event}
                                            onClick={() => onEventClick(event)}
                                        />
                                        {index < events.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </>
                        )}
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
                        height: '60vh',
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16
                    }
                }}
            >
                {content}
            </Drawer>
        );
    }

    // Sur desktop: Panel fixe à gauche (toujours visible avec légère transparence)
    return (
        <Paper
            elevation={3}
            sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                bottom: 16,
                width: 380,
                zIndex: 1000,
                borderRadius: 3,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(255, 255, 255, 0.97)',
                backdropFilter: 'blur(8px)'
            }}
        >
            {content}
        </Paper>
    );
});

ResultsPanel.displayName = 'ResultsPanel';

export default ResultsPanel;
