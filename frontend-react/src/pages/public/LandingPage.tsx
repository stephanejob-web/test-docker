import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    useTheme,
    useMediaQuery,
    Stack,
    IconButton,
    Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
    Church,
    Calendar,
    MapPin,
    Smartphone,
    ArrowRight,
    Apple,
    PlayCircle,
    Menu as MenuIcon,
} from 'lucide-react';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const features = [
        {
            icon: <Church size={40} />,
            title: 'Trouvez des églises',
            description: 'Découvrez les églises près de chez vous grâce à notre carte interactive avec géolocalisation.',
        },
        {
            icon: <Calendar size={40} />,
            title: 'Événements à proximité',
            description: 'Ne manquez aucun événement : cultes, conférences, concerts et activités communautaires.',
        },
        {
            icon: <MapPin size={40} />,
            title: 'Géolocalisation précise',
            description: 'Localisez instantanément les églises et événements autour de vous avec calcul de distance.',
        },
        {
            icon: <Smartphone size={40} />,
            title: 'Application mobile',
            description: 'Téléchargez notre app iOS et Android pour recevoir des notifications et rester connecté.',
        },
    ];

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 },
    };

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', overflow: 'hidden' }}>
            {/* Header / Navbar */}
            <Box
                component="nav"
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1100,
                    backdropFilter: 'blur(10px)',
                    bgcolor: 'rgba(15, 23, 42, 0.8)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                <Container maxWidth="lg">
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            py: 2,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Church size={28} color={theme.palette.primary.main} />
                            <Typography variant="h6" fontWeight="bold" color="white">
                                Light Church
                            </Typography>
                        </Box>
                        {!isMobile ? (
                            <Stack direction="row" spacing={3}>
                                <Button
                                    color="inherit"
                                    onClick={() => navigate('/map')}
                                    sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
                                >
                                    Explorer la carte
                                </Button>
                                <Button
                                    color="inherit"
                                    onClick={() => navigate('/login')}
                                    sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
                                >
                                    Connexion
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => navigate('/register')}
                                >
                                    Inscription
                                </Button>
                            </Stack>
                        ) : (
                            <IconButton color="inherit">
                                <MenuIcon size={24} />
                            </IconButton>
                        )}
                    </Box>
                </Container>
            </Box>

            {/* Hero Section */}
            <Box
                sx={{
                    position: 'relative',
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    background: `linear-gradient(135deg,
                        ${theme.palette.primary.main}15 0%,
                        ${theme.palette.background.default} 50%,
                        ${theme.palette.secondary.main}15 100%)`,
                    pt: 10,
                    overflow: 'hidden',
                }}
            >
                {/* Decorative elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '10%',
                        right: '-5%',
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${theme.palette.primary.main}20, transparent)`,
                        filter: 'blur(80px)',
                        animation: 'pulse 4s ease-in-out infinite',
                        '@keyframes pulse': {
                            '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
                            '50%': { opacity: 0.8, transform: 'scale(1.1)' },
                        },
                    }}
                />

                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                        <Box sx={{ width: { xs: '100%', md: '50%' }, flexGrow: { md: 1 } }}>
                            <MotionBox {...fadeInUp}>
                                <Typography
                                    variant="h1"
                                    sx={{
                                        fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                                        fontWeight: 800,
                                        lineHeight: 1.2,
                                        mb: 3,
                                        background: `linear-gradient(135deg,
                                            ${theme.palette.primary.main},
                                            ${theme.palette.secondary.main})`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    Trouvez votre église,
                                    <br />
                                    Vivez votre foi
                                </Typography>

                                <Typography
                                    variant="h5"
                                    sx={{
                                        mb: 4,
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        lineHeight: 1.6,
                                        fontWeight: 400,
                                    }}
                                >
                                    Découvrez des églises et événements chrétiens près de chez vous.
                                    Une communauté connectée, une foi partagée.
                                </Typography>

                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={2}
                                    sx={{ mb: 4 }}
                                >
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={() => navigate('/map')}
                                        endIcon={<ArrowRight size={20} />}
                                        sx={{
                                            py: 1.5,
                                            px: 4,
                                            fontSize: '1.1rem',
                                            fontWeight: 600,
                                            background: `linear-gradient(135deg,
                                                ${theme.palette.primary.main},
                                                ${theme.palette.primary.dark})`,
                                            '&:hover': {
                                                background: `linear-gradient(135deg,
                                                    ${theme.palette.primary.dark},
                                                    ${theme.palette.primary.main})`,
                                            },
                                        }}
                                    >
                                        Explorer la carte
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        size="large"
                                        startIcon={<Smartphone size={20} />}
                                        onClick={() => {
                                            document.getElementById('mobile-app')?.scrollIntoView({
                                                behavior: 'smooth',
                                            });
                                        }}
                                        sx={{
                                            py: 1.5,
                                            px: 4,
                                            fontSize: '1.1rem',
                                            fontWeight: 600,
                                            borderColor: theme.palette.primary.main,
                                            color: theme.palette.primary.main,
                                            '&:hover': {
                                                borderColor: theme.palette.primary.light,
                                                bgcolor: 'rgba(66, 133, 244, 0.1)',
                                            },
                                        }}
                                    >
                                        Télécharger l'app
                                    </Button>
                                </Stack>

                                <Typography
                                    variant="body2"
                                    sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                                >
                                    Disponible sur iOS et Android • Gratuit et sans publicité
                                </Typography>
                            </MotionBox>
                        </Box>

                        <Box sx={{ width: { xs: '100%', md: '50%' }, flexGrow: { md: 1 } }}>
                            <MotionBox
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <Box
                                    sx={{
                                        position: 'relative',
                                        height: { xs: 300, md: 500 },
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {/* Placeholder for hero illustration/mockup */}
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            borderRadius: 4,
                                            background: `linear-gradient(135deg,
                                                rgba(66, 133, 244, 0.2),
                                                rgba(234, 67, 53, 0.2))`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2px solid rgba(255, 255, 255, 0.1)',
                                            backdropFilter: 'blur(10px)',
                                        }}
                                    >
                                        <Church size={120} color={theme.palette.primary.main} />
                                    </Box>
                                </Box>
                            </MotionBox>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Features Section */}
            <Box sx={{ py: 12, bgcolor: 'background.paper' }}>
                <Container maxWidth="lg">
                    <MotionBox
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <Typography
                            variant="h2"
                            textAlign="center"
                            sx={{
                                fontSize: { xs: '2rem', md: '3rem' },
                                fontWeight: 700,
                                mb: 2,
                            }}
                        >
                            Pourquoi choisir Light Church ?
                        </Typography>
                        <Typography
                            variant="h6"
                            textAlign="center"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                mb: 8,
                                maxWidth: 700,
                                mx: 'auto',
                            }}
                        >
                            Une plateforme complète pour découvrir, connecter et participer à la vie
                            de votre communauté chrétienne locale.
                        </Typography>
                    </MotionBox>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {features.map((feature, index) => (
                            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(25% - 12px)' } }} key={index}>
                                <MotionCard
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                    sx={{
                                        height: '100%',
                                        background: `linear-gradient(135deg,
                                            ${theme.palette.background.default},
                                            rgba(66, 133, 244, 0.05))`,
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <CardContent sx={{ p: 4 }}>
                                        <Box
                                            sx={{
                                                width: 70,
                                                height: 70,
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: `linear-gradient(135deg,
                                                    ${theme.palette.primary.main}20,
                                                    ${theme.palette.secondary.main}20)`,
                                                color: theme.palette.primary.main,
                                                mb: 3,
                                            }}
                                        >
                                            {feature.icon}
                                        </Box>
                                        <Typography variant="h6" fontWeight={600} mb={1.5}>
                                            {feature.title}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.7 }}
                                        >
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </MotionCard>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* Mobile App Section */}
            <Box
                id="mobile-app"
                sx={{
                    py: 12,
                    background: `linear-gradient(135deg,
                        ${theme.palette.background.default},
                        rgba(66, 133, 244, 0.1))`,
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                        <Box sx={{ width: { xs: '100%', md: '50%' }, flexGrow: { md: 1 } }}>
                            <MotionBox
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <Typography
                                    variant="h2"
                                    sx={{
                                        fontSize: { xs: '2rem', md: '3rem' },
                                        fontWeight: 700,
                                        mb: 3,
                                    }}
                                >
                                    Emportez Light Church
                                    <br />
                                    partout avec vous
                                </Typography>

                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        mb: 4,
                                        lineHeight: 1.7,
                                    }}
                                >
                                    Téléchargez notre application mobile gratuite et restez connecté à
                                    votre communauté. Recevez des notifications pour les événements à
                                    proximité, consultez les horaires des cultes et bien plus encore.
                                </Typography>

                                <Stack spacing={3} sx={{ mb: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                            sx={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: 1.5,
                                                bgcolor: theme.palette.primary.main,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <MapPin size={24} />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                Géolocalisation en temps réel
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Trouvez les églises les plus proches
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                            sx={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: 1.5,
                                                bgcolor: theme.palette.secondary.main,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Calendar size={24} />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                Notifications d'événements
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Ne manquez plus aucune activité
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                            sx={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: 1.5,
                                                bgcolor: '#34A853',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Smartphone size={24} />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                Interface optimisée mobile
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Expérience fluide sur tous les appareils
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Stack>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<Apple size={24} />}
                                        sx={{
                                            py: 1.5,
                                            px: 4,
                                            bgcolor: 'white',
                                            color: 'black',
                                            '&:hover': { bgcolor: '#f1f1f1' },
                                        }}
                                    >
                                        <Box sx={{ textAlign: 'left' }}>
                                            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                                Télécharger sur
                                            </Typography>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                App Store
                                            </Typography>
                                        </Box>
                                    </Button>

                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<PlayCircle size={24} />}
                                        sx={{
                                            py: 1.5,
                                            px: 4,
                                            bgcolor: 'white',
                                            color: 'black',
                                            '&:hover': { bgcolor: '#f1f1f1' },
                                        }}
                                    >
                                        <Box sx={{ textAlign: 'left' }}>
                                            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                                Télécharger sur
                                            </Typography>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                Google Play
                                            </Typography>
                                        </Box>
                                    </Button>
                                </Stack>
                            </MotionBox>
                        </Box>

                        <Box sx={{ width: { xs: '100%', md: '50%' }, flexGrow: { md: 1 } }}>
                            <MotionBox
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                {/* Placeholder for mobile mockup */}
                                <Box
                                    sx={{
                                        height: 600,
                                        borderRadius: 4,
                                        background: `linear-gradient(135deg,
                                            rgba(66, 133, 244, 0.2),
                                            rgba(52, 168, 83, 0.2))`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px solid rgba(255, 255, 255, 0.1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Smartphone
                                        size={200}
                                        color={theme.palette.primary.main}
                                        strokeWidth={1}
                                    />
                                </Box>
                            </MotionBox>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box
                sx={{
                    py: 12,
                    bgcolor: 'background.paper',
                }}
            >
                <Container maxWidth="md">
                    <MotionBox
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <Box
                            sx={{
                                textAlign: 'center',
                                p: 6,
                                borderRadius: 4,
                                background: `linear-gradient(135deg,
                                    ${theme.palette.primary.main}20,
                                    ${theme.palette.secondary.main}20)`,
                                border: '2px solid rgba(255, 255, 255, 0.1)',
                            }}
                        >
                            <Typography
                                variant="h3"
                                fontWeight={700}
                                mb={2}
                                sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' } }}
                            >
                                Prêt à commencer votre voyage spirituel ?
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 4 }}
                            >
                                Rejoignez des milliers de chrétiens qui utilisent Light Church pour
                                rester connectés.
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/map')}
                                endIcon={<ArrowRight size={20} />}
                                sx={{
                                    py: 2,
                                    px: 5,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                }}
                            >
                                Commencer maintenant
                            </Button>
                        </Box>
                    </MotionBox>
                </Container>
            </Box>

            {/* Footer */}
            <Box
                component="footer"
                sx={{
                    py: 6,
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    bgcolor: 'background.default',
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        <Box sx={{ width: { xs: '100%', md: '33.33%' }, flexGrow: { md: 1 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Church size={28} color={theme.palette.primary.main} />
                                <Typography variant="h6" fontWeight="bold">
                                    Light Church
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Votre guide pour découvrir les églises et événements chrétiens près
                                de chez vous.
                            </Typography>
                        </Box>

                        <Box sx={{ width: { xs: '100%', sm: '50%', md: '16.67%' } }}>
                            <Typography variant="subtitle1" fontWeight={600} mb={2}>
                                Navigation
                            </Typography>
                            <Stack spacing={1}>
                                <Button
                                    color="inherit"
                                    onClick={() => navigate('/map')}
                                    sx={{ justifyContent: 'flex-start', color: 'text.secondary' }}
                                >
                                    Carte
                                </Button>
                                <Button
                                    color="inherit"
                                    onClick={() => navigate('/login')}
                                    sx={{ justifyContent: 'flex-start', color: 'text.secondary' }}
                                >
                                    Connexion
                                </Button>
                                <Button
                                    color="inherit"
                                    onClick={() => navigate('/register')}
                                    sx={{ justifyContent: 'flex-start', color: 'text.secondary' }}
                                >
                                    Inscription
                                </Button>
                            </Stack>
                        </Box>

                        <Box sx={{ width: { xs: '100%', sm: '50%', md: '16.67%' } }}>
                            <Typography variant="subtitle1" fontWeight={600} mb={2}>
                                Support
                            </Typography>
                            <Stack spacing={1}>
                                <Button
                                    color="inherit"
                                    sx={{ justifyContent: 'flex-start', color: 'text.secondary' }}
                                >
                                    À propos
                                </Button>
                                <Button
                                    color="inherit"
                                    sx={{ justifyContent: 'flex-start', color: 'text.secondary' }}
                                >
                                    Contact
                                </Button>
                                <Button
                                    color="inherit"
                                    sx={{ justifyContent: 'flex-start', color: 'text.secondary' }}
                                >
                                    FAQ
                                </Button>
                            </Stack>
                        </Box>

                        <Box sx={{ width: { xs: '100%', sm: '50%', md: '16.67%' } }}>
                            <Typography variant="subtitle1" fontWeight={600} mb={2}>
                                Légal
                            </Typography>
                            <Stack spacing={1}>
                                <Button
                                    color="inherit"
                                    sx={{ justifyContent: 'flex-start', color: 'text.secondary' }}
                                >
                                    Confidentialité
                                </Button>
                                <Button
                                    color="inherit"
                                    sx={{ justifyContent: 'flex-start', color: 'text.secondary' }}
                                >
                                    Conditions
                                </Button>
                                <Button
                                    color="inherit"
                                    sx={{ justifyContent: 'flex-start', color: 'text.secondary' }}
                                >
                                    Mentions légales
                                </Button>
                            </Stack>
                        </Box>

                        <Box sx={{ width: { xs: '100%', sm: '50%', md: '16.67%' } }}>
                            <Typography variant="subtitle1" fontWeight={600} mb={2}>
                                Télécharger
                            </Typography>
                            <Stack spacing={1}>
                                <Button
                                    color="inherit"
                                    startIcon={<Apple size={18} />}
                                    sx={{ justifyContent: 'flex-start', color: 'text.secondary' }}
                                >
                                    iOS
                                </Button>
                                <Button
                                    color="inherit"
                                    startIcon={<PlayCircle size={18} />}
                                    sx={{ justifyContent: 'flex-start', color: 'text.secondary' }}
                                >
                                    Android
                                </Button>
                            </Stack>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            © 2026 Light Church. Tous droits réservés.
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Typography variant="body2" color="text.secondary">
                                Fait avec ❤️ pour la communauté chrétienne
                            </Typography>
                        </Stack>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default LandingPage;
