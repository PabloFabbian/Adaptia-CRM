import { Shield, Users, Info, Eye, EyeOff, Loader2 } from 'lucide-react';
import { PermissionToggle } from '../features/clinics/PermissionToggle';
import { Can } from '../components/auth/Can';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const SovereigntyPage = ({ fetchAppointments }) => {
    const { user, refreshUser } = useAuth();

    useEffect(() => {
        if (user && !user.member_id && refreshUser) {
            refreshUser();
        }
    }, [user, refreshUser]);

    // is_granted = true → el miembro COMPARTIÓ su agenda con la clínica
    const isSharing = user?.consents?.some(
        c => c.type === 'appointments' && (c.is_granted === true || c.is_granted === 1)
    ) || false;

    const handleUpdate = async () => {
        try {
            if (refreshUser) await refreshUser();
            if (fetchAppointments) fetchAppointments();
        } catch (error) {
            console.error("❌ Error al actualizar estado local:", error);
        }
    };

    const clinicId = user?.activeClinic?.id || user?.clinic_id;
    const memberId = user?.member_id;

    return (
        <div className="max-w-5xl mx-auto px-6 pt-8 pb-20 animate-in fade-in duration-700">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-orange-500" />
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                            Seguridad y Privacidad
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Soberanía de <span className="text-orange-500">Datos</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Controla quién puede acceder a tu información clínica y agenda profesional.
                    </p>
                </div>

                <div className="hidden md:block p-3 bg-orange-50 dark:bg-orange-500/10 rounded-2xl border border-orange-100 dark:border-orange-500/20">
                    <Shield className="w-6 h-6 text-orange-500" />
                </div>
            </header>

            <Can
                perform="clinic.resources.manage"
                fallback={
                    <div className="bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-16 text-center">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Shield className="text-slate-300 dark:text-slate-600 opacity-50" size={32} />
                        </div>
                        <h3 className="text-slate-900 dark:text-white font-bold mb-2">Administración Restringida</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
                            La configuración de soberanía está administrada globalmente por la clínica para cumplir con las normativas locales.
                        </p>
                    </div>
                }
            >
                <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                                Configuración de Visibilidad
                            </h3>
                        </div>

                        <div className={`rounded-[2rem] p-8 md:p-10 border transition-all duration-500 ${isSharing
                            ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10'
                            : 'bg-orange-50/50 dark:bg-orange-500/5 border-orange-100 dark:border-orange-500/10'
                            }`}>
                            <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                                <div className="flex items-start gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center border shadow-sm transition-colors duration-500 ${isSharing
                                        ? 'bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-500/20 text-emerald-500'
                                        : 'bg-white dark:bg-slate-900 border-orange-100 dark:border-orange-500/20 text-orange-500'
                                        }`}>
                                        <Users size={28} />
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                                Visibilidad de Agenda Profesional
                                            </p>
                                            {/* Estado dinámico según si comparte o no */}
                                            <div className={`flex items-center gap-2 mt-1 transition-colors duration-300 ${isSharing
                                                ? 'text-emerald-600/80 dark:text-emerald-400/80'
                                                : 'text-orange-600/70 dark:text-orange-400/70'
                                                }`}>
                                                {isSharing
                                                    ? <Eye size={14} />
                                                    : <EyeOff size={14} />
                                                }
                                                <p className="text-xs font-bold uppercase tracking-wider">
                                                    {isSharing
                                                        ? 'Compartiendo con la clínica'
                                                        : 'Información privada — solo visible para vos'
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 py-2">
                                            <div className="flex items-top gap-2 md:mr-12 2xl:mr-20 text-sm text-slate-600 dark:text-slate-400">
                                                <Info size={16} className={`shrink-0 mt-[0.24rem] ${isSharing ? 'text-emerald-500' : 'text-orange-500'}`} />
                                                <span>
                                                    {isSharing
                                                        ? <><strong className="text-slate-900 dark:text-slate-200">Activo:</strong> Colegas verán tus bloques como "Ocupado". Los datos del paciente siguen siendo privados.</>
                                                        : <><strong className="text-slate-900 dark:text-slate-200">Privado:</strong> Tu agenda no es visible para ningún miembro de la clínica.</>
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Toggle + estado */}
                                <div className={`w-full md:w-[140px] flex flex-col items-center p-6 bg-white dark:bg-slate-900 rounded-3xl border shadow-sm transition-colors duration-500 ${isSharing
                                    ? 'border-emerald-100 dark:border-emerald-500/10'
                                    : 'border-orange-100 dark:border-orange-500/10'
                                    }`}>
                                    {memberId ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <PermissionToggle
                                                clinicId={clinicId}
                                                memberId={memberId}
                                                resourceType="appointments"
                                                label="Agenda"
                                                initialValue={isSharing}
                                                onUpdate={handleUpdate}
                                            />
                                            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${isSharing ? 'text-emerald-500' : 'text-orange-500'
                                                }`}>
                                                {isSharing ? 'Compartiendo' : 'Privado'}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 py-2">
                                            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                                            <span className="text-[10px] text-orange-500 font-black uppercase tracking-[0.2em]">Sincronizando</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Marca de agua decorativa */}
                    <Shield className="absolute -right-12 -bottom-12 text-slate-100 dark:text-slate-800/20 w-64 h-64 -rotate-12 pointer-events-none" />
                </div>
            </Can>
        </div>
    );
};

export default SovereigntyPage;