import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Loader2, UserPlus } from 'lucide-react';

export const Login = () => {
    // 1. Estados de la UI
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // Nuevo para registro
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 2. Lógica de Invitación
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const { login } = useAuth();
    const navigate = useNavigate();

    // 3. Efecto para detectar invitación
    useEffect(() => {
        if (token) {
            setIsLogin(false); // Forzamos modo registro
            const validateInvitation = async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/clinics/invitations/validate/${token}`);
                    const data = await response.json();
                    if (response.ok) {
                        setEmail(data.email); // Pre-cargamos el email invitado
                    }
                } catch (err) {
                    console.error("Token no válido");
                }
            };
            validateInvitation();
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const payload = isLogin ? { email, password } : { name, email, password };

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const resData = await response.json();

            if (response.ok) {
                // 4. SI ES REGISTRO CON TOKEN: Aceptar invitación automáticamente
                if (!isLogin && token) {
                    await fetch(`${import.meta.env.VITE_API_URL}/api/clinics/accept-invitation`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token, userId: resData.user.id })
                    });
                }

                login(resData.user);
                navigate('/pacientes');
            } else {
                setError(resData.message || 'Error en la operación');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
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
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3">
                            <AlertCircle size={18} />
                            <span className="text-xs font-bold uppercase tracking-wide">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Campo Nombre (solo registro) */}
                        {!isLogin && (
                            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2 ml-2">Nombre completo</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-6 py-5 bg-gray-50 dark:bg-[#101828] border-2 border-transparent focus:border-[#50e3c2]/30 text-white rounded-[1.5rem] outline-none transition-all"
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
                                    disabled={!!token} // Si viene de invitación, el email no se cambia
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-[#101828] border-2 border-transparent focus:border-[#50e3c2]/30 text-white rounded-[1.5rem] outline-none transition-all disabled:opacity-60"
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
                            className="w-full py-5 bg-gray-900 dark:bg-[#50e3c2] text-white dark:text-gray-900 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.1em] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <span>{isLogin ? 'Entrar al Sistema' : 'Crear Cuenta'}</span>}
                        </button>
                    </form>

                    {/* Selector de Modo (Login/Registro) */}
                    {!token && (
                        <div className="mt-8 text-center">
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