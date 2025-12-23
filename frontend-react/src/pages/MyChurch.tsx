import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../lib/axios';
import { Button, Input, Card, CardContent, Label } from '../components/ui';
import { Save, Plus, Trash2, MapPin } from 'lucide-react';
import { ImageUpload } from '../components/ImageUpload';
import { churchSchema, type ChurchFormData } from '../lib/validationSchemas';
import FormError, { BackendErrors } from '../components/FormError';
import AddressAutocomplete from '../components/AddressAutocomplete';

// Types for reference data
interface Denomination { id: number; name: string; }
interface ActivityType { id: number; label_fr: string; }

export default function MyChurch() {
    const [activeTab, setActiveTab] = useState('general');
    const [success, setSuccess] = useState('');
    const [backendErrors, setBackendErrors] = useState<Array<{ field: string; message: string }>>([]);

    // Reference Data
    const [denominations, setDenominations] = useState<Denomination[]>([]);
    const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);

    // React Hook Form with Zod validation
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ChurchFormData>({
        resolver: zodResolver(churchSchema),
        mode: 'onChange', // Real-time validation
        defaultValues: {
            socials: [],
            schedules: [],
        }
    });

    // useFieldArray for dynamic arrays
    const { fields: socialFields, append: appendSocial, remove: removeSocial } = useFieldArray({
        control,
        name: 'socials',
    });

    const { fields: scheduleFields, append: appendSchedule, remove: removeSchedule } = useFieldArray({
        control,
        name: 'schedules',
    });

    const has_parking = watch('has_parking');

    useEffect(() => {
        fetchReferences();
        fetchChurchData();
    }, []);

    const fetchReferences = async () => {
        try {
            const [denoms, types] = await Promise.all([
                api.get('/settings/denominations'),
                api.get('/settings/activity_types')
            ]);
            setDenominations(denoms.data);
            setActivityTypes(types.data);
        } catch (error) { console.error('Error fetching refs', error); }
    };

    const fetchChurchData = async () => {
        try {
            const { data } = await api.get('/church/my-church');
            if (data && data.id) {
                // Reset form with fetched data
                reset({
                    church_name: data.church_name,
                    description: data.details.description || '',
                    denomination_id: data.denomination_id,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    address: data.details.address || '',
                    street_number: data.details.street_number || '',
                    street_name: data.details.street_name || '',
                    postal_code: data.details.postal_code || '',
                    city: data.details.city || '',
                    phone: data.details.phone || '',
                    website: data.details.website || '',
                    pastor_name: data.details.pastor_name || '',
                    has_parking: !!data.details.has_parking,
                    parking_capacity: data.details.parking_capacity || null,
                    is_parking_free: !!data.details.is_parking_free,
                    logo_url: data.details.logo_url || '',
                    socials: data.socials || [],
                    schedules: data.schedules || [],
                });
            }
        } catch (error) {
            console.error('Error fetching church:', error);
        }
    };

    const onSubmit = async (formData: ChurchFormData) => {
        setBackendErrors([]);
        setSuccess('');

        try {
            await api.post('/church/my-church', formData);
            setSuccess('Sauvegardé avec succès !');
        } catch (err: any) {
            // Handle structured backend errors
            if (err.response?.data?.errors) {
                setBackendErrors(err.response.data.errors);
            } else {
                setBackendErrors([{ field: 'général', message: err.response?.data?.message || 'Une erreur est survenue' }]);
            }
        }
    };

    const platforms = ['FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'WHATSAPP', 'LINKEDIN'];
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    // Traduction des jours en français
    const daysTranslation: Record<string, string> = {
        MONDAY: 'Lundi',
        TUESDAY: 'Mardi',
        WEDNESDAY: 'Mercredi',
        THURSDAY: 'Jeudi',
        FRIDAY: 'Vendredi',
        SATURDAY: 'Samedi',
        SUNDAY: 'Dimanche'
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-5xl mx-auto pb-8">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold">Mon Église</h1>
                <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 h-12 px-6 text-base">
                    <Save className="mr-2 h-5 w-5" /> {isSubmitting ? 'Sauvegarde...' : 'Tout Sauvegarder'}
                </Button>
            </div>

            {/* Backend Errors */}
            <BackendErrors errors={backendErrors} />

            {/* Success Message */}
            {success && (
                <div className="p-3 text-sm text-green-400 bg-green-900/20 rounded-md border border-green-800">
                    {success}
                </div>
            )}

            {/* Tabs Header */}
            <div className="flex border-b border-gray-700 space-x-4">
                {['general', 'details', 'socials', 'schedules'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-white'}`}
                    >
                        {tab === 'general' ? 'Général' : tab === 'details' ? 'Détails & Infos' : tab === 'socials' ? 'Réseaux Sociaux' : 'Horaires'}
                    </button>
                ))}
            </div>

            <div className="mt-6">
                {/* GENERAL TAB */}
                {activeTab === 'general' && (
                    <Card>
                        <CardContent className="space-y-8 pt-8 px-8">
                            {/* SECTION 1: ADRESSE (PRIORITAIRE) */}
                            <div className="pb-8 border-b border-gray-800">
                                <h2 className="text-2xl font-semibold mb-6 text-primary">📍 Localisation de l'Église</h2>
                                <div className="space-y-4">
                                    {/* Autocomplete d'adresse */}
                                    <AddressAutocomplete
                                        defaultValue={watch('address') || ''}
                                        onAddressSelect={(addressData) => {
                                            setValue('address', addressData.full_address);
                                            setValue('street_number', addressData.street_number);
                                            setValue('street_name', addressData.street_name);
                                            setValue('postal_code', addressData.postal_code);
                                            setValue('city', addressData.city);
                                            setValue('latitude', addressData.latitude);
                                            setValue('longitude', addressData.longitude);
                                        }}
                                        error={errors.address?.message}
                                    />

                                    {/* Champs d'adresse détaillés (lecture seule, auto-remplis) */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/5 rounded-lg">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-500">N°</Label>
                                            <Input
                                                {...register('street_number')}
                                                readOnly
                                                className="bg-gray-800/50 text-gray-400"
                                                placeholder="Auto"
                                            />
                                        </div>
                                        <div className="space-y-1 col-span-2 md:col-span-3">
                                            <Label className="text-xs text-gray-500">Rue</Label>
                                            <Input
                                                {...register('street_name')}
                                                readOnly
                                                className="bg-gray-800/50 text-gray-400"
                                                placeholder="Auto-rempli"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-500">Code Postal</Label>
                                            <Input
                                                {...register('postal_code')}
                                                readOnly
                                                className="bg-gray-800/50 text-gray-400"
                                                placeholder="Auto"
                                            />
                                        </div>
                                        <div className="space-y-1 col-span-2 md:col-span-3">
                                            <Label className="text-xs text-gray-500">Ville</Label>
                                            <Input
                                                {...register('city')}
                                                readOnly
                                                className="bg-gray-800/50 text-gray-400"
                                                placeholder="Auto-remplie"
                                            />
                                        </div>
                                    </div>

                                    {/* Coordonnées GPS (lecture seule, auto-remplies) */}
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-blue-900/10 rounded-lg border border-blue-800/30">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-500 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> Latitude
                                            </Label>
                                            <Input
                                                {...register('latitude', { valueAsNumber: true })}
                                                readOnly
                                                className="bg-gray-800/50 text-gray-400 font-mono text-sm"
                                                placeholder="Auto-calculé"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-gray-500 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> Longitude
                                            </Label>
                                            <Input
                                                {...register('longitude', { valueAsNumber: true })}
                                                readOnly
                                                className="bg-gray-800/50 text-gray-400 font-mono text-sm"
                                                placeholder="Auto-calculé"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: INFORMATIONS DE BASE */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-white">⛪ Informations Générales</h2>

                                <div className="space-y-3">
                                    <Label htmlFor="church_name" className="text-base">
                                        Nom de l'église <span className="text-red-400">*</span>
                                    </Label>
                                    <Input
                                        id="church_name"
                                        {...register('church_name')}
                                        className={`h-12 text-base ${errors.church_name ? 'border-red-500' : ''}`}
                                    />
                                    <FormError error={errors.church_name} />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="denomination_id" className="text-base">
                                        Dénomination <span className="text-red-400">*</span>
                                    </Label>
                                    <select
                                        id="denomination_id"
                                        {...register('denomination_id', { valueAsNumber: true })}
                                        className={`w-full h-12 rounded-md border ${errors.denomination_id ? 'border-red-500' : 'border-input'} bg-background px-4 py-2 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
                                    >
                                        <option value="">Choisir...</option>
                                        {denominations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                    <FormError error={errors.denomination_id} />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="description" className="text-base">Description Courte</Label>
                                    <Input
                                        id="description"
                                        {...register('description')}
                                        className={`h-12 text-base ${errors.description ? 'border-red-500' : ''}`}
                                        placeholder="Présentez votre église en quelques mots..."
                                    />
                                    <FormError error={errors.description} />
                                </div>

                                <div className="space-y-2">
                                    <Label>Logo de l'Église</Label>
                                    <ImageUpload
                                        value={watch('logo_url') || ''}
                                        onChange={(url) => setValue('logo_url', url)}
                                    />
                                    <FormError error={errors.logo_url} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* DETAILS TAB */}
                {activeTab === 'details' && (
                    <Card>
                        <CardContent className="space-y-6 pt-8 px-8">
                            <div className="space-y-3">
                                <Label htmlFor="pastor_name" className="text-base">Nom du Pasteur Principal</Label>
                                <Input
                                    id="pastor_name"
                                    {...register('pastor_name')}
                                    className={`h-12 text-base ${errors.pastor_name ? 'border-red-500' : ''}`}
                                />
                                <FormError error={errors.pastor_name} />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="address" className="text-base">Adresse Complète</Label>
                                <Input
                                    id="address"
                                    {...register('address')}
                                    className={`h-12 text-base ${errors.address ? 'border-red-500' : ''}`}
                                />
                                <FormError error={errors.address} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="phone" className="text-base">Téléphone</Label>
                                    <Input
                                        id="phone"
                                        {...register('phone')}
                                        placeholder="+33 1 23 45 67 89"
                                        className={`h-12 text-base ${errors.phone ? 'border-red-500' : ''}`}
                                    />
                                    <FormError error={errors.phone} />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="website" className="text-base">Site Web</Label>
                                    <Input
                                        id="website"
                                        {...register('website')}
                                        placeholder="https://..."
                                        className={`h-12 text-base ${errors.website ? 'border-red-500' : ''}`}
                                    />
                                    <FormError error={errors.website} />
                                </div>
                            </div>

                            <div className="border-t border-gray-800 pt-6 mt-6 space-y-5">
                                <h3 className="text-lg font-semibold text-white">🚗 Parking</h3>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        {...register('has_parking')}
                                        className="h-5 w-5 rounded border-gray-300"
                                    />
                                    <Label className="text-base">Dispose d'un parking ?</Label>
                                </div>
                                {has_parking && (
                                    <div className="grid grid-cols-2 gap-6 pl-8">
                                        <div className="space-y-3">
                                            <Label htmlFor="parking_capacity" className="text-base">Capacité (places)</Label>
                                            <Input
                                                id="parking_capacity"
                                                type="number"
                                                {...register('parking_capacity', { valueAsNumber: true })}
                                                className={`h-12 text-base ${errors.parking_capacity ? 'border-red-500' : ''}`}
                                            />
                                            <FormError error={errors.parking_capacity} />
                                        </div>
                                        <div className="flex items-center space-x-3 pt-10">
                                            <input
                                                type="checkbox"
                                                {...register('is_parking_free')}
                                                className="h-5 w-5"
                                            />
                                            <Label className="text-base">Gratuit ?</Label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* SOCIALS TAB */}
                {activeTab === 'socials' && (
                    <Card>
                        <CardContent className="pt-8 px-8">
                            <div className="space-y-5">
                                {socialFields.map((field, idx) => (
                                    <div key={field.id} className="flex flex-col gap-3 p-6 bg-white/5 rounded-lg">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-48">
                                                <Label className="text-sm text-gray-400 mb-2 block">Plateforme</Label>
                                                <select
                                                    {...register(`socials.${idx}.platform` as const)}
                                                    className={`h-12 rounded-md border ${errors.socials?.[idx]?.platform ? 'border-red-500' : 'border-input'} bg-background px-4 py-2 text-base focus:outline-none w-full`}
                                                >
                                                    {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                                <FormError error={errors.socials?.[idx]?.platform} />
                                            </div>
                                            <div className="flex-1">
                                                <Label className="text-sm text-gray-400 mb-2 block">URL</Label>
                                                <Input
                                                    {...register(`socials.${idx}.url` as const)}
                                                    placeholder="https://..."
                                                    className={`h-12 text-base ${errors.socials?.[idx]?.url ? 'border-red-500' : ''}`}
                                                />
                                                <FormError error={errors.socials?.[idx]?.url} />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="text-red-400 mt-7"
                                                onClick={() => removeSocial(idx)}
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="mt-6 w-full border-dashed h-12 text-base"
                                onClick={() => appendSocial({ platform: 'FACEBOOK', url: '' })}
                            >
                                <Plus className="mr-2 h-5 w-5" /> Ajouter un réseau
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* SCHEDULES TAB */}
                {activeTab === 'schedules' && (
                    <Card>
                        <CardContent className="pt-8 px-8">
                            <div className="space-y-5">
                                {scheduleFields.map((field, idx) => (
                                    <div key={field.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center p-6 bg-white/5 rounded-lg">
                                        <div className="flex-1 w-full md:w-auto">
                                            <Label className="text-sm text-gray-400 mb-2 block">Jour <span className="text-red-400">*</span></Label>
                                            <select
                                                {...register(`schedules.${idx}.day_of_week` as const)}
                                                className={`w-full h-12 rounded-md border ${errors.schedules?.[idx]?.day_of_week ? 'border-red-500' : 'border-input'} bg-background px-4 py-2 text-base`}
                                            >
                                                {days.map(d => <option key={d} value={d}>{daysTranslation[d]}</option>)}
                                            </select>
                                            <FormError error={errors.schedules?.[idx]?.day_of_week} />
                                        </div>
                                        <div className="w-full md:w-40">
                                            <Label className="text-sm text-gray-400 mb-2 block">Heure <span className="text-red-400">*</span></Label>
                                            <Input
                                                type="time"
                                                {...register(`schedules.${idx}.start_time` as const)}
                                                className={`h-12 text-base ${errors.schedules?.[idx]?.start_time ? 'border-red-500' : ''}`}
                                            />
                                            <FormError error={errors.schedules?.[idx]?.start_time} />
                                        </div>
                                        <div className="flex-1 w-full md:w-auto">
                                            <Label className="text-sm text-gray-400 mb-2 block">Type d'activité <span className="text-red-400">*</span></Label>
                                            <select
                                                {...register(`schedules.${idx}.activity_type_id` as const, { valueAsNumber: true })}
                                                className={`w-full h-12 rounded-md border ${errors.schedules?.[idx]?.activity_type_id ? 'border-red-500' : 'border-input'} bg-background px-4 py-2 text-base`}
                                            >
                                                {activityTypes.map(t => <option key={t.id} value={t.id}>{t.label_fr}</option>)}
                                            </select>
                                            <FormError error={errors.schedules?.[idx]?.activity_type_id} />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-red-400 mt-6 md:mt-8"
                                            onClick={() => removeSchedule(idx)}
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="mt-6 w-full border-dashed h-12 text-base"
                                onClick={() => appendSchedule({ day_of_week: 'SUNDAY', start_time: '10:00', activity_type_id: activityTypes[0]?.id || 1 })}
                            >
                                <Plus className="mr-2 h-5 w-5" /> Ajouter un horaire
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </form>
    );
}
