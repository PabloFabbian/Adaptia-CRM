import React, { useState } from 'react';
import {
    MessageSquare,
    UserPlus,
    Search,
    Filter,
    ArrowRight,
    Clock,
    CheckCircle2
} from 'lucide-react';

export const InterconsultationsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Datos de ejemplo para visualizar la UI
    const interconsultas = [
        {
            id: 1,
            paciente: "Ana García",
            solicitante: "Dr. Pablo Fabbian",
            especialista: "Dra. Jimena López",
            estado: "Pendiente",
            fecha: "2026-04-05",
            motivo: "Evaluación de TCC para trastorno de ansiedad."
        },
        {
            id: 2,
            paciente: "Roberto Sánchez",
            solicitante: "Lic. Marcos Paz",
            especialista: "Dr. Pablo Fabbian",
            estado: "En curso",
            fecha: "2026-04-03",
            motivo: "Interconsulta por ajuste de medicación."
        }
    ];

    const filteredInterconsultas = interconsultas.filter(item =>
        item.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.solicitante.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.especialista.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Interconsultas</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Gestioná las consultas colaborativas entre profesionales de la clínica.
                    </p>
                </div>
                <button className="flex items-center gap-2 bg-[#50e3c2] hover:bg-[#40bda2] text-slate-900 px-4 py-2 rounded-lg font-medium transition-colors">
                    <UserPlus size={18} />
                    Nueva Interconsulta
                </button>
            </div>

            {/* Filtros y Búsqueda - Estilos ConsentsPage */}
            <div className="flex gap-4 items-center bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-4 rounded-3xl shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por paciente o profesional..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50e3c2]/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <Filter size={18} />
                    Filtros
                </button>
            </div>

            {/* Tabla / Lista de Casos - Estilos ConsentsPage */}
            <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-slate-700">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Paciente</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Participantes</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Motivo</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Estado</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredInterconsultas.length > 0 ? (
                            filteredInterconsultas.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="text-sm font-bold text-slate-900 dark:text-white">{item.paciente}</div>
                                        <div className="text-[11px] text-slate-400">ID: #00{item.id}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col text-sm text-slate-600 dark:text-slate-300">
                                            <span className="font-medium text-xs text-slate-500 dark:text-slate-400">DE: {item.solicitante}</span>
                                            <span className="font-medium text-xs text-[#50e3c2]">PARA: {item.especialista}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                        {item.motivo}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.estado === 'Pendiente'
                                            ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500'
                                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            }`}>
                                            {item.estado === 'Pendiente' ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                                            {item.estado}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-2 text-slate-400 hover:text-[#50e3c2] transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100">
                                            <ArrowRight size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-8 py-12 text-center text-slate-400">
                                    <p className="text-sm">No se encontraron interconsultas</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};