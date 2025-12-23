import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Label, Textarea, Checkbox } from '../components/ui';
import { Plus, Save, Calendar, MapPin, Youtube, Image as ImageIcon, Sparkles, X, Church } from 'lucide-react';
import AddressAutocomplete from '../components/AddressAutocomplete';
import DateTimeInput from '../components/DateTimeInput';

export default function MyEvents() {
    const [events, setEvents] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'general' | 'location' | 'options'>('general');

    // Initial State
    const initialFormState = {
        title: '',
        start_datetime: '',
        end_datetime: '',
        description: '',
        // Location
        latitude: '',
        longitude: '',
        address: '',
        street_number: '',
        street_name: '',
        postal_code: '',
        city: '',
        // Details
        speaker_name: '',
        max_seats: '',
        image_url: '',
        // Logistics
        is_free: 1, // Default true
        registration_link: '',
        // Parking
        has_parking: 0,
        parking_capacity: '',
        is_parking_free: 1,
        parking_details: '',
        // Online
        youtube_live: '',
        status: 'PUBLISHED' // Default status
    };

    const [formData, setFormData] = useState(initialFormState);
    const [dateError, setDateError] = useState('');

    const [hasChurch, setHasChurch] = useState<boolean | null>(null);
    const [isChurchComplete, setIsChurchComplete] = useState<boolean>(false);

    useEffect(() => {
        checkChurchAndEvents();
    }, []);

    const checkChurchAndEvents = async () => {
        setLoading(true);
        try {
            // 1. Check if church exists and is complete
            try {
                const { data } = await api.get('/church/my-church');
                setHasChurch(true);

                // Check if church is complete (required fields)
                const isComplete = Boolean(
                    data.church_name &&
                    data.denomination_id &&
                    (data.latitude !== null && data.latitude !== undefined && data.latitude !== '') &&
                    (data.longitude !== null && data.longitude !== undefined && data.longitude !== '') &&
                    (data.details?.address || data.address)
                );
                setIsChurchComplete(isComplete);

                // Debug log pour voir ce qui manque
                if (!isComplete) {
                    console.log('Église incomplète - Champs manquants:', {
                        church_name: data.church_name,
                        denomination_id: data.denomination_id,
                        latitude: data.latitude,
                        longitude: data.longitude,
                        address: data.details?.address || data.address
                    });
                }
            } catch (error: any) {
                if (error.response && error.response.status === 404) {
                    setHasChurch(false);
                    setIsChurchComplete(false);
                    setLoading(false);
                    return; // Stop here if no church
                }
            }

            // 2. Fetch Events if church exists
            const response = await api.get('/church/my-events');
            setEvents(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleCheckboxChange = (id: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [id]: checked ? 1 : 0 }));
    };

    const handleEdit = async (id: number) => {
        try {
            const { data } = await api.get(`/church/events/${id}`);
            // Normalize data for form
            setFormData({
                ...initialFormState,
                ...data,
                // Ensure dates are formatted for datetime-local input (YYYY-MM-DDTHH:mm)
                start_datetime: data.start_datetime ? new Date(data.start_datetime).toISOString().slice(0, 16) : '',
                end_datetime: data.end_datetime ? new Date(data.end_datetime).toISOString().slice(0, 16) : '',
                // Ensure booleans/checkboxes are strictly 1 or 0
                has_parking: data.has_parking ? 1 : 0,
                is_parking_free: data.is_parking_free ? 1 : 0,
                is_free: data.is_free ? 1 : 0
            });
            setEditingId(id);
            setShowForm(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error(error);
            alert("Impossible de charger l'événement");
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const churchRes = await api.get('/church/my-church');
            const churchId = churchRes.data.id;

            if (!churchId) {
                alert("Veuillez d'abord créer votre fiche église.");
                setLoading(false);
                return;
            }

            // Préparer les données avec conversion des types
            const payload = {
                ...formData,
                church_id: churchId,
                language_id: 10, // Français par défaut
                // Convertir latitude/longitude en floats
                latitude: parseFloat(formData.latitude) || 0,
                longitude: parseFloat(formData.longitude) || 0,
                // Convertir 0/1 en booleans
                has_parking: formData.has_parking === 1,
                is_parking_free: formData.is_parking_free === 1,
                is_free: formData.is_free === 1,
                // Convertir max_seats et parking_capacity en integers si présents
                max_seats: formData.max_seats ? parseInt(formData.max_seats as string) : null,
                parking_capacity: formData.parking_capacity ? parseInt(formData.parking_capacity as string) : null,
                // Convertir les URLs vides en undefined pour éviter les erreurs de validation
                registration_link: formData.registration_link || undefined,
                youtube_live: formData.youtube_live || undefined
            };

            if (editingId) {
                await api.put(`/church/events/${editingId}`, payload);
                alert('Événement mis à jour avec succès !');
            } else {
                await api.post('/church/events', payload);
                alert('Événement créé avec succès !');
            }

            setShowForm(false);
            setEditingId(null);
            setFormData(initialFormState);
            checkChurchAndEvents();
        } catch (error: any) {
            console.error('Erreur complète:', error);
            if (error.response?.data?.errors) {
                const errorMessages = error.response.data.errors.map((e: any) => `${e.field}: ${e.message}`).join('\n');
                alert(`Erreurs de validation:\n${errorMessages}`);
            } else {
                alert('Erreur lors de la création');
            }
        } finally {
            setLoading(false);
        }
    };

    const TabButton = ({ id, label, icon: Icon }: any) => (
        <button
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
        >
            <Icon className="h-4 w-4" /> {label}
        </button>
    );

    if (loading) return <div className="p-8 text-white">Chargement...</div>;

    if (hasChurch === false) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full"></div>
                    <Church className="relative h-24 w-24 text-white p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl" />
                </div>
                <div className="space-y-2 max-w-md">
                    <h1 className="text-3xl font-bold text-white">Bienvenue !</h1>
                    <p className="text-gray-400">
                        Pour commencer à publier des événements, vous devez d'abord créer la fiche de votre église.
                    </p>
                </div>
                <Button
                    onClick={() => window.location.href = '/dashboard/my-church'}
                    className="bg-white text-blue-900 hover:bg-gray-100 font-bold px-8 py-6 text-lg rounded-full shadow-lg hover:scale-105 transition-transform"
                >
                    <Plus className="mr-2 h-5 w-5" /> Créer mon Église
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Mes Événements</h1>
                    <p className="text-gray-400 mt-1">Gérez votre calendrier et vos publications.</p>
                </div>
                <Button
                    onClick={() => {
                        setShowForm(!showForm);
                        if (showForm) {
                            setEditingId(null);
                            setFormData(initialFormState);
                        }
                    }}
                    disabled={!isChurchComplete}
                    className={showForm ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"}
                >
                    {showForm ? <><X className="mr-2 h-4 w-4" /> Annuler</> : <><Plus className="mr-2 h-4 w-4" /> Nouvel Événement</>}
                </Button>
            </div>

            {/* Warning if church is incomplete */}
            {hasChurch && !isChurchComplete && (
                <Card className="bg-yellow-500/10 border-yellow-500/50">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <Church className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                                <h3 className="font-bold text-yellow-400 mb-2">Informations de l'église incomplètes</h3>
                                <p className="text-gray-300 text-sm mb-4">
                                    Pour créer des événements, vous devez compléter les informations obligatoires de votre église : nom, dénomination, adresse complète et coordonnées GPS (utilisez la recherche d'adresse dans l'onglet "Mon Église").
                                </p>
                                <Button
                                    onClick={() => window.location.href = '/dashboard/my-church'}
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                >
                                    <Church className="mr-2 h-4 w-4" /> Compléter mon Église
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {showForm ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* FORM SIDEBAR / STEPS */}
                    <div className="hidden lg:block space-y-2">
                        <div className="p-4 rounded-xl bg-surface border border-gray-800 sticky top-4">
                            <h3 className="font-bold text-white mb-4">Étapes</h3>
                            <div className="space-y-1">
                                <TabButton id="general" label="Général" icon={Calendar} />
                                <TabButton id="location" label="Lieu" icon={MapPin} />
                                <TabButton id="options" label="Options" icon={Sparkles} />
                            </div>
                        </div>
                    </div>

                    {/* FORM CONTENT */}
                    <div className="lg:col-span-3">
                        <Card className="bg-surface border-gray-800 shadow-xl">
                            <CardHeader className="border-b border-gray-800 pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle>{editingId ? "Modification" : "Création"} d'événement</CardTitle>
                                    <div className="lg:hidden flex gap-2">
                                        {/* Mobile Tabs */}
                                        <button onClick={() => setActiveTab('general')} className={`p-2 rounded ${activeTab === 'general' ? 'bg-blue-600' : 'bg-gray-800'}`}><Calendar className="h-4 w-4" /></button>
                                        <button onClick={() => setActiveTab('location')} className={`p-2 rounded ${activeTab === 'location' ? 'bg-blue-600' : 'bg-gray-800'}`}><MapPin className="h-4 w-4" /></button>
                                        <button onClick={() => setActiveTab('options')} className={`p-2 rounded ${activeTab === 'options' ? 'bg-blue-600' : 'bg-gray-800'}`}><Sparkles className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">

                                    {/* TAB: GENERAL */}
                                    {activeTab === 'general' && (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label>Titre *</Label>
                                                    <Input id="title" value={formData.title} onChange={handleChange} required placeholder="Ex: Culte de Louange" className="bg-background border-gray-700 focus:border-blue-500" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Intervenant</Label>
                                                    <Input id="speaker_name" value={formData.speaker_name} onChange={handleChange} placeholder="Ex: Pasteur John Doe" className="bg-background border-gray-700" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <DateTimeInput
                                                    label="Date de début"
                                                    value={formData.start_datetime}
                                                    onChange={(value) => {
                                                        setFormData(prev => ({ ...prev, start_datetime: value }));
                                                        // Validate: check if end is before new start
                                                        if (formData.end_datetime && value && new Date(value) >= new Date(formData.end_datetime)) {
                                                            setDateError('La date de fin doit être après la date de début');
                                                        } else {
                                                            setDateError('');
                                                        }
                                                    }}
                                                    required
                                                />

                                                <DateTimeInput
                                                    label="Date de fin"
                                                    value={formData.end_datetime}
                                                    onChange={(value) => {
                                                        setFormData(prev => ({ ...prev, end_datetime: value }));
                                                        // Validate: check if end is before start
                                                        if (formData.start_datetime && value && new Date(value) <= new Date(formData.start_datetime)) {
                                                            setDateError('La date de fin doit être après la date de début');
                                                        } else {
                                                            setDateError('');
                                                        }
                                                    }}
                                                    required
                                                    minDateTime={formData.start_datetime}
                                                    error={dateError}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Statut</Label>
                                                <select
                                                    id="status"
                                                    value={formData.status}
                                                    onChange={handleChange}
                                                    className="flex h-10 w-full rounded-md border border-gray-700 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="PUBLISHED">Publié</option>
                                                    <option value="DRAFT">Brouillon</option>
                                                    <option value="CANCELLED">Annulé</option>
                                                    <option value="COMPLETED">Terminé</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Textarea id="description" value={formData.description} onChange={handleChange} rows={5} placeholder="Détails de l'événement..." className="bg-background border-gray-700" />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Image (URL)</Label>
                                                <div className="flex gap-2">
                                                    <Input id="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://..." className="bg-background border-gray-700" />
                                                    <div className="h-10 w-10 bg-gray-800 rounded flex items-center justify-center border border-gray-700 overflow-hidden">
                                                        {formData.image_url ? <img src={formData.image_url} alt="Preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-gray-500" />}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB: LOCATION */}
                                    {activeTab === 'location' && (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                            {/* AddressAutocomplete */}
                                            <AddressAutocomplete
                                                defaultValue={formData.address || ''}
                                                onAddressSelect={(addressData) => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        address: addressData.full_address,
                                                        street_number: addressData.street_number,
                                                        street_name: addressData.street_name,
                                                        postal_code: addressData.postal_code,
                                                        city: addressData.city,
                                                        latitude: addressData.latitude.toString(),
                                                        longitude: addressData.longitude.toString()
                                                    }));
                                                }}
                                            />

                                            {/* Champs d'adresse détaillés (lecture seule, auto-remplis) */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/5 rounded-lg">
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-gray-500">N°</Label>
                                                    <Input
                                                        value={formData.street_number}
                                                        readOnly
                                                        className="bg-gray-800/50 text-gray-400 border-gray-700"
                                                        placeholder="Auto"
                                                    />
                                                </div>
                                                <div className="space-y-1 col-span-2 md:col-span-3">
                                                    <Label className="text-xs text-gray-500">Rue</Label>
                                                    <Input
                                                        value={formData.street_name}
                                                        readOnly
                                                        className="bg-gray-800/50 text-gray-400 border-gray-700"
                                                        placeholder="Auto-rempli"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-gray-500">Code Postal</Label>
                                                    <Input
                                                        value={formData.postal_code}
                                                        readOnly
                                                        className="bg-gray-800/50 text-gray-400 border-gray-700"
                                                        placeholder="Auto"
                                                    />
                                                </div>
                                                <div className="space-y-1 col-span-2 md:col-span-3">
                                                    <Label className="text-xs text-gray-500">Ville</Label>
                                                    <Input
                                                        value={formData.city}
                                                        readOnly
                                                        className="bg-gray-800/50 text-gray-400 border-gray-700"
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
                                                        value={formData.latitude}
                                                        readOnly
                                                        className="bg-gray-800/50 text-gray-400 font-mono text-sm border-gray-700"
                                                        placeholder="Auto-calculé"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-gray-500 flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" /> Longitude
                                                    </Label>
                                                    <Input
                                                        value={formData.longitude}
                                                        readOnly
                                                        className="bg-gray-800/50 text-gray-400 font-mono text-sm border-gray-700"
                                                        placeholder="Auto-calculé"
                                                    />
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <Checkbox id="has_parking" checked={formData.has_parking === 1} onCheckedChange={(c) => handleCheckboxChange('has_parking', c as boolean)} />
                                                    <Label htmlFor="has_parking" className="cursor-pointer font-medium">Ce lieu dispose d'un parking</Label>
                                                </div>

                                                {formData.has_parking === 1 && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7 animate-in slide-in-from-top-2">
                                                        <div className="space-y-2">
                                                            <Label>Capacité</Label>
                                                            <Input id="parking_capacity" type="number" value={formData.parking_capacity} onChange={handleChange} className="bg-background border-gray-700" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Info Accès</Label>
                                                            <Input id="parking_details" value={formData.parking_details} onChange={handleChange} placeholder="Code, entrée..." className="bg-background border-gray-700" />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox id="is_parking_free" checked={formData.is_parking_free === 1} onCheckedChange={(c) => handleCheckboxChange('is_parking_free', c as boolean)} />
                                                            <Label htmlFor="is_parking_free">Parking Gratuit</Label>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB: OPTIONS */}
                                    {activeTab === 'options' && (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label>Places Max</Label>
                                                    <Input id="max_seats" type="number" value={formData.max_seats} onChange={handleChange} className="bg-background border-gray-700" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>YouTube Live</Label>
                                                    <div className="relative">
                                                        <Youtube className="absolute left-3 top-2.5 h-4 w-4 text-red-500" />
                                                        <Input id="youtube_live" value={formData.youtube_live} onChange={handleChange} placeholder="URL du live..." className="pl-9 bg-background border-gray-700" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <Checkbox id="is_free" checked={formData.is_free === 1} onCheckedChange={(c) => handleCheckboxChange('is_free', c as boolean)} />
                                                    <Label htmlFor="is_free" className="font-medium">Entrée Gratuite</Label>
                                                </div>
                                                {formData.is_free === 0 && (
                                                    <div className="pl-7 animate-in slide-in-from-top-2">
                                                        <Label>Lien Billetterie</Label>
                                                        <Input id="registration_link" value={formData.registration_link} onChange={handleChange} placeholder="https://..." className="bg-background border-gray-700 mt-1" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pt-6 border-t border-gray-800 flex justify-end gap-3">
                                                <Button type="submit" disabled={loading} className="px-8 bg-green-600 hover:bg-green-700">
                                                    <Save className="mr-2 h-4 w-4" /> {loading ? 'Enregistrement...' : "Publier l'événement"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Navigation Buttons for Form */}
                                    <div className="flex justify-between pt-4">
                                        {activeTab !== 'general' && <Button type="button" variant="ghost" onClick={() => setActiveTab(activeTab === 'options' ? 'location' : 'general')}>Précédent</Button>}
                                        {activeTab !== 'options' && <div className="ml-auto"><Button type="button" onClick={() => setActiveTab(activeTab === 'general' ? 'location' : 'options')}>Suivant</Button></div>}
                                    </div>

                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                /* EVENT LIST GRID */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <Card key={event.id} className="group overflow-hidden bg-surface border-gray-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl">
                            {/* Image Placeholder or Actual Image */}
                            <div className="h-48 w-full bg-gray-900 relative">
                                {event.image_url ? (
                                    <img src={event.image_url} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center">
                                        <Calendar className="h-12 w-12 text-white/20" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md ${event.status === 'PUBLISHED' ? 'bg-green-500/80 text-white' :
                                        event.status === 'DRAFT' ? 'bg-yellow-500/80 text-white' :
                                            event.status === 'COMPLETED' ? 'bg-gray-500/80 text-white' : 'bg-red-500/80 text-white'
                                        }`}>
                                        {event.status === 'PUBLISHED' ? 'Publié' : event.status === 'DRAFT' ? 'Brouillon' : event.status === 'COMPLETED' ? 'Terminé' : 'Annulé'}
                                    </span>
                                </div>
                            </div>

                            <CardContent className="p-5">
                                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">{event.title}</h3>
                                <div className="space-y-1 mb-4">
                                    <p className="text-sm text-gray-400 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-blue-500" />
                                        {new Date(event.start_datetime).toLocaleDateString()} à {new Date(event.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="text-sm text-gray-400 flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-purple-500" />
                                        {event.address || "Lieu non précisé"}
                                    </p>
                                </div>
                                <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-gray-700" onClick={() => handleEdit(event.id)}>
                                    Modifier
                                </Button>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Add New Card (Empty State) */}
                    <button
                        onClick={() => { setShowForm(true); setEditingId(null); setFormData(initialFormState); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="h-full min-h-[300px] border-2 border-dashed border-gray-800 rounded-xl flex flex-col items-center justify-center p-6 text-gray-500 hover:text-blue-400 hover:border-blue-500/50 hover:bg-white/5 transition-all text-center"
                    >
                        <div className="h-16 w-16 rounded-full bg-gray-900 flex items-center justify-center mb-4">
                            <Plus className="h-8 w-8" />
                        </div>
                        <span className="font-bold">Créer un nouvel événement</span>
                        <span className="text-sm opacity-60 mt-1">Planifiez votre prochain culte</span>
                    </button>
                </div>
            )}
        </div>
    );
}
