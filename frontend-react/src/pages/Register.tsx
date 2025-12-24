import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../lib/axios';
import { registerSchema, type RegisterFormData } from '../lib/validationSchemas';
import FormError, { BackendErrors } from '../components/FormError';
import PasswordStrength from '../components/PasswordStrength';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Church } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function Register() {
  const [success, setSuccess] = useState('');
  const [backendErrors, setBackendErrors] = useState<
    Array<{ field: string; message: string }>
  >([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const password = watch('password', '');

  const onSubmit = async (data: RegisterFormData) => {
    setBackendErrors([]);
    setSuccess('');

    try {
      await api.post('/auth/register', {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
      });

      setSuccess('Inscription réussie ! Votre compte est en attente de validation.');
      reset();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setBackendErrors(err.response.data.errors);
      } else {
        setBackendErrors([
          {
            field: 'général',
            message: err.response?.data?.message || 'Une erreur est survenue',
          },
        ]);
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        px: 2,
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 2,
              background: 'linear-gradient(145deg, #1E293B 0%, #0F172A 100%)',
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%)',
                  mb: 2,
                }}
              >
                <Church sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                Rejoindre Light Church
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Créez votre compte pasteur
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Backend Errors */}
              <BackendErrors errors={backendErrors} />

              {/* Success Message */}
              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}{' '}
                  <Link
                    to="/login"
                    style={{
                      color: '#60A5FA',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Se connecter
                  </Link>
                </Alert>
              )}

              {/* First Name & Last Name */}
              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={
                      <>
                        Prénom <span style={{ color: '#EF4444' }}>*</span>
                      </>
                    }
                    {...register('first_name')}
                    error={!!errors.first_name}
                  />
                  <FormError error={errors.first_name} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={
                      <>
                        Nom <span style={{ color: '#EF4444' }}>*</span>
                      </>
                    }
                    {...register('last_name')}
                    error={!!errors.last_name}
                  />
                  <FormError error={errors.last_name} />
                </Grid>
              </Grid>

              {/* Email */}
              <TextField
                fullWidth
                label={
                  <>
                    Email <span style={{ color: '#EF4444' }}>*</span>
                  </>
                }
                type="email"
                {...register('email')}
                error={!!errors.email}
                sx={{ mb: 2.5 }}
                autoComplete="email"
              />
              <FormError error={errors.email} />

              {/* Password */}
              <TextField
                fullWidth
                label={
                  <>
                    Mot de passe <span style={{ color: '#EF4444' }}>*</span>
                  </>
                }
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                error={!!errors.password}
                sx={{ mb: 1 }}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <FormError error={errors.password} />
              <PasswordStrength password={password} />

              {/* Confirm Password */}
              <TextField
                fullWidth
                label={
                  <>
                    Confirmer le mot de passe <span style={{ color: '#EF4444' }}>*</span>
                  </>
                }
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                sx={{ mb: 1, mt: 2.5 }}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <FormError error={errors.confirmPassword} />

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{
                  mt: 3,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1E40AF 0%, #6D28D9 100%)',
                  },
                }}
              >
                {isSubmitting ? "Inscription en cours..." : "S'inscrire"}
              </Button>

              {/* Login Link */}
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mt: 3 }}
              >
                Déjà un compte ?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#60A5FA',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Se connecter
                </Link>
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
