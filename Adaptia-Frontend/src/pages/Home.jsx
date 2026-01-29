import { useAppointments } from '../hooks/useAppointments';
import { Card } from '../components/ui/Card';
import { Clock, User, Share2, ShieldCheck } from 'lucide-react';

const Home = () => {
    const { appointments, loading } = useAppointments();

    return (
        <div className="max-w-6xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                        Panel de Control
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                        <Share2 size={16} className="text-[#50e3c2]" />
                        Recursos compartidos de la clínica en Neon Cloud
                    </p>
                </div>

                {/* Indicador de estado rápido */}
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-[#50e3c2]/5 border border-[#50e3c2]/20 rounded-2xl">
                    <div className="w-2 h-2 rounded-full bg-[#50e3c2] animate-pulse" />
                    <span className="text-[11px] font-bold text-[#50e3c2] uppercase tracking-widest">Sistema Activo</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card title="Próximas Citas" className="overflow-hidden border-none shadow-2xl">
                        {loading ? (
                            <div className="p-10 flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-2 border-[#50e3c2] border-t-transparent rounded-full animate-spin" />
                                <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">Sincronizando agenda...</p>
                            </div>
                        ) : appointments.length === 0 ? (
                            <div className="p-12 text-center">
                                <ShieldCheck size={40} className="mx-auto text-gray-200 dark:text-gray-800 mb-4" />
                                <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs mx-auto italic">
                                    No hay citas disponibles o la visibilidad compartida está desactivada.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                {appointments.map((appointment) => (
                                    <div key={appointment.id} className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#50e3c2]/5 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${appointment.is_mine
                                                ? 'bg-[#50e3c2] text-gray-900 shadow-lg shadow-[#50e3c2]/20'
                                                : 'bg-gray-100 dark:bg-[#101828] text-gray-400 dark:text-gray-600'
                                                }`}>
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                    {appointment.patient_name}
                                                </p>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                                                    <Clock size={12} className="text-[#50e3c2]" />
                                                    {new Date(appointment.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Badge de pertenencia */}
                                        <span className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-tighter ${appointment.is_mine
                                            ? 'bg-[#50e3c2]/10 text-[#2a8c81] dark:text-[#50e3c2] border border-[#50e3c2]/20'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                                            }`}>
                                            {appointment.is_mine ? 'Mía' : 'Compartida'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar de Resumen rápido opcional */}
                <div className="space-y-6">
                    <div className="p-6 bg-[#161f31] border border-gray-800 rounded-[2rem]">
                        <h4 className="text-xs font-bold text-[#50e3c2] uppercase tracking-[0.2em] mb-4">Resumen de hoy</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-gray-400 text-sm">Total Citas</span>
                                <span className="text-2xl font-black text-white">{appointments.length}</span>
                            </div>
                            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-[#50e3c2] h-full transition-all duration-1000"
                                    style={{ width: `${Math.min((appointments.length / 10) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;