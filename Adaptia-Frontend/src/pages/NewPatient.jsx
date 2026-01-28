import { useState, useRef } from 'react';
import { UserPlus, ArrowLeft, Mail, Phone, CreditCard, MapPin, AlertCircle, ExternalLink, Calendar, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importante para la propiedad de los datos

export const NewPatient = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // Obtenemos el psicólogo logueado
    const errorRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [duplicatePatient, setDuplicatePatient] = useState(null);

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', dni: '', address: '', birthDate: ''
    });

    // Función para llevar la vista al mensaje de error
    const scrollToError = () => {
        setTimeout(() => {
            errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const handleChange = (e) => {
        setError('');
        setDuplicatePatient(null);
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Verificación de duplicados en la base de datos
            const checkRes = await fetch('http://localhost:3001/api/patients');
            const { data } = await checkRes.json();

            const existing = data.find(p =>
                (p.history?.dni === formData.dni && formData.dni !== '') ||
                p.name.toLowerCase() === formData.name.toLowerCase()
            );

            if (existing) {
                setError(`El paciente "${existing.name}" ya está registrado.`);
                setDuplicatePatient(existing);
                setLoading(false);
                scrollToError();
                return;
            }

            // 2. Registro en Neon con el ID del usuario actual
            const response = await fetch('http://localhost:3001/api/patients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    ownerMemberId: user?.id || 1, // Usa el ID del login o 1 por defecto
                    history: { ...formData }      // Se guarda como JSONB en el backend
                })
            });

            if (response.ok) {
                navigate('/pacientes');
            } else {
                throw new Error('Error en la respuesta del servidor');
            }
        } catch (err) {
            setError('Error al conectar con la base de datos cloud.');
            scrollToError();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-500">
            {/* Header y Navegación */}
            <Link to="/pacientes" className="flex items-center gap-2 text-gray-400 hover:text-gray-600 mb-6 text-sm transition-colors group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Volver a la base de datos
            </Link>

            <header className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-xl shadow-orange-100">
                        <UserPlus className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Registro de Paciente</h1>
                        <p className="text-gray-500 text-sm">Crea una nueva ficha clínica digital</p>
                    </div>
                </div>

                {/* ALERTA DE ERROR CON AUTO-SCROLL */}
                <div ref={errorRef}>
                    {error && (
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl mt-6 animate-in slide-in-from-top-4">
                            <div className="flex items-center gap-3">
                                <AlertCircle size={20} className="text-red-500 shrink-0" />
                                <span className="text-sm font-semibold">{error}</span>
                            </div>
                            {duplicatePatient && (
                                <button
                                    type="button"
                                    onClick={() => navigate(`/pacientes?open=${duplicatePatient.id}`)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-all shadow-sm shrink-0"
                                >
                                    <ExternalLink size={14} />
                                    Abrir Perfil Existente
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* SECCIÓN 1: DATOS PERSONALES */}
                <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-800">
                        <span className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                        Información Personal
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-2">Nombre Completo</label>
                            <input
                                name="name" required value={formData.name} onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${error.includes('registrado') ? 'border-red-300 ring-4 ring-red-50' : 'border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-orange-100'}`}
                                placeholder="Ej. Juan Pérez García"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">DNI/NIE</label>
                            <div className="relative">
                                <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    name="dni" required value={formData.dni} onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-orange-100 outline-none transition-all"
                                    placeholder="12345678X"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Fecha de Nacimiento</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    name="birthDate" type="date" value={formData.birthDate} onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-orange-100 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 2: CONTACTO */}
                <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-800">
                        <span className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                        Contacto y Ubicación
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Correo Electrónico</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    name="email" type="email" value={formData.email} onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                    placeholder="nombre@ejemplo.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Teléfono Móvil</label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    name="phone" type="tel" value={formData.phone} onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                    placeholder="+34 600 000 000"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-2">Dirección Residencial</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    name="address" value={formData.address} onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                    placeholder="Calle, Número, Ciudad"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ACCIONES FINALES */}
                <div className="flex items-center justify-end gap-4 pt-4 pb-12">
                    <button
                        type="button"
                        onClick={() => navigate('/pacientes')}
                        className="px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        disabled={loading}
                        className="px-10 py-3 bg-gray-900 text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50 shadow-lg active:scale-95"
                    >
                        {loading ? 'Sincronizando...' : (
                            <>
                                <Save size={18} />
                                Finalizar Registro
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};