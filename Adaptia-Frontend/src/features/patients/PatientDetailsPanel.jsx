import { X, Mail, Phone, MapPin, ShieldCheck, FileText, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PatientDetailsPanel = ({ patient, onClose, onOpenNote }) => {
    if (!patient) return null;

    return (
        <div className="fixed right-0 top-0 h-screen w-[400px] bg-white dark:bg-gray-900 shadow-[-20px_0_50px_rgba(0,0,0,0.05)] dark:shadow-[-20px_0_50px_rgba(0,0,0,0.3)] z-40 animate-in slide-in-from-right duration-500 border-l border-gray-100 dark:border-gray-800 flex flex-col">
            <div className="p-8 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-10">
                    <button onClick={onClose} className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
                        <X size={24} />
                    </button>
                    <span className="text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-[0.2em]">Expediente Digital</span>
                </div>

                <header className="flex flex-col items-center text-center mb-10">
                    <div className="w-24 h-24 bg-orange-500 rounded-[2rem] flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-orange-100 dark:shadow-orange-900/20 mb-4">
                        {patient.name.charAt(0)}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{patient.name}</h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 uppercase font-mono tracking-widest">Paciente de Adaptia</p>
                </header>

                <div className="space-y-8">
                    <div className="p-5 bg-[#50e3c2]/10 dark:bg-[#50e3c2]/5 border border-[#50e3c2]/20 dark:border-[#50e3c2]/30 rounded-3xl">
                        <h3 className="text-[11px] font-bold text-[#3dbfb0] dark:text-[#50e3c2] uppercase tracking-widest mb-3 flex items-center gap-2">
                            <ShieldCheck size={14} /> Estado de Privacidad
                        </h3>
                        <p className="text-xs text-[#2a8c81] dark:text-[#50e3c2]/90 leading-relaxed font-medium">
                            Este expediente es propiedad de <b className="text-[#1a665e] dark:text-[#50e3c2]">{patient.owner_name || 'Luis David'}</b>. Tienes acceso de lectura y edición.
                        </p>
                    </div>

                    <section className="space-y-6">
                        <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800 pb-3">Información de Contacto</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-xl transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <Mail size={16} className="text-gray-400 dark:text-gray-500" />
                                </div>
                                <span className="text-sm font-semibold">{patient.history?.email || 'No registrado'}</span>
                            </div>
                            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-xl transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <Phone size={16} className="text-gray-400 dark:text-gray-500" />
                                </div>
                                <span className="text-sm font-semibold">{patient.history?.phone || 'No registrado'}</span>
                            </div>
                            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-xl transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <MapPin size={16} className="text-gray-400 dark:text-gray-500" />
                                </div>
                                <span className="text-sm font-semibold leading-snug">{patient.history?.address || 'Sin dirección registrada'}</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30 space-y-3">
                <button onClick={onOpenNote} className="w-full flex items-center justify-center gap-3 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-xl active:scale-95">
                    <FileText size={18} /> Crear Nota Clínica
                </button>
                <Link to={`/pacientes/${patient.id}/historial`} className="w-full flex items-center justify-center gap-3 py-4 bg-white dark:bg-transparent border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-center">
                    <ExternalLink size={18} /> Ver Todo el Historial
                </Link>
            </div>
        </div>
    );
};