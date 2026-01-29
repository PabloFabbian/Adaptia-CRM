import { useParams } from 'react-router-dom';
import {
    Clock, Calendar, User, Download, Search,
    Plus, Filter, Activity, FileText, ClipboardList, Sparkles,
    ChevronDown, ChevronUp
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPatientNotes } from '../api/notes';

// --- SUB-COMPONENTE ADAPTADO ---
const ExpandableContent = ({ text }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!text) return <p className="text-gray-400 dark:text-gray-500 italic">Sin contenido detallado</p>;

    const isLongText = text.length > 250;

    return (
        <div className="space-y-2">
            <div className={`relative transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px]' : 'max-h-24 overflow-hidden'}`}>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                    {text}
                </p>
                {/* Degradado adaptativo: de transparente a fondo de tarjeta */}
                {!isExpanded && isLongText && (
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white dark:from-dark-surface via-white/80 dark:via-dark-surface/80 to-transparent" />
                )}
            </div>

            {isLongText && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors mt-2"
                >
                    {isExpanded ? (
                        <>Ver menos <ChevronUp size={12} /></>
                    ) : (
                        <>Leer detalle completo <ChevronDown size={12} /></>
                    )}
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

    useEffect(() => {
        const fetchNotes = async () => {
            setLoading(true);
            try {
                const data = await getPatientNotes(id);
                setNotes(data || []);
            } catch (error) {
                console.error("Error al cargar historial:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, [id]);

    const filteredNotes = notes.filter(n => {
        const contentToSearch = n.content || n.details || "";
        const titleToSearch = n.title || "";
        return contentToSearch.toLowerCase().includes(searchTerm.toLowerCase()) ||
            titleToSearch.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const getCategoryStyles = (category) => {
        switch (category) {
            case 'Urgencia': return 'bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400';
            case 'Diagnóstico': return 'bg-purple-50 dark:bg-purple-950/30 text-purple-500 dark:text-purple-400';
            case 'Tratamiento': return 'bg-green-50 dark:bg-green-950/30 text-green-500 dark:text-green-400';
            default: return 'bg-blue-50 dark:bg-blue-950/30 text-blue-500 dark:text-blue-400';
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-4">
            {/* 1. RESUMEN RÁPIDO - Estilo adaptado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-adaptia-blue dark:to-blue-900 p-6 rounded-[2.5rem] text-white shadow-xl">
                    <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-1">Estado General</p>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Activity size={18} className="text-orange-500" /> Estable
                    </h3>
                    <div className="mt-4 flex gap-4 text-xs">
                        <div><p className="opacity-50">Paciente ID</p><p className="font-bold">#{id}</p></div>
                        <div><p className="opacity-50">Expediente</p><p className="font-bold">Activo</p></div>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface p-6 rounded-[2.5rem] border border-gray-100 dark:border-dark-border flex items-center gap-4 transition-colors">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl flex items-center justify-center">
                        <ClipboardList size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Última Nota</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {notes.length > 0 ? new Date(notes[0].created_at).toLocaleDateString() : 'Sin registros'}
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface p-6 rounded-[2.5rem] border border-gray-100 dark:border-dark-border flex items-center gap-4 transition-colors">
                    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-2xl flex items-center justify-center">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Total Notas</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{notes.length} Registros</p>
                    </div>
                </div>
            </div>

            {/* 2. BARRA DE HERRAMIENTAS */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 dark:bg-dark-surface/30 p-2 rounded-[2rem]">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar en el contenido o títulos..."
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/10 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* 3. LÍNEA DE TIEMPO */}
            <div className="relative border-l-2 border-gray-100 dark:border-dark-border ml-4 pl-10 space-y-8">
                {loading ? (
                    <div className="py-20 text-center text-gray-400 animate-pulse font-medium">Cargando historial...</div>
                ) : filteredNotes.length > 0 ? (
                    filteredNotes.map((note) => (
                        <div key={note.id} className="relative group">
                            <div className="absolute -left-[51px] top-2 w-5 h-5 bg-white dark:bg-dark-bg border-4 border-gray-200 dark:border-dark-border group-hover:border-orange-500 rounded-full shadow-sm transition-colors" />

                            <div className="bg-white dark:bg-dark-surface rounded-[2.5rem] p-8 border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-xl dark:hover:shadow-black/20 transition-all duration-300">
                                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
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

                                {/* BLOQUE IA - Adaptación de contraste */}
                                <div className="mb-6 p-5 bg-orange-50/40 dark:bg-orange-950/10 rounded-3xl border border-orange-100/50 dark:border-orange-900/20 relative overflow-hidden transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles size={14} className="text-orange-500" />
                                        <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">Resumen de IA</span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic font-medium">
                                        {note.summary ? `"${note.summary}"` : "No se generó resumen automático para esta sesión."}
                                    </p>
                                </div>

                                {/* CONTENIDO DETALLADO */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest px-1">Detalle Clínico</p>
                                    <ExpandableContent text={note.content || note.details} />
                                </div>

                                <div className="mt-6 flex items-center justify-between border-t border-gray-50 dark:border-dark-border pt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-gray-900 dark:bg-adaptia-blue rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                                            {note.author ? note.author.charAt(0) : 'P'}
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                            Firma: {note.author || 'Profesional Adaptia'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white dark:bg-dark-surface rounded-[2rem] p-12 text-center border border-dashed border-gray-200 dark:border-dark-border">
                        <p className="text-gray-400 dark:text-gray-600 font-medium">No se encontraron registros clínicos.</p>
                    </div>
                )}
            </div>
        </div>
    );
};