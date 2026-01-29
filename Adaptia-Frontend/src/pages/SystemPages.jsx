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
    <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#50e3c2] rounded-xl text-gray-900 shadow-lg shadow-[#50e3c2]/20">
                    <Layers className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Categorías</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Organiza las especialidades de tu clínica</p>
                </div>
            </div>

            <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-[#50e3c2] text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-sm active:scale-95">
                <Plus size={18} />
                Nueva Categoría
            </button>
        </header>

        {/* Grid de Categorías */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => (
                <div
                    key={cat.name}
                    className="group bg-white dark:bg-[#161f31] border border-gray-100 dark:border-gray-800 rounded-[2rem] p-7 hover:shadow-2xl hover:shadow-[#50e3c2]/5 transition-all cursor-pointer relative overflow-hidden"
                >
                    {/* Decoración de fondo */}
                    <div className={`absolute -right-4 -top-4 w-24 h-24 ${cat.bg} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />

                    <div className="relative">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 ${cat.bg} ${cat.color} rounded-2xl`}>
                                <cat.icon size={28} />
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{cat.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
                            {cat.description}
                        </p>

                        <div className="flex items-center justify-between pt-5 border-t border-gray-50 dark:border-gray-800/50">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                                {cat.services} Servicios
                            </span>
                            <span className={`text-[11px] font-bold ${cat.color} uppercase tracking-wider`}>
                                Gestionar →
                            </span>
                        </div>
                    </div>
                </div>
            ))}

            {/* Card de "Agregar más" */}
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-[#50e3c2]/5 hover:border-[#50e3c2]/50 transition-all group cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#101828] flex items-center justify-center text-gray-400 group-hover:text-[#50e3c2] transition-all mb-4">
                    <Plus size={32} strokeWidth={1.5} />
                </div>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Añadir Especialidad</p>
            </div>
        </div>
    </div>
);