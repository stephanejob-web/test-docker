import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Fab,
    Alert,
    CircularProgress
} from '@mui/material';
import { MyLocation as MyLocationIcon } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/leaflet.css';
import type { Church, Event, UserLocation, MapFilters } from '../../types/publicMap';
import {
    fetchChurchesAndEvents,
    getUserLocation,
    formatDistance
} from '../../services/publicMapService';

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

const MapCenter: React.FC<MapCenterProps> = React.memo(({ center, zoom = 13 }) => {
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
 * HomePage - Page principale avec carte interactive
 * Optimisée avec useMemo, useCallback et React.memo
 */
const HomePage: React.FC = () => {
    // États
    const [churches, setChurches] = useState<Church[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]); // Paris par défaut
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filtres
    const [filters] = useState<MapFilters>({
        radius: 50,
        denominationId: null,
        showChurches: true,
        showEvents: true,
        search: ''
    });

    /**
     * Chargement initial : géolocalisation + données
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

                if (position) {
                    lat = position.coords.latitude;
                    lng = position.coords.longitude;
                    setUserLocation({ latitude: lat, longitude: lng });
                    setMapCenter([lat, lng]);
                }

                // Charger les données
                const data = await fetchChurchesAndEvents({
                    latitude: lat,
                    longitude: lng,
                    radius: filters.radius,
                    denominationId: filters.denominationId || undefined
                });

                setChurches(data.churches);
                setEvents(data.events);
            } catch (err: any) {
                console.error('Error initializing map:', err);
                setError(err.message || 'Erreur lors du chargement de la carte');
            } finally {
                setLoading(false);
            }
        };

        initializeMap();
    }, [filters.radius, filters.denominationId]);

    /**
     * Handler: Recentrer sur la position utilisateur
     */
    const handleRecenterMap = useCallback(async () => {
        if (userLocation) {
            setMapCenter([userLocation.latitude, userLocation.longitude]);
            return;
        }

        // Demander la géolocalisation si pas encore obtenue
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
     * Icônes memoizées pour éviter les re-créations
     */
    const churchIcon = useMemo(() => createChurchIcon(), []);
    const eventIcon = useMemo(() => createEventIcon(), []);
    const userIcon = useMemo(() => createUserIcon(), []);

    /**
     * Filtrage des données selon les filtres
     */
    const filteredChurches = useMemo(() => {
        return filters.showChurches ? churches : [];
    }, [churches, filters.showChurches]);

    const filteredEvents = useMemo(() => {
        return filters.showEvents ? events : [];
    }, [events, filters.showEvents]);

    return (
        <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
            {/* Carte Leaflet */}
            <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Recentrage automatique */}
                <MapCenter center={mapCenter} />

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

                {/* Marqueurs églises avec clustering */}
                <MarkerClusterGroup chunkedLoading>
                    {filteredChurches.map((church) => (
                        <Marker
                            key={`church-${church.id}`}
                            position={[church.latitude, church.longitude]}
                            icon={churchIcon}
                        >
                            <Popup>
                                <Box sx={{ minWidth: 200 }}>
                                    <strong>{church.church_name}</strong>
                                    {church.pastor_name && (
                                        <div style={{ fontSize: '0.9em', marginTop: 4 }}>
                                            Pasteur: {church.pastor_name}
                                        </div>
                                    )}
                                    {church.city && (
                                        <div style={{ fontSize: '0.9em', marginTop: 4 }}>
                                            {church.city} ({church.postal_code})
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
                </MarkerClusterGroup>

                {/* Marqueurs événements avec clustering */}
                <MarkerClusterGroup chunkedLoading>
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
        </Box>
    );
};

export default HomePage;
