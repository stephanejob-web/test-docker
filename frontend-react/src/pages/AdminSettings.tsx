import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';

export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState('languages');

    // Data
    const [languages, setLanguages] = useState<any[]>([]);
    const [activityTypes, setActivityTypes] = useState<any[]>([]);
    const [denominations, setDenominations] = useState<any[]>([]);
    const [churchUnions, setChurchUnions] = useState<any[]>([]);

    // Inputs
    const [langInput, setLangInput] = useState({ code: '', name_native: '', name_fr: '', flag_emoji: '' });
    const [typeInput, setTypeInput] = useState({ name: '', label_fr: '', icon: '' });
    const [denomInput, setDenomInput] = useState({ name: '', abbreviation: '', union_id: '', is_active: 1 });

    // Editing states
    const [editingLangId, setEditingLangId] = useState<number | null>(null);
    const [editingTypeId, setEditingTypeId] = useState<number | null>(null);
    const [editingDenomId, setEditingDenomId] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [langRes, typeRes, denomRes, unionRes] = await Promise.all([
                api.get('/settings/languages'),
                api.get('/settings/activity_types'),
                api.get('/settings/denominations'),
                api.get('/settings/church_unions')
            ]);
            setLanguages(langRes.data);
            setActivityTypes(typeRes.data);
            setDenominations(denomRes.data);
            setChurchUnions(unionRes.data);
        } catch (e) { console.error(e); }
    };

    const createLanguage = async () => {
        if (!langInput.code) return;
        try {
            if (editingLangId) {
                await api.put(`/settings/languages/${editingLangId}`, langInput);
                setEditingLangId(null);
            } else {
                await api.post('/settings/languages', langInput);
            }
            setLangInput({ code: '', name_native: '', name_fr: '', flag_emoji: '' });
            fetchData();
        } catch (e) { alert('Erreur sauvegarde langue'); }
    };

    const createType = async () => {
        if (!typeInput.name) return;
        try {
            if (editingTypeId) {
                await api.put(`/settings/activity_types/${editingTypeId}`, typeInput);
                setEditingTypeId(null);
            } else {
                await api.post('/settings/activity_types', typeInput);
            }
            setTypeInput({ name: '', label_fr: '', icon: '' });
            fetchData();
        } catch (e) { alert('Erreur sauvegarde type'); }
    };

    const createDenomination = async () => {
        if (!denomInput.name) return;
        try {
            if (editingDenomId) {
                await api.put(`/settings/denominations/${editingDenomId}`, denomInput);
                setEditingDenomId(null);
            } else {
                await api.post('/settings/denominations', denomInput);
            }
            setDenomInput({ name: '', abbreviation: '', union_id: '', is_active: 1 });
            fetchData();
        } catch (e) { alert('Erreur sauvegarde dénomination'); }
    };

    const editLanguage = (lang: any) => {
        setLangInput({
            code: lang.code,
            name_native: lang.name_native,
            name_fr: lang.name_fr,
            flag_emoji: lang.flag_emoji
        });
        setEditingLangId(lang.id);
    };

    const editType = (type: any) => {
        setTypeInput({
            name: type.name,
            label_fr: type.label_fr,
            icon: type.icon
        });
        setEditingTypeId(type.id);
    };

    const editDenomination = (denom: any) => {
        setDenomInput({
            name: denom.name,
            abbreviation: denom.abbreviation || '',
            union_id: denom.union_id || '',
            is_active: denom.is_active
        });
        setEditingDenomId(denom.id);
    };

    const cancelEdit = (type: 'lang' | 'type' | 'denom') => {
        if (type === 'lang') {
            setLangInput({ code: '', name_native: '', name_fr: '', flag_emoji: '' });
            setEditingLangId(null);
        } else if (type === 'type') {
            setTypeInput({ name: '', label_fr: '', icon: '' });
            setEditingTypeId(null);
        } else {
            setDenomInput({ name: '', abbreviation: '', union_id: '', is_active: 1 });
            setEditingDenomId(null);
        }
    };

    const deleteItem = async (table: string, id: number) => {
        if (!confirm('Supprimer ?')) return;
        try {
            await api.delete(`/settings/${table}/${id}`);
            fetchData();
        } catch (e) { alert('Erreur suppression'); }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Configuration Globale</h1>

            <div className="flex border-b border-gray-700 space-x-4">
                <button onClick={() => setActiveTab('languages')} className={`pb-2 px-4 ${activeTab === 'languages' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}>Langues</button>
                <button onClick={() => setActiveTab('types')} className={`pb-2 px-4 ${activeTab === 'types' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}>Types d'activités</button>
                <button onClick={() => setActiveTab('denominations')} className={`pb-2 px-4 ${activeTab === 'denominations' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}>Dénominations</button>
            </div>

            {/* LANGUAGES */}
            {activeTab === 'languages' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle>{editingLangId ? 'Modifier Langue' : 'Nouvelle Langue'}</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <Input placeholder="Code ISO (ex: en)" value={langInput.code} onChange={e => setLangInput({ ...langInput, code: e.target.value })} />
                            <Input placeholder="Nom Natif (ex: English)" value={langInput.name_native} onChange={e => setLangInput({ ...langInput, name_native: e.target.value })} />
                            <Input placeholder="Nom Français (ex: Anglais)" value={langInput.name_fr} onChange={e => setLangInput({ ...langInput, name_fr: e.target.value })} />
                            <Input placeholder="Emoji Drapeau 🇬🇧" value={langInput.flag_emoji} onChange={e => setLangInput({ ...langInput, flag_emoji: e.target.value })} />
                            <div className="flex gap-2">
                                <Button onClick={createLanguage} className="flex-1">
                                    {editingLangId ? <><Save className="mr-2 h-4 w-4" /> Sauvegarder</> : <><Plus className="mr-2 h-4 w-4" /> Ajouter</>}
                                </Button>
                                {editingLangId && (
                                    <Button onClick={() => cancelEdit('lang')} variant="outline">
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Langues Actives</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {languages.map(l => (
                                    <li key={l.id} className="flex justify-between items-center bg-white/5 p-3 rounded">
                                        <span>{l.flag_emoji} {l.name_fr} ({l.code})</span>
                                        <div className="flex gap-1">
                                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => editLanguage(l)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => deleteItem('languages', l.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ACTIVITY TYPES */}
            {activeTab === 'types' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle>{editingTypeId ? 'Modifier Type d\'Activité' : 'Nouveau Type d\'Activité'}</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <Input placeholder="Nom technique (ex: SUNDAY_SERVICE)" value={typeInput.name} onChange={e => setTypeInput({ ...typeInput, name: e.target.value })} />
                            <Input placeholder="Label FR (ex: Culte du Dimanche)" value={typeInput.label_fr} onChange={e => setTypeInput({ ...typeInput, label_fr: e.target.value })} />
                            <Input placeholder="Nom Icône (ex: User)" value={typeInput.icon} onChange={e => setTypeInput({ ...typeInput, icon: e.target.value })} />
                            <div className="flex gap-2">
                                <Button onClick={createType} className="flex-1">
                                    {editingTypeId ? <><Save className="mr-2 h-4 w-4" /> Sauvegarder</> : <><Plus className="mr-2 h-4 w-4" /> Ajouter</>}
                                </Button>
                                {editingTypeId && (
                                    <Button onClick={() => cancelEdit('type')} variant="outline">
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Types Actifs</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {activityTypes.map(t => (
                                    <li key={t.id} className="flex justify-between items-center bg-white/5 p-3 rounded">
                                        <span>{t.label_fr}</span>
                                        <div className="flex gap-1">
                                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => editType(t)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => deleteItem('activity_types', t.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* DENOMINATIONS */}
            {activeTab === 'denominations' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle>{editingDenomId ? 'Modifier Dénomination' : 'Nouvelle Dénomination'}</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <Input
                                placeholder="Nom complet (ex: Assemblées de Dieu)"
                                value={denomInput.name}
                                onChange={e => setDenomInput({ ...denomInput, name: e.target.value })}
                            />
                            <Input
                                placeholder="Abréviation (ex: ADD)"
                                value={denomInput.abbreviation}
                                onChange={e => setDenomInput({ ...denomInput, abbreviation: e.target.value })}
                            />
                            <select
                                className="w-full h-10 bg-background border border-gray-700 rounded px-3 text-white"
                                value={denomInput.union_id}
                                onChange={e => setDenomInput({ ...denomInput, union_id: e.target.value })}
                            >
                                <option value="">Sélectionner une union (optionnel)</option>
                                {churchUnions.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={denomInput.is_active === 1}
                                    onChange={e => setDenomInput({ ...denomInput, is_active: e.target.checked ? 1 : 0 })}
                                    className="h-4 w-4"
                                />
                                <label htmlFor="is_active" className="text-sm">Active</label>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={createDenomination} className="flex-1">
                                    {editingDenomId ? <><Save className="mr-2 h-4 w-4" /> Sauvegarder</> : <><Plus className="mr-2 h-4 w-4" /> Ajouter</>}
                                </Button>
                                {editingDenomId && (
                                    <Button onClick={() => cancelEdit('denom')} variant="outline">
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Dénominations Actives ({denominations.filter(d => d.is_active).length})</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {denominations.map(d => (
                                    <li key={d.id} className={`flex justify-between items-center bg-white/5 p-3 rounded ${!d.is_active ? 'opacity-50' : ''}`}>
                                        <div>
                                            <span className="font-medium">{d.name}</span>
                                            {d.abbreviation && <span className="text-gray-400 text-sm ml-2">({d.abbreviation})</span>}
                                            {!d.is_active && <span className="ml-2 text-xs text-red-400">Inactive</span>}
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => editDenomination(d)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => deleteItem('denominations', d.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
