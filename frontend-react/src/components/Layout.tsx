import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Church, Calendar, UserCheck, LogOut, Menu, X, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui';

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'PASTOR', 'EVANGELIST'] },
        { name: 'Mon Église', href: '/dashboard/my-church', icon: Church, roles: ['PASTOR'] },
        { name: 'Mes Événements', href: '/dashboard/events', icon: Calendar, roles: ['PASTOR', 'EVANGELIST'] },
        { name: 'Utilisateurs', href: '/dashboard/admin/users', icon: UserCheck, roles: ['SUPER_ADMIN'] },
        { name: 'Églises', href: '/dashboard/admin/churches', icon: Church, roles: ['SUPER_ADMIN'] },
        { name: 'Événements', href: '/dashboard/admin/events', icon: Calendar, roles: ['SUPER_ADMIN'] },
        { name: 'Paramètres', href: '/dashboard/admin/settings', icon: Settings, roles: ['SUPER_ADMIN'] },
    ];

    const filteredNav = navigation.filter(item => user && item.roles.includes(user.role));

    return (
        <div className="min-h-screen bg-background flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-gray-800 transform transition-transform duration-200 lg:translate-x-0 lg:static",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-16 items-center px-6 border-b border-gray-800">
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                        Light Church
                    </span>
                    <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
                        <X className="h-6 w-6 text-gray-400" />
                    </button>
                </div>

                <div className="p-4 space-y-1">
                    {filteredNav.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                )}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
                    <div className="flex items-center mb-4 px-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                            {user?.first_name.charAt(0)}{user?.last_name.charAt(0)}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">{user?.first_name} {user?.last_name}</p>
                            <p className="text-xs text-gray-500 capitalize">{(user?.role || '').replace('_', ' ').toLowerCase()}</p>
                        </div>
                    </div>
                    <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/10" onClick={logout}>
                        <LogOut className="mr-3 h-5 w-5" />
                        Déconnexion
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center h-16 px-4 border-b border-gray-800 bg-surface">
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-400">
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="ml-4 font-semibold text-white">Menu</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
