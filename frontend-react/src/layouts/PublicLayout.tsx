import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container,
    useScrollTrigger
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface ElevationScrollProps {
    children: React.ReactElement;
}

/**
 * Optimisation: Elevation sur scroll pour meilleure UX
 */
function ElevationScroll({ children }: ElevationScrollProps) {
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 0
    });

    return React.cloneElement(children, {
        elevation: trigger ? 4 : 0
    });
}

/**
 * PublicLayout - Layout minimaliste pour les pages publiques
 * Optimisé avec React.memo pour éviter les re-renders inutiles
 */
const PublicLayout: React.FC = React.memo(() => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleLoginClick = React.useCallback(() => {
        navigate('/login');
    }, [navigate]);

    const handleDashboardClick = React.useCallback(() => {
        navigate('/dashboard');
    }, [navigate]);

    const handleLogoClick = React.useCallback(() => {
        navigate('/');
    }, [navigate]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <ElevationScroll>
                <AppBar
                    position="fixed"
                    sx={{
                        backgroundColor: 'white',
                        color: 'text.primary',
                        zIndex: (theme) => theme.zIndex.drawer + 1
                    }}
                >
                    <Container maxWidth={false} disableGutters>
                        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
                            {/* Logo / Titre */}
                            <Typography
                                variant="h6"
                                component="div"
                                onClick={handleLogoClick}
                                sx={{
                                    flexGrow: 1,
                                    fontWeight: 700,
                                    color: 'primary.main',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                }}
                            >
                                Light Church
                            </Typography>

                            {/* Bouton Connexion ou Dashboard */}
                            {user ? (
                                <Button
                                    variant="outlined"
                                    onClick={handleDashboardClick}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600
                                    }}
                                >
                                    Tableau de bord
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    startIcon={<LoginIcon />}
                                    onClick={handleLoginClick}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        boxShadow: 2
                                    }}
                                >
                                    Connexion
                                </Button>
                            )}
                        </Toolbar>
                    </Container>
                </AppBar>
            </ElevationScroll>

            {/* Spacer pour compenser l'AppBar fixe */}
            <Toolbar />

            {/* Contenu principal */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
});

PublicLayout.displayName = 'PublicLayout';

export default PublicLayout;
