import React from 'react';
import {
    Box,
    Paper,
    Typography,
    List,
    ListItemButton,
    Divider,
    Chip,
    Stack,
    IconButton,
    Drawer,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    Close as CloseIcon,
    Church as ChurchIcon,
    Event as EventIcon,
    Place as PlaceIcon,
    Directions as DirectionsIcon
} from '@mui/icons-material';
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
}

/**
 * Composant Card pour une église
 */
const ChurchCard: React.FC<{
    church: Church;
    onClick: () => void;
}> = React.memo(({ church, onClick }) => (
    <ListItemButton
        onClick={onClick}
        sx={{
            py: 2,
            px: 2,
            '&:hover': {
                backgroundColor: 'action.hover'
            }
        }}
    >
        <Box sx={{ width: '100%' }}>
            <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1 }}>
                <ChurchIcon color="primary" sx={{ mt: 0.5 }} />
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                        {church.church_name}
                    </Typography>
                    {church.pastor_name && (
                        <Typography variant="body2" color="text.secondary">
                            Pasteur: {church.pastor_name}
                        </Typography>
                    )}
                </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={0.5}>
                {church.denomination_name && (
                    <Chip
                        label={church.denomination_name}
                        size="small"
                        color="primary"
                        variant="outlined"
                    />
                )}
                {church.distance_km !== null && (
                    <>
                        <Typography variant="caption" color="text.secondary">
                            📍 {formatDistance(church.distance_km)}
                        </Typography>
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
                                ml: 0.5,
                                padding: 0.5,
                                backgroundColor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'primary.dark'
                                }
                            }}
                        >
                            <DirectionsIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </>
                )}
            </Stack>
        </Box>
    </ListItemButton>
));

ChurchCard.displayName = 'ChurchCard';

/**
 * Composant Card pour un événement
 */
const EventCard: React.FC<{
    event: Event;
    onClick: () => void;
}> = React.memo(({ event, onClick }) => (
    <ListItemButton
        onClick={onClick}
        sx={{
            py: 2,
            px: 2,
            '&:hover': {
                backgroundColor: 'action.hover'
            }
        }}
    >
        <Box sx={{ width: '100%' }}>
            <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1 }}>
                <EventIcon color="secondary" sx={{ mt: 0.5 }} />
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                        {event.title}
                    </Typography>
                    {event.church_name && (
                        <Typography variant="body2" color="text.secondary">
                            {event.church_name}
                        </Typography>
                    )}
                </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={0.5}>
                <Typography variant="caption" color="text.secondary">
                    {new Date(event.start_datetime).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </Typography>
                {event.event_city && (
                    <Chip
                        icon={<PlaceIcon />}
                        label={event.event_city}
                        size="small"
                        variant="outlined"
                    />
                )}
                {event.distance_km !== null && (
                    <>
                        <Typography variant="caption" color="text.secondary">
                            📍 {formatDistance(event.distance_km)}
                        </Typography>
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
                                ml: 0.5,
                                padding: 0.5,
                                backgroundColor: 'secondary.main',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'secondary.dark'
                                }
                            }}
                        >
                            <DirectionsIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </>
                )}
            </Stack>
        </Box>
    </ListItemButton>
));

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
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
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
