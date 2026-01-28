import { useState } from 'react';
import {
    Users, UserPlus, Search, Mail, Phone, Filter, X,
    FileText, MapPin, ExternalLink, ShieldCheck
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePatients } from '../hooks/usePatients';

export const PatientsPage = () => {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();

    // Hook personalizado que conecta con Neon Cloud
    const { patients, loading } = usePatients(setSelectedPatient);

    const closePanel = () => {
        setSelectedPatient(null);
        setSearchParams({}); // Limpia el ?open=ID de la URL al cerrar
    };

    // Lógica de búsqueda avanzada: Nombre o DNI
    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.history?.dni && p.history.dni.includes(searchTerm))
    );

    return (
        <div className="relative min-h-screen">
            {/* CONTENIDO PRINCIPAL */}
            <div className={`max-w-7xl mx-auto px-4 py-8 transition-all duration-500 ease-in-out ${selectedPatient ? 'pr-[420px]' : ''}`}>
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-lg shadow-orange-100">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pacientes</h1>
                            <p className="text-gray-400 text-sm font-light">
                                <span className="text-gray-900 font-medium">{filteredPatients.length}</span> registros en la nube
                            </p>
                        </div>
                    </div>
                    <Link to="/nuevo-paciente" className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all shadow-xl active:scale-95">
                        <UserPlus size={18} /> Nuevo Registro
                    </Link>
                </header>

                {/* BUSCADOR Y FILTROS */}
                <div className="flex gap-4 mb-8">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o DNI..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-orange-50 transition-all shadow-sm"
                        />
                    </div>
                    <button className="p-4 bg-white border border-gray-100 rounded-[1.5rem] text-gray-400 hover:text-gray-900 hover:shadow-md transition-all">
                        <Filter size={20} />
                    </button>
                </div>

                {/* TABLA PROFESIONAL */}
                <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                    <th className="px-8 py-5">Identificación de Paciente</th>
                                    <th className="px-8 py-5">Datos de Contacto</th>
                                    <th className="px-8 py-5">Propiedad del Dato</th>
                                    <th className="px-8 py-5 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-32 text-center text-gray-400 font-light animate-pulse">
                                            Sincronizando con Adaptia Cloud...
                                        </td>
                                    </tr>
                                ) : filteredPatients.length > 0 ? (
                                    filteredPatients.map((patient) => (
                                        <tr
                                            key={patient.id}
                                            className={`hover:bg-orange-50/30 transition-all group cursor-pointer ${selectedPatient?.id === patient.id ? 'bg-orange-50/50' : ''}`}
                                            onClick={() => setSelectedPatient(patient)}
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gradient-to-tr from-gray-50 to-gray-100 text-gray-600 rounded-2xl flex items-center justify-center font-bold text-sm border border-gray-200 group-hover:border-orange-200 group-hover:bg-orange-100 group-hover:text-orange-700 transition-all">
                                                        {patient.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 leading-tight">{patient.name}</p>
                                                        <p className="text-[11px] text-gray-400 font-mono mt-1 uppercase">ID-{patient.history?.dni || 'SN'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="space-y-1">
                                                    <span className="flex items-center gap-2 text-xs text-gray-600 italic">
                                                        <Mail size={12} className="text-gray-300" /> {patient.history?.email || '—'}
                                                    </span>
                                                    <span className="flex items-center gap-2 text-xs text-gray-600">
                                                        <Phone size={12} className="text-gray-300" /> {patient.history?.phone || '—'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                                                    <ShieldCheck size={12} /> {patient.owner_name || 'Luis David'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button className="p-2 text-gray-300 group-hover:text-orange-500 transition-colors">
                                                    <ExternalLink size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center text-gray-400">
                                            No se encontraron pacientes que coincidan con la búsqueda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* PANEL LATERAL DE DETALLE */}
            {selectedPatient && (
                <div className="fixed right-0 top-0 h-screen w-[400px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.05)] z-50 animate-in slide-in-from-right duration-500 border-l border-gray-100 flex flex-col">
                    <div className="p-8 flex-1 overflow-y-auto">
                        <div className="flex justify-between items-center mb-10">
                            <button onClick={closePanel} className="p-2.5 hover:bg-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 transition-all">
                                <X size={24} />
                            </button>
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">Expediente Digital</span>
                        </div>

                        <header className="flex flex-col items-center text-center mb-10">
                            <div className="w-24 h-24 bg-orange-500 rounded-[2rem] flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-orange-100 mb-4">
                                {selectedPatient.name.charAt(0)}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{selectedPatient.name}</h2>
                            <p className="text-xs text-gray-400 mt-1 uppercase font-mono tracking-widest">Paciente de Adaptia</p>
                        </header>

                        <div className="space-y-8">
                            {/* Card de Permisos */}
                            <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-3xl">
                                <h3 className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <ShieldCheck size={14} /> Estado de Privacidad
                                </h3>
                                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                    Este expediente es propiedad de <b>{selectedPatient.owner_name || 'Luis David'}</b>. Tienes acceso de lectura y edición habilitado.
                                </p>
                            </div>

                            {/* Información Detallada */}
                            <section className="space-y-6">
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-3">Información de Contacto</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-gray-600 hover:bg-gray-50 p-2 rounded-xl transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"><Mail size={16} className="text-gray-400" /></div>
                                        <span className="text-sm font-semibold">{selectedPatient.history?.email || 'No registrado'}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-gray-600 hover:bg-gray-50 p-2 rounded-xl transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"><Phone size={16} className="text-gray-400" /></div>
                                        <span className="text-sm font-semibold">{selectedPatient.history?.phone || 'No registrado'}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-gray-600 hover:bg-gray-50 p-2 rounded-xl transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"><MapPin size={16} className="text-gray-400" /></div>
                                        <span className="text-sm font-semibold leading-snug">{selectedPatient.history?.address || 'Sin dirección registrada'}</span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Footer de Acciones fijas al final del panel */}
                    <div className="p-8 border-t border-gray-100 bg-gray-50/30 space-y-3">
                        <button className="w-full flex items-center justify-center gap-3 py-4 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all shadow-xl active:scale-95">
                            <FileText size={18} /> Crear Nota Clínica
                        </button>
                        <button className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all">
                            <ExternalLink size={18} /> Ver Todo el Historial
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};