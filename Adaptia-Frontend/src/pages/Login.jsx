import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Loader2, UserPlus, CheckCircle2 } from 'lucide-react';

export const Login = () => {
    // 1. Estados de la UI
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // 2. Lógica de Invitación y Auth
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const { user, login, logout } = useAuth(); // Añadimos user y logout
    const navigate = useNavigate();

    // 3. Efecto para validar invitación y manejar sesiones previas
    useEffect(() => {
        if (token) {
            // Si hay un token y ya hay un usuario logueado, cerramos sesión para evitar conflictos
            if (user) {
                logout();
            }

            setIsLogin(false); // Forzamos vista de registro

            const validateInvitation = async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/clinics/invitations/validate/${token}`);

                    // Verificación de seguridad para evitar el error JSON.parse
                    const contentType = response.headers.get("content-type");
                    if (!contentType || !contentType.includes("application/json")) {
                        const text = await response.text();
                        console.error("Respuesta no JSON del servidor:", text);
                        throw new Error("El servidor de invitaciones no responde correctamente.");
                    }

                    const data = await response.json();

                    if (response.ok) {
                        setEmail(data.email);
                        setSuccessMsg(`Invitación válida para ${data.clinic_name}`);
                    } else {
                        setError(data.error || "La invitación ha expirado o no es válida");
                    }
                } catch (err) {
                    setError(err.message || "Error al conectar con el servidor de validación");
                }
            };
            validateInvitation();
        }
    }, [token]); // Quitamos 'user' de las dependencias para evitar bucles de logout

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const payload = isLogin ? { email, password } : { name, email, password };

        try {
            // PASO A: Login o Registro de usuario
            const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Manejo seguro de JSON para evitar el "Unexpected character"
            const contentType = response.headers.get("content-type");
            let resData;
            if (contentType && contentType.includes("application/json")) {
                resData = await response.json();
            } else {
                const rawText = await response.text();
                throw new Error(`Error del servidor: ${rawText.substring(0, 50)}...`);
            }

            if (!response.ok) {
                throw new Error(resData.message || 'Error en la operación');
            }

            // PASO B: Si es registro con invitación, vinculamos a la clínica
            if (!isLogin && token) {
                const acceptRes = await fetch(`${import.meta.env.VITE_API_URL}/api/clinics/accept-invitation`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        token: token,
                        userId: resData.user.id
                    })
                });

                if (!acceptRes.ok) {
                    const acceptData = await acceptRes.json();
                    setError("Cuenta creada, pero hubo un problema al unirse a la clínica.");
                    console.error("Error vinculación:", acceptData.error);
                }
            }

            // PASO C: Autenticar en la App
            login(resData.user);
            navigate('/'); // Cambiado a '/' para que App.jsx decida a dónde ir

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#101828] px-4 transition-colors duration-500">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex p-5 bg-[#50e3c2] rounded-[2rem] text-gray-900 shadow-2xl shadow-[#50e3c2]/20 mb-6">
                        {isLogin ? <LogIn size={32} strokeWidth={2.5} /> : <UserPlus size={32} strokeWidth={2.5} />}
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Adaptia</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                        {isLogin ? 'Inicia sesión en tu clínica' : 'Crea tu cuenta profesional'}
                    </p>
                </div>

                <div className="bg-white dark:bg-[#161f31] p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl">
                    {successMsg && !error && (
                        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                            <CheckCircle2 size={18} />
                            <span className="text-xs font-bold uppercase tracking-wide">{successMsg}</span>
                        </div>
                    )}

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3">
                            <AlertCircle size={18} />
                            <span className="text-xs font-bold uppercase tracking-wide">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2 ml-2">Nombre completo</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-6 py-5 bg-gray-50 dark:bg-[#101828] border-2 border-transparent focus:border-[#50e3c2]/30 text-white rounded-[1.5rem] outline-none transition-all placeholder:text-gray-600"
                                    placeholder="Dr. García"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2 ml-2">Email profesional</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#50e3c2]" size={20} />
                                <input
                                    type="email"
                                    required
                                    disabled={!!token}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-[#101828] border-2 border-transparent focus:border-[#50e3c2]/30 text-white rounded-[1.5rem] outline-none transition-all disabled:opacity-50"
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2 ml-2">Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#50e3c2]" size={20} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-[#101828] border-2 border-transparent focus:border-[#50e3c2]/30 text-white rounded-[1.5rem] outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full py-5 bg-gray-900 dark:bg-[#50e3c2] text-white dark:text-gray-900 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.1em] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <span>{isLogin ? 'Entrar al Sistema' : 'Crear Cuenta'}</span>}
                        </button>
                    </form>

                    {!token && (
                        <div className="mt-8 text-center border-t border-gray-100 dark:border-gray-800 pt-6">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-[11px] font-bold text-gray-400 hover:text-[#50e3c2] uppercase tracking-widest transition-colors"
                            >
                                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Ingresa'}
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-center mt-10 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                    &copy; 2026 Adaptia Clinic &bull; Secure Terminal
                </p>
            </div>
        </div>
    );
};