import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
    ShieldCheck,
    Lock,
    ChevronRight,
    CheckCircle2,
    Loader2,
    Building2,
    Info
} from 'lucide-react';

export const AcceptInvitation = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { user, login } = useAuth(); // Usamos login para refrescar las memberships al finalizar

    const [invitation, setInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Validar token y obtener info de la clínica
        const fetchInvitation = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/invitations/validate/${token}`);
                if (!res.ok) throw new Error("Esta invitación ha expirado o no es válida.");
                const data = await res.json();
                setInvitation(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchInvitation();
    }, [token]);

    const handleAccept = async () => {
        if (!user) {
            // Si no está logueado, lo mandamos a registro/login primero
            navigate(`/register?callback=/accept-invitation/${token}`);
            return;
        }

        setProcessing(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/clinics/accept-invitation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, userId: user.id })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Refrescamos los datos del usuario para que el AuthContext vea la nueva clínica
            // Aquí llamarías a una función que traiga el perfil actualizado
            alert("¡Bienvenido a la sede! Ahora configurarás tus permisos.");
            navigate('/clinicas');
        } catch (err) {
            alert(err.message);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
            <Loader2 className="animate-spin text-adaptia-blue" size={32} />
        </div>
    );

    if (error) return (
        <div className="h-screen flex items-center justify-center p-4">
            <Card className="max-w-md p-8 text-center">
                <ShieldAlert className="mx-auto text-red-400 mb-4" size={48} />
                <h1 className="text-xl font-medium text-gray-800 dark:text-white mb-2">Enlace no válido</h1>
                <p className="text-sm text-gray-500 mb-6">{error}</p>
                <Button onClick={() => navigate('/')} variant="secondary" className="w-full justify-center">Volver al inicio</Button>
            </Card>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col items-center justify-center p-4 animate-in fade-in duration-700">
            <div className="w-full max-w-xl">
                {/* Brand Logo */}
                <div className="flex justify-center mb-10">
                    <img src="/Logo1.png" alt="Adaptia" className="h-10 w-auto dark:brightness-110" />
                </div>

                <Card className="overflow-hidden border-none shadow-2xl">
                    <div className="bg-gradient-to-r from-adaptia-blue/10 to-adaptia-mint/10 p-8 border-b border-gray-100 dark:border-dark-border">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-dark-surface flex items-center justify-center shadow-sm">
                                <Building2 className="text-adaptia-blue" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-light text-gray-800 dark:text-white">
                                    Invitación a <span className="font-medium text-adaptia-blue">{invitation.clinic_name}</span>
                                </h2>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Sede de Psicología Sanitaria</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="mt-1"><CheckCircle2 className="text-emerald-500" size={18} /></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Rol asignado: {invitation.role_name}</p>
                                    <p className="text-xs text-gray-400 font-light mt-1 text-balance italic">
                                        Tendrás las capacidades de este rol una vez que la vinculación se complete.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 bg-blue-50/50 dark:bg-adaptia-blue/5 rounded-2xl border border-blue-100/50 dark:border-adaptia-blue/20">
                                <div className="mt-1"><Lock className="text-adaptia-blue" size={18} /></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Soberanía de Datos Activa</p>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
                                        Al aceptar, entrarás con todos los permisos de acceso a datos **desactivados**.
                                        Tú decidirás manualmente qué pacientes y agendas compartir con la sede desde tu panel de control.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex flex-col gap-3">
                            <Button
                                onClick={handleAccept}
                                disabled={processing}
                                className="w-full justify-center py-4 bg-gray-900 dark:bg-adaptia-blue text-white rounded-2xl shadow-lg shadow-adaptia-blue/20"
                            >
                                {processing ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>Vincularme a esta sede <ChevronRight size={18} className="ml-2" /></>
                                )}
                            </Button>
                            <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                                Al hacer clic, aceptas los términos de colaboración de la sede.
                            </p>
                        </div>
                    </div>
                </Card>

                <div className="mt-8 flex items-center justify-center gap-2 text-gray-400 dark:text-gray-600">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Encriptación de extremo a extremo</span>
                </div>
            </div>
        </div>
    );
};