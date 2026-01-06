import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button, Divider, CircularProgress, IconButton, AppBar, Toolbar } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { EventDetails } from '../../types/publicMap';
import { fetchEventDetails } from '../../services/publicMapService';
import useEventInterestWeb from '../../hooks/useEventInterestWeb';
import DetailDrawer from '../../components/ui/DetailDrawer';

const STORAGE_KEY = 'light_church:interested_events';

export default function MyParticipations() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<EventDetails[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const loadLocal = useCallback(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [] as number[];
            const obj = JSON.parse(raw) as Record<string, number>;
            return Object.keys(obj).map(k => Number(k)).filter(Boolean);
        } catch {
            return [] as number[];
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            try {
                const ids = loadLocal();
                if (ids.length === 0) {
                    if (mounted) setEvents([]);
                    return;
                }

                const promises = ids.map(id => fetchEventDetails(id).catch(() => null));
                const results = await Promise.all(promises);
                const good = results.filter(Boolean) as EventDetails[];
                if (mounted) setEvents(good);
            } catch (err) {
                console.error('Erreur chargement participations', err);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => { mounted = false; };
    }, [loadLocal]);

    if (loading) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!events || events.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6">Aucune participation</Typography>
                <Typography variant="body2" sx={{ color: '#5F6368', mt: 1 }}>Vous n'êtes inscrit à aucun événement pour le moment.</Typography>
                <Box sx={{ mt: 2 }}>
                    <Button variant="contained" onClick={() => navigate('/map')}>Voir la carte</Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header with back button */}
            <AppBar position="static" elevation={1}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => navigate('/map')}
                        aria-label="Retour à la carte"
                        sx={{ mr: 2 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Mes participations
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Content */}
            <Box sx={{ p: 2, overflow: 'auto', flexGrow: 1 }}>
            <List>
                {events.map(ev => (
                    <React.Fragment key={ev.id}>
                        <ListItem secondaryAction={
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button size="small" variant="outlined" onClick={async () => {
                                    setDetailLoading(true);
                                    try {
                                        const details = await fetchEventDetails(ev.id);
                                        setSelectedEvent(details);
                                        setDrawerOpen(true);
                                    } catch (e) {
                                        console.error('Failed to load event details', e);
                                    } finally {
                                        setDetailLoading(false);
                                    }
                                }}>Détails</Button>
                                <ParticipationButton eventId={ev.id} />
                            </Box>
                        }>
                            <ListItemText primary={ev.title} secondary={ev.details?.city ? `${ev.details.city} • ${new Date(ev.start_datetime).toLocaleString('fr-FR')}` : new Date(ev.start_datetime).toLocaleString('fr-FR')} />
                        </ListItem>
                        <Divider />
                    </React.Fragment>
                ))}
            </List>
            </Box>
            <DetailDrawer
                open={drawerOpen}
                onClose={() => { setDrawerOpen(false); setSelectedEvent(null); }}
                loading={detailLoading}
                data={selectedEvent}
                type="event"
            />
        </Box>
    );
}

function ParticipationButton({ eventId }: { eventId: number }) {
    const { isInterested, isPending, toggle } = useEventInterestWeb(eventId, true);

    return (
        <Button size="small" variant={isInterested ? 'contained' : 'outlined'} onClick={() => toggle().catch(() => {})} disabled={isPending}>
            {isPending ? '...' : (isInterested ? 'Ne plus participer' : 'Je participe')}
        </Button>
    );
}
