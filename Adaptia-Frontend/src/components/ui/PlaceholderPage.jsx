export const PlaceholderPage = ({ title, icon: Icon, color }) => (
    <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex items-center gap-3 mb-8">
            <div className={`p-2.5 ${color} rounded-xl text-white shadow-lg`}><Icon className="w-6 h-6" /></div>
            <h1 className="text-3xl font-bold">{title}</h1>
        </header>
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-20 text-center text-gray-400">
            Módulo de {title} listo para conectar.
        </div>
    </div>
);