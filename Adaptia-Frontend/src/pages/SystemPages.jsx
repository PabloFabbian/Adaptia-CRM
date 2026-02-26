import { Layers, Brain, Apple, Stethoscope, Activity, Plus, MoreVertical } from 'lucide-react';

const CATEGORIES = [
    {
        name: 'Psicología',
        services: 12,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        icon: Brain,
        description: 'Terapia individual, grupal y evaluaciones cognitivas.'
    },
    {
        name: 'Nutrición',
        services: 8,
        color: 'text-[#50e3c2]',
        bg: 'bg-[#50e3c2]/10',
        icon: Apple,
        description: 'Planes de alimentación y seguimiento metabólico.'
    },
    {
        name: 'Medicina General',
        services: 15,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        icon: Stethoscope,
        description: 'Consultas de atención primaria y chequeos anuales.'
    },
    {
        name: 'Fisioterapia',
        services: 6,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        icon: Activity,
        description: 'Rehabilitación física y masajes terapéuticos.'
    }
];

export const CategoriesPage = () => (
    <div className="max-w-7xl mx-auto px-6 pt-8 pb-20 animate-in fade-in duration-700">

        {/* Header Estilo Expediente */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
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

            <button className="flex items-center gap-2 px-6 py-4 bg-slate-900 dark:bg-[#50e3c2] text-white dark:text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl hover:opacity-90 active:scale-95 shrink-0">
                <Plus size={16} />
                Nueva Categoría
            </button>
        </header>

        {/* Grid de Categorías */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CATEGORIES.map((cat) => (
                <div
                    key={cat.name}
                    className="group bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 hover:shadow-xl hover:shadow-[#50e3c2]/5 transition-all cursor-pointer relative overflow-hidden"
                >
                    {/* Efecto de fondo sutil al hover */}
                    <div className={`absolute -right-8 -top-8 w-32 h-32 ${cat.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    <div className="relative">
                        <div className="flex justify-between items-start mb-8">
                            <div className={`p-4 ${cat.bg} ${cat.color} rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                                <cat.icon size={24} />
                            </div>
                            <button className="p-2 text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors">
                                <MoreVertical size={18} />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{cat.name}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-[13px] leading-relaxed mb-10 h-10 overflow-hidden line-clamp-2">
                            {cat.description}
                        </p>

                        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-700/50">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registrados</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{cat.services} Servicios</span>
                            </div>

                            <span className={`text-[10px] font-black ${cat.color} uppercase tracking-[0.15em] flex items-center gap-1 group-hover:gap-2 transition-all`}>
                                Gestionar <span className="text-lg leading-none">→</span>
                            </span>
                        </div>
                    </div>
                </div>
            ))}

            {/* Card de "Agregar más" Estilo Placeholder */}
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-[#50e3c2]/5 hover:border-[#50e3c2]/50 transition-all group cursor-pointer min-h-[280px]">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-[#50e3c2] group-hover:scale-110 transition-all mb-4 shadow-sm">
                    <Plus size={32} strokeWidth={1.5} />
                </div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Añadir Especialidad</h4>
            </div>
        </div>
    </div>
);