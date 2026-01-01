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
import GlobalStats from '../../components/Map/GlobalStats';

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

// Créer l'icône utilisateur UNE SEULE FOIS en dehors du composant
const userIconInstance = L.divIcon({
    className: 'custom-marker-user-static',
    html: `
        <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <circle class="pulse-circle" cx="10" cy="10" r="8" fill="rgba(33, 150, 243, 0.3)"/>
            <circle cx="10" cy="10" r="5" fill="#2196F3" stroke="white" stroke-width="2"/>
        </svg>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
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

    // Recherche
    const [search, setSearch] = useState('');

    // Ref pour debounce et first load
    const boundsChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isFirstLoadRef = useRef(true);
    const abortControllerRef = useRef<AbortController | null>(null);

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
     * Cleanup: Annuler les requêtes et timers au unmount
     */
    useEffect(() => {
        return () => {
            // Annuler toute requête en cours
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            // Nettoyer le timeout de debounce
            if (boundsChangeTimeoutRef.current) {
                clearTimeout(boundsChangeTimeoutRef.current);
            }
        };
    }, []);

    /**
     * Handler: Charger les données selon les bounds de la carte
     * Sur mobile géolocalisé: rayon fixe de 15km
     * Sinon: bounding box classique
     */
    const loadDataForBounds = useCallback(async (bounds: L.LatLngBounds) => {
        // Annuler la requête précédente si elle existe
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Créer un nouveau AbortController pour cette requête
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            setLoading(true);
            setError(null);

            let data;

            // MODE MOBILE GÉOLOCALISÉ: Rayon fixe de 15km autour de la position
            if (isMobile && userLocation) {
                data = await fetchChurchesAndEvents({
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    radius: 15, // 15km de rayon
                    userLat: userLocation.latitude,
                    userLng: userLocation.longitude,
                    search: search || undefined,
                    limit: 100
                });
            }
            // MODE DESKTOP OU MOBILE NON GÉOLOCALISÉ: Bounding box
            else {
                // Utiliser la position de l'utilisateur si disponible, sinon le centre de la carte
                let refLat: number | undefined;
                let refLng: number | undefined;

                if (userLocation) {
                    // Position géolocalisée de l'utilisateur (fixe)
                    refLat = userLocation.latitude;
                    refLng = userLocation.longitude;
                } else {
                    // Fallback: centre de la carte (si pas de géolocalisation)
                    const center = bounds.getCenter();
                    refLat = center.lat;
                    refLng = center.lng;
                }

                data = await fetchChurchesAndEvents({
                    north: bounds.getNorth(),
                    south: bounds.getSouth(),
                    east: bounds.getEast(),
                    west: bounds.getWest(),
                    userLat: refLat,
                    userLng: refLng,
                    search: search || undefined,
                    limit: 100  // Optimisé pour 3000 églises
                });
            }

            // Ne mettre à jour que si la requête n'a pas été annulée
            if (!abortController.signal.aborted) {
                setChurches(data.churches);
                setEvents(data.events);
            }
        } catch (err: any) {
            // Ignorer les erreurs d'annulation
            if (err.name === 'AbortError' || abortController.signal.aborted) {
                return;
            }
            console.error('Error loading data:', err);
            if (!abortController.signal.aborted) {
                setError(err.message || 'Erreur lors du chargement des données');
            }
        } finally {
            if (!abortController.signal.aborted) {
                setLoading(false);
            }
        }
    }, [search, userLocation, isMobile]);

    /**
     * Handler: Changement de bounds de la carte (debounced, sauf premier chargement)
     * Sur mobile géolocalisé: pas de rechargement (rayon fixe)
     */
    const handleBoundsChange = useCallback((bounds: L.LatLngBounds) => {
        // Premier chargement: immédiat sans debounce
        if (isFirstLoadRef.current) {
            isFirstLoadRef.current = false;
            loadDataForBounds(bounds);
            return;
        }

        // Sur mobile géolocalisé, on utilise un rayon fixe
        // Pas besoin de recharger quand la carte bouge
        if (isMobile && userLocation) {
            return;
        }

        // Debounce pour éviter trop de requêtes pendant le déplacement
        if (boundsChangeTimeoutRef.current) {
            clearTimeout(boundsChangeTimeoutRef.current);
        }

        boundsChangeTimeoutRef.current = setTimeout(() => {
            loadDataForBounds(bounds);
        }, 500); // 500ms de délai
    }, [loadDataForBounds, isMobile, userLocation]);

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


    return (
        <Box sx={{ position: 'relative', height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Statistiques globales */}
            <GlobalStats />

            {/* Carte Leaflet */}
            <Box sx={{ flex: 1, position: 'relative' }}>
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
                        icon={userIconInstance}
                    >
                        <Popup>
                            <Box sx={{ textAlign: 'center', p: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#2196F3' }}>
                                    📍 Vous êtes ici
                                </Typography>
                            </Box>
                        </Popup>
                    </Marker>
                )}

                {/* Marqueurs églises et événements avec clustering unifié */}
                <MarkerClusterGroup chunkedLoading>
                    {/* Églises */}
                    {churches.map((church) => (
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
                    {events.map((event) => (
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
                onLocationSelect={handleLocationSelect}
            />

            {/* Panneau de résultats */}
            <ResultsPanel
                churches={churches}
                events={events}
                loading={loading}
                onChurchClick={handleChurchClick}
                onEventClick={handleEventClick}
                onClose={() => setResultsPanelOpen(false)}
                open={resultsPanelOpen}
                isGeolocated={!!userLocation}
                isMobileView={isMobile}
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
        </Box>
    );
};

export default HomePage;
