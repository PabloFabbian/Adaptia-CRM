import { useAuth } from '../../context/AuthContext';
import { useSovereignty } from '../../hooks/useSovereignty';
import { ShieldCheck, Users, Calendar, FileText, Loader2 } from 'lucide-react';

const CONSENT_TYPES = [
    { id: 'patients', label: 'Lista de Pacientes', icon: Users, desc: 'Permite que la clínica vea tus pacientes vinculados.' },
    { id: 'appointments', label: 'Agenda y Citas', icon: Calendar, desc: 'Permite gestionar citas en los calendarios de la sede.' },
    { id: 'clinical_notes', label: 'Historias Clínicas', icon: FileText, desc: 'Acceso a notas de evolución y documentos sensibles.' },
];

export const SovereigntyPanel = () => {
    const { activeClinic } = useAuth();
    const { consents, loading, updating, toggleConsent } = useSovereignty();

    if (loading) return (
        <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-[#50e3c2]" size={32} />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-[#50e3c2]" size={20} />
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Centro de Soberanía de Datos
                    </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                    Tus datos te pertenecen. Decidís qué compartís con <span className="font-bold text-slate-700 dark:text-slate-300">{activeClinic?.name}</span>.
                </p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {CONSENT_TYPES.map(type => {
                    const Icon = type.icon;
                    const isGranted = consents[type.id] || false;

                    return (
                        <div key={type.id} className="p-6 flex items-center justify-between gap-4">
                            <div className="flex gap-4">
                                <div className={`p-3 rounded-2xl transition-colors ${isGranted ? 'bg-[#50e3c2]/10 text-[#50e3c2]' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{type.label}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{type.desc}</p>
                                </div>
                            </div>

                            <button
                                disabled={updating === type.id}
                                onClick={() => toggleConsent(type.id, isGranted)}
                                className={`
                                    relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors
                                    ${isGranted ? 'bg-[#50e3c2]' : 'bg-slate-200 dark:bg-slate-600'}
                                    ${updating === type.id ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                                `}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isGranted ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-[10px] text-slate-400 flex items-center gap-2">
                    <ShieldCheck size={12} className="text-[#50e3c2] shrink-0" />
                    Los cambios se aplican de forma inmediata en toda la red de la clínica.
                </p>
            </div>
        </div>
    );
};