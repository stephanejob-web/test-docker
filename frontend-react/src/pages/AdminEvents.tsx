import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label, Textarea, Checkbox } from '../components/ui';
import { Trash2, Edit, Save, X, Search, ChevronLeft, ChevronRight, Calendar, MapPin, Sparkles, Play, CheckCircle } from 'lucide-react';
import { TableSkeleton } from '../components/Loader';

export default function AdminEvents() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'general' | 'location' | 'options'>('general');

    // Filter & Pagination State
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEvents, setTotalEvents] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchEvents();
        }, 300); // Simple debounce for search
        return () => clearTimeout(timer);
    }, [search, statusFilter, page]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/events', {
                params: {
                    page,
                    limit: 10,
                    search,
                    status: statusFilter
                }
            });
            // Handle both legacy array format (safety) and new paginated format
            if (Array.isArray(data)) {
                setEvents(data);
            } else {
                setEvents(data.data);
                setTotalPages(data.meta.totalPages);
                setTotalEvents(data.meta.total);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const deleteEvent = async (id: number) => {
        if (!confirm('Supprimer cet événement ?')) return;
        try {
            await api.delete(`/admin/events/${id}`);
            fetchEvents();
        } catch (e) { alert('Erreur suppression'); }
    };

    const updateEventStatus = async (id: number, newStatus: string) => {
        try {
            await api.put(`/admin/events/${id}`, { status: newStatus });
            fetchEvents();
        } catch (e) {
            alert('Erreur lors de la mise à jour du statut');
        }
    };

    const handleEdit = async (id: number) => {
        try {
            const { data } = await api.get(`/admin/events/${id}`);
            setFormData({
                // Events table
                title: data.title || '',
                start_datetime: data.start_datetime ? new Date(data.start_datetime).toISOString().slice(0, 16) : '',
                end_datetime: data.end_datetime ? new Date(data.end_datetime).toISOString().slice(0, 16) : '',
                latitude: data.latitude || '',
                longitude: data.longitude || '',
                status: data.status || 'DRAFT',
                church_id: data.church_id || '',
                // Event_details table
                description: data.details?.description || '',
                address: data.details?.address || '',
                street_number: data.details?.street_number || '',
                street_name: data.details?.street_name || '',
                postal_code: data.details?.postal_code || '',
                city: data.details?.city || '',
                speaker_name: data.details?.speaker_name || '',
                max_seats: data.details?.max_seats || '',
                image_url: data.details?.image_url || '',
                is_free: data.details?.is_free ? 1 : 0,
                registration_link: data.details?.registration_link || '',
                youtube_live: data.details?.youtube_live || '',
                has_parking: data.details?.has_parking ? 1 : 0,
                parking_capacity: data.details?.parking_capacity || '',
                is_parking_free: data.details?.is_parking_free ? 1 : 0,
                parking_details: data.details?.parking_details || ''
            });
            setEditingId(id);
            setActiveTab('general');
        } catch (e) { alert('Erreur chargement'); }
    };

    const handleSave = async () => {
        if (!editingId) return;
        try {
            await api.put(`/admin/events/${editingId}`, formData);
            alert('Sauvegardé !');
            setEditingId(null);
            fetchEvents();
        } catch (e) { alert('Erreur sauvegarde'); }
    };

    const updateField = (field: string, value: any) => setFormData({ ...formData, [field]: value });

    const handleCheckboxChange = (id: string, checked: boolean) => {
        setFormData((prev: any) => ({ ...prev, [id]: checked ? 1 : 0 }));
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Modération Événements</h1>

            {/* MODAL D'ÉDITION COMPLET */}
            {editingId && formData && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
                    <Card className="w-full max-w-4xl bg-surface border-gray-700 my-8 max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex flex-row justify-between sticky top-0 bg-surface z-10 border-b border-gray-700">
                            <CardTitle>Édition Événement #{editingId}</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}><X className="h-6 w-6" /></Button>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {/* TABS */}
                            <div className="flex border-b border-gray-700 gap-4">
                                <button
                                    onClick={() => setActiveTab('general')}
                                    className={`pb-2 px-4 flex items-center gap-2 transition-colors ${activeTab === 'general' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-300'}`}
                                >
                                    <Calendar className="h-4 w-4" /> Général
                                </button>
                                <button
                                    onClick={() => setActiveTab('location')}
                                    className={`pb-2 px-4 flex items-center gap-2 transition-colors ${activeTab === 'location' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-300'}`}
                                >
                                    <MapPin className="h-4 w-4" /> Lieu
                                </button>
                                <button
                                    onClick={() => setActiveTab('options')}
                                    className={`pb-2 px-4 flex items-center gap-2 transition-colors ${activeTab === 'options' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-300'}`}
                                >
                                    <Sparkles className="h-4 w-4" /> Options
                                </button>
                            </div>

                            {/* TAB: GÉNÉRAL */}
                            {activeTab === 'general' && (
                                <div className="space-y-4">
                                    <div>
                                        <Label>Titre *</Label>
                                        <Input value={formData.title} onChange={e => updateField('title', e.target.value)} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Date de début *</Label>
                                            <Input type="datetime-local" value={formData.start_datetime} onChange={e => updateField('start_datetime', e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>Date de fin *</Label>
                                            <Input type="datetime-local" value={formData.end_datetime} onChange={e => updateField('end_datetime', e.target.value)} />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Intervenant</Label>
                                        <Input value={formData.speaker_name} onChange={e => updateField('speaker_name', e.target.value)} placeholder="Ex: Pasteur John Doe" />
                                    </div>

                                    <div>
                                        <Label>Statut</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-gray-700 bg-background px-3 py-2 text-sm"
                                            value={formData.status || 'DRAFT'}
                                            onChange={e => updateField('status', e.target.value)}
                                        >
                                            <option value="DRAFT">Brouillon</option>
                                            <option value="PUBLISHED">À venir</option>
                                            <option value="ONGOING">En cours</option>
                                            <option value="COMPLETED">Terminé</option>
                                            <option value="CANCELLED">Annulé</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label>Description</Label>
                                        <Textarea value={formData.description} onChange={e => updateField('description', e.target.value)} className="h-32" />
                                    </div>

                                    <div>
                                        <Label>Image (URL)</Label>
                                        <Input value={formData.image_url} onChange={e => updateField('image_url', e.target.value)} placeholder="https://..." />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Places disponibles</Label>
                                            <Input type="number" value={formData.max_seats} onChange={e => updateField('max_seats', e.target.value)} />
                                        </div>
                                        <div className="flex items-center gap-2 mt-8">
                                            <Checkbox id="is_free" checked={formData.is_free === 1} onCheckedChange={(checked) => handleCheckboxChange('is_free', checked as boolean)} />
                                            <Label htmlFor="is_free" className="cursor-pointer">Événement gratuit</Label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: LIEU */}
                            {activeTab === 'location' && (
                                <div className="space-y-4">
                                    <div>
                                        <Label>Adresse complète</Label>
                                        <Input value={formData.address} onChange={e => updateField('address', e.target.value)} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Numéro de rue</Label>
                                            <Input value={formData.street_number} onChange={e => updateField('street_number', e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>Nom de rue</Label>
                                            <Input value={formData.street_name} onChange={e => updateField('street_name', e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Code postal</Label>
                                            <Input value={formData.postal_code} onChange={e => updateField('postal_code', e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>Ville</Label>
                                            <Input value={formData.city} onChange={e => updateField('city', e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Latitude</Label>
                                            <Input value={formData.latitude} onChange={e => updateField('latitude', e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>Longitude</Label>
                                            <Input value={formData.longitude} onChange={e => updateField('longitude', e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-700 pt-4 mt-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Checkbox id="has_parking" checked={formData.has_parking === 1} onCheckedChange={(checked) => handleCheckboxChange('has_parking', checked as boolean)} />
                                            <Label htmlFor="has_parking" className="cursor-pointer">Parking disponible</Label>
                                        </div>

                                        {formData.has_parking === 1 && (
                                            <div className="space-y-4 ml-6 border-l-2 border-blue-500 pl-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Capacité du parking</Label>
                                                        <Input type="number" value={formData.parking_capacity} onChange={e => updateField('parking_capacity', e.target.value)} />
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-8">
                                                        <Checkbox id="is_parking_free" checked={formData.is_parking_free === 1} onCheckedChange={(checked) => handleCheckboxChange('is_parking_free', checked as boolean)} />
                                                        <Label htmlFor="is_parking_free" className="cursor-pointer">Parking gratuit</Label>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label>Détails du parking</Label>
                                                    <Textarea value={formData.parking_details} onChange={e => updateField('parking_details', e.target.value)} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB: OPTIONS */}
                            {activeTab === 'options' && (
                                <div className="space-y-4">
                                    <div>
                                        <Label>Lien d'inscription</Label>
                                        <Input value={formData.registration_link} onChange={e => updateField('registration_link', e.target.value)} placeholder="https://..." />
                                    </div>

                                    <div>
                                        <Label>Lien YouTube Live</Label>
                                        <Input value={formData.youtube_live} onChange={e => updateField('youtube_live', e.target.value)} placeholder="https://youtube.com/..." />
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t border-gray-700">
                                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                                    <Save className="mr-2 h-4 w-4" /> Sauvegarder les modifications
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <CardTitle>Tous les événements <span className="text-sm font-normal text-gray-500">({totalEvents})</span></CardTitle>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Rechercher..."
                                className="pl-9 w-[200px] md:w-[300px]"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                        <select
                            className="h-10 px-3 rounded-md border border-gray-700 bg-background text-sm"
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        >
                            <option value="ALL">Tous les statuts</option>
                            <option value="DRAFT">Brouillon</option>
                            <option value="PUBLISHED">À venir</option>
                            <option value="ONGOING">En cours</option>
                            <option value="COMPLETED">Terminé</option>
                            <option value="CANCELLED">Annulé</option>
                        </select>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <TableSkeleton rows={10} />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-800 text-gray-400">
                                        <th className="py-3 px-4">Titre</th>
                                        <th className="py-3 px-4">Date</th>
                                        <th className="py-3 px-4">Statut</th>
                                        <th className="py-3 px-4">Église</th>
                                        <th className="py-3 px-4">Créé par</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map(ev => (
                                    <tr key={ev.id} className="border-b border-gray-800 hover:bg-white/5">
                                        <td className="py-3 px-4 font-bold">{ev.title}</td>
                                        <td className="py-3 px-4 text-gray-300">{new Date(ev.start_datetime).toLocaleDateString()} {new Date(ev.start_datetime).toLocaleTimeString()}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                ev.status === 'PUBLISHED' ? 'bg-blue-900/50 text-blue-400 border border-blue-900' :
                                                ev.status === 'ONGOING' ? 'bg-orange-900/50 text-orange-400 border border-orange-900' :
                                                ev.status === 'COMPLETED' ? 'bg-green-900/50 text-green-400 border border-green-900' :
                                                ev.status === 'DRAFT' ? 'bg-yellow-900/50 text-yellow-500 border border-yellow-900' :
                                                'bg-red-900/50 text-red-500 border border-red-900' // CANCELLED
                                                }`}>
                                                {
                                                    ev.status === 'PUBLISHED' ? 'À venir' :
                                                    ev.status === 'ONGOING' ? 'En cours' :
                                                    ev.status === 'COMPLETED' ? 'Terminé' :
                                                    ev.status === 'DRAFT' ? 'Brouillon' :
                                                    'Annulé'
                                                }
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-blue-400">{ev.church_name || 'N/A'}</td>
                                        <td className="py-3 px-4 text-gray-500">{ev.first_name} {ev.last_name}</td>
                                        <td className="py-3 px-4 text-right space-x-1">
                                            {/* Workflow buttons */}
                                            {ev.status === 'PUBLISHED' && (
                                                <Button
                                                    size="sm"
                                                    className="bg-orange-600 hover:bg-orange-700"
                                                    onClick={() => updateEventStatus(ev.id, 'ONGOING')}
                                                    title="Marquer comme En cours"
                                                >
                                                    <Play className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {ev.status === 'ONGOING' && (
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => updateEventStatus(ev.id, 'COMPLETED')}
                                                    title="Marquer comme Terminé"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button size="sm" className="bg-blue-600 hover:bg-blue-500" onClick={() => handleEdit(ev.id)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => deleteEvent(ev.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {!loading && (
                        <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-400">
                            Page {page} sur {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" /> Précédent
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Suivant <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div >
    );
}
