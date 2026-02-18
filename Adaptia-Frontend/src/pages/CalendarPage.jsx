import { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Info, Plus, Filter, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Can } from '../components/auth/Can';

export const CalendarPage = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    // URL directa al perfil del profesional en Cal.com
    const calendarUrl = useMemo(() => {
        // "Pablo Fabbian" -> "pablo-fabbian"
        const doctorSlug = user?.name?.toLowerCase().trim().replace(/\s+/g, '-') || 'pablo-fabbian';

        // Apuntamos al perfil raíz para que el paciente elija el tipo de cita
        return `https://cal.com/${doctorSlug}?embed=true`;
    }, [user]);

    return (
        <div className="max-w-7xl mx-auto px-4 pt-3 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#50e3c2] rounded-2xl text-gray-900 shadow-xl shadow-[#50e3c2]/20">
                        <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-light dark:text-white leading-none">
                            Agenda <span className="font-bold">Personal</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 flex items-center gap-2">
                            Gestionando citas para <span className="font-medium text-gray-700 dark:text-gray-200">{user?.name}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-3 bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-white/5 rounded-xl text-gray-500 hover:text-[#50e3c2] transition-all">
                        <Filter size={18} />
                    </button>
                    <Can perform="appointments.create">
                        <button className="flex items-center gap-2 px-5 py-3 bg-[#50e3c2] text-gray-900 rounded-2xl font-bold text-xs transition-all shadow-lg shadow-[#50e3c2]/10 active:scale-95">
                            <Plus size={16} strokeWidth={3} />
                            Cita Manual
                        </button>
                    </Can>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#50e3c2] mb-4">Link Público</h3>
                        <div className="space-y-3">
                            <p className="text-[10px] text-gray-400 leading-tight">
                                Comparte este link para que tus pacientes elijan su horario:
                            </p>
                            <a
                                href={calendarUrl.replace('?embed=true', '')}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#0f172a] rounded-xl border border-gray-100 dark:border-white/5 text-[10px] font-bold text-[#50e3c2] hover:bg-[#50e3c2]/5 transition-all break-all"
                            >
                                cal.com/{calendarUrl.split('/')[3].replace('?embed=true', '')}
                                <ExternalLink size={14} className="shrink-0 ml-2" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-[#0F0F0F] px-6 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[700px] relative">

                        {isLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#161f31] z-10">
                                <Loader2 className="w-8 h-8 text-[#50e3c2] animate-spin mb-2" />
                            </div>
                        )}

                        <iframe
                            src={calendarUrl}
                            width="100%"
                            height="700px"
                            frameBorder="0"
                            onLoad={() => setIsLoading(false)}
                            className={`transition-opacity duration-500 bg-[#0F0F0F] py-12 outline-none ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
};