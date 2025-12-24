import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
    Tabs,
    Tab,
    IconButton,
    Alert,
    Grid
} from '@mui/material';
import {
    Save as SaveIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    LocationOn as LocationOnIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { ImageUpload } from '../components/ImageUpload';
import { churchSchema, type ChurchFormData } from '../lib/validationSchemas';
import FormError, { BackendErrors } from '../components/FormError';
import AddressAutocomplete from '../components/AddressAutocomplete';

// Types for reference data
interface Denomination { id: number; name: string; }
interface ActivityType { id: number; label_fr: string; }

export default function MyChurch() {
    const { churchId } = useParams<{ churchId: string }>();
    const navigate = useNavigate();
    const isAdminMode = !!churchId; // Mode admin si churchId existe
    const [activeTab, setActiveTab] = useState(0);
    const [success, setSuccess] = useState('');
    const [backendErrors, setBackendErrors] = useState<Array<{ field: string; message: string }>>([]);

    // Reference Data
    const [denominations, setDenominations] = useState<Denomination[]>([]);
    const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);

    // React Hook Form with Zod validation
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ChurchFormData>({
        resolver: zodResolver(churchSchema),
        mode: 'onChange', // Real-time validation
        defaultValues: {
            socials: [],
            schedules: [],
        }
    });

    // useFieldArray for dynamic arrays
    const { fields: socialFields, append: appendSocial, remove: removeSocial } = useFieldArray({
        control,
        name: 'socials',
    });

    const { fields: scheduleFields, append: appendSchedule, remove: removeSchedule } = useFieldArray({
        control,
        name: 'schedules',
    });

    const has_parking = watch('has_parking');

    useEffect(() => {
        fetchReferences();
        fetchChurchData();
    }, []);

    const fetchReferences = async () => {
        try {
            const [denoms, types] = await Promise.all([
                api.get('/settings/denominations'),
                api.get('/settings/activity_types')
            ]);
            setDenominations(denoms.data);
            setActivityTypes(types.data);
        } catch (err) {
            console.error('Error fetching refs', err);
        }
    };

    const fetchChurchData = async () => {
        try {
            // Mode admin: charger une église spécifique par ID
            // Mode pastor: charger l'église du pasteur connecté
            const endpoint = isAdminMode
                ? `/admin/churches/${churchId}`
                : '/church/my-church';

            const { data } = await api.get(endpoint);
            if (data && data.id) {
                // Reset form with fetched data
                reset({
                    church_name: data.church_name,
                    description: data.details.description || '',
                    denomination_id: data.denomination_id,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    address: data.details.address || '',
                    street_number: data.details.street_number || '',
                    street_name: data.details.street_name || '',
                    postal_code: data.details.postal_code || '',
                    city: data.details.city || '',
                    phone: data.details.phone || '',
                    website: data.details.website || '',
                    pastor_name: data.details.pastor_name || '',
                    has_parking: !!data.details.has_parking,
                    parking_capacity: data.details.parking_capacity || null,
                    is_parking_free: !!data.details.is_parking_free,
                    logo_url: data.details.logo_url || '',
                    socials: data.socials || [],
                    schedules: data.schedules || [],
                });
            }
        } catch (err) {
            console.error('Error fetching church:', err);
        }
    };

    const onSubmit = async (formData: ChurchFormData) => {
        setBackendErrors([]);
        setSuccess('');

        try {
            // Mode admin: modifier une église spécifique
            // Mode pastor: modifier son église
            if (isAdminMode) {
                await api.put(`/admin/churches/${churchId}`, formData);
            } else {
                await api.post('/church/my-church', formData);
            }
            setSuccess('Sauvegardé avec succès !');

            // En mode admin, retourner à la liste après sauvegarde
            if (isAdminMode) {
                setTimeout(() => navigate('/dashboard/admin/churches'), 1500);
            }
        } catch (err: unknown) {
            // Handle structured backend errors
            const error = err as { response?: { data?: { errors?: Array<{ field: string; message: string }>; message?: string } } };
            if (error.response?.data?.errors) {
                setBackendErrors(error.response.data.errors);
            } else {
                setBackendErrors([{ field: 'général', message: error.response?.data?.message || 'Une erreur est survenue' }]);
            }
        }
    };

    const platforms = ['FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'WHATSAPP', 'LINKEDIN'];
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    // Traduction des jours en français
    const daysTranslation: Record<string, string> = {
        MONDAY: 'Lundi',
        TUESDAY: 'Mardi',
        WEDNESDAY: 'Mercredi',
        THURSDAY: 'Jeudi',
        FRIDAY: 'Vendredi',
        SATURDAY: 'Samedi',
        SUNDAY: 'Dimanche'
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '1200px', mx: 'auto', pb: 4 }}>
            {/* Bouton Retour en mode admin */}
            {isAdminMode && (
                <Button
                    variant="text"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/dashboard/admin/churches')}
                    sx={{ alignSelf: 'flex-start' }}
                >
                    Retour à la liste
                </Button>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {isAdminMode ? "Modifier l'Église" : "Mon Église"}
                </Typography>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={<SaveIcon />}
                    sx={{ px: 4 }}
                >
                    {isSubmitting ? 'Sauvegarde...' : 'Tout Sauvegarder'}
                </Button>
            </Box>

            {/* Backend Errors */}
            <BackendErrors errors={backendErrors} />

            {/* Success Message */}
            {success && (
                <Alert severity="success">{success}</Alert>
            )}

            {/* Tabs Header */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                    <Tab label="Général" />
                    <Tab label="Détails & Infos" />
                    <Tab label="Réseaux Sociaux" />
                    <Tab label="Horaires" />
                </Tabs>
            </Box>

            <Box sx={{ mt: 2 }}>
                {/* GENERAL TAB */}
                {activeTab === 0 && (
                    <Card>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {/* SECTION 1: ADRESSE (PRIORITAIRE) */}
                                <Box sx={{ pb: 4, borderBottom: 1, borderColor: 'divider' }}>
                                    <Typography variant="h5" sx={{ mb: 3, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LocationOnIcon /> Localisation de l'Église
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        {/* Autocomplete d'adresse */}
                                        <AddressAutocomplete
                                            defaultValue={watch('address') || ''}
                                            onAddressSelect={(addressData) => {
                                                setValue('address', addressData.full_address);
                                                setValue('street_number', addressData.street_number);
                                                setValue('street_name', addressData.street_name);
                                                setValue('postal_code', addressData.postal_code);
                                                setValue('city', addressData.city);
                                                setValue('latitude', addressData.latitude);
                                                setValue('longitude', addressData.longitude);
                                            }}
                                            error={errors.address?.message}
                                        />

                                        {/* Champs d'adresse détaillés (lecture seule, auto-remplis) */}
                                        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, md: 3 }}>
                                                    <TextField
                                                        {...register('street_number')}
                                                        fullWidth
                                                        size="small"
                                                        label="N°"
                                                        InputProps={{ readOnly: true }}
                                                        placeholder="Auto"
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 9 }}>
                                                    <TextField
                                                        {...register('street_name')}
                                                        fullWidth
                                                        size="small"
                                                        label="Rue"
                                                        InputProps={{ readOnly: true }}
                                                        placeholder="Auto-rempli"
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 3 }}>
                                                    <TextField
                                                        {...register('postal_code')}
                                                        fullWidth
                                                        size="small"
                                                        label="Code Postal"
                                                        InputProps={{ readOnly: true }}
                                                        placeholder="Auto"
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 9 }}>
                                                    <TextField
                                                        {...register('city')}
                                                        fullWidth
                                                        size="small"
                                                        label="Ville"
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
                                                        {...register('latitude', { valueAsNumber: true })}
                                                        fullWidth
                                                        size="small"
                                                        label="Latitude"
                                                        InputProps={{ readOnly: true }}
                                                        placeholder="Auto-calculé"
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <TextField
                                                        {...register('longitude', { valueAsNumber: true })}
                                                        fullWidth
                                                        size="small"
                                                        label="Longitude"
                                                        InputProps={{ readOnly: true }}
                                                        placeholder="Auto-calculé"
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* SECTION 2: INFORMATIONS DE BASE */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <Typography variant="h5" sx={{ color: 'text.primary' }}>
                                        Informations Générales
                                    </Typography>

                                    <TextField
                                        {...register('church_name')}
                                        fullWidth
                                        label="Nom de l'église *"
                                        error={!!errors.church_name}
                                        helperText={errors.church_name?.message}
                                    />
                                    <FormError error={errors.church_name} />

                                    <FormControl fullWidth error={!!errors.denomination_id}>
                                        <InputLabel>Dénomination *</InputLabel>
                                        <Select
                                            {...register('denomination_id', { valueAsNumber: true })}
                                            label="Dénomination *"
                                            defaultValue=""
                                        >
                                            <MenuItem value="">Choisir...</MenuItem>
                                            {denominations.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                                        </Select>
                                        <FormError error={errors.denomination_id} />
                                    </FormControl>

                                    <TextField
                                        {...register('description')}
                                        fullWidth
                                        label="Description Courte"
                                        placeholder="Présentez votre église en quelques mots..."
                                        error={!!errors.description}
                                        helperText={errors.description?.message}
                                    />
                                    <FormError error={errors.description} />

                                    <Box>
                                        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                                            Logo de l'Église
                                        </Typography>
                                        <ImageUpload
                                            value={watch('logo_url') || ''}
                                            onChange={(url) => setValue('logo_url', url)}
                                        />
                                        <FormError error={errors.logo_url} />
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* DETAILS TAB */}
                {activeTab === 1 && (
                    <Card>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    {...register('pastor_name')}
                                    fullWidth
                                    label="Nom du Pasteur Principal"
                                    error={!!errors.pastor_name}
                                    helperText={errors.pastor_name?.message}
                                />

                                <TextField
                                    {...register('address')}
                                    fullWidth
                                    label="Adresse Complète"
                                    error={!!errors.address}
                                    helperText={errors.address?.message}
                                />

                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            {...register('phone')}
                                            fullWidth
                                            label="Téléphone"
                                            placeholder="+33 1 23 45 67 89"
                                            error={!!errors.phone}
                                            helperText={errors.phone?.message}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            {...register('website')}
                                            fullWidth
                                            label="Site Web"
                                            placeholder="https://..."
                                            error={!!errors.website}
                                            helperText={errors.website?.message}
                                        />
                                    </Grid>
                                </Grid>

                                <Box sx={{ pt: 3, borderTop: 1, borderColor: 'divider' }}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>
                                        Parking
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <input
                                                type="checkbox"
                                                {...register('has_parking')}
                                                style={{ width: 20, height: 20, marginRight: 8 }}
                                            />
                                            <Typography>Dispose d'un parking ?</Typography>
                                        </Box>
                                        {has_parking && (
                                            <Box sx={{ pl: 4 }}>
                                                <Grid container spacing={2}>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <TextField
                                                            {...register('parking_capacity', { valueAsNumber: true })}
                                                            fullWidth
                                                            type="number"
                                                            label="Capacité (places)"
                                                            error={!!errors.parking_capacity}
                                                            helperText={errors.parking_capacity?.message}
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <input
                                                                type="checkbox"
                                                                {...register('is_parking_free')}
                                                                style={{ width: 20, height: 20, marginRight: 8 }}
                                                            />
                                                            <Typography>Gratuit ?</Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* SOCIALS TAB */}
                {activeTab === 2 && (
                    <Card>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {socialFields.map((field, idx) => (
                                    <Box key={field.id} sx={{ display: 'flex', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                                        <FormControl sx={{ minWidth: 200 }}>
                                            <InputLabel>Plateforme</InputLabel>
                                            <Select
                                                {...register(`socials.${idx}.platform` as const)}
                                                label="Plateforme"
                                                defaultValue="FACEBOOK"
                                            >
                                                {platforms.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            {...register(`socials.${idx}.url` as const)}
                                            fullWidth
                                            label="URL"
                                            placeholder="https://..."
                                            error={!!errors.socials?.[idx]?.url}
                                            helperText={errors.socials?.[idx]?.url?.message}
                                        />
                                        <IconButton
                                            color="error"
                                            onClick={() => removeSocial(idx)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                            <Button
                                variant="outlined"
                                fullWidth
                                startIcon={<AddIcon />}
                                onClick={() => appendSocial({ platform: 'FACEBOOK', url: '' })}
                                sx={{ mt: 3, borderStyle: 'dashed' }}
                            >
                                Ajouter un réseau
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* SCHEDULES TAB */}
                {activeTab === 3 && (
                    <Card>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {scheduleFields.map((field, idx) => (
                                    <Box key={field.id} sx={{ display: 'flex', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1, flexWrap: 'wrap' }}>
                                        <FormControl sx={{ minWidth: 150 }}>
                                            <InputLabel>Jour *</InputLabel>
                                            <Select
                                                {...register(`schedules.${idx}.day_of_week` as const)}
                                                label="Jour *"
                                                defaultValue="SUNDAY"
                                            >
                                                {days.map(d => <MenuItem key={d} value={d}>{daysTranslation[d]}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            {...register(`schedules.${idx}.start_time` as const)}
                                            type="time"
                                            label="Heure *"
                                            sx={{ width: 150 }}
                                            error={!!errors.schedules?.[idx]?.start_time}
                                            helperText={errors.schedules?.[idx]?.start_time?.message}
                                        />
                                        <FormControl sx={{ minWidth: 200, flex: 1 }}>
                                            <InputLabel>Type d'activité *</InputLabel>
                                            <Select
                                                {...register(`schedules.${idx}.activity_type_id` as const, { valueAsNumber: true })}
                                                label="Type d'activité *"
                                                defaultValue={activityTypes[0]?.id || 1}
                                            >
                                                {activityTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.label_fr}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                        <IconButton
                                            color="error"
                                            onClick={() => removeSchedule(idx)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                            <Button
                                variant="outlined"
                                fullWidth
                                startIcon={<AddIcon />}
                                onClick={() => appendSchedule({ day_of_week: 'SUNDAY', start_time: '10:00', activity_type_id: activityTypes[0]?.id || 1 })}
                                sx={{ mt: 3, borderStyle: 'dashed' }}
                            >
                                Ajouter un horaire
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </Box>
        </Box>
    );
}
