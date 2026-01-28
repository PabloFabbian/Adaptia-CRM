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
            flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-xl transition-all
            ${active
                ? 'text-gray-900 bg-gray-100 font-medium'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/80'}
        `}>
            {Icon && <Icon size={18} strokeWidth={active ? 2 : 1.5} />}
            <span className="tracking-tight">{label}</span>
        </Link>
    );
};

export const Sidebar = () => {
    return (
        <aside className="w-64 bg-white h-screen flex flex-col border-r border-gray-100 p-6 overflow-y-auto">

            {/* Logo - Estilo Adaptia */}
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-gray-200">
                    A
                </div>
                <span className="font-bold text-lg text-gray-900 tracking-tighter">Adaptia</span>
            </div>

            {/* Nav Principal */}
            <nav className="space-y-1 mb-8">
                <p className="px-3 text-[10px] font-bold text-gray-400 mb-3 tracking-widest uppercase">Principal</p>
                <NavItem to="/" label="Inicio" icon={Home} />
                <NavItem to="/pacientes" label="Pacientes" icon={Users} />
                <NavItem to="/citas" label="Citas" icon={Clock} />
                <NavItem to="/calendario" label="Calendario" icon={Calendar} />
                <NavItem to="/facturacion" label="Facturación" icon={CreditCard} />
                <NavItem to="/clinicas" label="Clínicas" icon={Building2} />
            </nav>

            {/* Acciones Rápidas */}
            <div className="space-y-1 mb-8">
                <p className="px-3 text-[10px] font-bold text-gray-400 mb-3 tracking-widest uppercase">Acciones</p>
                <NavItem to="/agendar" label="Agendar cita" icon={PlusCircle} />
                <NavItem to="/nuevo-paciente" label="Nuevo paciente" icon={UserPlus} />
                <NavItem to="/registrar-gasto" label="Gasto" icon={Wallet} />
            </div>

            {/* Sistema */}
            <div className="space-y-1">
                <p className="px-3 text-[10px] font-bold text-gray-400 mb-3 tracking-widest uppercase">Sistema</p>
                <NavItem to="/settings" label="Disponibilidad" icon={Settings} />
                <NavItem to="/categorias" label="Categorías" icon={Layers} />
                <NavItem to="/nueva-factura" label="Facturar" icon={Receipt} />
                <NavItem to="/papelera" label="Papelera" icon={Trash2} />
            </div>

            {/* Footer / Soporte */}
            <div className="mt-auto pt-6 border-t border-gray-100">
                <button className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
                    <MessageSquare size={18} strokeWidth={1.5} />
                    <span className="font-medium">Soporte técnico</span>
                </button>
            </div>
        </aside>
    );
};