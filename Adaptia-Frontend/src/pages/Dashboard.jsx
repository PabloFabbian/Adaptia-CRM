import { useState } from 'react';
import { Calendar, Users, Clock, Video, AlertCircle, EyeOff, Eye, Send, Edit2, CreditCard, Timer, Hash, Plus } from 'lucide-react';
import { AppointmentTable } from '../features/appointments/AppointmentTable';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user, appointments = [] }) => {
    const navigate = useNavigate();
    const [isFocusMode, setIsFocusMode] = useState(false);

    // Estados para la tarjeta editable (puedes cargarlos de una API/LocalStorage)
    const [consultationInfo, setConsultationInfo] = useState({
        label: 'Tiempo Promedio',
        value: '25 min',
        type: 'time' // time, price, or info
    });

    const todayAppointments = appointments.length;

    // Función para rotar la info rápidamente (simulando utilidad)
    const rotateInfo = () => {
        const infos = [
            { label: 'Tiempo Promedio', value: '25 min', type: 'time', icon: Timer, color: 'bg-adaptia-mint text-gray-900' },
            { label: 'Tarifa Base', value: '$45.00', type: 'price', icon: CreditCard, color: 'bg-emerald-500 text-white' },
            { label: 'ID Profesional', value: 'MP-4492', type: 'info', icon: Hash, color: 'bg-adaptia-blue text-white' }
        ];
        const currentIndex = infos.findIndex(i => i.label === consultationInfo.label);
        const nextIndex = (currentIndex + 1) % infos.length;
        setConsultationInfo(infos[nextIndex]);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Hola, {user?.name?.split(' ')[0] || 'Profesional'} 👋🏼
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-light">
                        Tienes <span className="text-gray-900 dark:text-adaptia-mint font-semibold">{todayAppointments} citas</span> hoy.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/agendar')} className="flex items-center gap-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 px-5 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm">
                        <Calendar size={18} /> Agenda
                    </button>
                    <button onClick={() => navigate('/nuevo-paciente')} className="flex items-center gap-2 bg-gray-900 dark:bg-adaptia-blue text-white px-5 py-3 rounded-2xl text-sm font-semibold hover:opacity-90 transition-all shadow-lg active:scale-95 border-b-2 border-white/10">
                        <Plus size={18} /> Nuevo Paciente
                    </button>
                </div>
            </header>

            {/* Grid de Estadísticas */}
            {!isFocusMode && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
                    {/* Citas */}
                    <div className="bg-white dark:bg-dark-surface p-6 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-gray-900 dark:bg-dark-bg text-white shadow-lg">
                                <Clock size={22} />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">+12%</span>
                        </div>
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Citas de Hoy</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{todayAppointments}</h3>
                    </div>

                    {/* Pacientes */}
                    <div className="bg-white dark:bg-dark-surface p-6 rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-adaptia-blue text-white shadow-lg">
                                <Users size={22} />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">+4%</span>
                        </div>
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Pacientes Totales</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">124</h3>
                    </div>

                    {/* TARJETA EDITABLE / ROTATIVA: Info de Consulta */}
                    <div
                        onClick={rotateInfo}
                        className="bg-white dark:bg-dark-surface p-6 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-dark-border shadow-sm hover:border-adaptia-mint transition-all cursor-pointer group relative"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl transition-colors duration-500 ${consultationInfo.color || 'bg-adaptia-mint text-gray-900'} shadow-lg`}>
                                {consultationInfo.icon ? <consultationInfo.icon size={22} /> : <Timer size={22} />}
                            </div>
                            <button className="p-2 text-gray-300 group-hover:text-adaptia-mint transition-colors">
                                <Edit2 size={14} />
                            </button>
                        </div>
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{consultationInfo.label}</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1 tracking-tight">
                            {consultationInfo.value}
                        </h3>
                        <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] text-adaptia-mint font-bold uppercase tracking-tighter italic">Click para rotar info</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Sección de Tabla */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Próximas Citas
                        <span className="text-[10px] bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">Hoy</span>
                    </h2>
                </div>

                <div className="bg-gray-50 dark:bg-dark-surface/50 border border-gray-100 dark:border-dark-border rounded-2xl p-2 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => setIsFocusMode(!isFocusMode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isFocusMode ? 'bg-adaptia-mint text-gray-900' : 'bg-white dark:bg-dark-bg text-gray-500 border border-gray-100 dark:border-dark-border'}`}
                        >
                            {isFocusMode ? <Eye size={14} /> : <EyeOff size={14} />}
                            {isFocusMode ? 'Modo Normal' : 'Modo Enfoque'}
                        </button>
                        <div className="h-4 w-px bg-gray-200 dark:bg-dark-border hidden sm:block" />
                        <span className="text-[10px] text-gray-400 font-medium px-2 hidden md:block uppercase tracking-widest">Gestión rápida</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-dark-bg border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-500 px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-50 transition-all">
                            <AlertCircle size={14} /> Notificar Retraso (15m) <Send size={12} className="opacity-50" />
                        </button>
                    </div>
                </div>

                <div className={`bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-[2.5rem] shadow-sm overflow-hidden p-2 transition-all ${isFocusMode ? 'ring-2 ring-adaptia-mint/20' : ''}`}>
                    {appointments.length > 0 ? (
                        <div className="dark:bg-dark-surface">
                            <AppointmentTable
                                appointments={appointments}
                                actions={(app) => app.type === 'virtual' && (
                                    <button className="flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all">
                                        <Video size={12} /> Unirse
                                    </button>
                                )}
                            />
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4 text-gray-300"><Calendar size={32} /></div>
                            <p className="text-gray-400 dark:text-gray-500 font-light">No hay registros hoy.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;