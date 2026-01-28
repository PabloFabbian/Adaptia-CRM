import { Calendar, Users, Activity, ArrowUpRight, Plus, Clock } from 'lucide-react';
import { AppointmentTable } from '../features/appointments/AppointmentTable';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${color} text-white`}>
                <Icon size={22} />
            </div>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                <ArrowUpRight size={10} /> {trend}
            </span>
        </div>
        <div>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
    </div>
);

const Dashboard = ({ user, appointments = [] }) => {
    const navigate = useNavigate();

    // Cálculos simples para el dashboard
    const todayAppointments = appointments.length;
    const pendingTasks = 3; // Placeholder

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header con Bienvenida Dinámica */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                        Hola, {user?.name?.split(' ')[0] || 'Profesional'} 👋
                    </h1>
                    <p className="text-gray-500 mt-2 font-light">
                        Tienes <span className="text-gray-900 font-semibold">{todayAppointments} citas</span> programadas para hoy.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/agendar')}
                        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Calendar size={18} />
                        Ver Agenda
                    </button>
                    <button
                        onClick={() => navigate('/nuevo-paciente')}
                        className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                    >
                        <Plus size={18} />
                        Nuevo Paciente
                    </button>
                </div>
            </header>

            {/* Grid de Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Citas de Hoy"
                    value={todayAppointments}
                    icon={Clock}
                    color="bg-gray-900"
                    trend="+12%"
                />
                <StatCard
                    title="Pacientes Totales"
                    value="124"
                    icon={Users}
                    color="bg-blue-600"
                    trend="+4%"
                />
                <StatCard
                    title="Productividad"
                    value="88%"
                    icon={Activity}
                    color="bg-emerald-500"
                    trend="+2.5%"
                />
            </div>

            {/* Sección de Tabla de Citas */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        Próximas Citas
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase">Hoy</span>
                    </h2>
                </div>
                <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden p-2">
                    {appointments.length > 0 ? (
                        <AppointmentTable appointments={appointments} />
                    ) : (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                                <Calendar size={32} />
                            </div>
                            <p className="text-gray-400 font-light">No hay citas registradas para hoy.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;