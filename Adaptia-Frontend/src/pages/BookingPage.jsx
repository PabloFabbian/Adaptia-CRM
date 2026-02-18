import { useMemo, useState } from 'react';
import { PlusCircle, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const BookingPage = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    const calendarUrl = useMemo(() => {
        const doctorSlug = user?.name?.toLowerCase().trim().replace(/\s+/g, '-') || 'pablo-fabbian';
        return `https://cal.com/${doctorSlug}?embed=true`;
    }, [user]);

    return (
        <div className="max-w-7xl mx-auto px-4 pt-3 space-y-10 animate-in slide-in-from-bottom-4 duration-1000">
            <header className="flex items-center gap-4">
                <div className="p-3 bg-[#50e3c2] rounded-2xl text-gray-900 shadow-xl shadow-[#50e3c2]/20">
                    <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-light dark:text-white">Agendar <span className="font-bold">Nueva Cita</span></h1>
                    <p className="text-gray-500 text-sm">Selecciona el tipo de servicio y profesional</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-[#0F0F0F] rounded-[2.5rem] shadow-sm overflow-hidden min-h-[700px] relative border border-gray-100 dark:border-white/5">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-[#161f31] z-10">
                            <Loader2 className="w-8 h-8 text-[#50e3c2] animate-spin" />
                        </div>
                    )}
                    <iframe
                        src={calendarUrl}
                        width="100%"
                        height="700px"
                        frameBorder="0"
                        onLoad={() => setIsLoading(false)}
                        className={`transition-opacity duration-500 bg-[#0F0F0F] py-12 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    />
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#50e3c2] mb-4">Link Directo</h3>
                        <a href={calendarUrl.replace('?embed=true', '')} target="_blank" rel="noreferrer"
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#0f172a] rounded-xl text-[10px] font-bold text-[#50e3c2]">
                            Abrir en pestaña nueva
                            <ExternalLink size={14} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};