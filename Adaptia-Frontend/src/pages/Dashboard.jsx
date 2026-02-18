import { useState, useMemo } from 'react';
import { Calendar, Users, Clock, Video, Edit2, CreditCard, Timer, Hash, Plus, ChevronRight, Zap } from 'lucide-react';
import { AppointmentTable } from '../features/appointments/AppointmentTable';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = ({ user, appointments = [] }) => {
    const navigate = useNavigate();
    const { can } = useAuth(); // Usamos nuestro helper de soberanía
    const [isFocusMode, setIsFocusMode] = useState(false);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 13) return "Buenos días";
        if (hour >= 13 && hour < 20) return "Buenas tardes";
        return "Buenas noches";
    }, []);

    const [consultationInfo, setConsultationInfo] = useState({
        label: 'Tiempo Promedio',
        value: '25 min',
        icon: Timer,
        color: 'bg-[#50e3c2] text-gray-900 shadow-[#50e3c2]/20'
    });

    const rotateInfo = () => {
        const infos = [
            { label: 'Tiempo Promedio', value: '25 min', icon: Timer, color: 'bg-[#50e3c2] text-gray-900 shadow-[#50e3c2]/20' },
            { label: 'Tarifa Base', value: '$45.00', icon: CreditCard, color: 'bg-emerald-500 text-white shadow-emerald-500/20' },
            { label: 'ID Profesional', value: 'MP-4492', icon: Hash, color: 'bg-slate-800 text-white shadow-slate-800/20' }
        ];
        const currentIndex = infos.findIndex(i => i.label === consultationInfo.label);
        const nextIndex = (currentIndex + 1) % infos.length;
        setConsultationInfo(infos[nextIndex]);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 pt-3 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">

            {/* Header: Se oculta en modo enfoque para cero distracciones */}
            {!isFocusMode && (
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in duration-500">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-[#50e3c2]/10 text-[#50e3c2] text-[10px] font-black uppercase tracking-widest rounded-full">
                                Panel de Control
                            </span>
                        </div>
                        <h1 className="text-4xl font-light text-gray-900 dark:text-white tracking-tight">
                            {greeting}, <span className="font-bold">{user?.name || 'Profesional'}</span> 👋🏼
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                            Tu agenda tiene <span className="text-[#50e3c2] font-bold">{appointments.length} citas</span> programadas para hoy.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/calendario')}
                            className="group flex items-center gap-2 bg-white dark:bg-[#161f31] border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3.5 rounded-2xl text-sm font-bold hover:shadow-xl transition-all active:scale-95"
                        >
                            <Calendar size={18} className="text-[#50e3c2]" />
                            Ver Agenda
                        </button>

                        {/* Botón condicional según Soberanía */}
                        {can('patients.write') && (
                            <button
                                onClick={() => navigate('/nuevo-paciente')}
                                className="flex items-center gap-2 bg-gray-900 dark:bg-[#50e3c2] text-white dark:text-gray-900 px-6 py-3.5 rounded-2xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-gray-900/10 dark:shadow-[#50e3c2]/20 active:scale-95"
                            >
                                <Plus size={18} strokeWidth={3} />
                                Nuevo Paciente
                            </button>
                        )}
                    </div>
                </header>
            )}

            {/* Grid de KPIs: También se oculta en Modo Enfoque */}
            {!isFocusMode && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
                    {/* Citas Hoy */}
                    <div className="bg-white dark:bg-[#161f31] p-7 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 rounded-2xl bg-gray-900 dark:bg-[#101828] text-white shadow-lg">
                                <Clock size={24} />
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-tighter">Sincronizado</span>
                        </div>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Citas Programadas</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-4xl font-bold text-gray-900 dark:text-white mt-1">{appointments.length}</h3>
                            <span className="text-gray-400 text-sm font-medium">hoy</span>
                        </div>
                    </div>

                    {/* Pacientes Totales - Protegido por Soberanía */}
                    <div className="bg-white dark:bg-[#161f31] p-7 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 rounded-2xl bg-[#50e3c2] text-gray-900 shadow-lg shadow-[#50e3c2]/20">
                                <Users size={24} />
                            </div>
                            {can('patients.read') ? (
                                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full">+4% mes</span>
                            ) : (
                                <ShieldCheck size={16} className="text-gray-300" />
                            )}
                        </div>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Comunidad Total</p>
                        <h3 className="text-4xl font-bold text-gray-900 dark:text-white mt-1">
                            {can('patients.read') ? '124' : '---'}
                        </h3>
                    </div>

                    {/* Info Rotativa */}
                    <div onClick={rotateInfo} className="bg-white dark:bg-[#161f31] p-7 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-800 hover:border-[#50e3c2] transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl transition-all duration-500 ${consultationInfo.color} shadow-lg`}>
                                <consultationInfo.icon size={24} />
                            </div>
                            <div className="p-2 text-gray-300 group-hover:text-[#50e3c2] transition-colors">
                                <Edit2 size={16} />
                            </div>
                        </div>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">{consultationInfo.label}</p>
                        <h3 className="text-4xl font-bold text-gray-900 dark:text-white mt-1 tracking-tight">
                            {consultationInfo.value}
                        </h3>
                    </div>
                </div>
            )}

            {/* Sección de Tabla */}
            <section className={`space-y-6 transition-all duration-500 ${isFocusMode ? 'pt-10' : ''}`}>
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#50e3c2] rounded-full" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {isFocusMode ? 'Enfoque de Jornada' : 'Próximas Citas'}
                        </h2>
                    </div>
                    <button
                        onClick={() => setIsFocusMode(!isFocusMode)}
                        className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all flex items-center gap-2 ${isFocusMode ? 'bg-[#50e3c2] text-gray-900' : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200'}`}
                    >
                        <Zap size={12} className={isFocusMode ? 'fill-gray-900' : ''} />
                        {isFocusMode ? 'Salir de Enfoque' : 'Modo Enfoque'}
                    </button>
                </div>

                <div className={`bg-white dark:bg-[#161f31] border border-gray-100 dark:border-gray-800 rounded-[3rem] shadow-sm overflow-hidden p-4 transition-all duration-500 ${isFocusMode ? 'ring-8 ring-[#50e3c2]/5 scale-[1.02]' : ''}`}>
                    {appointments.length > 0 ? (
                        <AppointmentTable
                            appointments={appointments}
                            actions={(app) => (
                                <div className="flex items-center gap-2">
                                    {app.type === 'virtual' && (
                                        <button className="flex items-center gap-2 bg-[#50e3c2]/10 text-[#50e3c2] px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-[#50e3c2] hover:text-gray-900 transition-all">
                                            <Video size={14} /> Unirse
                                        </button>
                                    )}
                                    <button
                                        onClick={() => navigate(`/pacientes/${app.patient_id}/historial`)}
                                        className="p-2 text-gray-300 hover:text-[#50e3c2] transition-colors"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        />
                    ) : (
                        <div className="py-24 text-center animate-in fade-in duration-700">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-[#101828] rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-gray-200">
                                <Zap size={40} className="opacity-20" />
                            </div>
                            <h4 className="text-gray-900 dark:text-white font-bold text-lg">Todo en orden</h4>
                            <p className="text-gray-400 dark:text-gray-500 font-medium text-sm mt-1">No tienes más citas para el resto del día.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;