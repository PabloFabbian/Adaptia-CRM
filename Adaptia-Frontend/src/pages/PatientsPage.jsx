import { useState } from 'react';
import { Users, UserPlus, Search, Mail, Phone, Filter, X, FileText, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePatients } from '../hooks/usePatients';

export const PatientsPage = () => {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();

    // Pasamos el "setter" al hook para que abra el perfil automáticamente si hay un ID en la URL
    const { patients, loading } = usePatients(setSelectedPatient);

    const closePanel = () => {
        setSelectedPatient(null);
        setSearchParams({}); // Limpia el ?open=ID de la URL al cerrar
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.history?.dni && p.history.dni.includes(searchTerm))
    );

    return (
        <div className="relative min-h-screen bg-gray-50/30">
            {/* CONTENIDO PRINCIPAL */}
            <div className={`max-w-7xl mx-auto px-4 py-8 transition-all duration-300 ${selectedPatient ? 'pr-[420px]' : ''}`}>
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-orange-500 rounded-xl text-white shadow-sm">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Base de Pacientes</h1>
                            <p className="text-gray-500 text-xs font-medium">{filteredPatients.length} pacientes sincronizados</p>
                        </div>
                    </div>
                    <Link to="/nuevo-paciente" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-sm">
                        <UserPlus size={16} /> Nuevo Registro
                    </Link>
                </header>

                {/* BUSCADOR */}
                <div className="flex gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o DNI..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all"
                        />
                    </div>
                    <button className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-gray-600 transition-all">
                        <Filter size={20} />
                    </button>
                </div>

                {/* TABLA DE PACIENTES */}
                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                                <th className="px-6 py-4">Paciente</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4">Propiedad (Scope)</th>
                                <th className="px-6 py-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="4" className="px-6 py-20 text-center text-gray-400 font-medium animate-pulse">Sincronizando con Adaptia Cloud...</td></tr>
                            ) : filteredPatients.map((patient) => (
                                <tr
                                    key={patient.id}
                                    className={`hover:bg-orange-50/30 transition-colors group cursor-pointer ${selectedPatient?.id === patient.id ? 'bg-orange-50/50' : ''}`}
                                    onClick={() => setSelectedPatient(patient)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-tr from-orange-100 to-orange-200 text-orange-700 rounded-full flex items-center justify-center font-bold text-xs border border-orange-200">
                                                {patient.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{patient.name}</p>
                                                <p className="text-[10px] text-gray-400 font-mono">{patient.history?.dni || 'SIN DNI'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-0.5 text-xs text-gray-500">
                                            <span className="flex items-center gap-1.5"><Mail size={12} className="text-gray-300" /> {patient.history?.email || '—'}</span>
                                            <span className="flex items-center gap-1.5"><Phone size={12} className="text-gray-300" /> {patient.history?.phone || '—'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase tracking-tight border border-blue-100">
                                            <ShieldCheck size={10} /> {patient.owner_name || 'Mío'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <ExternalLink size={16} className="text-gray-300 group-hover:text-orange-500 inline-block transition-colors" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PANEL LATERAL */}
            {selectedPatient && (
                <div className="fixed right-0 top-0 h-screen w-[400px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.04)] z-50 animate-in slide-in-from-right duration-300 border-l border-gray-100 overflow-y-auto">
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-8">
                            <button onClick={closePanel} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors">
                                <X size={20} />
                            </button>
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Expediente Clínico</span>
                        </div>

                        <header className="flex items-center gap-5 mb-10">
                            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-orange-100">
                                {selectedPatient.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedPatient.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[9px] font-bold rounded uppercase">Activo</span>
                                    <span className="text-gray-300 text-[10px] font-mono">#{selectedPatient.id.toString().padStart(4, '0')}</span>
                                </div>
                            </div>
                        </header>

                        <div className="space-y-8">
                            <section className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                                <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <ShieldCheck size={12} /> Control de Acceso
                                </h3>
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    Este expediente pertenece a <b>{selectedPatient.owner_name || 'Luis David'}</b>. Tienes permisos otorgados por Adaptia.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">Información de Contacto</h3>
                                <div className="grid gap-3">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center"><Mail size={14} className="text-gray-400" /></div>
                                        <span className="text-sm font-medium">{selectedPatient.history?.email || 'Sin correo'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center"><Phone size={14} className="text-gray-400" /></div>
                                        <span className="text-sm font-medium">{selectedPatient.history?.phone || 'Sin teléfono'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center"><MapPin size={14} className="text-gray-400" /></div>
                                        <span className="text-sm font-medium leading-tight">{selectedPatient.history?.address || 'Sin dirección'}</span>
                                    </div>
                                </div>
                            </section>

                            <section className="pt-4 space-y-3">
                                <button className="w-full flex items-center justify-center gap-2 p-3.5 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all shadow-md">
                                    <FileText size={18} /> Crear Nota Clínica
                                </button>
                                <button className="w-full flex items-center justify-center gap-2 p-3.5 bg-white border border-gray-200 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all">
                                    <ExternalLink size={18} /> Ver Historial Completo
                                </button>
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};