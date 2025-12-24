import { useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    InputAdornment,
    Grid,
    Tabs,
    Tab,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Close as CloseIcon,
    Search as SearchIcon,
    PlayArrow as PlayArrowIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import Pagination from '../components/Pagination';
import { TableSkeleton } from '../components/Loader';

interface Event {
    id: number;
    title: string;
    start_datetime: string;
    end_datetime: string;
    status: string;
    church_name: string;
    first_name: string;
    last_name: string;
    latitude: number;
    longitude: number;
    church_id: number;
}


interface EventFormData {
    title: string;
    start_datetime: string;
    end_datetime: string;
    latitude: string;
    longitude: string;
    status: string;
    church_id: string;
    description: string;
    address: string;
    street_number: string;
    street_name: string;
    postal_code: string;
    city: string;
    speaker_name: string;
    max_seats: string;
    image_url: string;
    is_free: number;
    registration_link: string;
    youtube_live: string;
    has_parking: number;
    parking_capacity: string;
    is_parking_free: number;
    parking_details: string;
}

export default function AdminEvents() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<EventFormData | null>(null);
    const [activeTab, setActiveTab] = useState(0);

    // Filter & Pagination State
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEvents, setTotalEvents] = useState(0);
    const itemsPerPage = 10;

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/events', {
                params: {
                    page,
                    limit: itemsPerPage,
                    search,
                    status: statusFilter
                }
            });
            // Handle both legacy array format (safety) and new paginated format
            if (Array.isArray(data)) {
                setEvents(data);
            } else {
                setEvents(data.data);
                setTotalPages(data.meta.totalPages);
                setTotalEvents(data.meta.total);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchEvents();
        }, 300); // Simple debounce for search
        return () => clearTimeout(timer);
    }, [fetchEvents]);

    const deleteEvent = async (id: number) => {
        if (!confirm('Supprimer cet événement ?')) return;
        try {
            await api.delete(`/admin/events/${id}`);
            fetchEvents();
        } catch (err) {
            alert('Erreur suppression');
        }
    };

    const updateEventStatus = async (id: number, newStatus: string) => {
        try {
            await api.put(`/admin/events/${id}`, { status: newStatus });
            fetchEvents();
        } catch (err) {
            alert('Erreur lors de la mise à jour du statut');
        }
    };

    const handleEdit = async (id: number) => {
        try {
            const { data } = await api.get(`/admin/events/${id}`);
            setFormData({
                // Events table
                title: data.title || '',
                start_datetime: data.start_datetime ? new Date(data.start_datetime).toISOString().slice(0, 16) : '',
                end_datetime: data.end_datetime ? new Date(data.end_datetime).toISOString().slice(0, 16) : '',
                latitude: data.latitude || '',
                longitude: data.longitude || '',
                status: data.status || 'DRAFT',
                church_id: data.church_id || '',
                // Event_details table
                description: data.details?.description || '',
                address: data.details?.address || '',
                street_number: data.details?.street_number || '',
                street_name: data.details?.street_name || '',
                postal_code: data.details?.postal_code || '',
                city: data.details?.city || '',
                speaker_name: data.details?.speaker_name || '',
                max_seats: data.details?.max_seats || '',
                image_url: data.details?.image_url || '',
                is_free: data.details?.is_free ? 1 : 0,
                registration_link: data.details?.registration_link || '',
                youtube_live: data.details?.youtube_live || '',
                has_parking: data.details?.has_parking ? 1 : 0,
                parking_capacity: data.details?.parking_capacity || '',
                is_parking_free: data.details?.is_parking_free ? 1 : 0,
                parking_details: data.details?.parking_details || ''
            });
            setEditingId(id);
            setActiveTab(0);
        } catch (err) {
            alert('Erreur chargement');
        }
    };

    const handleSave = async () => {
        if (!editingId || !formData) return;
        try {
            await api.put(`/admin/events/${editingId}`, formData);
            alert('Sauvegardé !');
            setEditingId(null);
            fetchEvents();
        } catch (err) {
            alert('Erreur sauvegarde');
        }
    };

    const updateField = (field: string, value: string | number) => {
        if (!formData) return;
        setFormData({ ...formData, [field]: value });
    };

    const handleCheckboxChange = (id: string, checked: boolean) => {
        if (!formData) return;
        setFormData({ ...formData, [id]: checked ? 1 : 0 });
    };

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
                return <Chip label="À venir" color="info" size="small" sx={{ fontWeight: 'bold' }} />;
            case 'ONGOING':
                return <Chip label="En cours" sx={{ bgcolor: 'orange', color: 'white', fontWeight: 'bold' }} size="small" />;
            case 'COMPLETED':
                return <Chip label="Terminé" color="success" size="small" sx={{ fontWeight: 'bold' }} />;
            case 'DRAFT':
                return <Chip label="Brouillon" color="warning" size="small" sx={{ fontWeight: 'bold' }} />;
            case 'CANCELLED':
                return <Chip label="Annulé" color="error" size="small" sx={{ fontWeight: 'bold' }} />;
            default:
                return <Chip label={status} size="small" />;
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                Modération Événements
            </Typography>

            {/* MODAL D'ÉDITION COMPLET */}
            <Dialog
                open={!!editingId && !!formData}
                onClose={() => setEditingId(null)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: { maxHeight: '90vh' }
                }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Édition Événement #{editingId}</Typography>
                    <IconButton onClick={() => setEditingId(null)} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                            <Tab label="Général" />
                            <Tab label="Lieu" />
                            <Tab label="Options" />
                        </Tabs>
                    </Box>

                    {/* TAB: GÉNÉRAL */}
                    {activeTab === 0 && formData && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                fullWidth
                                label="Titre"
                                value={formData.title}
                                onChange={e => updateField('title', e.target.value)}
                            />

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        type="datetime-local"
                                        label="Date de début"
                                        value={formData.start_datetime}
                                        onChange={e => updateField('start_datetime', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        type="datetime-local"
                                        label="Date de fin"
                                        value={formData.end_datetime}
                                        onChange={e => updateField('end_datetime', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                            </Grid>

                            <TextField
                                fullWidth
                                label="Intervenant"
                                value={formData.speaker_name}
                                onChange={e => updateField('speaker_name', e.target.value)}
                                placeholder="Ex: Pasteur John Doe"
                            />

                            <FormControl fullWidth>
                                <InputLabel>Statut</InputLabel>
                                <Select
                                    value={formData.status || 'DRAFT'}
                                    label="Statut"
                                    onChange={e => updateField('status', e.target.value)}
                                >
                                    <MenuItem value="DRAFT">Brouillon</MenuItem>
                                    <MenuItem value="PUBLISHED">À venir</MenuItem>
                                    <MenuItem value="ONGOING">En cours</MenuItem>
                                    <MenuItem value="COMPLETED">Terminé</MenuItem>
                                    <MenuItem value="CANCELLED">Annulé</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Description"
                                value={formData.description}
                                onChange={e => updateField('description', e.target.value)}
                            />

                            <TextField
                                fullWidth
                                label="Image (URL)"
                                value={formData.image_url}
                                onChange={e => updateField('image_url', e.target.value)}
                                placeholder="https://..."
                            />

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Places disponibles"
                                        value={formData.max_seats}
                                        onChange={e => updateField('max_seats', e.target.value)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={formData.is_free === 1}
                                                onChange={(e) => handleCheckboxChange('is_free', e.target.checked)}
                                            />
                                        }
                                        label="Événement gratuit"
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* TAB: LIEU */}
                    {activeTab === 1 && formData && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                fullWidth
                                label="Adresse complète"
                                value={formData.address}
                                onChange={e => updateField('address', e.target.value)}
                            />

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Numéro de rue"
                                        value={formData.street_number}
                                        onChange={e => updateField('street_number', e.target.value)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Nom de rue"
                                        value={formData.street_name}
                                        onChange={e => updateField('street_name', e.target.value)}
                                    />
                                </Grid>
                            </Grid>

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Code postal"
                                        value={formData.postal_code}
                                        onChange={e => updateField('postal_code', e.target.value)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Ville"
                                        value={formData.city}
                                        onChange={e => updateField('city', e.target.value)}
                                    />
                                </Grid>
                            </Grid>

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Latitude"
                                        value={formData.latitude}
                                        onChange={e => updateField('latitude', e.target.value)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Longitude"
                                        value={formData.longitude}
                                        onChange={e => updateField('longitude', e.target.value)}
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.has_parking === 1}
                                            onChange={(e) => handleCheckboxChange('has_parking', e.target.checked)}
                                        />
                                    }
                                    label="Parking disponible"
                                />

                                {formData.has_parking === 1 && (
                                    <Box sx={{ pl: 4, pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    label="Capacité du parking"
                                                    value={formData.parking_capacity}
                                                    onChange={e => updateField('parking_capacity', e.target.value)}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={formData.is_parking_free === 1}
                                                            onChange={(e) => handleCheckboxChange('is_parking_free', e.target.checked)}
                                                        />
                                                    }
                                                    label="Parking gratuit"
                                                />
                                            </Grid>
                                        </Grid>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={2}
                                            label="Détails du parking"
                                            value={formData.parking_details}
                                            onChange={e => updateField('parking_details', e.target.value)}
                                        />
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    )}

                    {/* TAB: OPTIONS */}
                    {activeTab === 2 && formData && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                fullWidth
                                label="Lien d'inscription"
                                value={formData.registration_link}
                                onChange={e => updateField('registration_link', e.target.value)}
                                placeholder="https://..."
                            />

                            <TextField
                                fullWidth
                                label="Lien YouTube Live"
                                value={formData.youtube_live}
                                onChange={e => updateField('youtube_live', e.target.value)}
                                placeholder="https://youtube.com/..."
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditingId(null)}>Annuler</Button>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                    >
                        Sauvegarder les modifications
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Filters and Search */}
            <Card sx={{ bgcolor: 'background.paper' }}>
                <CardContent sx={{ pt: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                placeholder="Rechercher..."
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
                                    <MenuItem value="DRAFT">Brouillon</MenuItem>
                                    <MenuItem value="PUBLISHED">À venir</MenuItem>
                                    <MenuItem value="ONGOING">En cours</MenuItem>
                                    <MenuItem value="COMPLETED">Terminé</MenuItem>
                                    <MenuItem value="CANCELLED">Annulé</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Tous les événements ({totalEvents})
                    </Typography>
                    {loading ? (
                        <TableSkeleton rows={itemsPerPage} />
                    ) : (
                        <TableContainer component={Paper} sx={{ bgcolor: 'transparent' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: 'text.secondary' }}>Titre</TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>Date</TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>Statut</TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>Église</TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>Créé par</TableCell>
                                        <TableCell align="right" sx={{ color: 'text.secondary' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {events.map(ev => (
                                        <TableRow
                                            key={ev.id}
                                            sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                                        >
                                            <TableCell sx={{ fontWeight: 'bold' }}>{ev.title}</TableCell>
                                            <TableCell sx={{ color: 'text.secondary' }}>
                                                {new Date(ev.start_datetime).toLocaleDateString()} {new Date(ev.start_datetime).toLocaleTimeString()}
                                            </TableCell>
                                            <TableCell>{getStatusChip(ev.status)}</TableCell>
                                            <TableCell sx={{ color: 'info.main' }}>{ev.church_name || 'N/A'}</TableCell>
                                            <TableCell sx={{ color: 'text.secondary' }}>{ev.first_name} {ev.last_name}</TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                                    {ev.status === 'PUBLISHED' && (
                                                        <IconButton
                                                            size="small"
                                                            sx={{ bgcolor: 'orange', color: 'white', '&:hover': { bgcolor: 'darkorange' } }}
                                                            onClick={() => updateEventStatus(ev.id, 'ONGOING')}
                                                            title="Marquer comme En cours"
                                                        >
                                                            <PlayArrowIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                    {ev.status === 'ONGOING' && (
                                                        <IconButton
                                                            size="small"
                                                            sx={{ bgcolor: 'success.main', color: 'white', '&:hover': { bgcolor: 'success.dark' } }}
                                                            onClick={() => updateEventStatus(ev.id, 'COMPLETED')}
                                                            title="Marquer comme Terminé"
                                                        >
                                                            <CheckCircleIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                    <IconButton
                                                        size="small"
                                                        sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                                                        onClick={() => handleEdit(ev.id)}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => deleteEvent(ev.id)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Pagination Controls */}
                    {!loading && (
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            total={totalEvents}
                            itemsPerPage={itemsPerPage}
                            onPageChange={(newPage) => setPage(newPage)}
                        />
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}
