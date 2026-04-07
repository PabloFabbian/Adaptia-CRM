import { useState, useEffect, useRef } from 'react';
import { Activity, Plus, MoreVertical, Pencil, PowerOff, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const COLOR_MAP = [
    { color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { color: 'text-[#50e3c2]', bg: 'bg-[#50e3c2]/10' },
    { color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
];

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
            <button onClick={() => setOpen(p => !p)} className="p-2 text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
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
    // IMPORTANTE: Extraemos 'token' del contexto
    const { activeClinic, token } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scale, setScale] = useState(1);
    const containerRef = useRef(null);

    // Fetch categorías con manejo de errores robusto
    useEffect(() => {
        const fetchCategories = async () => {
            if (!activeClinic?.id || !token) return;

            try {
                setLoading(true);
                const cleanId = Number(activeClinic.id);

                const res = await fetch(`http://localhost:3001/api/categories?clinicId=${cleanId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.status === 401) {
                    toast.error("Sesión expirada. Por favor, volvé a ingresar.");
                    return;
                }

                const json = await res.json();
                if (json.data) {
                    setCategories(json.data);
                }
            } catch (error) {
                console.error("Error cargando categorías:", error);
                toast.error('No se pudieron cargar las categorías');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [activeClinic?.id, token]); // Añadimos token a las dependencias

    // Scale responsivo corregido
    useEffect(() => {
        const update = () => {
            if (!containerRef.current) return;
            const availableWidth = window.innerWidth;
            if (availableWidth < 1200) {
                setScale(Math.max(0.8, availableWidth / 1280));
            } else {
                setScale(1);
            }
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    const handleToggle = async (cat) => {
        const prev = [...categories];
        setCategories(cs => cs.map(c => c.id === cat.id ? { ...c, active: !c.active } : c));
        try {
            const res = await fetch(`http://localhost:3001/api/categories/${cat.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ active: !cat.active })
            });
            if (!res.ok) throw new Error();
            toast.success(`Categoría actualizada`);
        } catch {
            setCategories(prev);
            toast.error('No se pudo actualizar');
        }
    };

    const handleDelete = async (cat) => {
        if (!window.confirm("¿Estás seguro de eliminar esta categoría?")) return;
        const prev = [...categories];
        setCategories(cs => cs.filter(c => c.id !== cat.id));
        try {
            const res = await fetch(`http://localhost:3001/api/categories/${cat.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error);
            }
            toast.success('Categoría eliminada');
        } catch (e) {
            setCategories(prev);
            toast.error(e.message || 'Error al eliminar');
        }
    };

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
            <Loader2 className="w-6 h-6 mb-4 animate-spin text-[#50e3c2]" />
            Sincronizando Adaptia...
        </div>
    );

    return (
        <div className="h-full w-full overflow-y-auto bg-slate-50 dark:bg-transparent custom-scrollbar">
            <div
                ref={containerRef}
                className="max-w-7xl mx-auto px-6 pt-12 pb-20 animate-in fade-in duration-700"
                style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
            >
                <header className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-[#50e3c2]" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configuración de Servicios</span>
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Gestión de <span className="text-[#50e3c2]">Categorías</span>
                        </h1>
                    </div>
                    <button
                        onClick={() => navigate('/categorias/nueva')}
                        className="flex items-center gap-2 px-6 py-4 bg-slate-900 dark:bg-[#50e3c2] text-white dark:text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl hover:opacity-90 active:scale-95 transition-all"
                    >
                        <Plus size={16} /> Nueva Categoría
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.length > 0 ? (
                        categories.map((cat, i) => {
                            const style = COLOR_MAP[i % COLOR_MAP.length];
                            return (
                                <div
                                    key={cat.id}
                                    className={`group bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 hover:shadow-xl transition-all relative overflow-hidden ${!cat.active ? 'opacity-60 grayscale' : ''}`}
                                >
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`p-3 ${style.bg} ${style.color} rounded-2xl`}>
                                                <Activity size={22} />
                                            </div>
                                            <CategoryMenu
                                                category={cat}
                                                onManage={() => navigate(`/categorias/${cat.slug || cat.id}/servicios`)}
                                                onEdit={() => navigate(`/categorias/${cat.id}/editar`)}
                                                onToggle={() => handleToggle(cat)}
                                                onDelete={() => handleDelete(cat)}
                                            />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{cat.name}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-6 h-8">
                                            {cat.description || 'Sin descripción disponible'}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Servicios</span>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {cat.services_count || 0} Registrados
                                                </span>
                                            </div>
                                            <span
                                                className={`text-[10px] font-black ${style.color} uppercase tracking-widest cursor-pointer hover:underline`}
                                                onClick={() => navigate(`/categorias/${cat.slug || cat.id}/servicios`)}
                                            >
                                                Gestionar →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                No se encontraron categorías para esta clínica
                            </p>
                        </div>
                    )}

                    <div
                        onClick={() => navigate('/categorias/nueva')}
                        className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:bg-[#50e3c2]/5 hover:border-[#50e3c2]/50 transition-all group cursor-pointer min-h-[200px]"
                    >
                        <Plus size={28} className="text-slate-300 group-hover:text-[#50e3c2] mb-2" />
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Añadir Especialidad</h4>
                    </div>
                </div>
            </div>
        </div>
    );
};