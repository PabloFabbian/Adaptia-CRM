export const PlaceholderPage = ({ title, icon: Icon }) => (
    <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-gray-100 dark:border-dark-border rounded-[3rem] bg-gray-50/50 dark:bg-dark-surface/30">
        <div className="p-5 bg-white dark:bg-dark-surface rounded-2xl shadow-xl mb-6 text-gray-200 dark:text-gray-700">
            {Icon && <Icon size={40} strokeWidth={1} />}
        </div>
        <h2 className="text-xl font-light text-gray-400 dark:text-gray-500">
            Módulo de <span className="text-gray-800 dark:text-gray-200 font-medium">{title}</span> en desarrollo
        </h2>
        <p className="text-xs text-gray-300 dark:text-gray-600 mt-2 tracking-widest uppercase font-light">
            Sincronizando con la red de Adaptia
        </p>
    </div>
);