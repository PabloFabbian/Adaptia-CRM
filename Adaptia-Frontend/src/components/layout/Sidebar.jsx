import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ClinicSelector } from './ClinicSelector';
import { CAP, NAV_PERMISSIONS } from '../../constants/roles';
import {
    Home, Users, Calendar, CreditCard,
    Building2, PlusCircle, UserPlus,
    Settings, MessageSquare, Tag,
    ClipboardList, HeartHandshake, ShieldCheck
} from 'lucide-react';

const NavItem = ({ to, label, icon: Icon, permission }) => {
    const location = useLocation();
    const { can, activeClinic, user } = useAuth();

    const active = location.pathname === to ||
        (to !== '/' && location.pathname.startsWith(to));

    // Ocultar si no tiene la capability requerida
    if (permission && !can(permission)) return null;

    // Deshabilitar si no hay clínica activa (excepto inicio)
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

// Sección que se oculta automáticamente si todos sus hijos son null
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

export const Sidebar = () => {
    const { loading, can } = useAuth();

    if (loading) return (
        <aside className="w-64 h-screen bg-white dark:bg-[#181d27] border-r border-gray-100 dark:border-white/5 animate-pulse" />
    );

    return (
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
                    <NavItem to="/pacientes" label="Pacientes" icon={Users} permission={CAP.READ_PATIENTS} />
                    <NavItem to="/calendario" label="Agenda y Turnos" icon={Calendar} permission={CAP.READ_APPOINTMENTS} />
                    <NavItem to="/notas" label="Notas Clínicas" icon={ClipboardList} permission={CAP.READ_NOTES} />
                </NavSection>

                <NavSection title="Soberanía">
                    <NavItem to="/mis-permisos" label="Compartir Recursos" icon={ShieldCheck} />
                    <NavItem to="/supervision" label="Supervisión" icon={HeartHandshake} />
                </NavSection>

                <NavSection title="Administración">
                    <NavItem to="/facturacion" label="Honorarios" icon={CreditCard} permission={CAP.MANAGE_CLINIC} />
                    <NavItem to="/clinicas" label="Gobernanza" icon={Building2} permission={CAP.MANAGE_CLINIC} />
                    <NavItem to="/categorias" label="Categorías" icon={Tag} permission={CAP.READ_CATEGORIES} />
                    <NavItem to="/agendar" label="Nueva Cita" icon={PlusCircle} permission={CAP.WRITE_APPOINTMENTS} />
                    <NavItem to="/nuevo-paciente" label="Alta Paciente" icon={UserPlus} permission={CAP.WRITE_PATIENTS} />
                </NavSection>

            </div>

            {/* SISTEMA */}
            <div className="p-4 mt-auto border-t border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                <NavItem to="/settings" label="Configuración" icon={Settings} />
                <button className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold text-gray-400 hover:text-[#50e3c2] transition-all uppercase tracking-widest mt-1">
                    <MessageSquare size={16} />
                    <span>Soporte Adaptia</span>
                </button>
            </div>
        </aside>
    );
};