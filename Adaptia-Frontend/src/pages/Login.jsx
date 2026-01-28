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
            // Aquí conectarás con tu endpoint de login en el futuro
            // Por ahora, simularemos un login exitoso con un usuario de Neon
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const resData = await response.json();

            if (response.ok) {
                login(resData.user); // Guardamos el usuario (id, nombre, etc.)
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 bg-gray-900 rounded-3xl text-white shadow-2xl mb-4">
                        <LogIn size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Bienvenido a Adaptia</h1>
                    <p className="text-gray-500 mt-2">Ingresa a tu panel de gestión clínica</p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                            <AlertCircle size={20} />
                            <span className="text-sm font-semibold">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Email profesional</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent border focus:border-gray-900 focus:bg-white rounded-2xl outline-none transition-all"
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent border focus:border-gray-900 focus:bg-white rounded-2xl outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-lg hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-sm text-gray-400">
                    &copy; 2026 Adaptia Clinic. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
};