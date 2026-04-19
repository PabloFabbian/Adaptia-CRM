import { useState, useMemo, useCallback } from 'react';
import { Users, UserPlus, Search, Filter, Mail, Phone, ShieldCheck, ChevronRight, Loader2, ShieldAlert, Eye, Check } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Hooks y Contexto
import { usePatients } from '../hooks/usePatients';
import { useAuth } from '../context/AuthContext';

// Componentes
import { PatientDetailsPanel } from '../features/patients/PatientDetailsPanel';
import { ClinicalNoteModal } from '../features/patients/ClinicalNoteModal';
import { Can } from '../components/auth/Can';

export const PatientsPage = () => {
    const navigate = useNavigate();
    const { user, activeClinic, loading: authLoading, can } = useAuth();
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [filterOwnership, setFilterOwnership] = useState('all'); // all, mine, others
    const [filterAccess, setFilterAccess] = useState('all'); // all, full, read
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [, setSearchParams] = useSearchParams();

    const { patients, loading, refresh } = usePatients(
        activeClinic?.id,
        user?.id,
        setSelectedPatient
    );

    // --- LÓGICA DE GOBERNANZA (Mantenida intacta) ---
    const canWriteNotes = useCallback((patient) => {
        if (!patient || !user) return false;
        if (Number(activeClinic?.role_id) === 0) return true;
        const hasMatrixPermission = can('clinic.notes.write');
        const isOwner = patient.owner_member_id === user.id;
        return hasMatrixPermission && isOwner;
    }, [user, activeClinic, can]);

    const getAccessLevel = (patient) => {
        if (!patient || !user) return 'Read';
        if (Number(activeClinic?.role_id) === 0 || patient.owner_member_id === user.id) {
            return 'Full';
        }
        return 'Read';
    };

    const closePanel = () => {
        setSelectedPatient(null);
        setSearchParams({});
    };

    const handleSaveNote = async (formData) => {
        if (!canWriteNotes(selectedPatient)) {
            toast.error("Acceso denegado", {
                description: "No tienes permisos o no eres el responsable de este expediente."
            });
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/clinical-notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adaptia_token') || localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    patient_id: selectedPatient.id,
                    member_id: user.id,
                    content: formData.details,
                    title: formData.title,
                    summary: formData.summary,
                    category: formData.category
                })
            });

            if (!response.ok) throw new Error("Error al guardar la nota");

            toast.success("Nota clínica guardada exitosamente");
            setIsNoteModalOpen(false);
            refresh();

        } catch (err) {
            toast.error("Error al guardar", { description: err.message });
        }
    };

    const filteredPatients = useMemo(() => {
        return (patients || []).filter(p => {
            // Filtro de búsqueda
            const matchesSearch = (
                (p.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (p.dni?.includes(searchTerm)) ||
                (p.email?.toLowerCase().includes(searchTerm.toLowerCase()))
            );

            // Filtro de propiedad
            let matchesOwnership = true;
            if (filterOwnership === 'mine') matchesOwnership = p.owner_member_id === user?.id;
            if (filterOwnership === 'others') matchesOwnership = p.owner_member_id !== user?.id;

            // Filtro de acceso
            let matchesAccess = true;
            const access = getAccessLevel(p);
            if (filterAccess === 'full') matchesAccess = access === 'Full';
            if (filterAccess === 'read') matchesAccess = access === 'Read';

            return matchesSearch && matchesOwnership && matchesAccess;
        });
    }, [patients, searchTerm, filterOwnership, filterAccess, user?.id]);

    if (authLoading) return (
        <div className="h-screen flex items-center justify-center bg-white dark:bg-[#0f172a]">
            <Loader2 className="animate-spin text-[#50e3c2]" />
        </div>
    );

    return (
        <div className="relative min-h-screen bg-[#f8fafc] dark:bg-[#11141D]">
            {/* Main Content */}
            <div className={`max-w-7xl mx-auto px-6 py-10 transition-all duration-500 ${selectedPatient ? 'pr-[420px] opacity-40 pointer-events-none' : 'opacity-100'
                }`}>

                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-slate-900 dark:bg-slate-800 rounded-xl text-white border border-slate-800 dark:border-slate-700">
                            <Users className="w-6 h-6" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Pacientes
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">
                                <span className="text-[#50e3c2]">{filteredPatients.length}</span> Expedientes activos
                            </p>
                        </div>
                    </div>

                    <Can perform="clinic.patients.write">
                        <button
                            onClick={() => navigate('/nuevo-paciente')}
                            className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-[#50e3c2] text-white dark:text-slate-900 px-6 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
                        >
                            <UserPlus size={16} strokeWidth={3} /> Nuevo Registro
                        </button>
                    </Can>
                </header>

                {/* Buscador Flat */}
                <div className="flex gap-3 mb-8">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#50e3c2] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, DNI o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-[#50e3c2] dark:focus:border-[#50e3c2] transition-all dark:text-white placeholder:text-slate-400"
                        />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className={`px-4 h-full bg-white dark:bg-slate-800 border rounded-xl transition-all flex items-center justify-center gap-2 hover:cursor-pointer ${showFilterMenu || filterOwnership !== 'all' || filterAccess !== 'all'
                                ? 'border-[#50e3c2] text-[#50e3c2]'
                                : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#50e3c2]'
                                }`}
                        >
                            <Filter size={18} />
                            {(filterOwnership !== 'all' || filterAccess !== 'all') && (
                                <span className="w-2 h-2 rounded-full bg-[#50e3c2] animate-pulse" />
                            )}
                        </button>

                        <AnimatePresence>
                            {showFilterMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowFilterMenu(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                    >
                                        <div className="p-5 space-y-6">
                                            {/* Sección: Propiedad */}
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Responsabilidad</p>
                                                <div className="space-y-1">
                                                    {[
                                                        { id: 'all', label: 'Todos los pacientes' },
                                                        { id: 'mine', label: 'Mis Pacientes' },
                                                        { id: 'others', label: 'Otros Profesionales' }
                                                    ].map((opt) => (
                                                        <button
                                                            key={opt.id}
                                                            onClick={() => setFilterOwnership(opt.id)}
                                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all hover:cursor-pointer ${filterOwnership === opt.id
                                                                ? 'bg-[#50e3c2]/10 text-[#50e3c2] font-bold'
                                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                                }`}
                                                        >
                                                            {opt.label}
                                                            {filterOwnership === opt.id && <Check size={14} strokeWidth={3} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Sección: Acceso */}
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nivel de Acceso</p>
                                                <div className="space-y-1">
                                                    {[
                                                        { id: 'all', label: 'Cualquier nivel' },
                                                        { id: 'full', label: 'Acceso Completo' },
                                                        { id: 'read', label: 'Solo Lectura' }
                                                    ].map((opt) => (
                                                        <button
                                                            key={opt.id}
                                                            onClick={() => setFilterAccess(opt.id)}
                                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all hover:cursor-pointer ${filterAccess === opt.id
                                                                ? 'bg-[#50e3c2]/10 text-[#50e3c2] font-bold'
                                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                                }`}
                                                        >
                                                            {opt.label}
                                                            {filterAccess === opt.id && <Check size={14} strokeWidth={3} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setFilterOwnership('all');
                                                    setFilterAccess('all');
                                                }}
                                                className="w-full pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors text-center hover:cursor-pointer"
                                            >
                                                Restablecer filtros
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Tabla Flat */}
                <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700">
                                    <th className="px-8 py-5">Identidad</th>
                                    <th className="px-8 py-5">Contacto</th>
                                    <th className="px-8 py-5">Responsable</th>
                                    <th className="px-8 py-5 text-right">Permisos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-10 py-24 text-center">
                                            <Loader2 className="animate-spin mx-auto mb-4 text-[#50e3c2]" />
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Cargando base de datos...</p>
                                        </td>
                                    </tr>
                                ) : filteredPatients.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-10 py-24 text-center">
                                            <ShieldAlert size={32} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
                                            <p className="text-slate-400 text-sm font-medium">No se encontraron registros.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPatients.map((patient) => {
                                        const access = getAccessLevel(patient);
                                        const isFullAccess = access === 'Full';

                                        return (
                                            <tr
                                                key={patient.id}
                                                onClick={() => setSelectedPatient(patient)}
                                                className={`group transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 ${selectedPatient?.id === patient.id ? 'bg-slate-50 dark:bg-slate-700/50' : ''
                                                    }`}
                                            >
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        {/* AVATAR MODIFICADO SOLO PARA MODO DÍA/FLAT */}
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs border transition-all ${isFullAccess
                                                            ? 'bg-[#2BBBAD]/70 dark:bg-[#50e3c2] text-slate-900 dark:text-slate-900 border-gray-300/40 dark:border-[#50e3c2] shadow-sm dark:shadow-none'
                                                            : 'bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-400 border-slate-100 dark:border-slate-600'
                                                            }`}>
                                                            {patient.name?.charAt(0)}
                                                        </div>

                                                        <div>
                                                            <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight">
                                                                {patient.name}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                                ID: {patient.dni || 'S/D'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="text-[11px] space-y-1 text-slate-500 dark:text-slate-400 font-medium">
                                                        <p className="flex items-center gap-2"><Mail size={12} className="text-slate-300" /> {patient.email || '—'}</p>
                                                        <p className="flex items-center gap-2"><Phone size={12} className="text-slate-300" /> {patient.phone || '—'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#50e3c2]" />
                                                        <p className="text-xs font-bold">
                                                            {patient.owner_member_id === user?.id ? 'Mío (Tú)' : (patient.owner_name || 'Sin asignar')}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${isFullAccess
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                                            : 'bg-slate-50 text-slate-400 border-slate-100 dark:bg-slate-900/40 dark:text-slate-500 dark:border-slate-700'
                                                            }`}>
                                                            {isFullAccess ? <ShieldCheck size={12} strokeWidth={3} /> : <Eye size={12} strokeWidth={3} />}
                                                            {isFullAccess ? 'Full' : 'Read'}
                                                        </div>
                                                        <ChevronRight className="text-slate-300 group-hover:text-[#50e3c2] transition-colors" size={18} />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Paneles laterales y Modales (Se mantienen igual) */}
            <PatientDetailsPanel
                patient={selectedPatient}
                user={user}
                activeClinic={activeClinic}
                onClose={closePanel}
                onOpenNote={canWriteNotes(selectedPatient) ? () => setIsNoteModalOpen(true) : null}
                canEdit={canWriteNotes(selectedPatient)}
            />

            {isNoteModalOpen && selectedPatient && (
                <ClinicalNoteModal
                    isOpen={isNoteModalOpen}
                    patientName={selectedPatient?.name}
                    onSave={handleSaveNote}
                    onClose={() => setIsNoteModalOpen(false)}
                />
            )}
        </div>
    );
};