import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ClinicSelector } from './ClinicSelector';
import { ROLE, NAV_PERMISSIONS } from '../../constants/roles';
import {
    Home, Users, Calendar, CreditCard,
    Building2, PlusCircle, UserPlus,
    Settings, Layers, Trash2, MessageSquare,
    ClipboardList, HeartHandshake, ShieldCheck
} from 'lucide-react';

const NavItem = ({ to, label, icon: Icon, access = 'PUBLIC', permission, currentRoleId, hasContext }) => {
    const location = useLocation();
    const { can } = useAuth(); // <--- Traemos el helper can
    const active = location.pathname === to;

    // 1. Verificación por Rol (Grueso)
    const allowedRoles = NAV_PERMISSIONS[access] || NAV_PERMISSIONS.PUBLIC;
    const isHiddenByRole = currentRoleId !== null && !allowedRoles.includes(currentRoleId);

    // 2. Verificación por Permiso Específico (Fino)
    // Si el componente recibe un "permission", preguntamos al contexto.
    const isHiddenByPermission = permission ? !can(permission) : false;

    const isTechOwner = currentRoleId === ROLE.TECH_OWNER;
    const isDisabled = !isTechOwner && !hasContext && to !== "/";

    // Ocultamos si falla cualquiera de las dos verificaciones
    if (isHiddenByRole || isHiddenByPermission) return null;

    return (
        <Link
            to={isDisabled ? "#" : to}
            className={`
                group flex items-center gap-3 px-4 py-2.5 text-[13px] rounded-xl transition-all duration-300
                ${isDisabled ? 'opacity-30 cursor-not-allowed grayscale' : ''}
                ${active && !isDisabled
                    ? 'text-gray-900 bg-gray-100/80 font-semibold shadow-sm dark:text-white dark:bg-white/10'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-white/5'}
            `}
        >
            {Icon && (
                <Icon
                    size={19}
                    strokeWidth={active ? 2.5 : 1.8}
                    className={`${active ? 'text-[#50e3c2]' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'}`}
                />
            )}
            <span className="tracking-tight">{label}</span>
            {active && (
                <div className="ml-auto w-0.5 h-4 bg-[#50e3c2] rounded-full animate-in fade-in zoom-in duration-300" />
            )}
        </Link>
    );
};

export const Sidebar = () => {
    const { activeClinic, user, loading } = useAuth();
    const rawRoleId = activeClinic?.role_id ?? user?.role_id;
    const roleId = (rawRoleId !== null && rawRoleId !== undefined) ? Number(rawRoleId) : null;
    const hasContext = !!activeClinic;

    if (loading) return <aside className="w-64 h-screen bg-white dark:bg-[#0f172a] border-r border-gray-100 dark:border-white/5" />;

    const navProps = { currentRoleId: roleId, hasContext };

    return (
        <aside className="w-64 h-screen flex flex-col overflow-hidden bg-white dark:bg-[#181d27] border-r border-adaptia-mint dark:border-adaptia-mint/20 relative z-10">
            <div className="pt-8 pb-6 px-7">
                <Link to="/" className="block">
                    <img src="/Logo1.png" alt="Adaptia" className="h-9 w-auto object-contain dark:brightness-110" />
                </Link>
            </div>

            <div className="px-3 mb-2">
                <ClinicSelector />
            </div>

            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                {/* 1. SECCIÓN CLÍNICA */}
                <nav className="mb-6">
                    <p className="px-4 text-[10px] font-black text-gray-400/60 dark:text-gray-500 mb-3 tracking-[0.2em] uppercase">Gestión Clínica</p>
                    <div className="space-y-0.5">
                        <NavItem to="/" label="Inicio" icon={Home} {...navProps} />
                        <NavItem to="/pacientes" label="Pacientes" icon={Users} permission="patients.read" {...navProps} />
                        <NavItem to="/calendario" label="Agenda y Turnos" icon={Calendar} {...navProps} />
                        <NavItem to="/notas" label="Notas Clínicas" icon={ClipboardList} permission="clinical_notes.read" {...navProps} />
                    </div>
                </nav>

                {/* 2. SECCIÓN SOBERANÍA */}
                <nav className="mb-6">
                    <p className="px-4 text-[10px] font-black text-gray-400/60 dark:text-gray-500 mb-3 tracking-[0.2em] uppercase">Soberanía</p>
                    <div className="space-y-0.5">
                        <NavItem to="/mis-permisos" label="Compartir Recursos" icon={ShieldCheck} permission="clinic.resources.manage" {...navProps} />
                        <NavItem to="/supervision" label="Supervisión" icon={HeartHandshake} {...navProps} />
                    </div>
                </nav>

                {/* 3. SECCIÓN ADMINISTRATIVA */}
                <nav className="mb-6">
                    <p className="px-4 text-[10px] font-black text-gray-400/60 dark:text-gray-500 mb-3 tracking-[0.2em] uppercase">Administración</p>
                    <div className="space-y-0.5">
                        <NavItem to="/facturacion" label="Honorarios" icon={CreditCard} access="MASTER" permission="clinic.billing.read" {...navProps} />
                        <NavItem to="/clinicas" label="Gobernanza" icon={Building2} access="MASTER" {...navProps} />
                    </div>
                </nav>

                <div className="mb-6">
                    <p className="px-4 text-[10px] font-black text-gray-400/60 dark:text-gray-500 mb-3 tracking-[0.2em] uppercase">Acciones</p>
                    <div className="space-y-0.5">
                        <NavItem to="/agendar" label="Agendar Cita" icon={PlusCircle} {...navProps} />
                        <NavItem to="/nuevo-paciente" label="Alta Paciente" icon={UserPlus} access="PROFESSIONAL" permission="patients.write" {...navProps} />
                    </div>
                </div>
            </div>

            <div className="p-4 mt-auto border-t border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                <NavItem to="/settings" label="Configuración" icon={Settings} access="PUBLIC" {...navProps} />
                <button className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold text-gray-400 hover:text-[#50e3c2] transition-all uppercase tracking-widest mt-2">
                    <MessageSquare size={16} />
                    <span>Soporte</span>
                </button>
            </div>
        </aside>
    );
};