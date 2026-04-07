import React, { useState } from 'react';
import {
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    FileText,
    UserPlus,
    CheckCircle2,
    Clock,
    Info
} from 'lucide-react';

export const ReferralsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Datos de ejemplo: Enviadas y Recibidas
    const referrals = [
        {
            id: 1,
            type: 'sent',
            paciente: "Julián Alvarez",
            destino: "Dr. Hugo Casco (Psiquiatría)",
            fecha: "2026-04-01",
            estado: "Aceptada",
            motivo: "Derivación para evaluación psiquiátrica por cuadro depresivo."
        },
        {
            id: 2,
            type: 'received',
            paciente: "Marta Gómez",
            origen: "Lic. Estela Maris",
            fecha: "2026-04-05",
            estado: "Pendiente",
            motivo: "Inicio de terapia de pareja. Se adjunta resumen clínico."
        }
    ];

    const filteredReferrals = referrals.filter(ref =>
        ref.paciente.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Derivaciones Internas</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Gestión de pacientes derivados entre especialistas de la clínica.
                    </p>
                </div>
                <button className="flex items-center gap-2 bg-[#50e3c2] hover:bg-[#40bda2] text-slate-900 px-4 py-2 rounded-lg font-medium transition-all shadow-sm">
                    <UserPlus size={18} />
                    Nueva Derivación
                </button>
            </div>

            {/* Grid de Resumen - Estilos ConsentsPage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl border-l-4 border-l-blue-500 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
                        <ArrowUpRight size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enviadas este mes</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">8</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl border-l-4 border-l-emerald-500 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
                        <ArrowDownLeft size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recibidas pendientes</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">3</p>
                    </div>
                </div>
            </div>

            {/* Lista de Derivaciones */}
            <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-white/5 flex justify-between items-center">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Historial de movimientos</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 pr-4 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-[#50e3c2]"
                        />
                    </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredReferrals.length > 0 ? (
                        filteredReferrals.map((ref) => (
                            <div key={ref.id} className="px-8 py-5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 ${ref.type === 'sent' ? 'text-blue-500' : 'text-emerald-500'}`}>
                                        {ref.type === 'sent' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                                            {ref.paciente}
                                            <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${ref.estado === 'Aceptada'
                                                ? 'bg-[#50e3c2]/10 text-[#50e3c2]'
                                                : 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500'
                                                }`}>
                                                {ref.estado === 'Aceptada' ? <CheckCircle2 size={12} className="inline mr-1" /> : <Clock size={12} className="inline mr-1" />}
                                                {ref.estado}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                                            {ref.type === 'sent' ? `Hacia: ${ref.destino}` : `Desde: ${ref.origen}`}
                                        </div>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">"{ref.motivo}"</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 ml-9 md:ml-0">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1">
                                            <Clock size={12} />
                                            {ref.fecha}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button title="Ver Detalles" className="p-2 text-slate-400 hover:text-[#50e3c2] transition-colors">
                                            <FileText size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-8 py-12 text-center">
                            <p className="text-sm text-slate-400">No se encontraron derivaciones</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer / Nota de Ayuda */}
            <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex gap-3">
                <Info className="text-[#50e3c2] shrink-0" size={16} />
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                    Las derivaciones internas generan un registro formal de la transferencia del paciente. El profesional receptor recibirá una notificación y tendrá acceso temporal al contexto clínico mínimo necesario para la admisión.
                </p>
            </div>
        </div>
    );
};