import React from 'react';
import {
    UserPlus, Mail, Phone, Fingerprint, Calendar, Save,
    BrainCircuit, Pill, FileText
} from 'lucide-react';

export const PatientForm = ({
    formData,
    handleChange,
    onSubmit,
    loading,
    isEditMode,
    error = '',
    navigate
}) => {

    const inputClass = (isError) => `
        w-full pl-12 pr-4 py-3 rounded-2xl border outline-none transition-all duration-300
        ${isError
            ? 'border-red-400/50 bg-red-500/5 ring-4 ring-red-500/10 text-red-600 dark:text-red-400'
            : 'border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-white/5 text-gray-800 dark:text-gray-100 focus:bg-white dark:focus:bg-dark-surface focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50'}
    `;

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* SECCIÓN 1: DATOS PERSONALES */}
            <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-[2.5rem] p-10 shadow-sm">
                <h2 className="text-sm font-bold mb-8 flex items-center gap-3 text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                    <span className="w-9 h-9 bg-orange-500/10 text-orange-500 rounded-md flex items-center justify-center text-xs">01</span>
                    Información Personal
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2 relative">
                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 ml-1 uppercase tracking-widest">Nombre Completo</label>
                        <div className="relative">
                            <UserPlus size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                            <input name="name" required value={formData.name} onChange={handleChange}
                                className={inputClass(error.includes('registrado'))} placeholder="Ej. Juan Pérez García" />
                        </div>
                    </div>
                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 ml-1 uppercase tracking-widest">DNI/NIE</label>
                        <div className="relative">
                            <Fingerprint size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                            <input name="dni" required value={formData.dni} onChange={handleChange} className={inputClass(false)} placeholder="12345678X" />
                        </div>
                    </div>
                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 ml-1 uppercase tracking-widest">Fecha de Nacimiento</label>
                        <div className="relative">
                            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                            <input name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} className={inputClass(false)} />
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: CONTACTO */}
            <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-[2.5rem] p-10 shadow-sm">
                <h2 className="text-sm font-bold mb-8 flex items-center gap-3 text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                    <span className="w-9 h-9 bg-blue-500/10 text-blue-500 rounded-md flex items-center justify-center text-xs">02</span>
                    Contactos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 ml-1 uppercase tracking-widest">Email</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                            <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputClass(false)} placeholder="correo@paciente.com" />
                        </div>
                    </div>
                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 ml-1 uppercase tracking-widest">Móvil</label>
                        <div className="relative">
                            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                            <input name="phone" type="tel" value={formData.phone} onChange={handleChange} className={inputClass(false)} placeholder="+34 600 000 000" />
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 4: PERFIL PSICOLÓGICO INICIAL - ESTILO VISUAL EXACTO */}
            <div className="bg-[#1a1f2e] dark:bg-[#111827] border border-gray-800 rounded-[2.5rem] p-10 shadow-2xl">
                <h2 className="text-[10px] font-black mb-10 flex items-center gap-4 text-teal-500/80 uppercase tracking-[0.3em]">
                    <span className="w-8 h-8 bg-teal-500/10 text-teal-400 rounded-lg flex items-center justify-center text-[10px] border border-teal-500/20">04</span>
                    Perfil Psicológico Inicial
                </h2>

                <div className="space-y-8">
                    {/* Motivo de Consulta Principal (Ancho completo) */}
                    <div className="relative group">
                        <label className="block text-[10px] font-bold text-gray-500 mb-4 ml-1 uppercase tracking-widest group-focus-within:text-teal-500 transition-colors">
                            Motivo de Consulta Principal
                        </label>
                        <div className="relative">
                            <BrainCircuit size={18} className="absolute left-5 top-5 text-gray-600 group-focus-within:text-teal-500 transition-colors" />
                            <textarea
                                name="history.motivo_consulta"
                                value={formData.history?.motivo_consulta}
                                onChange={handleChange}
                                className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] border border-gray-800 bg-[#0f172a]/50 text-gray-200 outline-none min-h-[140px] focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all placeholder:text-gray-700"
                                placeholder="Describe brevemente por qué acude a consulta..."
                            />
                        </div>
                    </div>

                    {/* Dos columnas para Antecedentes y Medicación */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="relative group">
                            <label className="block text-[10px] font-bold text-gray-500 mb-4 ml-1 uppercase tracking-widest group-focus-within:text-teal-500 transition-colors">
                                Antecedentes / Notas
                            </label>
                            <div className="relative">
                                <input
                                    name="history.antecedentes"
                                    value={formData.history?.antecedentes}
                                    onChange={handleChange}
                                    className="w-full px-8 py-5 rounded-[1.5rem] border border-gray-800 bg-[#0f172a]/50 text-gray-200 outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all placeholder:text-gray-700"
                                    placeholder="Ej. Depresión previa, familia..."
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="block text-[10px] font-bold text-gray-500 mb-4 ml-1 uppercase tracking-widest group-focus-within:text-teal-500 transition-colors">
                                Medicación Actual
                            </label>
                            <div className="relative">
                                <input
                                    name="history.medicacion"
                                    value={formData.history?.medicacion}
                                    onChange={handleChange}
                                    className="w-full px-8 py-5 rounded-[1.5rem] border border-gray-800 bg-[#0f172a]/50 text-gray-200 outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all placeholder:text-gray-700"
                                    placeholder="¿Toma algún psicofármaco?"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-6 pt-6 pb-20 items-center">
                <button type="button" onClick={() => navigate('/pacientes')} className="text-sm font-bold text-gray-400 uppercase tracking-widest hover:text-gray-800 transition-colors">
                    Descartar
                </button>
                <button type="submit" disabled={loading} className={`px-12 py-4 text-white rounded-2xl font-bold flex items-center gap-3 shadow-xl active:scale-95 transition-all ${isEditMode ? 'bg-adaptia-blue' : 'bg-gray-900'}`}>
                    {loading ? 'Procesando...' : <><Save size={18} /> {isEditMode ? 'Actualizar Expediente' : 'Guardar Paciente'}</>}
                </button>
            </div>
        </form>
    );
};