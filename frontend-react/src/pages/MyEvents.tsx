import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Alert,
    Grid,
    Checkbox,
    FormControlLabel,
    FormHelperText,
    InputAdornment,
    Menu,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    Add as AddIcon,
    Save as SaveIcon,
    Close as CloseIcon,
    Event as EventIcon,
    LocationOn as LocationOnIcon,
    AutoAwesome as AutoAwesomeIcon,
    Image as ImageIcon,
    YouTube as YouTubeIcon,
    Church as ChurchIcon,
    ArrowBack as ArrowBackIcon,
    MoreVert as MoreVertIcon,
    Cancel as CancelIcon,
    Publish as PublishIcon,
    Drafts as DraftsIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import AddressAutocomplete from '../components/AddressAutocomplete';
import DateTimeInput from '../components/DateTimeInput';

interface EventFormData {
    title: string;
    start_datetime: string;
    end_datetime: string;
    description: string;
    latitude: string;
    longitude: string;
    address: string;
    street_number: string;
    street_name: string;
    postal_code: string;
    city: string;
    speaker_name: string;
    language_id: string;
    translation_language_ids: number[];
    max_seats: string;
    image_url: string;
    is_free: number;
    registration_link: string;
    has_parking: number;
    parking_capacity: string;
    is_parking_free: number;
    parking_details: string;
    youtube_live: string;
    status: string;
}

interface EventData extends EventFormData {
    id: number;
}

export default function MyEvents() {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const isAdminMode = !!eventId; // Mode admin si eventId existe

    const [events, setEvents] = useState<EventData[]>([]);
    const [showForm, setShowForm] = useState(isAdminMode); // Si mode admin, afficher le formulaire directement
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(eventId ? parseInt(eventId) : null);
    const [activeTab, setActiveTab] = useState(0);

    // Initial State
    const initialFormState: EventFormData = {
        title: '',
        start_datetime: '',
        end_datetime: '',
        description: '',
        // Location
        latitude: '',
        longitude: '',
        address: '',
        street_number: '',
        street_name: '',
        postal_code: '',
        city: '',
        // Details
        speaker_name: '',
        language_id: '10', // Default French
        translation_language_ids: [],
        max_seats: '',
        image_url: '',
        // Logistics
        is_free: 1, // Default true
        registration_link: '',
        // Parking
        has_parking: 0,
        parking_capacity: '',
        is_parking_free: 1,
        parking_details: '',
        // Online
        youtube_live: '',
        status: 'PUBLISHED' // Default status
    };

    const [formData, setFormData] = useState<EventFormData>(initialFormState);
    const [dateError, setDateError] = useState('');

    const [hasChurch, setHasChurch] = useState<boolean | null>(null);
    const [isChurchComplete, setIsChurchComplete] = useState<boolean>(false);
    const [languages, setLanguages] = useState<any[]>([]);
    const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; eventId: number } | null>(null);

    // Load available languages
    useEffect(() => {
        const loadLanguages = async () => {
            try {
                const { data } = await api.get('/settings/languages');
                setLanguages(data.filter((lang: any) => lang.is_active));
            } catch (err) {
                console.error('Failed to load languages:', err);
            }
        };
        loadLanguages();
    }, []);

    useEffect(() => {
        if (isAdminMode && eventId) {
            // In admin mode, load the specific event directly
            loadEventForEdit(parseInt(eventId));
        } else {
            // In pastor mode, check church and load events
            checkChurchAndEvents();
        }
    }, [isAdminMode, eventId]);

    const loadEventForEdit = async (id: number) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/admin/events/${id}`);
            // Normalize data for form
            setFormData({
                ...initialFormState,
                ...data,
                // Ensure dates are formatted for datetime-local input (YYYY-MM-DDTHH:mm)
                start_datetime: data.start_datetime ? new Date(data.start_datetime).toISOString().slice(0, 16) : '',
                end_datetime: data.end_datetime ? new Date(data.end_datetime).toISOString().slice(0, 16) : '',
                // Ensure language_id is a string
                language_id: data.language_id ? data.language_id.toString() : '10',
                // Ensure translation_language_ids is an array of numbers
                translation_language_ids: data.translation_language_ids || [],
                // Ensure booleans/checkboxes are strictly 1 or 0
                has_parking: data.has_parking ? 1 : 0,
                is_parking_free: data.is_parking_free ? 1 : 0,
                is_free: data.is_free ? 1 : 0
            });
            setLoading(false);
        } catch (err) {
            console.error(err);
            alert("Impossible de charger l'événement");
            setLoading(false);
        }
    };

    const checkChurchAndEvents = async () => {
        setLoading(true);
        try {
            // 1. Check if church exists and is complete
            try {
                const { data } = await api.get('/church/my-church');
                setHasChurch(true);

                // Check if church is complete (required fields)
                const isComplete = Boolean(
                    data.church_name &&
                    data.denomination_id &&
                    (data.latitude !== null && data.latitude !== undefined && data.latitude !== '') &&
                    (data.longitude !== null && data.longitude !== undefined && data.longitude !== '') &&
                    (data.details?.address || data.address)
                );
                setIsChurchComplete(isComplete);

                // Debug log pour voir ce qui manque
                if (!isComplete) {
                    console.log('Église incomplète - Champs manquants:', {
                        church_name: data.church_name,
                        denomination_id: data.denomination_id,
                        latitude: data.latitude,
                        longitude: data.longitude,
                        address: data.details?.address || data.address
                    });
                }
            } catch (err: unknown) {
                const error = err as { response?: { status?: number } };
                if (error.response && error.response.status === 404) {
                    setHasChurch(false);
                    setIsChurchComplete(false);
                    setLoading(false);
                    return; // Stop here if no church
                }
            }

            // 2. Fetch Events if church exists
            const response = await api.get('/church/my-events');
            setEvents(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleCheckboxChange = (id: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [id]: checked ? 1 : 0 }));
    };

    const handleEdit = async (id: number) => {
        try {
            const { data } = await api.get(`/church/events/${id}`);
            // Normalize data for form
            setFormData({
                ...initialFormState,
                ...data,
                // Ensure dates are formatted for datetime-local input (YYYY-MM-DDTHH:mm)
                start_datetime: data.start_datetime ? new Date(data.start_datetime).toISOString().slice(0, 16) : '',
                end_datetime: data.end_datetime ? new Date(data.end_datetime).toISOString().slice(0, 16) : '',
                // Ensure booleans/checkboxes are strictly 1 or 0
                has_parking: data.has_parking ? 1 : 0,
                is_parking_free: data.is_parking_free ? 1 : 0,
                is_free: data.is_free ? 1 : 0
            });
            setEditingId(id);
            setShowForm(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error(err);
            alert("Impossible de charger l'événement");
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Préparer les données avec conversion des types
            const payload = {
                ...formData,
                // Convertir language_id en integer
                language_id: parseInt(formData.language_id) || 10,
                // Inclure les langues de traduction
                translation_language_ids: formData.translation_language_ids || [],
                // Convertir latitude/longitude en floats
                latitude: parseFloat(formData.latitude) || 0,
                longitude: parseFloat(formData.longitude) || 0,
                // Convertir 0/1 en booleans
                has_parking: formData.has_parking === 1,
                is_parking_free: formData.is_parking_free === 1,
                is_free: formData.is_free === 1,
                // Convertir max_seats et parking_capacity en integers si présents
                max_seats: formData.max_seats ? parseInt(formData.max_seats as string) : null,
                parking_capacity: formData.parking_capacity ? parseInt(formData.parking_capacity as string) : null,
                // Convertir les URLs vides en undefined pour éviter les erreurs de validation
                registration_link: formData.registration_link || undefined,
                youtube_live: formData.youtube_live || undefined,
                // Ajouter les nouveaux champs d'adresse
                street_number: formData.street_number || undefined,
                street_name: formData.street_name || undefined,
                postal_code: formData.postal_code || undefined,
                city: formData.city || undefined
            };

            if (isAdminMode) {
                // Mode admin: utiliser l'endpoint admin
                await api.put(`/admin/events/${editingId}`, payload);
                alert('Événement mis à jour avec succès !');
                setTimeout(() => navigate('/dashboard/admin/events'), 1500);
            } else {
                // Mode pastor: utiliser l'endpoint church
                const churchRes = await api.get('/church/my-church');
                const churchId = churchRes.data.id;

                if (!churchId) {
                    alert("Veuillez d'abord créer votre fiche église.");
                    setLoading(false);
                    return;
                }

                const pastorPayload = { ...payload, church_id: churchId };

                if (editingId) {
                    await api.put(`/church/events/${editingId}`, pastorPayload);
                    alert('Événement mis à jour avec succès !');
                } else {
                    await api.post('/church/events', pastorPayload);
                    alert('Événement créé avec succès !');
                }

                setShowForm(false);
                setEditingId(null);
                setFormData(initialFormState);
                checkChurchAndEvents();
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { errors?: Array<{ field: string; message: string }> } } };
            console.error('Erreur complète:', err);
            if (error.response?.data?.errors) {
                const errorMessages = error.response.data.errors.map((e) => `${e.field}: ${e.message}`).join('\n');
                alert(`Erreurs de validation:\n${errorMessages}`);
            } else {
                alert('Erreur lors de la création');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (eventId: number, newStatus: string) => {
        try {
            setLoading(true);
            await api.patch(`/church/events/${eventId}/status`, { status: newStatus });
            alert(`Événement ${newStatus === 'CANCELLED' ? 'annulé' : newStatus === 'PUBLISHED' ? 'publié' : 'mis à jour'} avec succès !`);
            setMenuAnchor(null);
            checkChurchAndEvents();
        } catch (err) {
            console.error('Erreur lors du changement de statut:', err);
            alert('Erreur lors du changement de statut');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Box sx={{ p: 4 }}><Typography>Chargement...</Typography></Box>;

    if (hasChurch === false) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 3, textAlign: 'center' }}>
                <Box sx={{ position: 'relative' }}>
                    <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'primary.main', filter: 'blur(60px)', opacity: 0.2, borderRadius: '50%' }}></Box>
                    <Box sx={{ position: 'relative', p: 2, bgcolor: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)', borderRadius: 4, boxShadow: 8 }}>
                        <ChurchIcon sx={{ fontSize: 96, color: 'white' }} />
                    </Box>
                </Box>
                <Box sx={{ maxWidth: 'md' }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Bienvenue !
                    </Typography>
                    <Typography color="text.secondary">
                        Pour commencer à publier des événements, vous devez d'abord créer la fiche de votre église.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => window.location.href = '/dashboard/my-church'}
                    sx={{ px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold', borderRadius: 8 }}
                >
                    Créer mon Église
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Back Button (Admin Mode Only) */}
            {isAdminMode && (
                <Button
                    variant="text"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/dashboard/admin/events')}
                    sx={{ alignSelf: 'flex-start' }}
                >
                    Retour à la liste
                </Button>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {isAdminMode ? "Modifier l'Événement" : "Mes Événements"}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                        {isAdminMode ? "Modifiez les informations de cet événement." : "Gérez votre calendrier et vos publications."}
                    </Typography>
                </Box>
                {!isAdminMode && (
                    <Button
                        variant={showForm ? "outlined" : "contained"}
                        color={showForm ? "error" : "primary"}
                        startIcon={showForm ? <CloseIcon /> : <AddIcon />}
                        onClick={() => {
                            setShowForm(!showForm);
                            if (showForm) {
                                setEditingId(null);
                                setFormData(initialFormState);
                            }
                        }}
                        disabled={!isChurchComplete}
                    >
                        {showForm ? 'Annuler' : 'Nouvel Événement'}
                    </Button>
                )}
            </Box>

            {/* Warning if church is incomplete */}
            {hasChurch && !isChurchComplete && (
                <Alert severity="warning" icon={<ChurchIcon />}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Informations de l'église incomplètes
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Pour créer des événements, vous devez compléter les informations obligatoires de votre église : nom, dénomination, adresse complète et coordonnées GPS (utilisez la recherche d'adresse dans l'onglet "Mon Église").
                    </Typography>
                    <Button
                        variant="contained"
                        color="warning"
                        startIcon={<ChurchIcon />}
                        onClick={() => window.location.href = '/dashboard/my-church'}
                    >
                        Compléter mon Église
                    </Button>
                </Alert>
            )}

            {showForm ? (
                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* FORM SIDEBAR / STEPS */}
                        <Grid size={{ xs: 0, lg: 3 }} sx={{ display: { xs: 'none', lg: 'block' } }}>
                            <Card sx={{ position: 'sticky', top: 16 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                        Étapes
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        <Button
                                            fullWidth
                                            variant={activeTab === 0 ? "contained" : "text"}
                                            startIcon={<EventIcon />}
                                            onClick={() => setActiveTab(0)}
                                            sx={{ justifyContent: 'flex-start' }}
                                        >
                                            Général
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant={activeTab === 1 ? "contained" : "text"}
                                            startIcon={<LocationOnIcon />}
                                            onClick={() => setActiveTab(1)}
                                            sx={{ justifyContent: 'flex-start' }}
                                        >
                                            Lieu
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant={activeTab === 2 ? "contained" : "text"}
                                            startIcon={<AutoAwesomeIcon />}
                                            onClick={() => setActiveTab(2)}
                                            sx={{ justifyContent: 'flex-start' }}
                                        >
                                            Options
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* FORM CONTENT */}
                        <Grid size={{ xs: 12, lg: 9 }}>
                            <Card>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                            {editingId ? "Modification" : "Création"} d'événement
                                        </Typography>
                                        {/* Mobile Tabs */}
                                        <Box sx={{ display: { xs: 'flex', lg: 'none' }, gap: 1 }}>
                                            <IconButton
                                                onClick={() => setActiveTab(0)}
                                                color={activeTab === 0 ? "primary" : "default"}
                                                sx={{ bgcolor: activeTab === 0 ? 'primary.main' : 'action.hover', color: activeTab === 0 ? 'white' : 'text.primary' }}
                                            >
                                                <EventIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => setActiveTab(1)}
                                                color={activeTab === 1 ? "primary" : "default"}
                                                sx={{ bgcolor: activeTab === 1 ? 'primary.main' : 'action.hover', color: activeTab === 1 ? 'white' : 'text.primary' }}
                                            >
                                                <LocationOnIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => setActiveTab(2)}
                                                color={activeTab === 2 ? "primary" : "default"}
                                                sx={{ bgcolor: activeTab === 2 ? 'primary.main' : 'action.hover', color: activeTab === 2 ? 'white' : 'text.primary' }}
                                            >
                                                <AutoAwesomeIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    {/* TAB: GENERAL */}
                                    {activeTab === 0 && (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <TextField
                                                        id="title"
                                                        fullWidth
                                                        required
                                                        label="Titre"
                                                        value={formData.title}
                                                        onChange={handleChange}
                                                        placeholder="Ex: Culte de Louange"
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <TextField
                                                        id="speaker_name"
                                                        fullWidth
                                                        label="Intervenant"
                                                        value={formData.speaker_name}
                                                        onChange={handleChange}
                                                        placeholder="Ex: Pasteur John Doe"
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Statut</InputLabel>
                                                        <Select
                                                            id="status"
                                                            value={formData.status}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                status: e.target.value as string
                                                            })}
                                                            label="Statut"
                                                        >
                                                            <MenuItem value="PUBLISHED">
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <PublishIcon fontSize="small" color="success" />
                                                                    Publié
                                                                </Box>
                                                            </MenuItem>
                                                            <MenuItem value="DRAFT">
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <DraftsIcon fontSize="small" color="warning" />
                                                                    Brouillon
                                                                </Box>
                                                            </MenuItem>
                                                            <MenuItem value="CANCELLED">
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <CancelIcon fontSize="small" color="error" />
                                                                    Annulé
                                                                </Box>
                                                            </MenuItem>
                                                            <MenuItem value="COMPLETED">
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <CheckCircleIcon fontSize="small" />
                                                                    Terminé
                                                                </Box>
                                                            </MenuItem>
                                                        </Select>
                                                        <FormHelperText>
                                                            Choisissez le statut de l'événement
                                                        </FormHelperText>
                                                    </FormControl>
                                                </Grid>
                                            </Grid>

                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Langue du speaker</InputLabel>
                                                        <Select
                                                            id="language_id"
                                                            value={formData.language_id}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                language_id: e.target.value as string
                                                            })}
                                                            label="Langue du speaker"
                                                        >
                                                            {languages.map(lang => (
                                                                <MenuItem key={lang.id} value={lang.id.toString()}>
                                                                    {lang.flag_emoji} {lang.name_fr}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                        <FormHelperText>
                                                            Langue dans laquelle le speaker parlera
                                                        </FormHelperText>
                                                    </FormControl>
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Langues de traduction</InputLabel>
                                                        <Select
                                                            multiple
                                                            value={formData.translation_language_ids}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                translation_language_ids: e.target.value as number[]
                                                            })}
                                                            renderValue={(selected) =>
                                                                languages
                                                                    .filter(l => selected.includes(l.id))
                                                                    .map(l => `${l.flag_emoji} ${l.name_fr}`)
                                                                    .join(', ')
                                                            }
                                                            label="Langues de traduction"
                                                        >
                                                            {languages
                                                                .filter(l => l.id.toString() !== formData.language_id)
                                                                .map(lang => (
                                                                    <MenuItem key={lang.id} value={lang.id}>
                                                                        <Checkbox checked={formData.translation_language_ids.includes(lang.id)} />
                                                                        {lang.flag_emoji} {lang.name_fr}
                                                                    </MenuItem>
                                                                ))
                                                            }
                                                        </Select>
                                                        <FormHelperText>
                                                            Langues dans lesquelles l'événement sera traduit (optionnel)
                                                        </FormHelperText>
                                                    </FormControl>
                                                </Grid>
                                            </Grid>

                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <DateTimeInput
                                                        label="Date de début"
                                                        value={formData.start_datetime}
                                                        onChange={(value) => {
                                                            setFormData(prev => ({ ...prev, start_datetime: value }));
                                                            // Validate: check if end is before new start
                                                            if (formData.end_datetime && value && new Date(value) >= new Date(formData.end_datetime)) {
                                                                setDateError('La date de fin doit être après la date de début');
                                                            } else {
                                                                setDateError('');
                                                            }
                                                        }}
                                                        required
                                                    />
                                                </Grid>

                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <DateTimeInput
                                                        label="Date de fin"
                                                        value={formData.end_datetime}
                                                        onChange={(value) => {
                                                            setFormData(prev => ({ ...prev, end_datetime: value }));
                                                            // Validate: check if end is before start
                                                            if (formData.start_datetime && value && new Date(value) <= new Date(formData.start_datetime)) {
                                                                setDateError('La date de fin doit être après la date de début');
                                                            } else {
                                                                setDateError('');
                                                            }
                                                        }}
                                                        required
                                                        minDateTime={formData.start_datetime}
                                                        error={dateError}
                                                    />
                                                </Grid>
                                            </Grid>

                                            <FormControl fullWidth>
                                                <InputLabel>Statut</InputLabel>
                                                <Select
                                                    id="status"
                                                    value={formData.status}
                                                    label="Statut"
                                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                                >
                                                    <MenuItem value="PUBLISHED">Publié</MenuItem>
                                                    <MenuItem value="DRAFT">Brouillon</MenuItem>
                                                    <MenuItem value="CANCELLED">Annulé</MenuItem>
                                                    <MenuItem value="COMPLETED">Terminé</MenuItem>
                                                </Select>
                                            </FormControl>

                                            <TextField
                                                id="description"
                                                fullWidth
                                                multiline
                                                rows={5}
                                                label="Description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder="Détails de l'événement..."
                                            />

                                            <TextField
                                                id="image_url"
                                                fullWidth
                                                label="Image (URL)"
                                                value={formData.image_url}
                                                onChange={handleChange}
                                                placeholder="https://..."
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            {formData.image_url ? (
                                                                <Box
                                                                    component="img"
                                                                    src={formData.image_url}
                                                                    alt="Preview"
                                                                    sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }}
                                                                />
                                                            ) : (
                                                                <ImageIcon sx={{ color: 'text.secondary' }} />
                                                            )}
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Box>
                                    )}

                                    {/* TAB: LOCATION */}
                                    {activeTab === 1 && (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                            {/* AddressAutocomplete */}
                                            <AddressAutocomplete
                                                defaultValue={formData.address || ''}
                                                onAddressSelect={(addressData) => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        address: addressData.full_address,
                                                        street_number: addressData.street_number,
                                                        street_name: addressData.street_name,
                                                        postal_code: addressData.postal_code,
                                                        city: addressData.city,
                                                        latitude: addressData.latitude.toString(),
                                                        longitude: addressData.longitude.toString()
                                                    }));
                                                }}
                                            />

                                            {/* Champs d'adresse détaillés (lecture seule, auto-remplis) */}
                                            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                                                <Grid container spacing={2}>
                                                    <Grid size={{ xs: 12, md: 3 }}>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            label="N°"
                                                            value={formData.street_number}
                                                            InputProps={{ readOnly: true }}
                                                            placeholder="Auto"
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 9 }}>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            label="Rue"
                                                            value={formData.street_name}
                                                            InputProps={{ readOnly: true }}
                                                            placeholder="Auto-rempli"
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 3 }}>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            label="Code Postal"
                                                            value={formData.postal_code}
                                                            InputProps={{ readOnly: true }}
                                                            placeholder="Auto"
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 9 }}>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            label="Ville"
                                                            value={formData.city}
                                                            InputProps={{ readOnly: true }}
                                                            placeholder="Auto-remplie"
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Box>

                                            {/* Coordonnées GPS (lecture seule, auto-remplies) */}
                                            <Box sx={{ p: 2, bgcolor: 'rgba(33, 150, 243, 0.1)', borderRadius: 1, border: 1, borderColor: 'info.light' }}>
                                                <Grid container spacing={2}>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            label="Latitude"
                                                            value={formData.latitude}
                                                            InputProps={{
                                                                readOnly: true,
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <LocationOnIcon fontSize="small" />
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                            placeholder="Auto-calculé"
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            label="Longitude"
                                                            value={formData.longitude}
                                                            InputProps={{
                                                                readOnly: true,
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <LocationOnIcon fontSize="small" />
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                            placeholder="Auto-calculé"
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Box>

                                            <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'action.hover' }}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={formData.has_parking === 1}
                                                            onChange={(e) => handleCheckboxChange('has_parking', e.target.checked)}
                                                        />
                                                    }
                                                    label="Ce lieu dispose d'un parking"
                                                />

                                                {formData.has_parking === 1 && (
                                                    <Box sx={{ pl: 4, pt: 2 }}>
                                                        <Grid container spacing={2}>
                                                            <Grid size={{ xs: 12, md: 6 }}>
                                                                <TextField
                                                                    id="parking_capacity"
                                                                    fullWidth
                                                                    type="number"
                                                                    label="Capacité"
                                                                    value={formData.parking_capacity}
                                                                    onChange={handleChange}
                                                                />
                                                            </Grid>
                                                            <Grid size={{ xs: 12, md: 6 }}>
                                                                <TextField
                                                                    id="parking_details"
                                                                    fullWidth
                                                                    label="Info Accès"
                                                                    value={formData.parking_details}
                                                                    onChange={handleChange}
                                                                    placeholder="Code, entrée..."
                                                                />
                                                            </Grid>
                                                            <Grid size={{ xs: 12 }}>
                                                                <FormControlLabel
                                                                    control={
                                                                        <Checkbox
                                                                            checked={formData.is_parking_free === 1}
                                                                            onChange={(e) => handleCheckboxChange('is_parking_free', e.target.checked)}
                                                                        />
                                                                    }
                                                                    label="Parking Gratuit"
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* TAB: OPTIONS */}
                                    {activeTab === 2 && (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <TextField
                                                        id="max_seats"
                                                        fullWidth
                                                        type="number"
                                                        label="Places Max"
                                                        value={formData.max_seats}
                                                        onChange={handleChange}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <TextField
                                                        id="youtube_live"
                                                        fullWidth
                                                        label="YouTube Live"
                                                        value={formData.youtube_live}
                                                        onChange={handleChange}
                                                        placeholder="URL du live..."
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <YouTubeIcon sx={{ color: 'error.main' }} />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                </Grid>
                                            </Grid>

                                            <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'action.hover' }}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={formData.is_free === 1}
                                                            onChange={(e) => handleCheckboxChange('is_free', e.target.checked)}
                                                        />
                                                    }
                                                    label="Entrée Gratuite"
                                                />
                                                {formData.is_free === 0 && (
                                                    <Box sx={{ pl: 4, pt: 2 }}>
                                                        <TextField
                                                            id="registration_link"
                                                            fullWidth
                                                            label="Lien Billetterie"
                                                            value={formData.registration_link}
                                                            onChange={handleChange}
                                                            placeholder="https://..."
                                                        />
                                                    </Box>
                                                )}
                                            </Box>

                                            <Box sx={{ pt: 3, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    color="success"
                                                    size="large"
                                                    startIcon={<SaveIcon />}
                                                    disabled={loading}
                                                    sx={{ px: 4 }}
                                                >
                                                    {loading ? 'Enregistrement...' : "Publier l'événement"}
                                                </Button>
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Navigation Buttons for Form */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 3, borderTop: 1, borderColor: 'divider' }}>
                                        {activeTab !== 0 && (
                                            <Button variant="outlined" onClick={() => setActiveTab(activeTab === 2 ? 1 : 0)}>
                                                Précédent
                                            </Button>
                                        )}
                                        {activeTab !== 2 && (
                                            <Button variant="outlined" onClick={() => setActiveTab(activeTab === 0 ? 1 : 2)} sx={{ ml: 'auto' }}>
                                                Suivant
                                            </Button>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            ) : (
                /* EVENT LIST GRID */
                <Grid container spacing={3}>
                    {events.map((event) => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={event.id}>
                            <Card sx={{
                                overflow: 'hidden',
                                transition: 'all 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 6,
                                    borderColor: 'primary.main'
                                }
                            }}>
                                {/* Image Placeholder or Actual Image */}
                                <Box sx={{ height: 192, width: '100%', bgcolor: 'grey.900', position: 'relative' }}>
                                    {event.image_url ? (
                                        <Box
                                            component="img"
                                            src={event.image_url}
                                            alt={event.title}
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                transition: 'transform 0.5s',
                                                '&:hover': {
                                                    transform: 'scale(1.05)'
                                                }
                                            }}
                                        />
                                    ) : (
                                        <Box sx={{
                                            width: '100%',
                                            height: '100%',
                                            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.5) 0%, rgba(156, 39, 176, 0.5) 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <EventIcon sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.2)' }} />
                                        </Box>
                                    )}
                                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMenuAnchor({ element: e.currentTarget, eventId: event.id });
                                            }}
                                            sx={{
                                                bgcolor: 'rgba(255, 255, 255, 0.95)',
                                                backdropFilter: 'blur(12px)',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    bgcolor: 'primary.main',
                                                    color: 'white',
                                                    transform: 'scale(1.1)',
                                                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)'
                                                }
                                            }}
                                        >
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                        {event.status === 'PUBLISHED' && (
                                            <Box sx={{ px: 1, py: 0.5, borderRadius: 8, fontSize: '0.75rem', fontWeight: 'bold', bgcolor: 'rgba(76, 175, 80, 0.8)', color: 'white', backdropFilter: 'blur(8px)' }}>
                                                Publié
                                            </Box>
                                        )}
                                        {event.status === 'DRAFT' && (
                                            <Box sx={{ px: 1, py: 0.5, borderRadius: 8, fontSize: '0.75rem', fontWeight: 'bold', bgcolor: 'rgba(255, 193, 7, 0.8)', color: 'white', backdropFilter: 'blur(8px)' }}>
                                                Brouillon
                                            </Box>
                                        )}
                                        {event.status === 'COMPLETED' && (
                                            <Box sx={{ px: 1, py: 0.5, borderRadius: 8, fontSize: '0.75rem', fontWeight: 'bold', bgcolor: 'rgba(158, 158, 158, 0.8)', color: 'white', backdropFilter: 'blur(8px)' }}>
                                                Terminé
                                            </Box>
                                        )}
                                        {event.status === 'CANCELLED' && (
                                            <Box sx={{ px: 1, py: 0.5, borderRadius: 8, fontSize: '0.75rem', fontWeight: 'bold', bgcolor: 'rgba(244, 67, 54, 0.8)', color: 'white', backdropFilter: 'blur(8px)' }}>
                                                Annulé
                                            </Box>
                                        )}
                                    </Box>
                                </Box>

                                <CardContent sx={{ p: 2.5 }}>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 'bold',
                                        mb: 1,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        '&:hover': { color: 'primary.main' },
                                        transition: 'color 0.3s'
                                    }}>
                                        {event.title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EventIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(event.start_datetime).toLocaleDateString()} à {new Date(event.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LocationOnIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {event.city ?
                                                    `${event.street_number || ''} ${event.street_name || ''}, ${event.city}`.trim().replace(/^,\s*/, '')
                                                    : event.address || "Lieu non précisé"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => handleEdit(event.id)}
                                    >
                                        Modifier
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}

                    {/* Add New Card (Empty State) */}
                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                        <Box
                            onClick={() => { setShowForm(true); setEditingId(null); setFormData(initialFormState); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            sx={{
                                height: '100%',
                                minHeight: 300,
                                border: 2,
                                borderStyle: 'dashed',
                                borderColor: 'divider',
                                borderRadius: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: 3,
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    bgcolor: 'action.hover',
                                    color: 'primary.main'
                                }
                            }}
                        >
                            <Box sx={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                bgcolor: 'action.hover',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2
                            }}>
                                <AddIcon sx={{ fontSize: 32 }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Créer un nouvel événement
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, opacity: 0.6 }}>
                                Planifiez votre prochain culte
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            )}

            {/* Menu d'actions rapides */}
            <Menu
                anchorEl={menuAnchor?.element}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        minWidth: 200
                    }
                }}
            >
                <MenuItem
                    onClick={() => handleStatusChange(menuAnchor?.eventId || 0, 'DRAFT')}
                    sx={{ py: 1.5, gap: 1.5 }}
                >
                    <ListItemIcon>
                        <DraftsIcon fontSize="small" sx={{ color: '#ff9800' }} />
                    </ListItemIcon>
                    <ListItemText>Passer en brouillon</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => handleStatusChange(menuAnchor?.eventId || 0, 'CANCELLED')}
                    sx={{ py: 1.5, gap: 1.5 }}
                >
                    <ListItemIcon>
                        <CancelIcon fontSize="small" sx={{ color: '#f44336' }} />
                    </ListItemIcon>
                    <ListItemText>Annuler l'événement</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => handleStatusChange(menuAnchor?.eventId || 0, 'COMPLETED')}
                    sx={{ py: 1.5, gap: 1.5 }}
                >
                    <ListItemIcon>
                        <CheckCircleIcon fontSize="small" sx={{ color: '#9e9e9e' }} />
                    </ListItemIcon>
                    <ListItemText>Marquer comme terminé</ListItemText>
                </MenuItem>
            </Menu>
        </Box>
    );
}
