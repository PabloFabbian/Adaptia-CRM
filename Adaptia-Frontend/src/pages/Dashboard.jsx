import { Calendar } from 'lucide-react';
import { AppointmentTable } from '../features/appointments/AppointmentTable';

const Dashboard = ({ user, appointments }) => (
    <div className="max-w-6xl mx-auto px-4">
        <header className="mb-10 pt-8">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg text-white">
                    <Calendar className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Agenda de {user || 'Luis David'}</h1>
                    <p className="text-gray-600">Gestión centralizada de hoy</p>
                </div>
            </div>
        </header>
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            <AppointmentTable appointments={appointments} />
        </div>
    </div>
);

export default Dashboard;