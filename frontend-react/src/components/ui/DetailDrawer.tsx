import React from 'react';
import { Drawer, Box, Typography, Button, IconButton, Rating, Skeleton, Divider, Chip, Link, Stack, Alert } from '@mui/material';
import { Close, Directions, Share, PunchClock, Call, Language, LocationOn, Event as EventIcon, LocalParking, Accessible, Mic, Person, People, AttachMoney, YouTube, LinkIcon, CancelOutlined, Info, Email, Translate, Facebook, Instagram, Twitter, LinkedIn } from '@mui/icons-material';
import type { ChurchDetails, EventDetails } from '../../types/publicMap';

interface DetailDrawerProps {
    open: boolean;
    onClose: () => void;
    loading: boolean;
    data: ChurchDetails | EventDetails | null;
    type: 'church' | 'event' | null;
}

const DetailDrawer: React.FC<DetailDrawerProps> = ({ open, onClose, loading, data, type }) => {

    const renderChurchDetails = (church: ChurchDetails) => {
        // Helper to get social icon
        const getSocialIcon = (platform: string) => {
            const p = platform.toUpperCase();
            switch(p) {
                case 'FACEBOOK': return <Facebook fontSize="small" />;
                case 'INSTAGRAM': return <Instagram fontSize="small" />;
                case 'YOUTUBE': return <YouTube fontSize="small" />;
                case 'TWITTER': return <Twitter fontSize="small" />;
                case 'LINKEDIN': return <LinkedIn fontSize="small" />;
                default: return <Language fontSize="small" />;
            }
        };

        return (
            <Box sx={{ p: 3 }}>
                {/* Title & Type */}
                <Typography variant="h5" fontWeight="700" gutterBottom>
                    {church.church_name}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip label="Église" size="small" color="primary" icon={<LocationOn />} />
                    {church.denomination_name && <Chip label={church.denomination_name} size="small" variant="outlined" />}
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Button variant="contained" startIcon={<Directions />} fullWidth sx={{ borderRadius: 8 }}>Itinéraire</Button>
                    <Button variant="outlined" startIcon={<Share />} fullWidth sx={{ borderRadius: 8 }}>Partager</Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Info Section */}
                <Stack spacing={2}>
                    {/* Address */}
                    {(church.details?.address || church.details?.city) && (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <LocationOn color="action" />
                            <Typography variant="body2">
                                {[church.details?.address, church.details?.postal_code, church.details?.city].filter(Boolean).join(', ')}
                            </Typography>
                        </Box>
                    )}

                    {/* Pastor */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Person color="action" />
                        <Typography variant="body2">Pasteur: {church.first_name} {church.last_name}</Typography>
                    </Box>

                    {/* Pastor Email */}
                    {church.email && (
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Email color="action" />
                            <Link href={`mailto:${church.email}`}>{church.email}</Link>
                        </Box>
                    )}

                    {/* Phone */}
                    {church.details?.phone && (
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Call color="action" />
                            <Link href={`tel:${church.details.phone}`}>{church.details.phone}</Link>
                        </Box>
                    )}

                    {/* Website */}
                    {church.details?.website && (
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Language color="action" />
                            <Link href={church.details.website} target="_blank" rel="noopener">Site Web</Link>
                        </Box>
                    )}

                    {/* Description */}
                    {church.details?.description && (
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">À propos</Typography>
                            <Typography variant="body2" color="text.secondary">{church.details.description}</Typography>
                        </Box>
                    )}

                    {/* Parking */}
                    {church.details?.has_parking && (
                        <Box>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 0.5 }}>
                                <LocalParking color="action" />
                                <Typography variant="body2" fontWeight="bold">Parking disponible</Typography>
                            </Box>
                            {church.details.parking_capacity && (
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 5 }}>
                                    Capacité: {church.details.parking_capacity} places
                                </Typography>
                            )}
                            {church.details.parking_info && (
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 5 }}>
                                    {church.details.parking_info}
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* Features */}
                    {(church.details?.seating_capacity || church.details?.accessibility_features) && (
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {church.details?.seating_capacity && (
                                <Chip label={`${church.details.seating_capacity} places`} size="small" variant="outlined" />
                            )}
                            {church.details?.accessibility_features && <Chip icon={<Accessible />} label="Accès PMR" size="small" />}
                        </Stack>
                    )}

                    {/* Schedules */}
                    {church.schedules && church.schedules.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PunchClock fontSize="small" /> Horaires
                            </Typography>
                            {church.schedules.map((sch) => (
                                <Box key={sch.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2" color="text.secondary">{sch.day_of_week}</Typography>
                                    <Typography variant="body2" fontWeight="500">{sch.start_time} - {sch.activity_type || 'Service'}</Typography>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {/* Social Media */}
                    {church.socials && church.socials.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                                Réseaux sociaux
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {church.socials.map((social, idx) => (
                                    <IconButton
                                        key={idx}
                                        component={Link}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener"
                                        size="small"
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                            '&:hover': { bgcolor: 'action.hover' }
                                        }}
                                    >
                                        {getSocialIcon(social.platform)}
                                    </IconButton>
                                ))}
                            </Stack>
                        </Box>
                    )}
                </Stack>
            </Box>
        );
    };

    const renderEventDetails = (event: EventDetails) => {
        const isCancelled = Boolean(event.cancelled_at);

        return (
            <Box sx={{ p: 3 }}>
                {/* Badge ANNULÉ */}
                {isCancelled && (
                    <Alert severity="error" icon={<CancelOutlined />} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold">ÉVÉNEMENT ANNULÉ</Typography>
                    </Alert>
                )}

                {/* Title & Type */}
                <Typography variant="h5" fontWeight="700" gutterBottom>
                    {event.title}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                    <Chip label="Événement" size="small" color="secondary" icon={<EventIcon />} />
                    <Chip label={new Date(event.start_datetime).toLocaleDateString('fr-FR')} size="small" variant="outlined" />
                    {event.details?.is_free && <Chip label="Gratuit" size="small" color="success" icon={<AttachMoney />} />}
                </Stack>

                {/* Raison d'annulation */}
                {isCancelled && event.cancellation_reason && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'error.lighter', borderLeft: '4px solid', borderColor: 'error.main', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                            <Info fontSize="small" color="error" />
                            <Box>
                                <Typography variant="caption" color="error.main" fontWeight="bold">Raison de l'annulation</Typography>
                                <Typography variant="body2" color="text.secondary">{event.cancellation_reason}</Typography>
                            </Box>
                        </Box>
                    </Box>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Button variant="contained" startIcon={<Directions />} fullWidth sx={{ borderRadius: 8 }}>Itinéraire</Button>
                    <Button variant="outlined" startIcon={<Share />} fullWidth sx={{ borderRadius: 8 }}>Partager</Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={2}>
                    {/* Date/Time */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <PunchClock color="action" />
                        <Box>
                            <Typography variant="body2" fontWeight="bold">
                                {new Date(event.start_datetime).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </Typography>
                            <Typography variant="body2">
                                {new Date(event.start_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                {event.end_datetime && ` - ${new Date(event.end_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Participants */}
                    {event.interested_count !== undefined && event.interested_count > 0 && (
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <People color="action" />
                            <Typography variant="body2">{event.interested_count} participant{event.interested_count > 1 ? 's' : ''} intéressé{event.interested_count > 1 ? 's' : ''}</Typography>
                        </Box>
                    )}

                    {/* Location */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <LocationOn color="action" />
                        <Box>
                            <Typography variant="body2" fontWeight="bold">{event.church_name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {[event.details?.street_number, event.details?.street_name].filter(Boolean).join(' ') || event.details?.address}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {[event.details?.postal_code, event.details?.city].filter(Boolean).join(' ')}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Speaker */}
                    {event.details?.speaker_name && (
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Mic color="action" />
                            <Typography variant="body2">Intervenant: {event.details.speaker_name}</Typography>
                        </Box>
                    )}

                    {/* Description */}
                    {event.details?.description && (
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">Détails</Typography>
                            <Typography variant="body2" color="text.secondary">{event.details.description}</Typography>
                        </Box>
                    )}

                    {/* Languages */}
                    {(event.primary_language || (event.translations && event.translations.length > 0)) && (
                        <Box>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Translate fontSize="small" /> Langues
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {event.primary_language && (
                                    <Chip
                                        label={`${event.primary_language.flag || ''} ${event.primary_language.name}`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                )}
                                {event.translations && event.translations.map((lang, idx) => (
                                    <Chip
                                        key={idx}
                                        label={`${lang.flag || ''} ${lang.name}`}
                                        size="small"
                                        variant="outlined"
                                    />
                                ))}
                            </Stack>
                        </Box>
                    )}

                    {/* Parking */}
                    {event.details?.has_parking && (
                        <Box>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 0.5 }}>
                                <LocalParking color="action" />
                                <Typography variant="body2" fontWeight="bold">Parking disponible</Typography>
                            </Box>
                            {event.details.parking_capacity && (
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 5 }}>
                                    Capacité: {event.details.parking_capacity} places
                                </Typography>
                            )}
                            {event.details.is_parking_free !== undefined && (
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 5 }}>
                                    {event.details.is_parking_free ? 'Gratuit' : 'Payant'}
                                </Typography>
                            )}
                            {event.details.parking_details && (
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 5 }}>
                                    {event.details.parking_details}
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* Registration Link */}
                    {event.details?.registration_link && (
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <LinkIcon color="action" />
                            <Link href={event.details.registration_link} target="_blank" rel="noopener">
                                S'inscrire à l'événement
                            </Link>
                        </Box>
                    )}

                    {/* YouTube Live */}
                    {event.details?.youtube_live && (
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <YouTube color="error" />
                            <Link href={event.details.youtube_live} target="_blank" rel="noopener">
                                Voir le live YouTube
                            </Link>
                        </Box>
                    )}

                    {/* Contact */}
                    {(event.details?.contact_email || event.details?.contact_phone) && (
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Contact</Typography>
                            {event.details.contact_email && (
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 0.5 }}>
                                    <Email fontSize="small" color="action" />
                                    <Link href={`mailto:${event.details.contact_email}`}>{event.details.contact_email}</Link>
                                </Box>
                            )}
                            {event.details.contact_phone && (
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Call fontSize="small" color="action" />
                                    <Link href={`tel:${event.details.contact_phone}`}>{event.details.contact_phone}</Link>
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* Organizer/Church Link */}
                    {event.church && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary">Organisé par</Typography>
                            <Typography variant="body2" fontWeight="bold">{event.church.church_name}</Typography>
                            {event.church.denomination_name && (
                                <Typography variant="caption" color="text.secondary">{event.church.denomination_name}</Typography>
                            )}
                        </Box>
                    )}
                </Stack>
            </Box>
        );
    };

    return (
        <Drawer
            anchor="left"
            open={open}
            onClose={onClose}
            variant="persistent"
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 400 },
                    top: 0,
                    height: '100%',
                    boxShadow: '4px 0 12px rgba(0,0,0,0.2)',
                    borderRight: 'none',
                    zIndex: 1200,
                }
            }}
        >
            {loading ? (
                <Box sx={{ p: 2 }}>
                    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
                    <Skeleton variant="text" width="60%" height={40} />
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
                </Box>
            ) : data ? (
                <Box>
                    {/* Cover Image */}
                    <Box
                        sx={{
                            height: 200,
                            backgroundColor: 'grey.300',
                            backgroundImage: `url(${(type === 'church' ? (data as ChurchDetails).details?.logo_url : (data as EventDetails).details?.image_url) || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            position: 'relative'
                        }}
                    >
                        <IconButton
                            onClick={onClose}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                backgroundColor: 'rgba(0,0,0,0.4)',
                                color: 'white',
                                '&:hover': { backgroundColor: 'rgba(0,0,0,0.6)' }
                            }}
                        >
                            <Close />
                        </IconButton>
                    </Box>

                    {type === 'church'
                        ? renderChurchDetails(data as ChurchDetails)
                        : renderEventDetails(data as EventDetails)
                    }
                </Box>
            ) : null}
        </Drawer>
    );
};

export default DetailDrawer;
