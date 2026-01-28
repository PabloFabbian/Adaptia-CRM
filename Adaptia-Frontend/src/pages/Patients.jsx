import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { User, FileText, Search, Plus, X, Calendar, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/patients');
                const json = await res.json();
                setPatients(json.data || []);

                // Si venimos redirigidos por un duplicado (?open=ID)
                const openId = searchParams.get('open');
                if (openId && json.data) {
                    const p = json.data.find(item => item.id.toString() === openId);
                    if (p) setSelectedPatient(p);
                }
            } catch (err) {
                console.error("Error cargando pacientes", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, [searchParams]);

    const closePanel = () => {
        setSelectedPatient(null);
        setSearchParams({}); // Limpiar URL
    };

    return (
        <div className="relative min-h-screen">
            <div className={`max-w-6xl mx-auto px-4 py-8 transition-all duration-500 ${selectedPatient ? 'pr-[40%] blur-[2px] pointer-events-none' : ''}`}>
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Pacientes</h1>
                        <p className="text-gray-500 text-sm">Gestión de historias clínicas.</p>
                    </div>
                    <button className="flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200">
                        <Plus size={18} /> Nuevo Paciente
                    </button>
                </header>

                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar paciente por nombre..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
                    />
                </div>

                <Card>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 text-gray-400 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Paciente</th>
                                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Contexto</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {patients.map((p) => (
                                <tr key={p.id} className="group hover:bg-gray-50/50 cursor-pointer" onClick={() => setSelectedPatient(p)}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-bold">
                                                {p.name.charAt(0)}
                                            </div>
                                            <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${p.is_mine ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                                            {p.is_mine ? 'Propio' : 'Compartido'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <ExternalLink size={16} className="text-gray-300 group-hover:text-gray-600 inline-block" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>

            {/* OVERLAY TIPO NOTION (SIDE PANEL) */}
            {selectedPatient && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 transition-opacity" onClick={closePanel} />

                    {/* Panel Lateral */}
                    <div className="fixed right-0 top-0 h-screen w-[60%] bg-white shadow-2xl z-50 animate-in slide-in-from-right duration-300 border-l border-gray-100 overflow-y-auto">
                        <div className="p-8">
                            <button onClick={closePanel} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors mb-6">
                                <X size={24} />
                            </button>

                            <header className="flex items-start justify-between mb-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-orange-100">
                                        {selectedPatient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-1">{selectedPatient.name}</h2>
                                        <p className="text-gray-400 font-mono text-sm tracking-tighter uppercase">Expediente #{selectedPatient.id.toString().padStart(4, '0')}</p>
                                    </div>
                                </div>
                            </header>

                            <div className="grid grid-cols-2 gap-8 mb-12">
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Datos de Contacto</h3>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Mail size={16} className="text-gray-300" />
                                        <span className="text-sm">{selectedPatient.history?.email || 'Sin correo'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Phone size={16} className="text-gray-300" />
                                        <span className="text-sm">{selectedPatient.history?.phone || 'Sin teléfono'}</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Ubicación</h3>
                                    <div className="flex items-start gap-3 text-gray-600">
                                        <MapPin size={16} className="text-gray-300 mt-0.5" />
                                        <span className="text-sm leading-relaxed">{selectedPatient.history?.address || 'Dirección no registrada'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Actividad Reciente</h3>
                                <div className="bg-gray-50 rounded-2xl p-6 text-center border-2 border-dashed border-gray-200">
                                    <FileText className="mx-auto text-gray-300 mb-2" size={32} />
                                    <p className="text-sm text-gray-500">No hay notas clínicas registradas todavía.</p>
                                    <button className="mt-3 text-blue-600 text-xs font-bold hover:underline">Crear primera nota</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};