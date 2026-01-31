import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { ShieldCheck, Users, Calendar, FileText, Loader2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

const CONSENT_TYPES = [
    { id: 'patients', label: 'Lista de Pacientes', icon: Users, desc: 'Permite que la clínica vea tus pacientes vinculados.' },
    { id: 'appointments', label: 'Agenda y Citas', icon: Calendar, desc: 'Permite gestionar citas en los calendarios de la sede.' },
    { id: 'clinical_notes', label: 'Historias Clínicas', icon: FileText, desc: 'Acceso a notas de evolución y documentos sensibles.' },
];

export const SovereigntyPanel = () => {
    const { activeClinic } = useAuth();
    const [consents, setConsents] = useState({});
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        // Cargar estados actuales desde el backend
        const fetchConsents = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/clinics/${activeClinic.clinic_id}/my-consents/${activeClinic.member_id}`);
                const data = await res.json();
                // Transformamos el array en un objeto { patients: true, ... }
                const consentMap = data.reduce((acc, curr) => ({ ...acc, [curr.resource_type]: curr.is_granted }), {});
                setConsents(consentMap);
            } catch (err) {
                console.error("Error al cargar consentimientos");
            } finally {
                setLoading(false);
            }
        };
        if (activeClinic) fetchConsents();
    }, [activeClinic]);

    const toggleConsent = async (resourceType, currentValue) => {
        setUpdating(resourceType);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/clinics/consent`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    memberId: activeClinic.member_id,
                    clinicId: activeClinic.clinic_id,
                    resourceType,
                    isGranted: !currentValue
                })
            });

            if (res.ok) {
                setConsents(prev => ({ ...prev, [resourceType]: !currentValue }));
            }
        } catch (err) {
            alert("No se pudo actualizar el permiso.");
        } finally {
            setUpdating(null);
        }
    };

    if (loading) return <Loader2 className="animate-spin mx-auto text-adaptia-blue" />;

    return (
        <Card className="max-w-2xl mx-auto overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-adaptia-blue" size={20} />
                    <h3 className="text-sm font-medium text-gray-800 dark:text-white uppercase tracking-wider">Centro de Soberanía de Datos</h3>
                </div>
                <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                    Tus datos te pertenecen. Aquí decides qué información compartes con **{activeClinic.clinic_name}**.
                    Puedes revocar cualquier acceso en tiempo real.
                </p>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-dark-border">
                {CONSENT_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isGranted = consents[type.id] || false;

                    return (
                        <div key={type.id} className="p-6 flex items-center justify-between hover:bg-gray-50/30 dark:hover:bg-white/[0.02] transition-colors">
                            <div className="flex gap-4">
                                <div className={`p-3 rounded-2xl ${isGranted ? 'bg-adaptia-mint/10 text-adaptia-mint' : 'bg-gray-100 text-gray-400'} transition-colors`}>
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{type.label}</p>
                                    <p className="text-xs text-gray-400 font-light mt-0.5">{type.desc}</p>
                                </div>
                            </div>

                            <button
                                disabled={updating === type.id}
                                onClick={() => toggleConsent(type.id, isGranted)}
                                className={`
                                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
                                    ${isGranted ? 'bg-adaptia-mint' : 'bg-gray-200 dark:bg-gray-700'}
                                    ${updating === type.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                `}
                            >
                                <span
                                    className={`
                                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                        ${isGranted ? 'translate-x-6' : 'translate-x-1'}
                                    `}
                                />
                            </button>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};