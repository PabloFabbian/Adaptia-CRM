import { useState, useEffect, useRef } from 'react';
import { Brain, Apple, Stethoscope, Activity, Plus, MoreVertical, Pencil, PowerOff, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ICON_MAP = { Brain, Apple, Stethoscope, Activity };

const CategoryMenu = ({ category, onEdit, onToggle, onDelete, onManage }) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const action = (fn) => (e) => {
        e.stopPropagation();
        setOpen(false);
        fn();
    };

    return (
        <div ref={menuRef} className="relative" onClick={e => e.stopPropagation()}>
            <button
                onClick={() => setOpen(p => !p)}
                className="p-2 text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
                <MoreVertical size={16} />
            </button>

            {open && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button onClick={action(onManage)} className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 uppercase tracking-wider transition-colors">
                        <ArrowRight size={13} className="text-[#50e3c2]" /> Ver Servicios
                    </button>
                    <button onClick={action(onEdit)} className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 uppercase tracking-wider transition-colors">
                        <Pencil size={13} className="text-blue-400" /> Editar
                    </button>
                    <button onClick={action(onToggle)} className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 uppercase tracking-wider transition-colors">
                        <PowerOff size={13} className={category.active ? 'text-orange-400' : 'text-green-400'} />
                        {category.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <div className="my-1.5 border-t border-slate-100 dark:border-slate-700" />
                    <button onClick={action(onDelete)} className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 uppercase tracking-wider transition-colors">
                        <Trash2 size={13} /> Eliminar
                    </button>
                </div>
            )}
        </div>
    );
};

export const CategoriesPage = () => {
    const { user, activeClinic } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scale, setScale] = useState(1);
    const containerRef = useRef(null);

    // Scale responsivo
    useEffect(() => {
        const update = () => {
            if (!containerRef.current) return;
            const availableHeight = containerRef.current.parentElement?.clientHeight || window.innerHeight;
            const availableWidth = containerRef.current.parentElement?.clientWidth || window.innerWidth;
            setScale(Math.min(1, availableWidth / 1280, availableHeight / 900));
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    // Fetch categorías
    useEffect(() => {
        const fetchCategories = async () => {
            if (!activeClinic?.id) return;  // esperar a que cargue
            try {
                const res = await fetch(`http://localhost:3001/api/categories?clinicId=${activeClinic.id}`);
                const json = await res.json();
                setCategories(json.data || []);
            } catch {
                toast.error('No se pudieron cargar las categorías');
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, [activeClinic?.id]);

    const handleManage = (cat) => {
        navigate(`/categorias/${cat.slug || cat.id}/servicios`);
    };

    const handleEdit = (cat) => {
        navigate(`/categorias/${cat.id}/editar`);
    };

    const handleToggle = async (cat) => {
        const prev = [...categories];
        // Optimistic update
        setCategories(cs => cs.map(c => c.id === cat.id ? { ...c, active: !c.active } : c));
        try {
            const res = await fetch(`http://localhost:3001/api/categories/${cat.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !cat.active })
            });
            if (!res.ok) throw new Error();
            toast.success(`Categoría ${!cat.active ? 'activada' : 'desactivada'} correctamente`);
        } catch {
            setCategories(prev);
            toast.error('No se pudo actualizar la categoría');
        }
    };

    const handleDelete = async (cat) => {
        const prev = [...categories];
        setCategories(cs => cs.filter(c => c.id !== cat.id));
        try {
            const res = await fetch(`http://localhost:3001/api/categories/${cat.id}`, { method: 'DELETE' });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Error al eliminar');
            }
            toast.success('Categoría eliminada');
        } catch (e) {
            setCategories(prev);
            toast.error(e.message || 'No se pudo eliminar. Puede tener servicios vinculados.');
        }
    };

    const COLOR_MAP = [
        { color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { color: 'text-[#50e3c2]', bg: 'bg-[#50e3c2]/10' },
        { color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { color: 'text-pink-500', bg: 'bg-pink-500/10' },
        { color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    ];

    const enriched = categories.map((cat, i) => ({
        ...cat,
        color: COLOR_MAP[i % COLOR_MAP.length].color,
        bg: COLOR_MAP[i % COLOR_MAP.length].bg,
    }));

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] animate-pulse">
            <Loader2 className="w-6 h-6 mb-4 animate-spin text-[#50e3c2]" />
            Cargando Categorías...
        </div>
    );

    return (
        <div className="h-full w-full overflow-hidden flex items-start justify-center">
            <div
                ref={containerRef}
                className="origin-top w-full"
                style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
            >
                <div className="max-w-7xl mx-auto px-6 pt-8 pb-8 animate-in fade-in duration-700">

                    <header className="flex flex-row items-end justify-between gap-6 mb-10">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-[#50e3c2]" />
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                                    Configuración de Servicios
                                </span>
                            </div>
                            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Gestión de <span className="text-[#50e3c2]">Categorías</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                Organiza las especialidades y servicios disponibles en tu clínica.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/categorias/nueva')}
                            className="flex items-center gap-2 px-6 py-4 bg-slate-900 dark:bg-[#50e3c2] text-white dark:text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl hover:opacity-90 active:scale-95 shrink-0"
                        >
                            <Plus size={16} /> Nueva Categoría
                        </button>
                    </header>

                    <div className="grid grid-cols-3 gap-6">
                        {enriched.map((cat) => (
                            <div
                                key={cat.id}
                                onClick={() => handleManage(cat)}
                                className={`group bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 hover:shadow-xl hover:shadow-[#50e3c2]/5 transition-all cursor-pointer relative overflow-hidden
                                    ${!cat.active ? 'opacity-50 grayscale' : ''}`}
                            >
                                <div className={`absolute -right-8 -top-8 w-32 h-32 ${cat.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                <div className="relative">
                                    <div className="flex justify-between items-start mb-5">
                                        <div className={`p-3 ${cat.bg} ${cat.color} rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                                            {/* Ícono genérico si no hay mapa */}
                                            <Activity size={22} />
                                        </div>
                                        <CategoryMenu
                                            category={cat}
                                            onManage={() => handleManage(cat)}
                                            onEdit={() => handleEdit(cat)}
                                            onToggle={() => handleToggle(cat)}
                                            onDelete={() => handleDelete(cat)}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{cat.name}</h3>
                                        {!cat.active && (
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
                                                Inactiva
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-slate-500 dark:text-slate-400 text-[12px] leading-relaxed mb-6 line-clamp-2">
                                        {cat.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registrados</span>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{cat.services_count ?? 0} Servicios</span>
                                        </div>
                                        <span className={`text-[10px] font-black ${cat.color} uppercase tracking-[0.15em] flex items-center gap-1 group-hover:gap-2 transition-all`}>
                                            Gestionar <span className="text-lg leading-none">→</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Placeholder nueva categoría */}
                        <div
                            onClick={() => navigate('/categorias/nueva')}
                            className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-[#50e3c2]/5 hover:border-[#50e3c2]/50 transition-all group cursor-pointer"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-[#50e3c2] group-hover:scale-110 transition-all mb-3 shadow-sm">
                                <Plus size={28} strokeWidth={1.5} />
                            </div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Añadir Especialidad</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};