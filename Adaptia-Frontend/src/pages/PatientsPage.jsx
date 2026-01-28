import { useEffect, useState } from 'react';
import { Users, UserPlus, Search, MoreHorizontal, Mail, Phone, CreditCard, Filter, X, FileText, MapPin, ExternalLink } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export const PatientsPage = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/patients');
                const json = await res.json();
                const data = json.data || [];
                setPatients(data);

                // Lógica para abrir paciente desde URL (?open=ID)
                const openId = searchParams.get('open');
                if (openId) {
                    const p = data.find(item => item.id.toString() === openId);
                    if (p) setSelectedPatient(p);
                }
            } catch (error) {
                console.error("Error cargando pacientes", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, [searchParams]);

    const closePanel = () => {
        setSelectedPatient(null);
        setSearchParams({}); // Limpia la URL al cerrar
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.history?.dni && p.history.dni.includes(searchTerm))
    );

    return (
        <div className="relative min-h-screen bg-gray-50/30">
            {/* Contenido Principal - Ahora no se bloquea ni se difumina */}
            <div className={`max-w-7xl mx-auto px-4 py-8 transition-all duration-300 ${selectedPatient ? 'pr-[420px]' : ''}`}>
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500 rounded-lg text-white">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Base de Pacientes</h1>
                            <p className="text-gray-500 text-xs">{filteredPatients.length} registros</p>
                        </div>
                    </div>
                    <Link to="/nuevo-paciente" className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all">
                        <UserPlus size={16} /> Nuevo
                    </Link>
                </header>

                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o DNI..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all shadow-sm"
                        />
                    </div>
                    <button className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-gray-600 transition-all">
                        <Filter size={20} />
                    </button>
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-5">Información del Paciente</th>
                                <th className="px-6 py-5">Contacto Principal</th>
                                <th className="px-6 py-5">Estado Clínico</th>
                                <th className="px-6 py-5 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="4" className="px-6 py-20 text-center text-gray-400">Accediendo al historial...</td></tr>
                            ) : filteredPatients.map((patient) => (
                                <tr
                                    key={patient.id}
                                    className="hover:bg-gray-50/40 transition-colors group cursor-pointer"
                                    onClick={() => setSelectedPatient(patient)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 bg-gradient-to-tr from-orange-50 to-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm border border-orange-200">
                                                {patient.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{patient.name}</p>
                                                <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono mt-0.5">
                                                    <CreditCard size={10} /> {patient.history?.dni || 'SIN DNI'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <Mail size={12} className="text-gray-300" />
                                                {patient.history?.email || '—'}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <Phone size={12} className="text-gray-300" />
                                                {patient.history?.phone || '—'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                                            Activo
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <ExternalLink size={16} className="text-gray-300 group-hover:text-gray-600 inline-block" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PANEL LATERAL COMPACTO */}
            {selectedPatient && (
                <div className="fixed right-0 top-0 h-screen w-[400px] bg-white shadow-[0_0_40px_rgba(0,0,0,0.08)] z-50 animate-in slide-in-from-right duration-300 border-l border-gray-200 overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <button onClick={closePanel} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                <X size={20} />
                            </button>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Detalle del Paciente</span>
                        </div>

                        <header className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                                {selectedPatient.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 leading-tight">{selectedPatient.name}</h2>
                                <p className="text-gray-400 font-mono text-[11px]">ID: {selectedPatient.id.toString().padStart(4, '0')}</p>
                            </div>
                        </header>

                        <div className="space-y-6">
                            <section>
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Contacto</h3>
                                <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Mail size={14} className="text-gray-400" />
                                        <span className="text-sm truncate">{selectedPatient.history?.email || 'Sin correo'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Phone size={14} className="text-gray-400" />
                                        <span className="text-sm">{selectedPatient.history?.phone || 'Sin teléfono'}</span>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Ubicación</h3>
                                <div className="flex items-start gap-3 text-gray-600 px-1">
                                    <MapPin size={14} className="text-gray-400 mt-0.5" />
                                    <span className="text-sm leading-snug text-gray-500">{selectedPatient.history?.address || 'No registrada'}</span>
                                </div>
                            </section>

                            <hr className="border-gray-100" />

                            <section>
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Acciones rápidas</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <button className="flex items-center justify-center gap-2 p-2 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                        <FileText size={14} /> Nueva Nota
                                    </button>
                                    <button className="flex items-center justify-center gap-2 p-2 text-xs font-semibold bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                                        <ExternalLink size={14} /> Ver Perfil
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};