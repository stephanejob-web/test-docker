import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../lib/axios';
import { registerSchema, type RegisterFormData } from '../lib/validationSchemas';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Label } from '../components/ui';
import FormError, { BackendErrors } from '../components/FormError';
import PasswordStrength from '../components/PasswordStrength';
import { motion } from 'framer-motion';

export default function Register() {
    const [success, setSuccess] = useState('');
    const [backendErrors, setBackendErrors] = useState<Array<{ field: string; message: string }>>([]);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        mode: 'onChange', // Validation en temps réel
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
                password: data.password
            });

            setSuccess('Inscription réussie ! Votre compte est en attente de validation.');
            reset();
        } catch (err: any) {
            // Gérer les erreurs structurées du backend
            if (err.response?.data?.errors) {
                setBackendErrors(err.response.data.errors);
            } else {
                setBackendErrors([{ field: 'général', message: err.response?.data?.message || 'Une erreur est survenue' }]);
            }
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                            Rejoindre Light Church
                        </CardTitle>
                        <p className="text-muted text-sm mt-2">Créez votre compte pasteur</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Messages d'erreur backend */}
                            <BackendErrors errors={backendErrors} />

                            {/* Message de succès */}
                            {success && (
                                <div className="p-3 text-sm text-green-400 bg-green-900/20 rounded-md border border-green-800">
                                    {success} <Link to="/login" className="underline font-bold">Se connecter</Link>
                                </div>
                            )}

                            {/* Prénom et Nom */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">
                                        Prénom <span className="text-red-400">*</span>
                                    </Label>
                                    <Input
                                        id="first_name"
                                        {...register('first_name')}
                                        className={errors.first_name ? 'border-red-500' : ''}
                                    />
                                    <FormError error={errors.first_name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last_name">
                                        Nom <span className="text-red-400">*</span>
                                    </Label>
                                    <Input
                                        id="last_name"
                                        {...register('last_name')}
                                        className={errors.last_name ? 'border-red-500' : ''}
                                    />
                                    <FormError error={errors.last_name} />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register('email')}
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                <FormError error={errors.email} />
                            </div>

                            {/* Mot de passe avec indicateur de force */}
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Mot de passe <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register('password')}
                                    className={errors.password ? 'border-red-500' : ''}
                                />
                                <FormError error={errors.password} />
                                <PasswordStrength password={password} />
                            </div>

                            {/* Confirmation mot de passe */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">
                                    Confirmer le mot de passe <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    {...register('confirmPassword')}
                                    className={errors.confirmPassword ? 'border-red-500' : ''}
                                />
                                <FormError error={errors.confirmPassword} />
                            </div>

                            {/* Bouton Submit */}
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 border-0"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire'}
                            </Button>

                            {/* Lien vers login */}
                            <div className="text-center text-sm text-muted">
                                Déjà un compte ?{' '}
                                <Link to="/login" className="text-blue-400 hover:underline font-medium">
                                    Se connecter
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
