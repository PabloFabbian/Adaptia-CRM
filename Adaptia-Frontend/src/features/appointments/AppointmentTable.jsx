import { User, Calendar, Share2, Clock } from 'lucide-react';

export const AppointmentTable = ({ appointments = [] }) => (
    <div className="overflow-hidden">
        <table className="w-full text-sm">
            <thead className="bg-white/50 dark:bg-slate-800/50 text-gray-400 border-b border-gray-100 dark:border-slate-700">
                <tr>
                    <th className="px-6 py-4 font-light text-left text-xs uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" strokeWidth={1.5} /> Paciente
                        </div>
                    </th>
                    <th className="px-6 py-4 font-light text-left text-xs uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" strokeWidth={1.5} /> Fecha
                        </div>
                    </th>
                    <th className="px-6 py-4 font-light text-left text-xs uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <Share2 className="w-4 h-4" strokeWidth={1.5} /> Estado
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {appointments.length === 0 ? (
                    <tr>
                        <td colSpan="3" className="px-6 py-16 text-center">
                            <div className="flex flex-col items-center gap-3 text-gray-300 dark:text-slate-600">
                                <Clock className="w-12 h-12 opacity-20" strokeWidth={1} />
                                <p className="text-sm font-light">No hay citas programadas</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    appointments.map((appo, index) => (
                        <tr
                            key={appo.id}
                            className="group hover:bg-blue-50/20 dark:hover:bg-slate-700/30 transition-all duration-300"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400/80 to-blue-500/80 flex items-center justify-center text-white font-light text-sm">
                                        {/* ✅ patient_name es el campo que devuelve el backend */}
                                        {(appo.patient_name || appo.patientName || 'P').charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-light text-gray-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
                                        {appo.patient_name || appo.patientName || 'Paciente'}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <span className="text-gray-500 dark:text-slate-400 font-light">
                                    {appo.date
                                        ? new Date(appo.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                                        : '—'}
                                </span>
                            </td>
                            <td className="px-6 py-5">
                                {appo.status === 'pending' ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-light bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                        Pendiente
                                    </span>
                                ) : appo.status === 'confirmed' ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-light bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        Confirmada
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-light bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20">
                                        <Share2 className="w-3 h-3" strokeWidth={1.5} />
                                        {appo.status || 'Compartida'}
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
);