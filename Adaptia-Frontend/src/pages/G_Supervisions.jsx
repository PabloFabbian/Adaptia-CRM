import React from 'react';
import {
    HeartHandshake,
    ShieldCheck,
    Clock,
    MoreVertical,
    ExternalLink,
    Info
} from 'lucide-react';

export const SupervisionsPage = () => {
    // Datos de ejemplo para la UI
    const supervisiones = [
        {
            id: 1,
            rol: "Supervisor",
            colega: "Lic. Marcos Paz",
            pacienteRef: "Caso #442 (Anónimo)",
            ultimaActividad: "hace 2 horas",
            estado: "Activa"
        },
        {
            id: 2,
            rol: "Supervisado",
            colega: "Dra. Jimena López",
            pacienteRef: "Caso #129 (Compartido)",
            ultimaActividad: "ayer",
            estado: "Finalizada"
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Supervisión Clínica</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Espacio colaborativo para el análisis de casos respetando la soberanía de datos.
                    </p>
                </div>
                <button className="bg-[#50e3c2] hover:bg-[#40bda2] text-slate-900 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm">
                    Solicitar Supervisión
                </button>
            </div>

            {/* Stats Rápidas - Estilos ConsentsPage */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl border-l-4 border-l-[#50e3c2] flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-[#50e3c2]/10 text-[#50e3c2] rounded-xl">
                        <HeartHandshake size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mis Supervisiones</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">12</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl border-l-4 border-l-amber-500 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pendientes</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">2</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl border-l-4 border-l-slate-300 dark:border-l-slate-600 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-xl">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horas este mes</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">8.5h</p>
                    </div>
                </div>
            </div>

            {/* Lista de Casos */}
            <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-white/5">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Casos Recientes</h3>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {supervisiones.map((item) => (
                        <div
                            key={item.id}
                            className="px-8 py-5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${item.rol === 'Supervisor' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                                    <HeartHandshake size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-slate-900 dark:text-white">{item.pacienteRef}</span>
                                        <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${item.rol === 'Supervisor'
                                            ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                                            : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                                            }`}>
                                            {item.rol}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-slate-300">
                                        Colega: <span className="font-medium">{item.colega}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="hidden md:block text-right">
                                    <div className="flex items-center justify-end gap-1 text-xs text-slate-500 dark:text-slate-400 mb-1">
                                        <Clock size={12} />
                                        {item.ultimaActividad}
                                    </div>
                                    <div className={`text-xs font-black ${item.estado === 'Activa' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                        ● {item.estado}
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-slate-400 hover:text-[#50e3c2] transition-colors">
                                        <ExternalLink size={16} />
                                    </button>
                                    <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                <ShieldCheck className="text-[#50e3c2] shrink-0" size={16} />
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                    <strong>Soberanía de Datos:</strong> Al supervisar, el profesional externo solo accede a la información que el supervisado decida compartir explícitamente. No se exponen datos filiatorios sensibles sin consentimiento previo.
                </p>
            </div>
        </div>
    );
};