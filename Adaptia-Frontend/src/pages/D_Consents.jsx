import React, { useState } from 'react';
import {
    FileCheck, AlertCircle, Info, Search,
    Filter, Send, Eye, MoreHorizontal,
    Download, Clock, CheckCircle2
} from 'lucide-react';
import { Card } from '../components/ui/Card';

const ConsentsPage = () => {
    const [loading, setLoading] = useState(false);

    // Mock data para la tabla
    const documents = [
        { id: 1, patient: "Juan Pérez", type: "Consentimiento Telemedicina", status: "Pendiente", date: "2024-03-20" },
        { id: 2, patient: "María García", type: "Tratamiento de Datos", status: "Firmado", date: "2024-03-19" },
        { id: 3, patient: "Roberto Carlos", type: "Consentimiento Quirúrgico", status: "Pendiente", date: "2024-03-18" },
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 animate-in fade-in duration-700 space-y-8">

            {/* Header al estilo CalendarPage */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-900 dark:bg-[#50e3c2] rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 dark:shadow-[#50e3c2]/10 transition-colors duration-500">
                        <FileCheck className="w-7 h-7 text-white dark:text-slate-900" strokeWidth={1.5} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-[#50e3c2] font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                            <Clock size={12} />
                            Gestión Legal Activa
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Centro de <span className="text-[#50e3c2]">Consentimientos</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#50e3c2] transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar paciente..."
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#50e3c2]/20 focus:border-[#50e3c2] outline-none transition-all w-64"
                        />
                    </div>
                    <button className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-[#50e3c2] transition-all shadow-sm">
                        <Filter size={18} />
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4 border-amber-500 bg-white dark:bg-slate-800/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pendientes de firma</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">12</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-[#50e3c2] bg-white dark:bg-slate-800/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#50e3c2]/10 text-[#50e3c2] rounded-xl">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completados hoy</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">08</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-xl">
                            <Download size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total del mes</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">142</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Table Container */}
            <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-slate-700">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Paciente</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Tipo de Documento</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Estado</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {documents.map((doc) => (
                            <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                                <td className="px-8 py-5">
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">{doc.patient}</div>
                                    <div className="text-[11px] text-slate-400">ID: #00{doc.id}</div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                        {doc.type}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${doc.status === 'Firmado'
                                        ? 'bg-[#50e3c2]/10 text-[#50e3c2]'
                                        : 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500'
                                        }`}>
                                        {doc.status === 'Firmado' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                        {doc.status}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button title="Enviar Recordatorio" className="p-2 text-slate-400 hover:text-[#50e3c2] transition-colors">
                                            <Send size={16} />
                                        </button>
                                        <button title="Ver Documento" className="p-2 text-slate-400 hover:text-[#50e3c2] transition-colors">
                                            <Eye size={16} />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Info Footer al estilo CalendarPage */}
            <footer className="flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                <Info size={16} className="text-[#50e3c2] shrink-0" />
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Los documentos firmados se almacenan con encriptación AES-256.
                    El sistema envía recordatorios automáticos cada 48hs para formularios pendientes.
                </p>
            </footer>
        </div>
    );
};

export default ConsentsPage;