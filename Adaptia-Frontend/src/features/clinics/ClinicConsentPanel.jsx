import { ShieldCheck, UserCheck, Users, Calendar, FileText } from 'lucide-react';

const RESOURCES = [
    { id: 'patients', label: 'Mis Pacientes', icon: Users },
    { id: 'appointments', label: 'Mis Citas', icon: Calendar },
    { id: 'clinical_notes', label: 'Mis Notas Clínicas', icon: FileText },
];

export const ClinicConsentPanel = ({ member, onToggle, updating }) => {
    if (!member) return null;

    return (
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
            <header className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#50e3c2]/10 rounded-2xl flex items-center justify-center text-[#50e3c2]">
                    <UserCheck size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Soberanía de Datos</h3>
                    <p className="text-sm text-slate-400">Gestioná quién accede a tu información profesional</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {RESOURCES.map(res => {
                    const Icon = res.icon;
                    const isGranted = member.consents?.some(c => c.type === res.id && c.is_granted);
                    const isUpdating = updating === res.id;

                    return (
                        <button
                            key={res.id}
                            onClick={() => onToggle(res.id, isGranted)}
                            disabled={isUpdating}
                            className={`
                                flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all
                                ${isGranted
                                    ? 'border-[#50e3c2]/50 bg-[#50e3c2]/5 text-[#50e3c2]'
                                    : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}
                                ${isUpdating ? 'opacity-50 cursor-wait' : 'cursor-pointer active:scale-95'}
                            `}
                        >
                            <Icon size={24} />
                            <span className="text-[11px] font-black uppercase tracking-widest text-center">
                                {res.label}
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full
                                ${isGranted ? 'bg-[#50e3c2]/20 text-[#50e3c2]' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                                {isGranted ? 'Compartido' : 'Privado'}
                            </span>
                        </button>
                    );
                })}
            </div>

            <footer className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                <p className="text-[10px] text-slate-400 flex items-center gap-2">
                    <ShieldCheck size={12} className="text-[#50e3c2] shrink-0" />
                    Los cambios se aplican de forma inmediata en toda la red de la clínica.
                </p>
            </footer>
        </div>
    );
};