import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const resData = await response.json();

            if (response.ok) {
                login(resData.user);
                navigate('/pacientes');
            } else {
                setError(resData.message || 'Credenciales incorrectas');
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
                        <LogIn size={32} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Adaptia</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Panel de gestión clínica</p>
                </div>

                <div className="bg-white dark:bg-[#161f31] p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl dark:shadow-2xl">
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <AlertCircle size={18} />
                            <span className="text-xs font-bold uppercase tracking-wide">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-2 ml-2">Email profesional</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#50e3c2] transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-[#101828] border-2 border-transparent focus:border-[#50e3c2]/30 dark:focus:border-[#50e3c2]/50 text-gray-900 dark:text-white rounded-[1.5rem] outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-2 ml-2">Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#50e3c2] transition-colors" size={20} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-[#101828] border-2 border-transparent focus:border-[#50e3c2]/30 dark:focus:border-[#50e3c2]/50 text-gray-900 dark:text-white rounded-[1.5rem] outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full py-5 bg-gray-900 dark:bg-[#50e3c2] text-white dark:text-gray-900 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.1em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 overflow-hidden relative"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Entrar al Sistema</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-10 space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">
                        &copy; 2026 Adaptia Clinic &bull; Secure Terminal
                    </p>
                    <div className="flex justify-center gap-4">
                        <div className="w-1 h-1 rounded-full bg-[#50e3c2]/30" />
                        <div className="w-1 h-1 rounded-full bg-[#50e3c2]/30" />
                        <div className="w-1 h-1 rounded-full bg-[#50e3c2]/30" />
                    </div>
                </div>
            </div>
        </div>
    );
};