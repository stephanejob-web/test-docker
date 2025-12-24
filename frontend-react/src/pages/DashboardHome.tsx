import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { Users, Church, Calendar, UserPlus, TrendingUp, ArrowRight, CalendarClock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';

export default function DashboardHome() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [myEvents, setMyEvents] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            if (user?.role === 'SUPER_ADMIN') {
                try {
                    const { data } = await api.get('/admin/stats');
                    setStats(data);
                } catch (e) { console.error(e); }
            } else {
                try {
                    const { data } = await api.get('/church/my-events');
                    setMyEvents(data);
                } catch (e) { console.error(e); }
            }
            setLoading(false);
        };
        load();
    }, [user]);

    const nextEvent = myEvents
        .filter((e: any) => new Date(e.start_datetime) > new Date())
        .sort((a: any, b: any) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())[0];

    if (loading) return <div className="p-8 text-white">Chargement...</div>;

    // --- PASTOR DASHBOARD ---
    if (user?.role !== 'SUPER_ADMIN') {

        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* HERO SECTION */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-700 p-8 shadow-2xl">
                    <div className="relative z-10">
                        <h1 className="text-4xl font-extrabold text-white mb-2">
                            Bonjour, {user?.first_name}
                        </h1>
                        <p className="text-blue-100 text-lg">
                            Heureux de vous revoir. Voici ce qui se passe dans votre église aujourd'hui.
                        </p>
                    </div>
                    {/* Decorative Circles */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-black/10 blur-2xl"></div>
                </div>

                {/* STATS ROW */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-surface border-gray-800 hover:border-gray-700 transition-colors">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-full bg-blue-500/10 text-blue-400">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Prochain Événement</p>
                                <p className="text-lg font-bold text-white truncate max-w-[150px]">
                                    {nextEvent ? nextEvent.title : 'Aucun'}
                                </p>
                                {nextEvent && <p className="text-xs text-gray-500">{new Date(nextEvent.start_datetime).toLocaleDateString()}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-surface border-gray-800 hover:border-gray-700 transition-colors">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-full bg-purple-500/10 text-purple-400">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Total Événements</p>
                                <p className="text-2xl font-bold text-white">{myEvents.length}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-surface border-gray-800 hover:border-gray-700 transition-colors">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-full bg-green-500/10 text-green-400">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Membres (Est.)</p>
                                <p className="text-2xl font-bold text-white">-</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* MAIN ACTIONS */}
                <h2 className="text-xl font-bold text-white mt-8">Accès Rapide</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link to="/dashboard/my-church" className="group">
                        <Card className="h-full bg-surface border-gray-800 group-hover:border-blue-500/50 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-white group-hover:text-blue-400 transition-colors">
                                    <Church className="h-6 w-6" /> Mon Église
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-400 mb-6">
                                    Gérez les informations générales, les horaires de culte et les liens sociaux de votre église.
                                </p>
                                <div className="flex items-center text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                                    Gérer mon église <ArrowRight className="ml-2 h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link to="/dashboard/events" className="group">
                        <Card className="h-full bg-surface border-gray-800 group-hover:border-purple-500/50 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-white group-hover:text-purple-400 transition-colors">
                                    <Calendar className="h-6 w-6" /> Mes Événements
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-400 mb-6">
                                    Planifiez vos prochains cultes, concerts ou réunions. Suivez leur statut de publication.
                                </p>
                                <div className="flex items-center text-purple-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                                    Voir le calendrier <ArrowRight className="ml-2 h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        );
    }

    // --- ADMIN DASHBOARD ---
    if (!stats) return <div className="p-8 text-white">Impossible de charger les statistiques.</div>;

    console.log('📊 Stats reçues:', stats);
    console.log('📈 Graphiques:', stats.charts);

    // Trouver le nombre d'événements en cours
    const ongoingEvents = stats.charts.events_status.find((s: any) => s.name === 'En cours')?.count || 0;

    // Transform Growth Data for Recharts
    const growthData: any[] = [];
    const months = new Set([
        ...stats.charts.growth.users.map((u: any) => u.month),
        ...stats.charts.growth.churches.map((c: any) => c.month)
    ].sort());

    months.forEach(m => {
        const u = stats.charts.growth.users.find((x: any) => x.month === m);
        const c = stats.charts.growth.churches.find((x: any) => x.month === m);
        growthData.push({
            name: m,
            Utilisateurs: u ? u.count : 0,
            Églises: c ? c.count : 0
        });
    });

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    console.log('📊 Growth Data:', growthData);
    console.log('📊 Denominations:', stats.charts.by_denomination);
    console.log('📊 Cities:', stats.charts.churches_by_city);
    console.log('📊 Events Status:', stats.charts.events_status);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Super Admin Dashboard
            </h1>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <KpiCard icon={Users} title="Total Utilisateurs" value={stats.kpi.total_users} trend="+12%" color="bg-blue-500/20 text-blue-400" />
                <KpiCard icon={UserPlus} title="En Attente" value={stats.kpi.pending_users} trend={stats.kpi.pending_users > 0 ? "Action requise" : "À jour"} color="bg-yellow-500/20 text-yellow-400" />
                <KpiCard icon={Church} title="Total Églises" value={stats.kpi.total_churches} trend="+5%" color="bg-purple-500/20 text-purple-400" />
                <KpiCard icon={CalendarClock} title="En Cours" value={ongoingEvents} trend="Événements" color="bg-orange-500/20 text-orange-400" />
                <KpiCard icon={Calendar} title="À Venir" value={stats.kpi.upcoming_events} trend="Événements" color="bg-green-500/20 text-green-400" />
            </div>

            {/* CHARTS ROW 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                <Card>
                    <CardHeader>
                        <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingUp size={20} /> Croissance Mensuelle
                        </CardTitle>
                    </CardHeader>
                    <CardContent style={{ height: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={growthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#E5E7EB' }}
                                    itemStyle={{ color: '#E5E7EB' }}
                                />
                                <Legend wrapperStyle={{ color: '#E5E7EB' }} />
                                <Bar dataKey="Utilisateurs" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Églises" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Church size={20} /> Répartition par Dénomination
                        </CardTitle>
                    </CardHeader>
                    <CardContent style={{ height: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.charts.by_denomination}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="count"
                                >
                                    {stats.charts.by_denomination.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#E5E7EB' }}
                                />
                                <Legend wrapperStyle={{ color: '#E5E7EB' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* CHARTS ROW 2 - Distribution des églises par ville */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                <Card>
                    <CardHeader>
                        <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Church size={20} /> Distribution des Églises par Ville (Top 10)
                        </CardTitle>
                    </CardHeader>
                    <CardContent style={{ height: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.charts.churches_by_city} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis type="number" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                                <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={100} style={{ fontSize: '11px' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#E5E7EB' }}
                                />
                                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={20} /> État des Événements
                        </CardTitle>
                    </CardHeader>
                    <CardContent style={{ height: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.charts.events_status}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    <Cell fill="#3B82F6" /> {/* À venir - Bleu */}
                                    <Cell fill="#F59E0B" /> {/* En cours - Orange */}
                                    <Cell fill="#10B981" /> {/* Terminés - Vert */}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#E5E7EB' }}
                                />
                                <Legend wrapperStyle={{ color: '#E5E7EB' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function KpiCard({ icon: Icon, title, value, trend, color }: any) {
    return (
        <Card className="border-gray-800 bg-surface hover:bg-white/5 transition-colors">
            <CardContent className="p-6 flex items-start justify-between">
                <div>
                    <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-white">{value}</h3>
                    <p className="text-xs text-emerald-400 mt-2 font-mono">{trend}</p>
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </CardContent>
        </Card>
    );
}
