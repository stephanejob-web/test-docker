import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label } from '../components/ui';
import { Edit, Save, Plus, Trash2, X, Search } from 'lucide-react';
import Pagination from '../components/Pagination';
import { TableSkeleton } from '../components/Loader';

export default function AdminChurches() {
    const [churches, setChurches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<any>(null); // Full church data

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const itemsPerPage = 10;

    // Filters and Search
    const [search, setSearch] = useState('');
    const [denominationFilter, setDenominationFilter] = useState('ALL');
    const [cityFilter, setCityFilter] = useState('ALL');

    // Reference data
    const [denominations, setDenominations] = useState<any[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchChurches();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [currentPage, search, denominationFilter, cityFilter]);

    useEffect(() => {
        fetchRefData();
    }, []);

    const fetchChurches = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/churches', {
                params: {
                    page: currentPage,
                    limit: itemsPerPage,
                    search,
                    denomination: denominationFilter,
                    city: cityFilter
                }
            });
            setChurches(data.churches);
            setTotal(data.pagination.total);
            setTotalPages(data.pagination.totalPages);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchRefData = async () => {
        try {
            const [denominationsRes, citiesRes] = await Promise.all([
                api.get('/settings/denominations'),
                api.get('/admin/cities')
            ]);
            setDenominations(denominationsRes.data);
            setCities(citiesRes.data);
        } catch (e) { console.error(e); }
    };

    const handleEdit = async (id: number) => {
        try {
            const { data } = await api.get(`/admin/churches/${id}`);
            // Prepare form data structure
            setFormData({
                ...data,
                // Flatten details
                description: data.details.description || '',
                address: data.details.address || '',
                phone: data.details.phone || '',
                website: data.details.website || '',
                pastor_name: data.details.pastor_name || '',
                has_parking: !!data.details.has_parking,
                // Ensure arrays
                socials: data.socials || [],
                schedules: data.schedules || []
            });
            setEditingId(id);
        } catch (e) { alert('Erreur chargement'); }
    };

    const handleSave = async () => {
        if (!editingId) return;
        try {
            await api.put(`/admin/churches/${editingId}`, formData);
            alert('Sauvegardé !');
            setEditingId(null);
            fetchChurches();
        } catch (e) { alert('Erreur sauvegarde'); }
    };

    const updateField = (field: string, value: any) => setFormData({ ...formData, [field]: value });

    // Helper for Socials
    const addSocial = () => updateField('socials', [...formData.socials, { platform: 'FACEBOOK', url: '' }]);
    const updateSocial = (idx: number, key: string, val: string) => {
        const copy = [...formData.socials];
        copy[idx] = { ...copy[idx], [key]: val };
        updateField('socials', copy);
    };
    const removeSocial = (idx: number) => updateField('socials', formData.socials.filter((_: any, i: number) => i !== idx));

    if (editingId && formData) {
        return (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
                <Card className="w-full max-w-4xl bg-surface border-gray-700 max-h-[90vh] overflow-y-auto">
                    <CardHeader className="flex flex-row justify-between sticky top-0 bg-surface z-10 border-b border-gray-700">
                        <CardTitle>Édition Église #{editingId}</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}><X className="h-6 w-6" /></Button>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        {/* GENERAL */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label>Nom</Label><Input value={formData.church_name} onChange={e => updateField('church_name', e.target.value)} /></div>
                            <div><Label>Dénomination</Label>
                                <select className="w-full h-10 bg-background border rounded px-3" value={formData.denomination_id} onChange={e => updateField('denomination_id', e.target.value)}>
                                    {denominations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div><Label>Latitude</Label><Input value={formData.latitude} onChange={e => updateField('latitude', e.target.value)} /></div>
                            <div><Label>Longitude</Label><Input value={formData.longitude} onChange={e => updateField('longitude', e.target.value)} /></div>
                        </div>

                        {/* DETAILS */}
                        <div className="space-y-4 border-t border-gray-700 pt-4">
                            <h3 className="font-bold">Détails de contact</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label>Adresse</Label><Input value={formData.address} onChange={e => updateField('address', e.target.value)} /></div>
                                <div><Label>Téléphone</Label><Input value={formData.phone} onChange={e => updateField('phone', e.target.value)} /></div>
                                <div><Label>Site Web</Label><Input value={formData.website} onChange={e => updateField('website', e.target.value)} /></div>
                                <div><Label>Pasteur Principal</Label><Input value={formData.pastor_name} onChange={e => updateField('pastor_name', e.target.value)} /></div>
                            </div>
                            <div><Label>Description</Label><textarea className="w-full bg-background border p-2 rounded h-24" value={formData.description} onChange={e => updateField('description', e.target.value)} /></div>
                        </div>

                        {/* SOCIALS */}
                        <div className="border-t border-gray-700 pt-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold">Réseaux Sociaux</h3>
                                <Button size="sm" variant="secondary" onClick={addSocial}><Plus className="h-4 w-4" /></Button>
                            </div>
                            {formData.socials.map((s: any, i: number) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <select className="bg-background border rounded px-2" value={s.platform} onChange={e => updateSocial(i, 'platform', e.target.value)}>
                                        <option value="FACEBOOK">Facebook</option>
                                        <option value="INSTAGRAM">Instagram</option>
                                        <option value="YOUTUBE">Youtube</option>
                                    </select>
                                    <Input value={s.url} onChange={e => updateSocial(i, 'url', e.target.value)} className="flex-1" />
                                    <Button size="sm" variant="danger" onClick={() => removeSocial(i)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-700">
                            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700"><Save className="mr-2 h-4 w-4" /> Enregistrer les modifications</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Gestion des Églises</h1>

            {/* Filters and Search */}
            <Card className="bg-surface/50 border-gray-800">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div>
                            <Label className="text-gray-400 mb-2 block">Rechercher</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Nom d'église, ville, pasteur..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Denomination Filter */}
                        <div>
                            <Label className="text-gray-400 mb-2 block">Dénomination</Label>
                            <select
                                className="w-full h-10 bg-background border border-gray-700 rounded px-3 text-white"
                                value={denominationFilter}
                                onChange={(e) => setDenominationFilter(e.target.value)}
                            >
                                <option value="ALL">Toutes les dénominations</option>
                                {denominations.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* City Filter */}
                        <div>
                            <Label className="text-gray-400 mb-2 block">Ville</Label>
                            <select
                                className="w-full h-10 bg-background border border-gray-700 rounded px-3 text-white"
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                            >
                                <option value="ALL">Toutes les villes</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Liste Complète ({total})</CardTitle></CardHeader>
                <CardContent>
                    {loading ? (
                        <TableSkeleton rows={itemsPerPage} />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-800 text-gray-400">
                                        <th className="py-3 px-4">Nom</th>
                                        <th className="py-3 px-4">Ville</th>
                                        <th className="py-3 px-4">Dénomination</th>
                                        <th className="py-3 px-4">Pasteur (Compte)</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {churches.map(church => (
                                        <tr key={church.id} className="border-b border-gray-800 hover:bg-white/5">
                                            <td className="py-3 px-4 font-medium">{church.church_name}</td>
                                            <td className="py-3 px-4 text-gray-400">{church.city || '-'}</td>
                                            <td className="py-3 px-4 text-gray-400">{church.denomination}</td>
                                            <td className="py-3 px-4 text-blue-400 font-mono text-sm">{church.first_name} {church.last_name}</td>
                                            <td className="py-3 px-4 text-right">
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-500" onClick={() => handleEdit(church.id)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            total={total}
                            itemsPerPage={itemsPerPage}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
