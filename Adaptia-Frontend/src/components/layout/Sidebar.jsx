import { Link, useLocation } from 'react-router-dom';
import {
    Home, Users, Calendar, Clock, CreditCard,
    Building2, PlusCircle, UserPlus, Receipt,
    Settings, Layers, Trash2, MessageSquare, Wallet
} from 'lucide-react';

const NavItem = ({ to, label, icon: Icon }) => {
    const location = useLocation();
    const active = location.pathname === to;

    return (
        <Link to={to} className={`
            flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-xl transition-all duration-200
            ${active
                ? 'text-gray-900 bg-gray-100 font-medium dark:text-white dark:bg-white/10'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/80 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-white/5'}
        `}>
            {Icon && <Icon size={18} strokeWidth={active ? 2 : 1.5} />}
            <span className="tracking-tight">{label}</span>
        </Link>
    );
};

export const Sidebar = () => {
    return (
        <aside className="
            w-64 h-screen flex flex-col p-6 overflow-y-auto transition-colors duration-500
            bg-white dark:bg-dark-surface 
            /* Borde brillante menta de Adaptia */
            border-r border-[#50e3c2] dark:border-[#50e3c2]/30 
            /* Glow lateral sutil */
            shadow-[1px_0_10px_rgba(80,227,194,0.1)] dark:shadow-[4px_0_20px_rgba(80,227,194,0.05)]
            relative z-10
        ">

            {/* Logo */}
            <div className="flex items-center -mt-1 mb-10 px-2">
                <Link to="/" className="block transition-opacity hover:opacity-80">
                    <img
                        src="/Logo1.png"
                        alt="Adaptia Logo"
                        className="h-10 w-auto object-contain dark:brightness-110"
                    />
                </Link>
            </div>

            {/* Nav Principal */}
            <nav className="space-y-1 mb-8">
                <p className="px-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-3 tracking-widest uppercase">Principal</p>
                <NavItem to="/" label="Inicio" icon={Home} />
                <NavItem to="/pacientes" label="Pacientes" icon={Users} />
                <NavItem to="/citas" label="Citas" icon={Clock} />
                <NavItem to="/calendario" label="Calendario" icon={Calendar} />
                <NavItem to="/facturacion" label="Facturación" icon={CreditCard} />
                <NavItem to="/clinicas" label="Clínicas" icon={Building2} />
            </nav>

            {/* Acciones Rápidas */}
            <div className="space-y-1 mb-8">
                <p className="px-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-3 tracking-widest uppercase">Acciones</p>
                <NavItem to="/agendar" label="Agendar cita" icon={PlusCircle} />
                <NavItem to="/nuevo-paciente" label="Nuevo paciente" icon={UserPlus} />
                <NavItem to="/registrar-gasto" label="Gasto" icon={Wallet} />
            </div>

            {/* Sistema */}
            <div className="space-y-1">
                <p className="px-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-3 tracking-widest uppercase">Sistema</p>
                <NavItem to="/settings" label="Disponibilidad" icon={Settings} />
                <NavItem to="/categorias" label="Categorías" icon={Layers} />
                <NavItem to="/nueva-factura" label="Facturar" icon={Receipt} />
                <NavItem to="/papelera" label="Papelera" icon={Trash2} />
            </div>

            {/* Footer / Soporte */}
            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-dark-border">
                <button className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all">
                    <MessageSquare size={18} strokeWidth={1.5} />
                    <span className="font-medium">Soporte técnico</span>
                </button>
            </div>
        </aside>
    );
};