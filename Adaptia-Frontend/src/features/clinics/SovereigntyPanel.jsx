import { useAuth } from '../../context/AuthContext';
import { useSovereignty } from '../../hooks/useSovereignty'; // <-- Usamos el hook
import { ShieldCheck, Users, Calendar, FileText, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';

const CONSENT_TYPES = [
    { id: 'patients', label: 'Lista de Pacientes', icon: Users, desc: 'Permite que la clínica vea tus pacientes vinculados.' },
    { id: 'appointments', label: 'Agenda y Citas', icon: Calendar, desc: 'Permite gestionar citas en los calendarios de la sede.' },
    { id: 'clinical_notes', label: 'Historias Clínicas', icon: FileText, desc: 'Acceso a notas de evolución y documentos sensibles.' },
];

export const SovereigntyPanel = () => {
    const { activeClinic } = useAuth();
    // Extraemos todo del hook
    const { consents, loading, updating, toggleConsent } = useSovereignty();

    if (loading) return (
        <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-adaptia-blue" size={32} />
        </div>
    );

    return (
        <Card className="max-w-2xl mx-auto overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-adaptia-blue" size={20} />
                    <h3 className="text-sm font-medium uppercase tracking-wider">Centro de Soberanía de Datos</h3>
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                    Tus datos te pertenecen. Decides qué compartes con **{activeClinic?.name}**.
                </p>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-dark-border">
                {CONSENT_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isGranted = consents[type.id] || false;

                    return (
                        <div key={type.id} className="p-6 flex items-center justify-between">
                            <div className="flex gap-4">
                                <div className={`p-3 rounded-2xl ${isGranted ? 'bg-adaptia-mint/10 text-adaptia-mint' : 'bg-gray-100 text-gray-400'}`}>
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{type.label}</p>
                                    <p className="text-xs text-gray-400">{type.desc}</p>
                                </div>
                            </div>

                            <button
                                disabled={updating === type.id}
                                onClick={() => toggleConsent(type.id, isGranted)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isGranted ? 'bg-adaptia-mint' : 'bg-gray-200 dark:bg-gray-700'
                                    } ${updating === type.id ? 'opacity-50' : ''}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isGranted ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};