import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    Box,
    Fab,
    Alert,
    CircularProgress,
    useMediaQuery,
    useTheme,
    Snackbar,
    Paper,
    Typography,
    IconButton
} from '@mui/material';
import {
    MyLocation as MyLocationIcon,
    List as ListIcon,
    Close as CloseIcon,
    TouchApp as TouchAppIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/leaflet.css';
import type { Church, Event, UserLocation } from '../../types/publicMap';
import {
    fetchChurchesAndEvents,
    getUserLocation,
    formatDistance
} from '../../services/publicMapService';
import SearchBar from '../../components/Map/SearchBar';
import ResultsPanel from '../../components/Map/ResultsPanel';
import ChurchDetailsModal from '../../components/Map/ChurchDetailsModal';
import EventDetailsModal from '../../components/Map/EventDetailsModal';

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * Composant pour recentrer la carte (optimisé avec React.memo)
 */
interface MapCenterProps {
    center: [number, number];
    zoom?: number;
}

const MapCenter: React.FC<MapCenterProps> = React.memo(({ center, zoom = 2 }) => {
    const map = useMap();

    useEffect(() => {
        map.flyTo(center, zoom, {
            duration: 1.5
        });
    }, [center, zoom, map]);

    return null;
});

MapCenter.displayName = 'MapCenter';

/**
 * Composant pour gérer les événements de la carte (déplacement, zoom)
 * Recharge automatiquement les données quand la carte bouge
 */
interface MapEventsHandlerProps {
    onBoundsChange: (bounds: L.LatLngBounds) => void;
}

const MapEventsHandler: React.FC<MapEventsHandlerProps> = React.memo(({ onBoundsChange }) => {
    const map = useMapEvents({
        moveend: () => {
            onBoundsChange(map.getBounds());
        },
        zoomend: () => {
            onBoundsChange(map.getBounds());
        }
    });

    return null;
});

MapEventsHandler.displayName = 'MapEventsHandler';

/**
 * Icônes personnalisées pour les marqueurs
 */
const createChurchIcon = () => L.divIcon({
    className: 'custom-marker-church',
    html: '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18 15l-3-3V9c0-1.1-.9-2-2-2h-2V5h2V3H11v2h2v2H11c-1.1 0-2 .9-2 2v3l-3 3v2h12v-2zM11 20H9v2h6v-2h-2v-2h-2v2z"/></svg>',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});

const createEventIcon = () => L.divIcon({
    className: 'custom-marker-event',
    html: '<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zM5 7V5h14v2H5zm7 5h5v5h-5z"/></svg>',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});

const createUserIcon = () => L.divIcon({
    className: 'custom-marker-user',
    html: '<div></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

/**
 * HomePage - Page principale avec carte interactive Google Maps style
 * Optimisée avec useMemo, useCallback et React.memo
 */
const HomePage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // États
    const [churches, setChurches] = useState<Church[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]); // Vue monde par défaut
    const [mapZoom, setMapZoom] = useState<number>(2); // Zoom monde
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI States
    const [resultsPanelOpen, setResultsPanelOpen] = useState(!isMobile); // Fermé par défaut sur mobile
    const [selectedChurchId, setSelectedChurchId] = useState<number | null>(null);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [churchModalOpen, setChurchModalOpen] = useState(false);
    const [eventModalOpen, setEventModalOpen] = useState(false);
    const [showHelpMessage, setShowHelpMessage] = useState(true);

    // Filtres simples
    const [showChurches, setShowChurches] = useState(true);
    const [showEvents, setShowEvents] = useState(true);
    const [search, setSearch] = useState('');

    // Ref pour debounce et first load
    const boundsChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isFirstLoadRef = useRef(true);

    /**
     * Chargement initial : géolocalisation
     */
    useEffect(() => {
        const initializeMap = async () => {
            setLoading(true);
            setError(null);

            try {
                // Obtenir la géolocalisation
                const position = await getUserLocation();

                let lat = 48.8566;
                let lng = 2.3522;
                let zoom = 13;

                if (position) {
                    lat = position.coords.latitude;
                    lng = position.coords.longitude;
                    setUserLocation({ latitude: lat, longitude: lng });
                    setMapCenter([lat, lng]);
                    setMapZoom(zoom);
                } else {
                    // Vue mondiale par défaut
                    setMapCenter([20, 0]);
                    setMapZoom(2);
                }

                // Les données seront chargées par le MapEventsHandler
                // après le premier rendu de la carte
            } catch (err: any) {
                console.error('Error initializing map:', err);
                setError(err.message || 'Erreur lors du chargement de la carte');
            } finally {
                setLoading(false);
            }
        };

        initializeMap();
    }, []);

    /**
     * Handler: Charger les données selon les bounds de la carte
     */
    const loadDataForBounds = useCallback(async (bounds: L.LatLngBounds) => {
        try {
            setLoading(true);
            setError(null);

            // Utiliser le centre de la carte pour calculer les distances v2
            const center = bounds.getCenter();

            const data = await fetchChurchesAndEvents({
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest(),
                userLat: center.lat,
                userLng: center.lng,
                search: search || undefined,
                limit: 100  // Optimisé pour 3000 églises
            });

            setChurches(data.churches);
            setEvents(data.events);
        } catch (err: any) {
            console.error('Error loading data:', err);
            setError(err.message || 'Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    }, [search]);

    /**
     * Handler: Changement de bounds de la carte (debounced, sauf premier chargement)
     */
    const handleBoundsChange = useCallback((bounds: L.LatLngBounds) => {
        // Premier chargement: immédiat sans debounce
        if (isFirstLoadRef.current) {
            isFirstLoadRef.current = false;
            loadDataForBounds(bounds);
            return;
        }

        // Debounce pour éviter trop de requêtes pendant le déplacement
        if (boundsChangeTimeoutRef.current) {
            clearTimeout(boundsChangeTimeoutRef.current);
        }

        boundsChangeTimeoutRef.current = setTimeout(() => {
            loadDataForBounds(bounds);
        }, 500); // 500ms de délai
    }, [loadDataForBounds]);

    /**
     * Handler: Recentrer sur la position utilisateur
     */
    const handleRecenterMap = useCallback(async () => {
        if (userLocation) {
            setMapCenter([userLocation.latitude, userLocation.longitude]);
            setMapZoom(13);
            return;
        }

        setLoading(true);
        try {
            const position = await getUserLocation();
            if (position) {
                const newLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                setUserLocation(newLocation);
                setMapCenter([newLocation.latitude, newLocation.longitude]);
                setMapZoom(13);
            } else {
                setError('Géolocalisation non disponible');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [userLocation]);

    /**
     * Handler: Changement de recherche
     */
    const handleSearchChange = useCallback((value: string) => {
        setSearch(value);
    }, []);

    /**
     * Handler: Toggle des filtres
     */
    const handleToggleChurches = useCallback(() => {
        setShowChurches(prev => !prev);
    }, []);

    const handleToggleEvents = useCallback(() => {
        setShowEvents(prev => !prev);
    }, []);

    /**
     * Handler: Clic sur une église dans la liste
     */
    const handleChurchClick = useCallback((church: Church) => {
        // Zoomer sur la carte
        setMapCenter([church.latitude, church.longitude]);
        setMapZoom(15);

        // Ouvrir le modal de détails
        setSelectedChurchId(church.id);
        setChurchModalOpen(true);

        // Fermer le panel sur mobile
        if (isMobile) {
            setResultsPanelOpen(false);
        }
    }, [isMobile]);

    /**
     * Handler: Clic sur un événement dans la liste
     */
    const handleEventClick = useCallback((event: Event) => {
        // Zoomer sur la carte
        setMapCenter([event.latitude, event.longitude]);
        setMapZoom(15);

        // Ouvrir le modal de détails
        setSelectedEventId(event.id);
        setEventModalOpen(true);

        // Fermer le panel sur mobile
        if (isMobile) {
            setResultsPanelOpen(false);
        }
    }, [isMobile]);

    /**
     * Handler: Sélection d'une adresse dans l'autocomplete
     */
    const handleLocationSelect = useCallback((lat: number, lng: number, label: string) => {
        // Centrer la carte sur l'adresse sélectionnée
        setMapCenter([lat, lng]);
        setMapZoom(13);

        // Fermer le panel sur mobile
        if (isMobile) {
            setResultsPanelOpen(false);
        }

        console.log(`📍 Navigation vers: ${label} (${lat}, ${lng})`);
    }, [isMobile]);

    /**
     * Icônes memoizées pour éviter les re-créations
     */
    const churchIcon = useMemo(() => createChurchIcon(), []);
    const eventIcon = useMemo(() => createEventIcon(), []);
    const userIcon = useMemo(() => createUserIcon(), []);

    /**
     * Filtrage des données selon les filtres
     */
    const filteredChurches = useMemo(() => {
        return showChurches ? churches : [];
    }, [churches, showChurches]);

    const filteredEvents = useMemo(() => {
        return showEvents ? events : [];
    }, [events, showEvents]);

    return (
        <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
            {/* Carte Leaflet */}
            <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                minZoom={6}
                maxZoom={18}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Recentrage automatique */}
                <MapCenter center={mapCenter} zoom={mapZoom} />

                {/* Handler pour les événements de carte */}
                <MapEventsHandler onBoundsChange={handleBoundsChange} />

                {/* Marqueur utilisateur */}
                {userLocation && (
                    <Marker
                        position={[userLocation.latitude, userLocation.longitude]}
                        icon={userIcon}
                    >
                        <Popup>
                            <strong>Votre position</strong>
                        </Popup>
                    </Marker>
                )}

                {/* Marqueurs églises et événements avec clustering unifié */}
                <MarkerClusterGroup chunkedLoading>
                    {/* Églises */}
                    {filteredChurches.map((church) => (
                        <Marker
                            key={`church-${church.id}`}
                            position={[church.latitude, church.longitude]}
                            icon={churchIcon}
                        >
                            <Popup>
                                <Box sx={{ minWidth: 200 }}>
                                    <strong>{church.church_name}</strong>
                                    {church.denomination_name && (
                                        <div style={{ fontSize: '0.9em', marginTop: 4 }}>
                                            {church.denomination_name}
                                        </div>
                                    )}
                                    {church.pastor_name && (
                                        <div style={{ fontSize: '0.9em', marginTop: 4 }}>
                                            Pasteur: {church.pastor_name}
                                        </div>
                                    )}
                                    {church.distance_km !== null && (
                                        <div style={{ fontSize: '0.9em', marginTop: 4, color: '#666' }}>
                                            📍 {formatDistance(church.distance_km)}
                                        </div>
                                    )}
                                </Box>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Événements */}
                    {filteredEvents.map((event) => (
                        <Marker
                            key={`event-${event.id}`}
                            position={[event.latitude, event.longitude]}
                            icon={eventIcon}
                        >
                            <Popup>
                                <Box sx={{ minWidth: 200 }}>
                                    <strong>{event.title}</strong>
                                    {event.church_name && (
                                        <div style={{ fontSize: '0.9em', marginTop: 4 }}>
                                            {event.church_name}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '0.9em', marginTop: 4 }}>
                                        {new Date(event.start_datetime).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                    {event.distance_km !== null && (
                                        <div style={{ fontSize: '0.9em', marginTop: 4, color: '#666' }}>
                                            📍 {formatDistance(event.distance_km)}
                                        </div>
                                    )}
                                </Box>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>

            {/* Barre de recherche */}
            <SearchBar
                value={search}
                onChange={handleSearchChange}
                showChurches={showChurches}
                showEvents={showEvents}
                onToggleChurches={handleToggleChurches}
                onToggleEvents={handleToggleEvents}
                resultsCount={filteredChurches.length + filteredEvents.length}
                onLocationSelect={handleLocationSelect}
            />

            {/* Panneau de résultats */}
            <ResultsPanel
                churches={filteredChurches}
                events={filteredEvents}
                loading={loading}
                onChurchClick={handleChurchClick}
                onEventClick={handleEventClick}
                onClose={() => setResultsPanelOpen(false)}
                open={resultsPanelOpen}
            />

            {/* Bouton liste sur mobile */}
            {isMobile && !resultsPanelOpen && (
                <Fab
                    color="secondary"
                    aria-label="afficher la liste"
                    onClick={() => setResultsPanelOpen(true)}
                    sx={{
                        position: 'absolute',
                        bottom: 100,
                        left: 16,
                        zIndex: 1000,
                        boxShadow: 3
                    }}
                >
                    <ListIcon />
                </Fab>
            )}

            {/* Bouton de géolocalisation */}
            <Fab
                color="primary"
                aria-label="ma position"
                onClick={handleRecenterMap}
                sx={{
                    position: 'absolute',
                    bottom: { xs: 100, md: 24 },
                    right: { xs: 16, md: 24 },
                    zIndex: 1000,
                    boxShadow: 3
                }}
            >
                <MyLocationIcon />
            </Fab>

            {/* Indicateur de chargement */}
            {loading && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 2000,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: 2,
                        p: 3,
                        boxShadow: 3
                    }}
                >
                    <CircularProgress />
                </Box>
            )}

            {/* Message d'erreur */}
            {error && !loading && (
                <Alert
                    severity="error"
                    onClose={() => setError(null)}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 2000,
                        maxWidth: 400
                    }}
                >
                    {error}
                </Alert>
            )}

            {/* Modal de détails d'église */}
            <ChurchDetailsModal
                open={churchModalOpen}
                onClose={() => setChurchModalOpen(false)}
                churchId={selectedChurchId}
            />

            {/* Modal de détails d'événement */}
            <EventDetailsModal
                open={eventModalOpen}
                onClose={() => setEventModalOpen(false)}
                eventId={selectedEventId}
            />

            {/* Message d'aide pour guider l'utilisateur */}
            <Snackbar
                open={showHelpMessage && !loading}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ bottom: { xs: 80, md: 24 } }}
            >
                <Paper
                    elevation={8}
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        px: 3,
                        py: 2,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        maxWidth: 500,
                        boxShadow: '0 8px 32px 0 rgba(102, 126, 234, 0.4)'
                    }}
                >
                    <TouchAppIcon sx={{ fontSize: 32, animation: 'pulse 2s infinite' }} />
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                            Bienvenue!
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Déplacez ou zoomez la carte pour découvrir les églises et événements autour de vous
                        </Typography>
                    </Box>
                    <IconButton
                        size="small"
                        onClick={() => setShowHelpMessage(false)}
                        sx={{
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Paper>
            </Snackbar>

            {/* Animation pulse pour l'icône */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
            `}</style>
        </Box>
    );
};

export default HomePage;
