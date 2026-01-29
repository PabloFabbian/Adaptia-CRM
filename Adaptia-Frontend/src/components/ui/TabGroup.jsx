export const RolesTable = ({ roles }) => {
    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-light text-gray-800 dark:text-white tracking-tight">
                        Configuración de <span className="font-bold">Permisos</span>
                    </h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-light">Define el alcance operativo de cada miembro.</p>
                </div>
                <button className="bg-gray-900 dark:bg-adaptia-blue text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-adaptia-blue/10 active:scale-95">
                    <span className="text-lg leading-none">+</span> Nuevo rol
                </button>
            </div>

            <div className="border border-gray-100 dark:border-dark-border rounded-[2rem] overflow-hidden bg-white dark:bg-dark-surface/50 backdrop-blur-md">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-gray-50/50 dark:bg-white/5 text-gray-400 dark:text-gray-500">
                        <tr>
                            <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-[0.2em]">Nombre</th>
                            <th className="px-8 py-4 font-bold text-[10px] uppercase tracking-[0.2em]">Descripción</th>
                            <th className="px-8 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                        {roles.map((role) => (
                            <tr key={role.name} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-adaptia-blue dark:bg-adaptia-mint" />
                                        <span className="font-medium text-gray-700 dark:text-gray-200">{role.name}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-gray-500 dark:text-gray-400 font-light text-xs leading-relaxed italic">
                                    {role.description}
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button className="opacity-0 group-hover:opacity-100 transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ml-auto text-adaptia-blue hover:text-adaptia-mint">
                                        Editar <span className="text-sm">↗</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};