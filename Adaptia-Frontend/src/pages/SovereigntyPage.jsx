import { Shield, Users, Info, CheckCircle2 } from 'lucide-react';
import { PermissionToggle } from '../features/clinics/PermissionToggle';
import { Can } from '../components/auth/Can';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const SovereigntyPage = ({ fetchAppointments }) => {
    const { user, refreshUser } = useAuth();

    // 1. Efecto de seguridad: Si entramos y no hay member_id, forzamos refresco inmediatamente
    useEffect(() => {
        if (user && !user.member_id && refreshUser) {
            refreshUser();
        }
    }, [user, refreshUser]);

    /** * LÓGICA DE PERSISTENCIA:
     * El backend devuelve un array 'consents'. Buscamos si existe el de citas.
     */
    const isAgendaHidden = user?.consents?.some(
        c => c.type === 'appointments' && (c.is_granted === true || c.is_granted === 1)
    ) || false;

    // Función de sincronización tras mover el switch
    const handleUpdate = async () => {
        try {
            if (refreshUser) {
                await refreshUser();
            }
            if (fetchAppointments) {
                fetchAppointments();
            }
            console.log("✅ Soberanía actualizada y AuthContext sincronizado.");
        } catch (error) {
            console.error("❌ Error al actualizar estado local:", error);
        }
    };

    // Identificación de IDs. 
    // clinicId viene de la clínica activa. 
    // memberId viene del perfil de usuario (cargado vía refreshUser).
    const clinicId = user?.activeClinic?.id || user?.clinic_id;
    const memberId = user?.member_id;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-xl shadow-orange-500/20">
                    <Shield className="w-7 h-7" />
                </div>
                <div>
                    <h1 className="text-3xl font-light dark:text-white">
                        Soberanía de <span className="font-bold">Datos</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Controla la visibilidad de tu información clínica
                    </p>
                </div>
            </header>

            <Can
                perform="clinic.resources.manage"
                fallback={
                    <div className="bg-gray-50/50 dark:bg-[#101828]/50 border border-dashed border-gray-200 dark:border-gray-800 rounded-[2.5rem] p-12 text-center">
                        <Shield className="mx-auto text-gray-300 dark:text-gray-700 mb-4 opacity-30" size={48} />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            La configuración de soberanía está administrada globalmente por la clínica.
                        </p>
                    </div>
                }
            >
                <div className="bg-white dark:bg-[#161f31] border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm">
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            Privacidad y Soberanía
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 leading-relaxed text-sm">
                            Tú decides qué información es visible para la administración de la clínica y tus colegas.
                        </p>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-500/5 rounded-[3rem] p-8 border border-orange-100 dark:border-orange-500/10 transition-all hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-white dark:bg-[#161f31] rounded-2xl flex-shrink-0 flex items-center justify-center border border-orange-100 dark:border-gray-800 shadow-sm text-orange-500">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-gray-800 dark:text-gray-200">Visibilidad de Agenda</p>
                                    <p className="text-xs text-orange-600/70 dark:text-orange-400/70 font-medium flex items-center gap-1 mt-1">
                                        <Info size={12} /> Restricción de acceso a datos sensibles
                                    </p>

                                    <ul className="mt-6 space-y-3 border-l-2 border-orange-200 dark:border-orange-500/20 pl-4">
                                        <li className="flex items-center gap-2 text-[11px] text-gray-600 dark:text-gray-400">
                                            <CheckCircle2 size={14} className="text-orange-500/60" />
                                            Anonimización: Tus colegas solo verán "Cita Ocupada".
                                        </li>
                                        <li className="flex items-center gap-2 text-[11px] text-gray-600 dark:text-gray-400">
                                            <CheckCircle2 size={14} className="text-orange-500/60" />
                                            Privacidad: Se ocultan nombres, apellidos y documentos.
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="pt-2">
                                {/* CAMBIO CLAVE: Mientras no hay memberId, mostramos un loader sutil en vez de Error */}
                                {memberId ? (
                                    <PermissionToggle
                                        clinicId={clinicId}
                                        memberId={memberId}
                                        resourceType="appointments"
                                        label="Ocultar Agenda"
                                        initialValue={isAgendaHidden}
                                        onUpdate={handleUpdate}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">Sincronizando</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Can>
        </div>
    );
};

export default SovereigntyPage;