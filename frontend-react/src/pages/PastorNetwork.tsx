import { useState, useEffect } from 'react';
import api from '../lib/axios';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Pagination,
    IconButton,
    Chip,
    Stack,
    Card,
    CardContent,
    Skeleton,
    Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    Info as InfoIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Church as ChurchIcon,
    LocationOn as LocationOnIcon
} from '@mui/icons-material';
import ChurchDetailsDrawer from '../components/ChurchDetailsDrawer';

interface Pastor {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    church_id: number;
    church_name: string;
    phone_number?: string;
    city?: string;
    postal_code?: string;
    denomination_name?: string;
}

interface PaginationData {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const PastorNetwork = () => {
    const [pastors, setPastors] = useState<Pastor[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationData>({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });
    const [search, setSearch] = useState('');
    const [city, setCity] = useState('');
    const [denominationId, setDenominationId] = useState('');
    const [denominations, setDenominations] = useState<any[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedChurchData, setSelectedChurchData] = useState<any>(null);
    const [error, setError] = useState('');

    // Charger les dénominations
    useEffect(() => {
        const fetchDenominations = async () => {
            try {
                const { data } = await api.get('/settings/denominations');
                setDenominations(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error loading denominations:', err);
                setDenominations([]);
            }
        };
        fetchDenominations();
    }, []);

    // Charger les pasteurs
    useEffect(() => {
        fetchPastors();
    }, [pagination.page, search, city, denominationId]);

    const fetchPastors = async () => {
        try {
            setLoading(true);
            setError('');
            
            const params: any = {
                page: pagination.page,
                limit: pagination.limit
            };

            if (search) params.search = search;
            if (city) params.city = city;
            if (denominationId) params.denomination_id = denominationId;

            const { data } = await api.get('/pastor/network', { params });

            setPastors(data.pastors || []);
            setPagination(data.pagination || {
                page: 1,
                limit: 20,
                total: 0,
                totalPages: 0
            });
        } catch (err: any) {
            console.error('Error loading pastors:', err);
            setError(err.response?.data?.message || 'Erreur lors du chargement du réseau pastoral');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPagination({ ...pagination, page: value });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleViewDetails = async (pastorId: number) => {
        try {
            const { data } = await api.get(`/pastor/network/${pastorId}`);

            // Ensure schedules and socials are always arrays
            if (data && data.church) {
                data.church.schedules = Array.isArray(data.church.schedules) ? data.church.schedules : [];
                data.church.socials = Array.isArray(data.church.socials) ? data.church.socials : [];

                setSelectedChurchData(data.church);
                setDrawerOpen(true);
            }
        } catch (err: any) {
            console.error('Error loading pastor details:', err);
            setError(err.response?.data?.message || 'Erreur lors du chargement des détails');
        }
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
        setSelectedChurchData(null);
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
                Réseau Pastoral
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Découvrez les pasteurs et églises membres du réseau
            </Typography>

            {/* Filtres */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <TextField
                            placeholder="Rechercher par nom, prénom, église..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPagination({ ...pagination, page: 1 });
                            }}
                            size="small"
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                )
                            }}
                        />

                        <TextField
                            placeholder="Ville"
                            value={city}
                            onChange={(e) => {
                                setCity(e.target.value);
                                setPagination({ ...pagination, page: 1 });
                            }}
                            size="small"
                            sx={{ minWidth: 200 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LocationOnIcon fontSize="small" />
                                    </InputAdornment>
                                )
                            }}
                        />

                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Dénomination</InputLabel>
                            <Select
                                value={denominationId}
                                label="Dénomination"
                                onChange={(e) => {
                                    setDenominationId(e.target.value);
                                    setPagination({ ...pagination, page: 1 });
                                }}
                            >
                                <MenuItem value="">Toutes</MenuItem>
                                {denominations.map((d) => (
                                    <MenuItem key={d.id} value={d.id}>
                                        {d.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </CardContent>
            </Card>

            {/* Affichage des erreurs */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Statistiques */}
            {!loading && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {pagination.total} pasteur{pagination.total > 1 ? 's' : ''} trouvé{pagination.total > 1 ? 's' : ''}
                </Typography>
            )}

            {/* Table des pasteurs */}
            <TableContainer component={Paper} elevation={1}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nom</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Prénom</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Église</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Ville</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Dénomination</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Contact</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton /></TableCell>
                                    <TableCell><Skeleton /></TableCell>
                                    <TableCell><Skeleton /></TableCell>
                                    <TableCell><Skeleton /></TableCell>
                                    <TableCell><Skeleton /></TableCell>
                                    <TableCell><Skeleton /></TableCell>
                                    <TableCell><Skeleton /></TableCell>
                                </TableRow>
                            ))
                        ) : pastors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        Aucun pasteur trouvé avec ces critères
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            pastors.map((pastor) => (
                                <TableRow
                                    key={pastor.id}
                                    hover
                                    sx={{ '&:hover': { backgroundColor: 'action.hover', cursor: 'pointer' } }}
                                >
                                    <TableCell>{pastor.last_name}</TableCell>
                                    <TableCell>{pastor.first_name}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <ChurchIcon fontSize="small" color="action" />
                                            <Typography variant="body2">{pastor.church_name}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        {pastor.city && (
                                            <Chip
                                                label={`${pastor.city} (${pastor.postal_code})`}
                                                size="small"
                                                variant="outlined"
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {pastor.denomination_name && (
                                            <Chip label={pastor.denomination_name} size="small" color="primary" variant="outlined" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            {pastor.email && (
                                                <IconButton
                                                    size="small"
                                                    href={`mailto:${pastor.email}`}
                                                    title={pastor.email}
                                                >
                                                    <EmailIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                            {pastor.phone_number && (
                                                <IconButton
                                                    size="small"
                                                    href={`tel:${pastor.phone_number}`}
                                                    title={pastor.phone_number}
                                                >
                                                    <PhoneIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleViewDetails(pastor.id)}
                                            title="Voir les détails"
                                        >
                                            <InfoIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={pagination.totalPages}
                        page={pagination.page}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                    />
                </Box>
            )}

            {/* Drawer de détails de l'église */}
            {selectedChurchData && (
                <ChurchDetailsDrawer
                    open={drawerOpen}
                    onClose={handleDrawerClose}
                    churchData={selectedChurchData}
                />
            )}
        </Box>
    );
};

export default PastorNetwork;
