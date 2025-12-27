import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    InputAdornment,
    Grid,
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import Pagination from '../components/Pagination';
import { TableSkeleton } from '../components/Loader';

interface Event {
    id: number;
    title: string;
    start_datetime: string;
    end_datetime: string;
    status?: string;
    cancelled_at?: string | null;
    cancellation_reason?: string | null;
    church_name: string;
    first_name: string;
    last_name: string;
}

export default function AdminEvents() {
    const navigate = useNavigate();
    const [allEvents, setAllEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter & Pagination State
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    /**
     * Calcule le statut dynamique d'un événement basé sur les dates
     */
    const calculateEventStatus = useCallback((event: Event): string => {
        // Si l'événement est annulé, retourner CANCELLED
        if (event.cancelled_at) {
            return 'CANCELLED';
        }

        const now = new Date();
        const startDate = new Date(event.start_datetime);
        const endDate = new Date(event.end_datetime);

        // Si la date de fin est passée
        if (now > endDate) {
            return 'COMPLETED';
        }

        // Si l'événement est en cours (entre start et end)
        if (now >= startDate && now <= endDate) {
            return 'ONGOING';
        }

        // Si l'événement est à venir
        if (now < startDate) {
            return 'UPCOMING';
        }

        return 'UPCOMING';
    }, []);

    /**
     * Calcule le compte à rebours avant un événement
     */
    const getCountdown = useCallback((startDatetime: string): string => {
        const now = new Date();
        const startDate = new Date(startDatetime);
        const diffMs = startDate.getTime() - now.getTime();

        // Si l'événement est déjà commencé ou passé
        if (diffMs <= 0) {
            return 'Commencé';
        }

        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (diffDays > 0) {
            return `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
        } else if (diffHours > 0) {
            return `Dans ${diffHours}h ${diffMinutes}min`;
        } else {
            return `Dans ${diffMinutes} min`;
        }
    }, []);

    /**
     * Récupère tous les événements depuis l'API
     */
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/events', {
                params: {
                    page: 1,
                    limit: 1000, // Récupère tous les événements
                    search: '' // On gère la recherche côté client
                }
            });

            // Handle both legacy array format and new paginated format
            let eventsList: Event[] = [];
            if (Array.isArray(data)) {
                eventsList = data;
            } else {
                eventsList = data.data || [];
            }

            // Enrichir chaque événement avec le statut calculé
            const enrichedEvents = eventsList.map(event => ({
                ...event,
                status: calculateEventStatus(event)
            }));

            setAllEvents(enrichedEvents);
        } catch (err) {
            console.error('Erreur lors du chargement des événements:', err);
        } finally {
            setLoading(false);
        }
    }, [calculateEventStatus]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    /**
     * Filtre et pagine les événements côté client
     */
    const filteredAndPaginatedEvents = useMemo(() => {
        // 1. Filtrer par recherche
        let filtered = allEvents.filter(event => {
            if (!search.trim()) return true;
            const searchLower = search.toLowerCase();
            return (
                event.title?.toLowerCase().includes(searchLower) ||
                event.church_name?.toLowerCase().includes(searchLower) ||
                event.first_name?.toLowerCase().includes(searchLower) ||
                event.last_name?.toLowerCase().includes(searchLower)
            );
        });

        // 2. Filtrer par statut
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(event => event.status === statusFilter);
        }

        // 3. Paginer
        const totalFiltered = filtered.length;
        const totalPages = Math.ceil(totalFiltered / itemsPerPage);
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginated = filtered.slice(startIndex, endIndex);

        return {
            events: paginated,
            total: totalFiltered,
            totalPages: totalPages
        };
    }, [allEvents, search, statusFilter, page, itemsPerPage]);

    /**
     * Navigue vers la page de détails de l'événement
     */
    const handleView = (id: number) => {
        navigate(`/dashboard/admin/events/${id}`);
    };

    /**
     * Retourne le chip de statut avec la bonne couleur
     */
    const getStatusChip = (status: string) => {
        switch (status) {
            case 'UPCOMING':
                return <Chip label="À venir" color="info" size="small" sx={{ fontWeight: 'bold' }} />;
            case 'ONGOING':
                return <Chip label="En cours" sx={{ bgcolor: 'orange', color: 'white', fontWeight: 'bold' }} size="small" />;
            case 'COMPLETED':
                return <Chip label="Terminé" color="success" size="small" sx={{ fontWeight: 'bold' }} />;
            case 'CANCELLED':
                return <Chip label="Annulé" color="error" size="small" sx={{ fontWeight: 'bold' }} />;
            default:
                return <Chip label={status} size="small" />;
        }
    };

    /**
     * Formate l'affichage des dates (début → fin)
     */
    const formatDateRange = (startDatetime: string, endDatetime: string) => {
        const startDate = new Date(startDatetime);
        const endDate = new Date(endDatetime);

        const formatDate = (date: Date) => {
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        };

        const formatTime = (date: Date) => {
            return date.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const startDateStr = formatDate(startDate);
        const endDateStr = formatDate(endDate);

        // Si même jour
        if (startDateStr === endDateStr) {
            return (
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {startDateStr}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {formatTime(startDate)} → {formatTime(endDate)}
                    </Typography>
                </Box>
            );
        }

        // Si jours différents
        return (
            <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {startDateStr}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {formatTime(startDate)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mx: 0.5 }}>
                    →
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {endDateStr} {formatTime(endDate)}
                </Typography>
            </Box>
        );
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                Modération Événements
            </Typography>

            {/* Filters and Search */}
            <Card sx={{ bgcolor: 'background.paper' }}>
                <CardContent sx={{ pt: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                placeholder="Rechercher un événement, une église, un créateur..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                label="Rechercher"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Statut</InputLabel>
                                <Select
                                    value={statusFilter}
                                    label="Statut"
                                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                >
                                    <MenuItem value="ALL">Tous les statuts</MenuItem>
                                    <MenuItem value="UPCOMING">À venir</MenuItem>
                                    <MenuItem value="ONGOING">En cours</MenuItem>
                                    <MenuItem value="COMPLETED">Terminés</MenuItem>
                                    <MenuItem value="CANCELLED">Annulés</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Tous les événements ({filteredAndPaginatedEvents.total})
                    </Typography>
                    {loading ? (
                        <TableSkeleton rows={itemsPerPage} />
                    ) : (
                        <TableContainer component={Paper} sx={{ bgcolor: 'transparent' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Titre</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Dates</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Compte à rebours</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Statut</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Église</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Créateur</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredAndPaginatedEvents.events.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                                <Typography color="text.secondary">
                                                    Aucun événement trouvé
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredAndPaginatedEvents.events.map(ev => (
                                            <TableRow
                                                key={ev.id}
                                                sx={{
                                                    '&:hover': { bgcolor: 'action.hover' },
                                                    cursor: 'pointer',
                                                    // Animation de clignotement pour les événements en cours
                                                    ...(ev.status === 'ONGOING' && {
                                                        animation: 'blink 2s ease-in-out infinite',
                                                        '@keyframes blink': {
                                                            '0%, 100%': {
                                                                bgcolor: 'transparent',
                                                                opacity: 1
                                                            },
                                                            '50%': {
                                                                bgcolor: 'rgba(255, 152, 0, 0.15)',
                                                                opacity: 0.85
                                                            }
                                                        }
                                                    })
                                                }}
                                                onClick={() => handleView(ev.id)}
                                            >
                                                <TableCell sx={{ fontWeight: 'bold', maxWidth: 250 }}>
                                                    {ev.title}
                                                </TableCell>
                                                <TableCell sx={{ minWidth: 180 }}>
                                                    {formatDateRange(ev.start_datetime, ev.end_datetime)}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={getCountdown(ev.start_datetime)}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: ev.status === 'UPCOMING' ? 'primary.light' : 'grey.300',
                                                            color: ev.status === 'UPCOMING' ? 'primary.contrastText' : 'text.secondary',
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusChip(ev.status || 'UPCOMING')}
                                                </TableCell>
                                                <TableCell sx={{ color: 'info.main', fontWeight: 500 }}>
                                                    {ev.church_name || 'N/A'}
                                                </TableCell>
                                                <TableCell sx={{ color: 'text.secondary' }}>
                                                    {ev.first_name} {ev.last_name}
                                                </TableCell>
                                                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                                    <IconButton
                                                        size="small"
                                                        sx={{
                                                            bgcolor: 'primary.main',
                                                            color: 'white',
                                                            '&:hover': { bgcolor: 'primary.dark' }
                                                        }}
                                                        onClick={() => handleView(ev.id)}
                                                        title="Voir les détails"
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Pagination Controls */}
                    {!loading && filteredAndPaginatedEvents.events.length > 0 && (
                        <Pagination
                            currentPage={page}
                            totalPages={filteredAndPaginatedEvents.totalPages}
                            total={filteredAndPaginatedEvents.total}
                            itemsPerPage={itemsPerPage}
                            onPageChange={(newPage) => setPage(newPage)}
                        />
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}
