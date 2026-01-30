import { useParams } from 'react-router-dom';
import {
    Calendar, Search, FileText, Sparkles,
    ChevronDown, ChevronUp, Pill, Brain, Save, Loader2
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getPatientNotes, getPatientById, updatePatient, exportHistoryToPDF } from '../api/notes';

// --- SUB-COMPONENTE PARA TEXTOS LARGOS ---
const ExpandableContent = ({ text }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    if (!text) return <p className="text-gray-400 dark:text-gray-500 italic text-sm">Sin contenido detallado</p>;
    const isLongText = text.length > 250;

    return (
        <div className="space-y-2">
            <div className={`relative transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px]' : 'max-h-24 overflow-hidden'}`}>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">{text}</p>
                {!isExpanded && isLongText && (
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-t from-white dark:from-[#1a1f2e] via-white/80 dark:via-[#1a1f2e]/80 to-transparent" />
                )}
            </div>
            {isLongText && (
                <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors mt-2">
                    {isExpanded ? <>Ver menos <ChevronUp size={12} /></> : <>Leer detalle completo <ChevronDown size={12} /></>}
                </button>
            )}
        </div>
    );
};

export const PatientHistoryPage = () => {
    const { id } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- REFERENCIAS PARA AUTO-AJUSTE ---
    const motivoRef = useRef(null);
    const antecedentesRef = useRef(null);
    const medicacionRef = useRef(null);

    // --- ESTADO PARA EL PERFIL ---
    const [patientData, setPatientData] = useState(null);
    const [profile, setProfile] = useState({
        motivo_consulta: '',
        antecedentes: '',
        medicacion: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Función de ajuste de altura real
    const adjustHeight = (ref) => {
        if (ref.current) {
            ref.current.style.height = 'auto';
            ref.current.style.height = `${ref.current.scrollHeight}px`;
        }
    };

    // Ajustar alturas cuando el perfil cambie
    useEffect(() => {
        adjustHeight(motivoRef);
        adjustHeight(antecedentesRef);
        adjustHeight(medicacionRef);
    }, [profile, loading]);

    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            try {
                const [notesData, patientResponse] = await Promise.all([
                    getPatientNotes(id),
                    getPatientById(id)
                ]);

                setNotes(notesData || []);

                if (patientResponse?.data) {
                    setPatientData(patientResponse.data);
                    const history = patientResponse.data.history || {};
                    setProfile({
                        motivo_consulta: history.motivo_consulta || '',
                        antecedentes: history.antecedentes || '',
                        medicacion: history.medicacion || ''
                    });
                }
            } catch (error) {
                console.error("Error al cargar datos:", error);
            } finally {
                setLoading(false);
            }
        };
        loadAllData();
    }, [id]);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const updatedPatient = {
                ...patientData,
                history: {
                    ...patientData.history,
                    ...profile
                }
            };
            await updatePatient(id, updatedPatient);
        } catch (error) {
            console.error("Error al guardar perfil:", error);
            alert("Error al guardar los cambios");
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            await exportHistoryToPDF(id, patientData?.name || 'Paciente');
        } finally {
            setIsExporting(false);
        }
    };

    const filteredNotes = notes.filter(n => {
        const contentToSearch = (n.content || n.details || "").toLowerCase();
        const titleToSearch = (n.title || "").toLowerCase();
        return contentToSearch.includes(searchTerm.toLowerCase()) || titleToSearch.includes(searchTerm.toLowerCase());
    });

    const getCategoryStyles = (category) => {
        switch (category) {
            case 'Urgencia': return 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400';
            case 'Diagnóstico': return 'bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400';
            case 'Tratamiento': return 'bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400';
            default: return 'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400';
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-4 bg-transparent transition-colors duration-300">

            {/* --- SECCIÓN: PERFIL PSICOLÓGICO EDITABLE --- */}
            <div className="bg-gray-50 border-gray-200 text-gray-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white border rounded-[2.5rem] p-8 shadow-sm dark:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center border border-teal-500/20 dark:border-teal-500/30">
                            <Brain size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold leading-none">Perfil Psicológico Inicial</h2>
                            <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase tracking-[0.2em] font-bold mt-1">Antecedentes de Ingreso</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportPDF}
                            disabled={isExporting || loading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 rounded-full text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm disabled:opacity-50"
                        >
                            {isExporting ? <Loader2 size={14} className="animate-spin text-orange-500" /> : <FileText size={14} className="text-orange-500" />}
                            {isExporting ? 'Generando...' : 'Exportar PDF'}
                        </button>

                        <button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-full text-xs font-bold transition-all shadow-lg shadow-teal-600/20 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {isSaving ? 'Guardando...' : 'Guardar Perfil'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start text-start">
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-800/40 p-5 rounded-[1.5rem] border border-gray-100 dark:border-slate-700/50">
                            <label className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-2 block">Motivo de Consulta Principal</label>
                            <textarea
                                ref={motivoRef}
                                value={profile.motivo_consulta}
                                onChange={(e) => setProfile({ ...profile, motivo_consulta: e.target.value })}
                                placeholder="Describe el motivo..."
                                className="w-full bg-transparent text-sm text-gray-700 dark:text-slate-200 focus:outline-none resize-none leading-relaxed overflow-hidden block"
                                rows="1"
                            />
                        </div>

                        <div className="px-5">
                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Antecedentes / Notas</label>
                            <textarea
                                ref={antecedentesRef}
                                value={profile.antecedentes}
                                onChange={(e) => setProfile({ ...profile, antecedentes: e.target.value })}
                                placeholder="Ej. Depresión previa..."
                                className="w-full bg-transparent text-sm italic text-gray-500 dark:text-slate-400 focus:outline-none resize-none leading-relaxed overflow-hidden block"
                                rows="1"
                            />
                        </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-500/10 p-6 rounded-[2rem] border border-red-100 dark:border-red-500/20 transition-all duration-300">
                        <div className="flex items-center gap-2 mb-3 text-red-500 dark:text-red-400">
                            <Pill size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Medicación Actual</span>
                        </div>
                        <textarea
                            ref={medicacionRef}
                            value={profile.medicacion}
                            onChange={(e) => setProfile({ ...profile, medicacion: e.target.value })}
                            placeholder="¿Toma fármacos?"
                            className="w-full bg-transparent text-sm font-bold text-gray-800 dark:text-slate-100 focus:outline-none placeholder:font-normal resize-none leading-tight overflow-hidden block"
                            rows="1"
                        />
                    </div>
                </div>
            </div>

            {/* --- BARRA DE BÚSQUEDA --- */}
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Filtrar por contenido de sesión, diagnóstico o fecha..."
                    className="w-full pl-14 pr-6 py-4 bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-sm shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* --- TIMELINE --- */}
            <div className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-4 pl-10 space-y-10">
                {loading ? (
                    <div className="py-20 text-center text-gray-400 animate-pulse font-medium">Cargando historial clínico...</div>
                ) : filteredNotes.length > 0 ? (
                    filteredNotes.map((note) => (
                        <div key={note.id} className="relative group">
                            <div className="absolute -left-[51px] top-2 w-5 h-5 bg-white dark:bg-[#0f172a] border-4 border-gray-200 dark:border-gray-800 group-hover:border-orange-500 rounded-full shadow-sm transition-colors" />
                            <div className="bg-white dark:bg-[#1a1f2e] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300">
                                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getCategoryStyles(note.category)}`}>
                                                {note.category || 'Evolución'}
                                            </span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1">
                                                <Calendar size={12} /> {new Date(note.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{note.title || 'Nota de Sesión'}</h4>
                                    </div>
                                </div>
                                <div className="mb-6 p-5 bg-orange-50 dark:bg-orange-950/10 rounded-3xl border border-orange-100 dark:border-orange-900/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles size={14} className="text-orange-600 dark:text-orange-400" />
                                        <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">Resumen Clínico IA</span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic font-medium">
                                        {note.summary ? `"${note.summary}"` : "No se generó resumen automático."}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest px-1">Detalle de la Sesión</p>
                                    <ExpandableContent text={note.content || note.details} />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white dark:bg-[#1a1f2e] rounded-[2rem] p-12 text-center border border-dashed border-gray-200 dark:border-gray-800">
                        <FileText size={40} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                        <p className="text-gray-400 dark:text-gray-600 font-medium">No se encontraron registros clínicos.</p>
                    </div>
                )}
            </div>
        </div>
    );
};