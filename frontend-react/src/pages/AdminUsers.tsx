import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from '../components/ui';
import { Check, X, Trash2, Ban, RefreshCw, Search, Church } from 'lucide-react';
import Pagination from '../components/Pagination';
import { TableSkeleton } from '../components/Loader';

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const itemsPerPage = 10;

    // Filters and Search
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Church View Modal
    const [viewingChurch, setViewingChurch] = useState<any>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [currentPage, search, roleFilter, statusFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/users', {
                params: {
                    page: currentPage,
                    limit: itemsPerPage,
                    search,
                    role: roleFilter,
                    status: statusFilter
                }
            });
            setUsers(data.users);
            setTotal(data.pagination.total);
            setTotalPages(data.pagination.totalPages);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleViewChurch = async (churchId: number) => {
        try {
            const { data } = await api.get(`/admin/churches/${churchId}`);
            setViewingChurch(data);
        } catch (error) {
            alert('Erreur lors du chargement de l\'église');
        }
    };

    const updateUserStatus = async (id: number, status: string) => {
        try {
            await api.put(`/admin/users/${id}`, { status });
            fetchUsers();
        } catch (error) { alert('Erreur mise à jour'); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Supprimer cet utilisateur ?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchUsers();
        } catch (error) { alert('Erreur suppression'); }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'VALIDATED': return <span className="px-2 py-1 rounded bg-green-900/40 text-green-400 text-xs text-center border border-green-800">Validé</span>;
            case 'PENDING': return <span className="px-2 py-1 rounded bg-yellow-900/40 text-yellow-400 text-xs text-center border border-yellow-800">En attente</span>;
            case 'SUSPENDED': return <span className="px-2 py-1 rounded bg-orange-900/40 text-orange-400 text-xs text-center border border-orange-800">Suspendu</span>;
            case 'REJECTED': return <span className="px-2 py-1 rounded bg-red-900/40 text-red-400 text-xs text-center border border-red-800">Rejeté</span>;
            default: return status;
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Administration des Utilisateurs</h1>

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
                                    placeholder="Nom, prénom, email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Role Filter */}
                        <div>
                            <Label className="text-gray-400 mb-2 block">Rôle</Label>
                            <select
                                className="w-full h-10 bg-background border border-gray-700 rounded px-3 text-white"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="ALL">Tous les rôles</option>
                                <option value="PASTOR">Pasteur</option>
                                <option value="USER">Utilisateur</option>
                                <option value="SUPER_ADMIN">Super Admin</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <Label className="text-gray-400 mb-2 block">Statut</Label>
                            <select
                                className="w-full h-10 bg-background border border-gray-700 rounded px-3 text-white"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">Tous les statuts</option>
                                <option value="VALIDATED">Validé</option>
                                <option value="PENDING">En attente</option>
                                <option value="SUSPENDED">Suspendu</option>
                                <option value="REJECTED">Rejeté</option>
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
                                        <th className="py-3 px-4">Email</th>
                                        <th className="py-3 px-4">Rôle</th>
                                        <th className="py-3 px-4">Statut</th>
                                        <th className="py-3 px-4">Église</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                    <tr key={user.id} className="border-b border-gray-800 hover:bg-white/5">
                                        <td className="py-3 px-4 font-medium">{user.first_name} {user.last_name}</td>
                                        <td className="py-3 px-4 text-gray-400">{user.email}</td>
                                        <td className="py-3 px-4 text-sm font-mono text-indigo-400">{user.role}</td>
                                        <td className="py-3 px-4">{getStatusBadge(user.status)}</td>
                                        <td className="py-3 px-4">
                                            {user.role === 'PASTOR' && user.church_id ? (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="bg-purple-600 hover:bg-purple-700"
                                                    onClick={() => handleViewChurch(user.church_id)}
                                                    title="Voir l'église"
                                                >
                                                    <Church className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <span className="text-gray-600 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right space-x-1">
                                            {user.status === 'PENDING' && (
                                                <>
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateUserStatus(user.id, 'VALIDATED')}><Check className="h-4 w-4" /></Button>
                                                    <Button size="sm" variant="danger" onClick={() => updateUserStatus(user.id, 'REJECTED')}><X className="h-4 w-4" /></Button>
                                                </>
                                            )}
                                            {user.status === 'VALIDATED' && (
                                                <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => updateUserStatus(user.id, 'SUSPENDED')} title="Suspendre">
                                                    <Ban className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {(user.status === 'SUSPENDED' || user.status === 'REJECTED') && (
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateUserStatus(user.id, 'VALIDATED')} title="Réactiver">
                                                    <RefreshCw className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button size="sm" variant="danger" onClick={() => handleDelete(user.id)} title="Supprimer">
                                                <Trash2 className="h-4 w-4" />
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

            {/* Church View Modal */}
            {viewingChurch && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
                    <Card className="w-full max-w-2xl bg-surface border-gray-700">
                        <CardHeader className="flex flex-row justify-between border-b border-gray-700">
                            <CardTitle className="flex items-center gap-2">
                                <Church className="h-5 w-5" />
                                {viewingChurch.church_name}
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => setViewingChurch(null)}>
                                <X className="h-6 w-6" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-400">Adresse</Label>
                                    <p className="text-white">{viewingChurch.details?.address || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-400">Téléphone</Label>
                                    <p className="text-white">{viewingChurch.details?.phone || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-400">Site Web</Label>
                                    <p className="text-white">{viewingChurch.details?.website || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-400">Pasteur Principal</Label>
                                    <p className="text-white">{viewingChurch.details?.pastor_name || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-400">Position</Label>
                                    <p className="text-white text-sm">
                                        Lat: {viewingChurch.latitude?.toFixed(6)}, Lng: {viewingChurch.longitude?.toFixed(6)}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-gray-400">Parking</Label>
                                    <p className="text-white">
                                        {viewingChurch.details?.has_parking ? 'Oui' : 'Non'}
                                        {viewingChurch.details?.has_parking && viewingChurch.details?.parking_capacity &&
                                            ` (${viewingChurch.details.parking_capacity} places)`}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-gray-400">Description</Label>
                                <p className="text-white text-sm">{viewingChurch.details?.description || 'Aucune description'}</p>
                            </div>
                            {viewingChurch.socials && viewingChurch.socials.length > 0 && (
                                <div>
                                    <Label className="text-gray-400">Réseaux Sociaux</Label>
                                    <div className="flex gap-2 mt-2">
                                        {viewingChurch.socials.map((social: any, idx: number) => (
                                            <a
                                                key={idx}
                                                href={social.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded text-xs hover:bg-blue-600/30"
                                            >
                                                {social.platform}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
