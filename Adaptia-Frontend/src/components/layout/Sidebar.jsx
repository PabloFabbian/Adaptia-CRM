import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ClinicSelector } from './ClinicSelector';
import { CAP } from '../../constants/roles';
import {
    Home, Users, Calendar, CreditCard,
    Building2, PlusCircle, UserPlus,
    Settings, MessageSquare, Tag,
    ClipboardList, HeartHandshake, ShieldCheck,
    X, Mail, BookOpen, MessageCircle, ExternalLink
} from 'lucide-react';

// ── Modal de Soporte ─────────────────────────────────────────────────────────
const SupportModal = ({ onClose }) => (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Soporte Adaptia</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">¿En qué podemos ayudarte?</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="p-4 space-y-2">

                <a href="mailto:soporte@adaptia.com?subject=Consulta desde Adaptia CRM"
                    className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-[#50e3c2]/50 hover:bg-[#50e3c2]/5 transition-all group"
                >
                    <div className="w-10 h-10 rounded-xl bg-[#50e3c2]/10 flex items-center justify-center text-[#50e3c2] shrink-0">
                        <Mail size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Enviar email</p>
                        <p className="text-[11px] text-slate-400 truncate">soporte@adaptia.com</p>
                    </div>
                    <ExternalLink size={14} className="text-slate-300 group-hover:text-[#50e3c2] transition-colors shrink-0" />
                </a>


                <a href="https://docs.adaptia.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-[#50e3c2]/50 hover:bg-[#50e3c2]/5 transition-all group"
                >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                        <BookOpen size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Documentación</p>
                        <p className="text-[11px] text-slate-400">Guías y tutoriales</p>
                    </div>
                    <ExternalLink size={14} className="text-slate-300 group-hover:text-[#50e3c2] transition-colors shrink-0" />
                </a>


                <a href="https://wa.me/5491168529993"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-[#50e3c2]/50 hover:bg-[#50e3c2]/5 transition-all group"
                >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                        <MessageCircle size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Chat en vivo</p>
                        <p className="text-[11px] text-slate-400">Lun–Vie 9:00–18:00</p>
                    </div>
                    <ExternalLink size={14} className="text-slate-300 group-hover:text-[#50e3c2] transition-colors shrink-0" />
                </a>
            </div >

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-[10px] text-slate-400 text-center">
                    Tiempo de respuesta promedio: <span className="font-bold text-slate-600 dark:text-slate-300">menos de 2 horas</span>
                </p>
            </div>
        </div >
    </div >
);

// ── NavItem ──────────────────────────────────────────────────────────────────
const NavItem = ({ to, label, icon: Icon, permission, navCap }) => {
    const location = useLocation();
    const { can, activeClinic, user } = useAuth();

    // Ocultar si el Owner lo desactivó para este usuario
    const hiddenItems = user?.sidebar_hidden || [];
    if (navCap && hiddenItems.includes(navCap)) return null;

    // Ocultar si no tiene la capability requerida
    if (permission && !can(permission)) return null;

    const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
    const isTechOwner = Number(activeClinic?.role_id) === 0;
    const isDisabled = !isTechOwner && !activeClinic && to !== '/';

    return (
        <Link
            to={isDisabled ? '#' : to}
            onClick={e => isDisabled && e.preventDefault()}
            className={`
                group flex items-center gap-3 px-4 py-2.5 text-[13px] rounded-xl transition-all duration-300
                ${isDisabled ? 'opacity-30 cursor-not-allowed pointer-events-none grayscale' : ''}
                ${active && !isDisabled
                    ? 'text-gray-900 bg-gray-100/80 font-semibold shadow-sm dark:text-white dark:bg-white/10'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-white/5'}
            `}
        >
            {Icon && (
                <Icon
                    size={19}
                    strokeWidth={active ? 2.5 : 1.8}
                    className={active
                        ? 'text-[#50e3c2]'
                        : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'}
                />
            )}
            <span className="tracking-tight">{label}</span>
            {active && (
                <div className="ml-auto w-0.5 h-4 bg-[#50e3c2] rounded-full animate-in fade-in zoom-in duration-300" />
            )}
        </Link>
    );
};

// ── NavSection ───────────────────────────────────────────────────────────────
const NavSection = ({ title, children }) => {
    const visible = React.Children.toArray(children).filter(Boolean);
    if (visible.length === 0) return null;
    return (
        <nav className="mb-6">
            <p className="px-4 text-[10px] font-black text-gray-400/60 dark:text-gray-500 mb-3 tracking-[0.2em] uppercase">
                {title}
            </p>
            <div className="space-y-0.5">{children}</div>
        </nav>
    );
};

// ── Sidebar ──────────────────────────────────────────────────────────────────
export const Sidebar = () => {
    const { loading } = useAuth();
    const [supportOpen, setSupportOpen] = useState(false);

    if (loading) return (
        <aside className="w-64 h-screen bg-white dark:bg-[#181d27] border-r border-gray-100 dark:border-white/5 animate-pulse" />
    );

    return (
        <>
            <aside className="w-64 h-screen flex flex-col overflow-hidden bg-white dark:bg-[#181d27] border-r border-[#50e3c2]/20 relative z-10">

                {/* BRANDING */}
                <div className="pt-8 pb-6 px-7">
                    <Link to="/">
                        <img src="/Logo1.png" alt="Adaptia" className="h-9 w-auto object-contain dark:brightness-110" />
                    </Link>
                </div>

                <div className="px-3 mb-2">
                    <ClinicSelector />
                </div>

                {/* NAVEGACIÓN */}
                <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                    <NavSection title="Gestión Clínica">
                        <NavItem to="/" label="Inicio" icon={Home} />
                        <NavItem to="/pacientes" label="Pacientes" icon={Users} permission={CAP.READ_PATIENTS} navCap="clinic.patients.read" />
                        <NavItem to="/calendario" label="Agenda y Turnos" icon={Calendar} permission={CAP.READ_APPOINTMENTS} navCap="clinic.appointments.read" />
                        <NavItem to="/notas" label="Notas Clínicas" icon={ClipboardList} permission={CAP.READ_NOTES} navCap="clinic.notes.read" />
                    </NavSection>

                    <NavSection title="Soberanía">
                        <NavItem to="/mis-permisos" label="Compartir Recursos" icon={ShieldCheck} />
                        <NavItem to="/supervision" label="Supervisión" icon={HeartHandshake} />
                    </NavSection>

                    <NavSection title="Administración">
                        <NavItem to="/facturacion" label="Honorarios" icon={CreditCard} permission={CAP.MANAGE_CLINIC} navCap="manage_clinic" />
                        <NavItem to="/clinicas" label="Gobernanza" icon={Building2} permission={CAP.MANAGE_CLINIC} navCap="manage_clinic" />
                        <NavItem to="/categorias" label="Categorías" icon={Tag} permission={CAP.READ_CATEGORIES} navCap="clinic.categories.read" />
                        <NavItem to="/agendar" label="Nueva Cita" icon={PlusCircle} permission={CAP.WRITE_APPOINTMENTS} navCap="clinic.appointments.write" />
                        <NavItem to="/nuevo-paciente" label="Alta Paciente" icon={UserPlus} permission={CAP.WRITE_PATIENTS} navCap="clinic.patients.write" />
                    </NavSection>
                </div>

                {/* SISTEMA */}
                <div className="p-4 mt-auto border-t border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                    <NavItem to="/settings" label="Configuración" icon={Settings} />
                    <button
                        onClick={() => setSupportOpen(true)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold text-gray-400 hover:text-[#50e3c2] hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest mt-1"
                    >
                        <MessageSquare size={16} />
                        <span>Soporte Adaptia</span>
                    </button>
                </div>
            </aside>

            {supportOpen && <SupportModal onClose={() => setSupportOpen(false)} />}
        </>
    );
};