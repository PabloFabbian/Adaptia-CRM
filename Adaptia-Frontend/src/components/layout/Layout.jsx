import { Sidebar } from './Sidebar';
import { ArrowLeft, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export const Layout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Mapeo simple para el título del Header según la ruta
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Dashboard';
        if (path.includes('pacientes')) return 'Gestión de Pacientes';
        if (path.includes('citas')) return 'Agenda Médica';
        return 'Panel de Control';
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50/50 to-white">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header Superior mejorado */}
                <header className="h-16 flex items-center justify-between px-10 border-b border-gray-100/50 backdrop-blur-sm bg-white/80">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-gray-400 hover:text-gray-700 transition-colors mr-4"
                        >
                            <ArrowLeft size={18} strokeWidth={1.5} />
                        </button>
                        <h1 className="text-sm font-medium text-gray-600 uppercase tracking-widest">{getPageTitle()}</h1>
                    </div>

                    {/* Acciones de Usuario */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 pr-6 border-r border-gray-100">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-gray-900 leading-none">{user?.name || 'Profesional'}</p>
                                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">Psicólogo Clínico</p>
                            </div>
                            <div className="h-9 w-9 rounded-xl bg-gray-900 flex items-center justify-center text-white shadow-lg">
                                <User size={18} />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate('/settings')}
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                            >
                                <Settings size={20} strokeWidth={1.5} />
                            </button>
                            <button
                                onClick={logout}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Cerrar Sesión"
                            >
                                <LogOut size={20} strokeWidth={1.5} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Área de Scroll - IMPORTANTE: Usamos Outlet para renderizar las páginas */}
                <div className="flex-1 overflow-y-auto px-10 py-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};