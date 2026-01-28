import { Layers, Brain, Apple, Stethoscope, Activity, Plus, MoreVertical } from 'lucide-react';

const CATEGORIES = [
    {
        name: 'Psicología',
        services: 12,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        icon: Brain,
        description: 'Terapia individual, grupal y evaluaciones cognitivas.'
    },
    {
        name: 'Nutrición',
        services: 8,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        icon: Apple,
        description: 'Planes de alimentación y seguimiento metabólico.'
    },
    {
        name: 'Medicina General',
        services: 15,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        icon: Stethoscope,
        description: 'Consultas de atención primaria y chequeos anuales.'
    },
    {
        name: 'Fisioterapia',
        services: 6,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        icon: Activity,
        description: 'Rehabilitación física y masajes terapéuticos.'
    }
];

export const CategoriesPage = () => (
    <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header con Acción */}
        <header className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-100">
                    <Layers className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Categorías de Servicio</h1>
                    <p className="text-gray-500 text-sm">Organiza y gestiona las especialidades de tu clínica</p>
                </div>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-sm">
                <Plus size={18} />
                Nueva Categoría
            </button>
        </header>

        {/* Grid de Categorías */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => (
                <div
                    key={cat.name}
                    className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-gray-200/40 transition-all cursor-pointer relative overflow-hidden"
                >
                    {/* Decoración sutil de fondo */}
                    <div className={`absolute -right-4 -top-4 w-24 h-24 ${cat.bg} rounded-full opacity-20 group-hover:scale-110 transition-transform`} />

                    <div className="relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 ${cat.bg} ${cat.color} rounded-xl`}>
                                <cat.icon size={24} />
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical size={18} />
                            </button>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-1">{cat.name}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            {cat.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <span className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">
                                {cat.services} Servicios
                            </span>
                            <span className={`text-[12px] font-semibold ${cat.color} bg-white px-2 py-1 rounded-md border border-current opacity-80`}>
                                Gestionar
                            </span>
                        </div>
                    </div>
                </div>
            ))}

            {/* Card de "Agregar más" visual */}
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors mb-3">
                    <Plus size={24} />
                </div>
                <p className="text-sm font-medium text-gray-500">Añadir Especialidad</p>
            </div>
        </div>
    </div>
);