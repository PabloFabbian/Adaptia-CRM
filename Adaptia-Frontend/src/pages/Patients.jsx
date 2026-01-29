import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { User, FileText, Search, Plus, X, Calendar, Phone, Mail, MapPin, ExternalLink, ChevronRight } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/patients');
                const json = await res.json();
                setPatients(json.data || []);

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
        setSearchParams({});
    };

    return (
        <div className="relative min-h-screen overflow-x-hidden">
            {/* CONTENIDO PRINCIPAL */}
            <div className={`max-w-7xl mx-auto px-6 py-10 transition-all duration-700 ease-in-out ${selectedPatient ? 'pr-[42%] scale-[0.98] opacity-50 blur-sm pointer-events-none' : 'scale-100 opacity-100'}`}>

                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-light dark:text-white tracking-tight">
                            Base de <span className="font-bold">Pacientes</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 font-light">
                            {patients.length} expedientes clínicos activos bajo tu supervisión.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/pacientes/nuevo')}
                        className="flex items-center justify-center gap-2 bg-gray-900 dark:bg-adaptia-blue text-white px-6 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-adaptia-blue/20"
                    >
                        <Plus size={18} strokeWidth={3} /> Nuevo Registro
                    </button>
                </header>

                <div className="relative mb-8 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-adaptia-mint transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, DNI o expediente..."
                        className="w-full pl-14 pr-6 py-4 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-[2rem] text-sm focus:ring-8 focus:ring-adaptia-blue/5 outline-none transition-all dark:text-white shadow-sm"
                    />
                </div>

                <Card className="overflow-hidden border-none shadow-2xl">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-50/50 dark:bg-white/5 text-gray-400 dark:text-gray-500">
                            <tr>
                                <th className="px-8 py-5 font-bold uppercase text-[10px] tracking-[0.2em]">Identidad</th>
                                <th className="px-8 py-5 font-bold uppercase text-[10px] tracking-[0.2em]">Privacidad</th>
                                <th className="px-8 py-5 text-right font-bold uppercase text-[10px] tracking-[0.2em]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                            {patients.map((p) => (
                                <tr
                                    key={p.id}
                                    className="group hover:bg-gray-50/80 dark:hover:bg-white/[0.02] cursor-pointer transition-all"
                                    onClick={() => setSelectedPatient(p)}
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center font-bold text-sm border border-orange-500/20 group-hover:scale-110 transition-transform">
                                                {p.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-adaptia-blue transition-colors">{p.name}</div>
                                                <div className="text-[10px] text-gray-400 font-mono tracking-tighter">ID-{p.id.toString().padStart(4, '0')}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${p.is_mine
                                            ? 'bg-adaptia-blue/10 text-adaptia-blue border-adaptia-blue/20'
                                            : 'bg-gray-100 dark:bg-white/5 text-gray-400 border-transparent'
                                            }`}>
                                            {p.is_mine ? 'Propio' : 'Compartido'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end items-center gap-2 text-gray-300 dark:text-gray-700 group-hover:text-adaptia-mint transition-colors">
                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Ver Ficha</span>
                                            <ChevronRight size={18} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>

            {/* SIDE PANEL (NOTION STYLE) */}
            {selectedPatient && (
                <>
                    <div className="fixed inset-0 bg-dark-bg/40 backdrop-blur-md z-40 transition-opacity duration-500" onClick={closePanel} />

                    <div className="fixed right-0 top-0 h-screen w-[40%] bg-white dark:bg-dark-surface shadow-[-20px_0_50px_rgba(0,0,0,0.2)] z-50 animate-in slide-in-from-right duration-500 border-l border-gray-100 dark:border-dark-border overflow-y-auto">
                        <div className="p-10">
                            <button
                                onClick={closePanel}
                                className="group flex items-center gap-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-10"
                            >
                                <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-full group-hover:rotate-90 transition-transform">
                                    <X size={20} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest">Cerrar</span>
                            </button>

                            <header className="flex flex-col items-center text-center mb-12">
                                <div className="w-24 h-24 bg-orange-500 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-orange-500/30 mb-6 rotate-3">
                                    {selectedPatient.name.charAt(0)}
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">{selectedPatient.name}</h2>
                                <div className="px-4 py-1 bg-gray-100 dark:bg-white/5 rounded-full text-[10px] font-mono text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                    Expediente #{selectedPatient.id.toString().padStart(4, '0')}
                                </div>
                            </header>

                            <div className="space-y-10">
                                {/* SECCIÓN INFO */}
                                <section>
                                    <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                                        <div className="h-px flex-1 bg-gray-100 dark:bg-dark-border" />
                                        Contacto Directo
                                        <div className="h-px flex-1 bg-gray-100 dark:bg-dark-border" />
                                    </h3>
                                    <div className="grid gap-4">
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-transparent hover:border-adaptia-blue/20 transition-all">
                                            <div className="p-2 bg-white dark:bg-dark-surface rounded-lg shadow-sm text-adaptia-blue"><Mail size={18} /></div>
                                            <span className="text-sm dark:text-gray-300 font-medium">{selectedPatient.history?.email || 'Sin correo'}</span>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-transparent hover:border-adaptia-blue/20 transition-all">
                                            <div className="p-2 bg-white dark:bg-dark-surface rounded-lg shadow-sm text-adaptia-mint"><Phone size={18} /></div>
                                            <span className="text-sm dark:text-gray-300 font-medium">{selectedPatient.history?.phone || 'Sin teléfono'}</span>
                                        </div>
                                    </div>
                                </section>

                                {/* SECCIÓN NOTAS */}
                                <section>
                                    <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                                        <div className="h-px flex-1 bg-gray-100 dark:bg-dark-border" />
                                        Historia Clínica
                                        <div className="h-px flex-1 bg-gray-100 dark:bg-dark-border" />
                                    </h3>
                                    <div className="bg-gray-50 dark:bg-white/5 rounded-[2rem] p-10 text-center border-2 border-dashed border-gray-100 dark:border-dark-border">
                                        <FileText className="mx-auto text-gray-200 dark:text-gray-700 mb-4" size={48} strokeWidth={1} />
                                        <p className="text-sm text-gray-400 dark:text-gray-500 font-light mb-6">No se han registrado sesiones o notas evolutivas aún.</p>
                                        <button className="px-6 py-2.5 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:bg-gray-900 hover:text-white dark:hover:bg-adaptia-mint dark:hover:text-dark-bg transition-all shadow-sm">
                                            Añadir Nota de Sesión
                                        </button>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Patients;