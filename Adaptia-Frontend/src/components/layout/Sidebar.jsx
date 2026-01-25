import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ to, label }) => {
    const location = useLocation();
    // Verificamos si la ruta actual coincide con 'to'
    const active = location.pathname === to;

    return (
        <Link to={to} className={`
            flex items-center px-3 py-1.5 text-sm rounded-md transition-colors
            ${active
                ? 'bg-gray-200 text-gray-900 font-semibold'
                : 'text-gray-500 hover:bg-gray-200 hover:text-gray-900'}
        `}>
            {label}
        </Link>
    );
};

export const Sidebar = () => {
    return (
        <aside className="w-60 bg-[#f7f7f5] h-screen flex flex-col border-r border-[#e5e5e3] p-4 overflow-y-auto">
            {/* Logo / Perfil */}
            <div className="flex items-center gap-2 mb-8 px-2">
                <div className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center text-[10px] font-bold">L</div>
                <span className="font-semibold text-sm text-gray-800">Adaptia Clinic</span>
            </div>

            {/* Navegación Principal */}
            <nav className="space-y-1">
                <NavItem to="/" label="Inicio" />
                <NavItem to="/pacientes" label="Pacientes" />
                <NavItem to="/citas" label="Citas" />
                <NavItem to="/clinicas" label="Clínicas" />
            </nav>

            {/* Sección Opciones (Submenú) */}
            <div className="mt-8">
                <h3 className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Opciones</h3>
                <nav className="space-y-1">
                    <NavItem to="/agendar" label="Agendar cita" />
                    <NavItem to="/settings" label="Disponibilidad" />
                    <NavItem to="/papelera" label="Abrir papelera" />
                </nav>
            </div>

            {/* Footer del Sidebar */}
            <div className="mt-auto pt-4 border-t border-[#e5e5e3]">
                <button className="w-full text-left text-xs text-gray-400 hover:text-gray-600 px-3 py-2 transition-colors">
                    Dar feedback
                </button>
            </div>
        </aside>
    );
};