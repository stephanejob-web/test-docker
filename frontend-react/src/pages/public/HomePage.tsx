import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    Box,
    Fab,
    useMediaQuery,
    useTheme,
    Typography,
    LinearProgress,
} from '@mui/material';
import {
    MyLocation as MyLocationIcon,
    Layers,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/leaflet.css';
import type { Church, Event, UserLocation } from '../../types/publicMap';
import {
    fetchChurchesAndEvents,
    getUserLocation,
} from '../../services/publicMapService';

// New UI Components
import SearchPanel from '../../components/ui/SearchPanel';
import DetailDrawer from '../../components/ui/DetailDrawer';
import ResultsPanel from '../../components/Map/ResultsPanel';
import Sidebar from '../../components/Map/Sidebar';

// Fix Leaflet default icon (Same as before)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// MapCenter Component (Same as before)
interface MapCenterProps {
    center: [number, number];
    zoom?: number;
}
const MapCenter: React.FC<MapCenterProps> = React.memo(({ center, zoom = 2 }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom, { duration: 1.5 });
    }, [center, zoom, map]);
    return null;
});
MapCenter.displayName = 'MapCenter';

// MapEventsHandler Component (Same as before)
interface MapEventsHandlerProps {
    onBoundsChange: (bounds: L.LatLngBounds) => void;
}
const MapEventsHandler: React.FC<MapEventsHandlerProps> = React.memo(({ onBoundsChange }) => {
    const map = useMapEvents({
        moveend: () => onBoundsChange(map.getBounds()),
        zoomend: () => onBoundsChange(map.getBounds())
    });
    return null;
});
MapEventsHandler.displayName = 'MapEventsHandler';

// Icons (Same as before)
const createChurchIcon = () => L.divIcon({
    className: 'custom-marker-church',
    html: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#4285F4" stroke="white" stroke-width="2"><path d="M18 12.22V9l-6-4-6 4v3.22l-2 1V21h7v-5h2v5h7v-7.78l-2-1zM12 7l4 3v1h-8v-1l4-3z"/></svg>',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
});

const createEventIcon = () => L.divIcon({
    className: 'custom-marker-event',
    html: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#EA4335" stroke="white" stroke-width="2"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zM5 7V5h14v2H5zm7 5h5v5h-5z"/></svg>',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
});

const createSelectedChurchIcon = () => L.divIcon({
    className: 'custom-marker-church-selected marker-bounce',
    html: '<svg width="48" height="48" viewBox="0 0 24 24" fill="#FBBC04" stroke="white" stroke-width="2" style="filter: drop-shadow(0 0 8px rgba(0,0,0,0.5));"><path d="M18 12.22V9l-6-4-6 4v3.22l-2 1V21h7v-5h2v5h7v-7.78l-2-1zM12 7l4 3v1h-8v-1l4-3z"/></svg>',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24]
});

const createSelectedEventIcon = () => L.divIcon({
    className: 'custom-marker-event-selected marker-bounce',
    html: '<svg width="48" height="48" viewBox="0 0 24 24" fill="#FBBC04" stroke="white" stroke-width="2" style="filter: drop-shadow(0 0 8px rgba(0,0,0,0.5));"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zM5 7V5h14v2H5zm7 5h5v5h-5z"/></svg>',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24]
});

const userIconInstance = L.divIcon({
    className: 'custom-marker-user-static',
    html: `
        <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <circle class="pulse-circle" cx="10" cy="10" r="8" fill="rgba(66, 133, 244, 0.3)"/>
            <circle cx="10" cy="10" r="5" fill="#4285F4" stroke="white" stroke-width="2"/>
        </svg>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
});

const HomePage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // States
    const [churches, setChurches] = useState<Church[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]);
    const [mapZoom, setMapZoom] = useState<number>(6);
    const [loading, setLoading] = useState(true);
    const [_error, setError] = useState<string | null>(null);
    const [_isMapReady, setIsMapReady] = useState(false);
    const [geoBlocked, setGeoBlocked] = useState(false);

    // UI States
    const [showChurches, setShowChurches] = useState(true);
    const [showEvents, setShowEvents] = useState(true);
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [selectedType, setSelectedType] = useState<'church' | 'event' | null>(null);

    // Map Type
    const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

    // Refs
    const boundsChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isFirstLoadRef = useRef(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Initialization (Geo)
    useEffect(() => {
        const initializeMap = async () => {
            setLoading(true);
            try {
                const position = await getUserLocation();
                if (position) {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ latitude, longitude });
                    setMapCenter([latitude, longitude]);
                    setMapZoom(13);
                } else {
                    setGeoBlocked(true);
                    return;
                }
            } catch (err: any) {
                console.error('Error initializing map:', err);
                setGeoBlocked(true);
                return;
            } finally {
                setLoading(false);
                setTimeout(() => setIsMapReady(true), 500);
            }
        };
        initializeMap();
    }, []);

    // Debug logging


    // Cleanup
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
            if (boundsChangeTimeoutRef.current) clearTimeout(boundsChangeTimeoutRef.current);
        };
    }, []);

    // Load Data
    const loadDataForBounds = useCallback(async (bounds: L.LatLngBounds) => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            setLoading(true);
            setError(null);

            let data;
            if (isMobile && userLocation) {
                data = await fetchChurchesAndEvents({
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    radius: 15,
                    userLat: userLocation.latitude,
                    userLng: userLocation.longitude,
                    limit: 100
                });
            } else {
                data = await fetchChurchesAndEvents({
                    north: bounds.getNorth(),
                    south: bounds.getSouth(),
                    east: bounds.getEast(),
                    west: bounds.getWest(),
                    userLat: userLocation?.latitude,
                    userLng: userLocation?.longitude,
                    limit: 100
                });
            }

            if (!abortController.signal.aborted) {
                setChurches(data.churches);
                setEvents(data.events);
            }
        } catch (err: any) {
            if (err.name !== 'AbortError' && !abortController.signal.aborted) {
                console.error('Error loading data:', err);
            }
        } finally {
            if (!abortController.signal.aborted) setLoading(false);
        }
    }, [userLocation, isMobile]);

    // Bounds Change Handler
    const handleBoundsChange = useCallback((bounds: L.LatLngBounds) => {
        if (isFirstLoadRef.current) {
            isFirstLoadRef.current = false;
            loadDataForBounds(bounds);
            return;
        }
        if (isMobile && userLocation) return;

        if (boundsChangeTimeoutRef.current) clearTimeout(boundsChangeTimeoutRef.current);
        boundsChangeTimeoutRef.current = setTimeout(() => {
            loadDataForBounds(bounds);
        }, 500);
    }, [loadDataForBounds, isMobile, userLocation]);

    // Interactions
    const handleRecenterMap = useCallback(() => {
        if (userLocation) {
            setMapCenter([userLocation.latitude, userLocation.longitude]);
            setMapZoom(13);
        }
    }, [userLocation]);

    const handleSearch = (_query: string) => {
        // Implement search logic here, potentially calling separate search API
        // console.log('Searching for:', query);
    };

    const handleFilterChange = (filters: { churches: boolean; events: boolean }) => {
        setShowChurches(filters.churches);
        setShowEvents(filters.events);
    };

    const handleMarkerClick = async (item: any, type: 'church' | 'event') => {
        setSelectedItem(null); // Clear previous item
        setSelectedType(type);
        setDetailDrawerOpen(true);
        setDetailDrawerOpen(true);
        setMapCenter([item.latitude, item.longitude]);
        setMapZoom(16); // Focus close on the selected item

        // Fetch full details
        try {
            // Temporarily use local state for loading in Drawer if needed, 
            // but we can pass a loading prop to drawer. 
            // For now, let's just use the selectedItem as 'loading' state implies null/skeleton
            let details;
            if (type === 'church') {
                // Import these dynamically or ensure they are imported at top
                const { fetchChurchDetails } = await import('../../services/publicMapService');
                details = await fetchChurchDetails(item.id);
            } else {
                const { fetchEventDetails } = await import('../../services/publicMapService');
                details = await fetchEventDetails(item.id);
            }
            setSelectedItem(details);
        } catch (err) {
            console.error('Error fetching details:', err);
            // Optionally handle error in UI
        }
    };

    const handleCloseDrawer = () => {
        setDetailDrawerOpen(false);
        setSelectedItem(null);
        handleRecenterMap();
    };

    const churchIcon = useMemo(() => createChurchIcon(), []);
    const eventIcon = useMemo(() => createEventIcon(), []);
    const selectedChurchIcon = useMemo(() => createSelectedChurchIcon(), []);
    const selectedEventIcon = useMemo(() => createSelectedEventIcon(), []);

    if (geoBlocked) {
        // ... (Keep existing geo blocked UI or simplify it)
        return (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography>Géolocalisation requise pour explorer la carte.</Typography>
                {/* Re-use the nice UI from before ideally */}
            </Box>
        );
    }

    const [resultsPanelOpen, setResultsPanelOpen] = useState(true);

    const handleToggleList = () => {
        setResultsPanelOpen(!resultsPanelOpen);
    };

    const handleLocationSelect = useCallback((lat: number, lng: number, _label: string) => {
        // console.log('Selected location:', label);
        setMapCenter([lat, lng]);
        setMapZoom(13);
    }, []);

    return (
        <React.Fragment>
            {loading && (
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 3000 }}>
                    <LinearProgress sx={{ height: 4 }} />
                </Box>
            )}
            {isMobile ? (
                // Mobile Layout (Floating Panels)
                <>
                    {/* 1. Floating Search Panel */}
                    <SearchPanel
                        onSearch={handleSearch}
                        onFilterChange={handleFilterChange}
                        onToggleList={handleToggleList}
                        onLocationSelect={handleLocationSelect}
                        hideFilters={true}
                    />

                    {/* 1.5 Results Panel */}
                    <Box sx={{
                        position: 'absolute',
                        top: 70, // Below search panel
                        left: 16,
                        bottom: 24,
                        width: { xs: 'calc(100% - 32px)', sm: 360 },
                        zIndex: 900, // Below DetailDrawer but above map
                        display: resultsPanelOpen && !detailDrawerOpen ? 'block' : 'none',
                        pointerEvents: 'none' // Let clicks pass through container
                    }}>
                        <Box sx={{
                            height: '100%',
                            pointerEvents: 'auto', // Re-enable clicks for panel
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: 3
                        }}>
                            <ResultsPanel
                                churches={churches}
                                events={events}
                                loading={loading}
                                onChurchClick={(church) => handleMarkerClick(church, 'church')}
                                onEventClick={(event) => handleMarkerClick(event, 'event')}
                                onClose={() => setResultsPanelOpen(false)}
                                open={resultsPanelOpen}
                                isGeolocated={!!userLocation}
                                isMobileView={isMobile}
                            />
                        </Box>
                    </Box>

                    {/* 3. Detail Drawer */}
                    <DetailDrawer
                        open={detailDrawerOpen}
                        onClose={handleCloseDrawer}
                        loading={false}
                        data={selectedItem}
                        type={selectedType}
                        onOrganizerClick={async (churchId) => {
                            const basicChurch = churches.find(c => String(c.id) === String(churchId));
                            if (basicChurch) {
                                handleMarkerClick(basicChurch, 'church');
                            } else {
                                try {
                                    setDetailDrawerOpen(true);
                                    setSelectedType('church');
                                    // Dynamically import service to fetch missing details
                                    const { fetchChurchDetails } = await import('../../services/publicMapService');
                                    const details = await fetchChurchDetails(Number(churchId));
                                    setSelectedItem(details);
                                    if (details && details.latitude && details.longitude) {
                                        setMapCenter([details.latitude, details.longitude]);
                                        setMapZoom(16);
                                    }
                                } catch (e) {
                                    console.error("Failed to fetch organizer church details", e);
                                }
                            }
                        }}
                    />
                </>
            ) : (
                // Desktop Layout (Sidebar)
                <Sidebar>
                    <SearchPanel
                        embedded
                        onSearch={handleSearch}
                        onFilterChange={handleFilterChange}
                        onToggleList={handleToggleList}
                        onLocationSelect={handleLocationSelect}
                    />

                    <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                        {detailDrawerOpen && selectedItem ? (
                            <DetailDrawer
                                embedded
                                open={true}
                                onClose={handleCloseDrawer}
                                loading={false}
                                data={selectedItem}
                                type={selectedType}
                                onOrganizerClick={async (churchId) => {
                                    // Fix: String conversion for safety
                                    const basicChurch = churches.find(c => String(c.id) === String(churchId));
                                    if (basicChurch) {
                                        handleMarkerClick(basicChurch, 'church');
                                    } else {
                                        try {
                                            // Dynamically import service to fetch missing details
                                            const { fetchChurchDetails } = await import('../../services/publicMapService');
                                            const details = await fetchChurchDetails(Number(churchId));
                                            setSelectedItem(details);
                                            setSelectedType('church');
                                            if (details && details.latitude && details.longitude) {
                                                setMapCenter([details.latitude, details.longitude]);
                                                setMapZoom(16);
                                            }
                                        } catch (e) {
                                            console.warn("Church logic: details fetch failed", e);
                                        }
                                    }
                                }}
                            />
                        ) : (
                            <ResultsPanel
                                churches={churches}
                                events={events}
                                loading={loading}
                                onChurchClick={(church) => handleMarkerClick(church, 'church')}
                                onEventClick={(event) => handleMarkerClick(event, 'event')}
                                isGeolocated={!!userLocation}
                                isMobileView={false}
                            />
                        )}
                    </Box>
                </Sidebar>
            )}

            {/* 2. Map Container */}
            <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                minZoom={3}
                maxZoom={18}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false} // We will add custom controls
            >
                <TileLayer
                    url={mapType === 'satellite'
                        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
                    attribution='&copy; OpenStreetMap contributors'
                />

                <MapCenter center={mapCenter} zoom={mapZoom} />
                <MapEventsHandler onBoundsChange={handleBoundsChange} />

                {userLocation && (
                    <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIconInstance} />
                )}

                <MarkerClusterGroup chunkedLoading>
                    {showChurches && churches.map(church => (
                        <Marker
                            key={`church-${church.id}`}
                            position={[church.latitude, church.longitude]}
                            icon={selectedItem?.id === church.id && selectedType === 'church' ? selectedChurchIcon : churchIcon}
                            eventHandlers={{ click: () => handleMarkerClick(church, 'church') }}
                            zIndexOffset={selectedItem?.id === church.id ? 1000 : 0}
                        />
                    ))}
                    {showEvents && events.map(event => (
                        <Marker
                            key={`event-${event.id}`}
                            position={[event.latitude, event.longitude]}
                            icon={selectedItem?.id === event.id && selectedType === 'event' ? selectedEventIcon : eventIcon}
                            eventHandlers={{ click: () => handleMarkerClick(event, 'event') }}
                            zIndexOffset={selectedItem?.id === event.id ? 1000 : 0}
                        />
                    ))}
                </MarkerClusterGroup>
            </MapContainer>

            {/* 4. Floating Action Buttons (Bottom Right) */}
            <Box sx={{ position: 'absolute', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 2, zIndex: 1000 }}>
                {/* Map Layer Toggle - Matches Geolocate button size */}
                <Fab
                    color="inherit" // or 'default' with white bg
                    onClick={() => setMapType(t => t === 'standard' ? 'satellite' : 'standard')}
                    sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#F1F3F4' } }}
                    aria-label="Changer de vue"
                >
                    <Layers sx={{ color: '#5F6368' }} />
                </Fab>

                <Fab color="primary" onClick={handleRecenterMap} aria-label="Ma position">
                    <MyLocationIcon />
                </Fab>
            </Box>

        </React.Fragment>
    );
};

export default HomePage;
